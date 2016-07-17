import fs from 'fs'
import path from 'path'
import { app as mainApp, remote } from 'electron'
import runas from 'runas'
import isRenderer from 'is-electron-renderer'
import HostGroup from './host-group'

const app = isRenderer ? remote.app : mainApp

const BEGIN_SECTION = '## hosty begin ##'
const END_SECTION = '## hosty end ##'

const DEBUG = process.env.NODE_ENV === 'development'
const HOSTS_OSX = '/etc/hosts'
const HOSTS_WINDOWS = 'C:\\Windows\\System32\\drivers\\etc\\hosts'
const HOSTS_DUMMY = path.join(process.cwd(), 'dummyHosts')
let HOSTS = process.platform === 'win32' ? HOSTS_WINDOWS : HOSTS_OSX
if (DEBUG) {
  HOSTS = HOSTS_DUMMY
}
const USER_HOSTS = path.join(app.getPath('userData'), 'hosts')
const HOSTS_CHARSET = 'utf8'

const HostsFile = new (class {
  read() {
    try {
      return fs.readFileSync(USER_HOSTS, HOSTS_CHARSET)
    } catch (e) {
      throw e
    }
  }
  write(data) {
    try {
      fs.writeFileSync(USER_HOSTS, data, HOSTS_CHARSET)
    } catch (e) {
      throw e
    }
  }
})

class HostsFileManager {
  setupHostsFile() {
    const options = { admin: !DEBUG }
    try {
      const stats = fs.lstatSync(HOSTS)
      if (!stats.isSymbolicLink()) {
        return
      }
      if (runas('rm', [HOSTS], options)) {
        throw new Error(`Failed to delete ${HOSTS}`)
      }
    } catch (e) {
      //
    }
    if (runas('touch', [HOSTS], options)) {
      throw new Error(`Failed to touch ${HOSTS}`)
    }
  }
  setupUserHostsFile() {
    const options = { admin: !DEBUG }
    try {
      const stats = fs.lstatSync(USER_HOSTS)
      if (stats.isSymbolicLink()) {
        return
      }
      if (runas('rm', [USER_HOSTS], options)) {
        throw new Error(`Failed to delete ${USER_HOSTS}`)
      }
    } catch (e) {
      //
    }
    if (process.platform === 'win32') {
      if (runas('cmd', ['/c', `mklink ${USER_HOSTS} ${HOSTS}`], options)) {
        throw new Error(`Failed to symlink ${HOSTS} to ${USER_HOSTS}`)
      }
    } else {
      if (runas('ln', ['-s', HOSTS, USER_HOSTS], options)) {
        throw new Error(`Failed to symlink ${HOSTS} to ${USER_HOSTS}`)
      }
      if (runas('chmod', ['666', HOSTS], options)) {
        throw new Error(`Failed to chmod ${HOSTS}`)
      }
    }
  }
  setup() {
    this.setupHostsFile()
    this.setupUserHostsFile()
  }
  save(groups) {
    const data = HostsFile.read()

    let newData = `${BEGIN_SECTION}\n${HostGroup.build(groups)}\n${END_SECTION}\n`

    const reg = new RegExp(
      String.raw`([\s\S]*\n?)${BEGIN_SECTION}\n[\s\S]*\n${END_SECTION}\n?([\s\S]*)`,
      'im'
    )
    const matches = data.match(reg)
    if (matches) {
      newData = matches[1] + newData + matches[2]
    } else {
      newData = `${data}\n${newData}`
    }

    HostsFile.write(newData)
  }
  clear() {
    this.save([])
  }
}

export default new HostsFileManager