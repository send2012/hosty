<template>
  <v-container class="search-treeview pa-0" fluid>
    <v-container
      id="search-treeview-scroll-target"
      ref="treeview"
      class="pa-0"
      fluid
      fill-height
      scroll-y
    >
      <v-layout v-if="results.length">
        <div v-if="scrolling" class="shadow" />
        <v-treeview
          v-scroll:#search-treeview-scroll-target="onScroll"
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
          <template slot="label" slot-scope="{ item }">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div :title="getText(item)" v-html="getHtml(item)" />
          </template>
        </v-treeview>
      </v-layout>
      <v-layout v-else>
        <v-flex class="ma-3 caption text-xs-center">No results found.</v-flex>
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
    ...mapState('local/search', ['scrollTop']),
    ...mapGetters('local/search', ['regExp', 'results'])
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
        this.scrolling = false
      }
    }
  },
  mounted() {
    // wait for treeview.open-all
    this.$nextTick(() => {
      this.$refs.treeview.scrollTop = this.scrollTop
    })
  },
  methods: {
    onScroll(e) {
      const scrollTop = e.target.scrollTop
      this.setScrollTop({ scrollTop })
      this.scrolling = scrollTop > 0
    },
    getColor(item) {
      if (item.type === 'group') {
        return null
      }
      if (item.disabled) {
        return this.darkTheme ? 'grey darken-1' : 'grey lighten-2'
      }
      return 'success'
    },
    getIcon(item) {
      return item.type === 'group' ? 'list' : 'check_circle'
    },
    getText(item) {
      if (item.type === 'group' && !item.text) {
        return '(Untitled)'
      }
      let text = item.text
      if (item.subtext) {
        text = item.subtext + ' ' + text
      }
      return text
    },
    getHtml(item) {
      if (item.type === 'group' && !item.text) {
        return '<span class="grey--text">(Untitled)</span>'
      }
      let html = this.highlight(item.text)
      if (item.subtext) {
        html =
          '<span class="subtext">' +
          this.highlight(item.subtext) +
          '</span> ' +
          html
      }
      return html
    },
    highlight(text) {
      return text.replace(
        this.regExp,
        `<span class="white--text primary">$1</span>`
      )
    },
    ...mapMutations('local/search', ['setScrollTop']),
    ...mapActions('local/search', ['viewResult'])
  }
}
</script>

<style scoped lang="scss">
.search-treeview {
  position: relative;
  .shadow {
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.1);
    content: '';
    height: 10px;
    position: absolute;
    top: -10px;
    width: 100%;
  }
  .v-treeview {
    width: 100%;
  }
  /deep/ .v-treeview-node__content {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    .v-treeview-node__label {
      font-size: 13px;
      .subtext {
        display: inline-block;
        min-width: 100px;
      }
    }
  }
}
</style>
