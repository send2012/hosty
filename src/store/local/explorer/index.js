import { Selector } from '~/store'
import child from './child'

export default {
  namespaced: true,
  state: {
    selectedGroupId: 0,
    scrollTop: 0,
    order: {
      by: 'name',
      descending: false
    },
    filtered: false,
    clippedGroup: null
  },
  getters: {
    groups(state, getters, rootState) {
      return rootState.group.groups.filter((group) => {
        return !state.filtered || !group.disabled
      })
    },
    selectedGroupIndex(state, getters) {
      return getters.getGroupIndex({ id: state.selectedGroupId })
    },
    selectedGroup(state, getters) {
      return getters.getGroup({ id: state.selectedGroupId })
    },
    canCreateGroup() {
      return true
    },
    canDeleteGroup(state) {
      return !!state.selectedGroupId
    },
    canPasteGroup(state) {
      return !!state.clippedGroup
    },
    getGroupIndex(state, getters) {
      return ({ id }) => getters.groups.findIndex((group) => group.id === id)
    },
    getGroup(state, getters) {
      return ({ id }) => getters.groups[getters.getGroupIndex({ id })]
    },
    isSelectedGroup(state) {
      return ({ id }) => state.selectedGroupId === id
    }
  },
  actions: {
    // loadGroups({ commit, dispatch, getters, state }) {
    //   const groups = getters.cloneGroups().filter((group) => {
    //     return !state.filtered || !group.disabled
    //   })
    //   commit('setGroups', { groups })
    //   commit('setScrollTop', { scrollTop: 0 })
    //   dispatch('sortGroups')
    //   dispatch('unselectGroup')
    // },
    // loadGroup({ commit, getters, state }) {
    //   const group = getters.cloneGroups().find((group) => {
    //     return group.id === state.selectedGroupId
    //   })
    //   commit('updateGroup', { id: state.selectedGroupId, group })
    // },
    createGroup({ commit, dispatch, getters }, { group } = {}) {
      commit('group/addGroup', { group }, { root: true })
      const index = getters.groups.length - 1
      dispatch('selectGroupIndex', { index })
      dispatch('focusTable')
    },
    deleteGroup({ commit, dispatch, getters }, { id }) {
      const oldIndex = getters.getGroupIndex({ id })
      commit('group/removeGroup', { id }, { root: true })
      const index =
        oldIndex < getters.groups.length ? oldIndex : getters.groups.length - 1
      dispatch('selectGroupIndex', { index })
      dispatch('focusTable')
    },
    updateGroup({ commit }, { id, group }) {
      commit('group/updateGroup', { id, group }, { root: true })
    },
    sortGroups({ commit, state }) {
      commit('group/sortGroups', state.order, { root: true })
    },
    copyGroup({ commit, getters }, { id }) {
      const clippedGroup = getters.getGroup({ id })
      commit('setClippedGroup', { clippedGroup })
    },
    pasteGroup({ dispatch, state }) {
      const group = state.clippedGroup
      if (!group) {
        return
      }
      dispatch('createGroup', { group })
    },
    selectGroup({ commit, dispatch, getters }, { id }) {
      commit('setSelectedGroupId', { selectedGroupId: id })
      const title = getters.selectedGroup
        ? getters.selectedGroup.name || '(Untitled)'
        : undefined
      dispatch('changeTitle', { title }, { root: true })
      dispatch('child/sortHosts')
      dispatch('child/unselectHost')
    },
    unselectGroup({ dispatch }) {
      dispatch('selectGroup', { id: 0 })
    },
    selectGroupIndex({ dispatch, getters }, { index }) {
      const group = getters.groups[index]
      if (group) {
        dispatch('selectGroup', { id: group.id })
      } else {
        dispatch('unselectGroup')
      }
    },
    selectFirstGroup({ dispatch, getters }) {
      const index = 0
      if (index > -1 && index < getters.groups.length) {
        dispatch('selectGroupIndex', { index })
      }
    },
    selectLastGroup({ dispatch, getters }) {
      const index = getters.groups.length - 1
      if (index > -1 && index < getters.groups.length) {
        dispatch('selectGroupIndex', { index })
      }
    },
    selectPreviousGroup({ dispatch, getters }) {
      const index = getters.selectedGroupIndex - 1
      if (index > -1 && index < getters.groups.length) {
        dispatch('selectGroupIndex', { index })
      }
    },
    selectNextGroup({ dispatch, getters }) {
      const index = getters.selectedGroupIndex + 1
      if (index > -1 && index < getters.groups.length) {
        dispatch('selectGroupIndex', { index })
      }
    },
    changeOrderBy({ commit, dispatch, state }, { orderBy }) {
      const descending =
        state.order.by === orderBy ? !state.order.descending : false
      const order = { by: orderBy, descending }
      commit('setOrder', { order })
      dispatch('sortGroups')
    },
    toggleFiltered({ dispatch, state }) {
      dispatch('setFiltered', { filtered: !state.filtered })
    },
    setFiltered({ commit }, { filtered }) {
      commit('setFiltered', { filtered })
    },
    focusTable({ dispatch }) {
      dispatch('focus', { selector: Selector.explorerTable }, { root: true })
    }
  },
  mutations: {
    setSelectedGroupId(state, { selectedGroupId }) {
      state.selectedGroupId = selectedGroupId
    },
    setScrollTop(state, { scrollTop }) {
      state.scrollTop = scrollTop
    },
    setOrder(state, { order }) {
      state.order = order
    },
    setFiltered(state, { filtered }) {
      state.filtered = filtered
    },
    setClippedGroup(state, { clippedGroup }) {
      state.clippedGroup = clippedGroup
    }
  },
  modules: {
    child
  }
}
