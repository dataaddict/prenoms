<template lang="pug">
.popup(:class="[position]" :style="{opacity: show ? 1 : 0}")
  .year {{year}}
  .name(v-for="nameData in names")
    div
      .circle(:style="{ backgroundColor: nameColor(nameData) }")
      | {{nameData.name}}
    div {{countForName(nameData)}}
</template>

<script>
import _ from 'lodash'
import { nameColor } from './utils'

export default {
  name: 'Popup',

  props: {
    names: { type: Array, required: true },
    position: { type: String, default: null },
    show: { type: Boolean, required: true },
    year: { type: Number, required: true }
  },

  methods: {
    countForName (nameData) {
      const d = _.find(nameData.births, { year: this.year })
      const count = _.get(d, 'births', 0)

      if (count === 0) {
        return 'aucune naissance'
      } else {
        return `${count} naissance${count === 1 ? '' : 's'}`
      }
    },

    nameColor
  }
}
</script>
<style lang="stylus">
@import "./css/colors"

.popup
  font-family "HelveticaLTStd-Roman"
  font-size 14px
  color white
  background-color rgba(0, 0, 0, 0.16)
  padding 10px 10px
  /*transition opacity 750ms*/
  position absolute
  width 300px
  pointer-events none
  top 20px
  left 95px

  &.right
    left auto
    right 130px

  .year
    fill white
    font-size 28px
    font-family "HelveticaLTStd-Bold"

  .name
    color #666666
    background-color white
    height 16px
    font-size 14px
    line-height 18px
    padding 5px 10px
    margin-top 5px
    display: flex
    justify-content: space-between
    .visible

    .circle
      display inline-block
      border-radius 50%
      width 10px
      height 10px
      margin-right 10px
    .birth
      text-align right
</style>
