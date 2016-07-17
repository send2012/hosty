export const INITIALIZE_GROUPS = 'INITIALIZE_GROUPS'
export const CREATE_GROUP = 'CREATE_GROUP'
export const UPDATE_GROUP = 'UPDATE_GROUP'
export const DELETE_GROUPS = 'DELETE_GROUPS'
export const CREATE_HOST = 'CREATE_HOST'
export const UPDATE_HOST = 'UPDATE_HOST'
export const DELETE_HOSTS = 'DELETE_HOSTS'

export const CREATE_MESSAGE = 'CREATE_MESSAGE'
export const CLEAR_MESSAGES = 'CLEAR_MESSAGES'

export function initializeGroups(groups) {
  return {
    type: INITIALIZE_GROUPS,
    payload: { groups },
  }
}

export function createGroup(group) {
  return {
    type: CREATE_GROUP,
    payload: { group },
  }
}

export function updateGroup(id, group) {
  return {
    type: UPDATE_GROUP,
    payload: { id, group },
  }
}

export function deleteGroups(ids) {
  return {
    type: DELETE_GROUPS,
    payload: { ids },
  }
}

export function createHost(groupId, host) {
  return {
    type: CREATE_HOST,
    payload: { groupId, host },
  }
}

export function updateHost(groupId, id, host) {
  return {
    type: UPDATE_HOST,
    payload: { groupId, id, host },
  }
}

export function deleteHosts(groupId, ids) {
  return {
    type: DELETE_HOSTS,
    payload: { groupId, ids },
  }
}

export function createMessage(message) {
  return {
    type: CREATE_MESSAGE,
    payload: { message },
  }
}

export function clearMessages() {
  return {
    type: CLEAR_MESSAGES,
  }
}
