import React, {Component, PropTypes} from 'react'
import {
  TextField, IconButton,
  TableRow, TableRowColumn
} from 'material-ui'
import * as SvgIcons from 'material-ui/svg-icons'
import * as Styles from 'material-ui/styles'
import validator from 'validator'

export default class HostItem extends Component {
  static propTypes = {
    host:       PropTypes.object,
    selected:   PropTypes.bool,
    onEditHost: PropTypes.func
  };
  static defaultProps = {
    host:       {},
    selected:   false,
    onEditHost: () => {}
  };
  state = {
    editableField: null
  };
  handleToggleHostStatus(e) {
    e.stopPropagation()
    const {host, onEditHost} = this.props
    const newHost = Object.assign({}, host)
    newHost.enable = !newHost.enable
    onEditHost(newHost)
  }
  handleEditHost(e) {
    const {host, onEditHost} = this.props
    const {name, value} = e.target
    const newHost = Object.assign({}, host)
    newHost[name] = value
    onEditHost(newHost)
    this.setState({editableField: null})
  }
  handleInputHost(e) {
    if (e.keyCode === 13) {
      e.target.blur()
    }
  }
  renderHostField() {
    const {host} = this.props
    const {editableField} = this.state
    const defaultValue = 'example.com'

    if (editableField !== 'host') {
      const value = host.host || defaultValue
      const color = host.host ? 'inherit' : 'rgba(0, 0, 0, 0.298039)'
      return (
        <div
          style={{...styles.fieldLabel, color}}
          onDoubleClick={e => this.setState({editableField: 'host'})}
        >{value}</div>
      )
    }

    return (
      <TextField
        autoFocus={true}
        name="host"
        hintText={defaultValue}
        underlineShow={true}
        defaultValue={host.host}
        onClick={e => e.stopPropagation()}
        onBlur={::this.handleEditHost}
        onKeyDown={::this.handleInputHost}
        fullWidth={true}
      />
    )
  }
  renderIPField() {
    const {host} = this.props
    const {editableField} = this.state
    const defaultValue = '192.0.2.0'

    if (editableField !== 'ip') {
      const value = host.ip || defaultValue
      const color = host.ip ? 'inherit' : 'rgba(0, 0, 0, 0.298039)'
      return (
        <div
        style={{...styles.fieldLabel, color}}
          onDoubleClick={e => this.setState({editableField: 'ip'})}
        >{value}</div>
      )
    }

    return (
      <TextField
        autoFocus={true}
        name="ip"
        hintText={defaultValue}
        underlineShow={true}
        defaultValue={host.ip}
        onClick={e => e.stopPropagation()}
        onBlur={::this.handleEditHost}
        onKeyDown={::this.handleInputHost}
        fullWidth={true}
      />
    )
  }
  renderIcon() {
    const {host} = this.props

    let errors = []
    if (!host.host || !host.host.length) {
      errors.push('Missing Host')
    }
    if (!host.ip || !host.ip.length) {
      errors.push('Missing IP')
    } else if (!validator.isIP(host.ip)) {
      errors.push('Invalid IP')
    }

    let icon = <SvgIcons.ActionDone color={Styles.colors.grey300} />
    if (host.enable) {
      icon = errors.length
        ? <SvgIcons.AlertWarning color={Styles.colors.yellow600} />
        : <SvgIcons.ActionDone color={Styles.colors.green600} />
    }

    return (
      <IconButton onClick={::this.handleToggleHostStatus}>
        {icon}
      </IconButton>
    )
  }
  render() {
    const {host, selected, ...others} = this.props

    return (
      <TableRow
        key={host.id}
        selected={selected}
        style={styles.row}
        {...others}
      >
        {others.children}
        <TableRowColumn style={styles.iconColumn}>
          {this.renderIcon()}
        </TableRowColumn>
        <TableRowColumn>
          {this.renderHostField()}
        </TableRowColumn>
        <TableRowColumn>
          {this.renderIPField()}
        </TableRowColumn>
      </TableRow>
    )
  }
}

const styles = {
  row: {
    cursor: 'pointer'
  },
  iconColumn: {
    width: 48,
    textAlign: 'center',
    paddingLeft: 0,
    paddingRight: 0
  },
  fieldLabel: {
    height: '100%',
    lineHeight: '48px',
    fontSize: 16
  }
}
