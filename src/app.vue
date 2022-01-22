<template lang="pug">
#app
  content
    .left-side
      .title
        h2 De 1929 à 2019 :
        h1 90 ans de prénoms en France
      form.search
        input(type="text" autocomplete="off" placeholder="Recherche..." v-model="searchQuery")
        img.search-image(src="./images/search.png")
        a.clear(href="#" v-show="searchQuery.length" @click="searchQuery = ''")
          img(src="./images/clear.png")/
      .names-list-container
        ul.names-list(ref="namesList")
          li(v-for="nameData in displayedNames",
            :class="[nameData.sex, nameData.selected ? 'selected' : '']",
            :style="nameStyle(nameData)",
            :title="nameData.alternateNames ? 'autres orthographes: ' + nameData.alternateNames.join(', ') : null",
            v-text="nameData.name"
            @click.prevent="toggleName(nameData)"
          )
    .right-side
      graph(
        :names="selectedNames",
        @name:remove="toggleName",
        @year-range="setYearRange"
      )
      .bottom
        .block
          .share-url
            div Partagez ces résultats avec ce lien :
            input(ref="share-url" type="text" @click="selectUrl", :value="shareUrl")
          .social-links
            iframe(src="https://www.facebook.com/plugins/share_button.php?href=http%3A%2F%2Fdataaddict.fr%2Fprenoms%2F&layout=button_count&size=large&mobile_iframe=true&appId=388906134841894&width=120&height=28" width="120" height="28" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true")
            a.twitter-share-button(href="https://twitter.com/share" data-size="large" data-via="_Data_Addict_" data-lang="fr" data-hashtags="70ansdeprénoms")
            a.github-button(href="https://github.com/dataaddict/prenoms" data-style="mega" aria-label="Star dataaddict/prenoms on GitHub") Star
        .explanations
          | Les prénoms sélectionnés sont les plus courants en France, ils ont été donnés au moins 2000 fois entre 1929 et 2019. Source :
          a(href="https://www.insee.fr/fr/statistiques/2540004" target="_blank") Insee - Fichier des prénoms (Édition 2016)
</template>

<script>
import { nameColor, initialRange, maxBirthsCount, years } from './utils'
import * as d3 from 'd3'
import _ from 'lodash'
import graph from './graph.vue'

export default {
  name: 'App',

  components: { graph },

  data () {
    return {
      names: [],
      shareUrl: window.location.toString(),
      searchQuery: '',
      range: initialRange
    }
  },

  computed: {
    selectedNames () {
      return _.filter(this.names, 'selected')
    },

    displayedNames () {
      if (this.searchQuery === '') return this.names

      const sanitize = s => _.deburr(s).toLowerCase()
      const q = sanitize(this.searchQuery)

      return this.names.filter(({ name, alternateNames = [] }) =>
        _([name, ...alternateNames])
          .map(sanitize)
          .some(name => name.includes(q))
      )
    }
  },

  watch: {
    names: 'refreshYearRange',
    selectedNames (names) {
      window.location.hash = names.map(d => d.id + '-' + d.sex).join(',')
      this.shareUrl = window.location.toString()
    }
  },

  mounted () {
    const selectedIds = _.flatMap(window.location.hash.slice(1).split(','), id => /-[hf]$/.test(id) ? [id] : [id + '-f', id + '-h'])

    d3.json('data.json', (err, names) => {
      if (err) return window.alert(err)

      _.each(names, nameData => {
        nameData.selected = _.includes(selectedIds, nameData.id + '-' + (nameData.sex === 'm' ? 'h' : 'f'))
        nameData.style = {}
        nameData.births = _.map(years, (year, i) => ({ year, births: nameData.births[i] }))
      })

      this.names = names
      this.$nextTick(window.onresize)
    })
  },

  methods: {
    toggleName (nameData) {
      nameData.selected = !nameData.selected
    },

    setYearRange (range) {
      this.range = range
      this.refreshYearRange()
    },

    refreshYearRange () {
      const overvallMax = maxBirthsCount(this.names, this.range)

      const fontSizeScale = d3
        .scalePow()
        .exponent(0.8)
        .domain([0, overvallMax])
        .range([16, 40])

      _(this.names)
        .each(nameData => {
          // const [fontSize, lineHeight] = sizes[level]
          const fontSize = fontSizeScale(maxBirthsCount([nameData], this.range)) + 'px'
          nameData.style = { fontSize }
        })
    },

    nameStyle (nameData) {
      const backgroundColor = nameData.selected ? nameColor(nameData) : ''
      return _.assign({ backgroundColor }, nameData.style)
    },

    // selectUrl () {
    //   // http://stackoverflow.com/a/1173319
    //   const el = this.$refs['share-url']
    //
    //   if (document.selection) {
    //     var range = document.body.createTextRange()
    //     range.moveToElementText(el)
    //     range.select()
    //   } else if (window.getSelection) {
    //     const range = document.createRange()
    //     range.selectNode(el)
    //     window.getSelection().addRange(range)
    //   }
    // }
    selectUrl () {
      this.$refs['share-url'].select()
    }
  }
}
</script>
<style lang="stylus">
@import "./css/colors"

html
  height 100%
  margin 0
  padding 0

a:visited
  color: #6e4cb9

body
  font-family "HelveticaLTStd-Roman", sans-serif
  font-size 18px
  //width $width - 17px*2
  color color1
  background-color #fff

body, #app, content
  height 100%

content
  display: flex
  flex-direction: row
  padding-left: 19px

.title
  margin-bottom: 10px
  margin-top: 10px
  h1
    color: color-male
    font-family: "HelveticaLTStd-Bold"
    font-size: 35px
  h2
    font-size: 24px
    margin-bottom: -4px
  h1, h2
    margin: 0

.left-side
  max-width 500px
  min-width 300px
  width 33%
  display: flex
  flex-direction: column
  margin-bottom: 10px

.right-side
  flex: 1

form.search
  position: relative
  height: 32px
  > *
    position: absolute

  .search-image
    left: 4px
    top: 6px

  .clear
    top: 6px
    right: 0

  input
    color: #333
    font-family: "HelveticaLTStd-Roman"
    font-size: 19px
    padding-left 26px
    padding-top 4px
    width: calc(100% - 30px)
  a
    color: red
    font-family: sans-serif
    right: 0
    text-decoration: none

.names-list-container
  flex: 1
  overflow scroll
  margin-top 10px

ul.names-list
  list-style none
  padding 0
  margin 0
  display: flex
  flex-wrap: wrap
  justify-content: space-between
  li
    cursor pointer
    padding 3px
    line-height 0.9
    display: inline-flex
    align-items: center
    &.h
      color color-male
    &.f
      color color-female
    &.selected
      line-height 1
      color white

.share-url
  cursor: crosshair

.bottom
  margin-bottom: 20px
  padding: 20px 95px 0 50px
  font-size: 12px
  color: color-male

  input[type=text]
    color: #333333
    width: 250px

  .block
    display flex
    justify-content: space-between
  a
    text-decoration: none
  .social-links > *
    margin-left 10px
  .social
    float: left
    margin-top: -9px
    width: 117px
    > *
      display: block
  .logo
    margin-top: -8px
    margin-left: -5px
    float: left
  .explanations
    margin-top: 1em
</style>
