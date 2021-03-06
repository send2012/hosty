<template>
  <tr
    :active="active"
    class="host-table-row"
    @click.stop="onClick"
    @contextmenu.stop="onContextMenu"
  >
    <td class="px-2">
      <v-btn :color="color" class="my-0" flat icon @click.stop="onButtonClick">
        <v-icon>check_circle</v-icon>
      </v-btn>
    </td>
    <td
      ref="ipColumn"
      :class="ipClasses"
      @dblclick="(e) => onColumnDblClick(e, 'ip')"
    >
      {{ host.ip || '192.0.2.0' }}
      <small v-if="ipError" class="px-4 error--text ellipsis">
        {{ ipError }}
      </small>
      <v-menu
        v-model="ipMenu.show"
        :position-x="ipMenu.x"
        :position-y="ipMenu.y"
        :min-width="ipMenu.width"
        :close-on-content-click="false"
        lazy
        transition="slide-x-reverse-transition"
      >
        <v-card>
          <v-card-text class="py-0 overflow-hidden">
            <v-text-field
              ref="ipText"
              v-model="ip"
              :error-messages="ipErrors"
              class="mb-1"
              label="192.0.2.0"
              single-line
              @keydown.native="(e) => onTextKeyDown(e, 'ip')"
              @blur="(e) => onTextBlur(e, 'ip')"
              @contextmenu.stop="onTextContextMenu"
            />
          </v-card-text>
        </v-card>
      </v-menu>
    </td>
    <td
      ref="nameColumn"
      :class="nameClasses"
      @dblclick="(e) => onColumnDblClick(e, 'name')"
    >
      {{ host.name || 'example.com' }}
      <small v-if="nameError" class="px-4 error--text ellipsis">
        {{ nameError }}
      </small>
      <v-menu
        v-model="nameMenu.show"
        :position-x="nameMenu.x"
        :position-y="nameMenu.y"
        :min-width="nameMenu.width"
        :close-on-content-click="false"
        lazy
        transition="slide-x-reverse-transition"
      >
        <v-card>
          <v-card-text class="py-0 overflow-hidden">
            <v-text-field
              ref="nameText"
              v-model="name"
              :error-messages="nameErrors"
              class="mb-1"
              label="example.com"
              single-line
              @keydown.native="(e) => onTextKeyDown(e, 'name')"
              @blur="(e) => onTextBlur(e, 'name')"
              @contextmenu.stop="onTextContextMenu"
            />
          </v-card-text>
        </v-card>
      </v-menu>
    </td>
  </tr>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  props: {
    host: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      ipMenu: {
        show: false,
        x: 0,
        y: 0,
        width: 0
      },
      nameMenu: {
        show: false,
        x: 0,
        y: 0,
        width: 0
      },
      ip: '',
      name: '',
      cancel: false
    }
  },
  computed: {
    active() {
      return this.isSelectedHost({ id: this.host.id })
    },
    color() {
      if (this.host.disabled) {
        return this.darkTheme ? 'grey darken-1' : 'grey lighten-2'
      }
      return 'success'
    },
    ipClasses() {
      return ['ellipsis', this.host.ip ? '' : 'grey--text']
    },
    nameClasses() {
      return ['ellipsis', this.host.name ? '' : 'grey--text']
    },
    ipErrors() {
      const error = this.findHostIPError({
        group: this.selectedGroup,
        host: { ...this.host, ip: this.ip }
      })
      return error ? [error] : []
    },
    nameErrors() {
      const error = this.findHostNameError({
        group: this.selectedGroup,
        host: { ...this.host, name: this.name }
      })
      return error ? [error] : []
    },
    ipError() {
      return this.findHostIPError({
        group: this.selectedGroup,
        host: this.host
      })
    },
    nameError() {
      return this.findHostNameError({
        group: this.selectedGroup,
        host: this.host
      })
    },
    ...mapState('settings', ['darkTheme']),
    ...mapGetters('group', ['findHostIPError', 'findHostNameError']),
    ...mapGetters('local', ['selectedGroup', 'isSelectedHost', 'canPasteHost'])
  },
  methods: {
    onClick() {
      this.selectHost({ id: this.host.id })
    },
    onContextMenu() {
      this.selectHost({ id: this.host.id })
      const template = [
        {
          label: 'New Host',
          click: () => this.createHost(),
          accelerator: 'CmdOrCtrl+N'
        },
        {
          label: 'Copy',
          click: () => this.copyHost({ id: this.host.id }),
          accelerator: 'CmdOrCtrl+C'
        },
        {
          label: 'Paste',
          click: () => this.pasteHost(),
          accelerator: 'CmdOrCtrl+V',
          enabled: this.canPaste
        },
        { type: 'separator' },
        {
          label: 'Edit',
          click: () => this.focus(),
          accelerator: 'Enter'
        },
        {
          label: 'Delete',
          click: () => this.deleteHost({ id: this.host.id }),
          accelerator: 'CmdOrCtrl+Backspace'
        }
      ]
      this.$contextMenu.show(template)
    },
    onButtonClick() {
      this.updateHost({
        id: this.host.id,
        host: { disabled: !this.host.disabled }
      })
    },
    onColumnDblClick(e, key) {
      this.focus(key)
    },
    onTextKeyDown(e, key) {
      switch (e.keyCode) {
        case 13:
          e.preventDefault()
          e.target.blur()
          this.focusTable()
          break
        case 27:
          e.preventDefault()
          this.cancel = true
          e.target.blur()
          this.focusTable()
          break
        case 9:
          e.preventDefault()
          e.target.blur()
          if (key === 'name' && e.shiftKey) {
            this.focus('ip')
            break
          } else if (key === 'ip' && !e.shiftKey) {
            this.focus('name')
            break
          }
          this.focusTable()
          break
      }
    },
    onTextBlur(e, key) {
      this[`${key}Menu`].show = false
      if (this.cancel) {
        return
      }
      const value = this[key].trim()
      this.updateHost({ id: this.host.id, host: { [key]: value } })
    },
    onTextContextMenu() {
      this.$contextMenu.show([
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ])
    },
    focus(key = 'ip') {
      this[key] = this.host[key]
      this.cancel = false
      this.$nextTick(() => {
        const rect = this.$refs[`${key}Column`].getBoundingClientRect()
        this[`${key}Menu`].x = rect.left
        this[`${key}Menu`].y = rect.top + 1
        this[`${key}Menu`].width = rect.width
        this[`${key}Menu`].show = true
        setTimeout(() => {
          this.$refs[`${key}Text`].focus()
        }, 200)
      })
    },
    ...mapActions('local', [
      'createHost',
      'updateHost',
      'deleteHost',
      'copyHost',
      'pasteHost',
      'selectHost',
      'focusTable'
    ])
  }
}
</script>

<style scoped lang="scss">
.host-table-row {
  cursor: pointer;
  > td {
    position: relative;
    > small {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
    }
  }
}
</style>
