<template>
  <v-container class="problems-treeview pa-0" fluid>
    <v-container
      id="scroll-target"
      ref="treeview"
      class="pa-0"
      fluid
      fill-height
      scroll-y
    >
      <v-layout v-if="results.length">
        <div v-if="scrolling" class="shadow" />
        <v-treeview
          v-scroll:#scroll-target="onScroll"
          class="spacer"
          item-key="key"
          item-text="text"
          open-all
          open-on-click
          activatable
          hoverable
          :items="results"
          :active.sync="active"
        >
          <template slot="prepend" slot-scope="{ item }">
            <v-icon :color="getColor(item)">{{ getIcon(item) }}</v-icon>
          </template>
        </v-treeview>
      </v-layout>
      <v-layout v-else align-center justify-center>
        <v-flex class="text-xs-center caption">
          No problems have been detected.
        </v-flex>
      </v-layout>
    </v-container>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  data() {
    return {
      scrolling: false,
      active: []
    }
  },
  computed: {
    ...mapState('settings', ['darkTheme']),
    ...mapState('local/problems', ['scrollTop']),
    ...mapGetters('local/problems', ['results'])
  },
  watch: {
    active(value) {
      if (!value.length) {
        return null
      }
      const key = value[0]
      this.viewResult({ key })
    },
    results(value) {
      if (!value.length) {
        this.scrolling = 0
      }
    }
  },
  mounted() {
    const scrollTop = this.scrollTop
    // open-all を待つために $nextTick でなく setTimeout を使用する
    setTimeout(() => {
      this.$refs.treeview.scrollTop = scrollTop
    }, 0)
  },
  methods: {
    onScroll(e) {
      const scrollTop = e.target.scrollTop
      this.setScrollTop({ scrollTop })
      this.scrolling = scrollTop > 0
    },
    getColor(item) {
      return item.type === 'group' ? null : 'error'
    },
    getIcon(item) {
      return item.type === 'group' ? 'list' : 'error'
    },
    ...mapMutations('local/problems/', ['setScrollTop']),
    ...mapActions('local/problems/', ['viewResult'])
  }
}
</script>

<style scoped lang="scss">
.problems-treeview {
  position: relative;
  .shadow {
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2),
      0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12);
    content: '';
    height: 10px;
    position: absolute;
    top: -10px;
    width: 100%;
  }
  /deep/ .v-treeview-node__label {
    font-size: 13px;
  }
}
</style>