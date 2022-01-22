<template lang="pug">
.svg-container
  .graph
    svg(ref="svg")
      defs
        clipPath#graphs-clip-path
          rect
      rect.playground-bg(ref="fg")
      g.axis.x-axis
      g.axis.y-axis
      g.prenoms
        g.lines
        g.circles
    .year-zoomers
      a(
        href="#"
        v-for="r in yearRanges"
        @click.prevent="yearClick(r)",
        :class="{selected: zoomed && range.from === r.from}")
        span.year  {{r.from}} → {{r.to}}
  .labels(ref="labels")
  popup(:names="names" :position="popup.position" :show="popup.show" :year="currentYear")
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'
import { defaultDuration, nameColor, years, maxBirthsCount, initialRange } from './utils'
import Popup from './popup.vue'

export default {
  name: 'Graph',

  components: { Popup },

  props: {
    names: { type: Array, required: true }
  },

  data () {
    const xScale = d3.scaleLinear()
    const yScale = d3.scaleLinear()

    const xAxis = d3.axisBottom(xScale)
      .tickFormat(String)
      // .tickSubdivide(1)
      .tickSize(6, 1)
      // .tickSize(-100, 0, 1)

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(String)
      .ticks(6)
      .tickSize(-100, 0, 1)

    return {
      popup: {
        show: false,
        position: null
      },
      range: initialRange,
      zoomed: false,
      currentYear: years[0],
      xScale,
      yScale,
      xAxis,
      yAxis,
      lineGenerator:
        d3.line()
          .x(d => xScale(d.year))
          .y(d => yScale(d.births))
          // .tension(0.1)
          // .interpolate('linear')
    }
  },

  computed: {
    yearRanges () {
      return _(years[0])
        .range(_.last(years), 10)
        .map(from => ({ from, to: from + 10 }))
        .value()
    }
  },

  watch: {
    names: 'updateLines'
  },

  mounted () {
    this.svg = d3.select(this.$refs.svg)

    this.$el.addEventListener('mouseenter', () => {
      console.log('mouseenter')

      this.popup.show = this.names.length > 0

      this.svg
        .selectAll('.circles > g')
        .attr('visibility', 'visible')
    }, true)

    this.$el.addEventListener('mouseleave', () => {
      console.log('mouseleave')
      this.popup.show = false
      this.svg
        .selectAll('.circles > g')
        .attr('visibility', 'hidden')
    }, true)

    this.$el.addEventListener('mousemove', (evt) => {
      console.log('mousemove')
      if (!this.popup.show) return

      const x = evt.clientX - this.$refs.svg.getBoundingClientRect().left
      this.popup.position = x < this.$el.offsetWidth / 2 ? 'right' : null
      this.currentYear = Math.round(this.xScale.invert(x))
      this.svg
        .selectAll('.circles > g')
        .attr('visibility', d => d.year === this.currentYear ? 'visible' : 'hidden')
    }, true)

    window.onresize = this.onresize.bind(this)

    this.onresize()
  },

  methods: {
    yearClick (clickedRange) {
      if (this.zoomed && this.range.from === clickedRange.from) {
        this.range = initialRange
        this.zoomed = false
      } else {
        this.range = { from: clickedRange.from, to: clickedRange.to + 1 }
        this.zoomed = true
      }

      this.updateAxis()

      this.svg
        .select('.x-axis')
        .transition()
        .duration(defaultDuration)
        .call(this.xAxis)

      this.svg
        .selectAll('.prenoms .lines g')
        .transition()
        .duration(defaultDuration)
        .call(this.redrawExistingLines)

      d3.select(this.$refs.labels)
        .selectAll('* > div')
        .transition()
        .duration(defaultDuration)
        .call(this.placeLabel.bind(this))

      this.svg
        .selectAll('.circles g')
        .transition()
        .duration(defaultDuration)
        .attr('transform', this.transformForCircle)

      this.$emit('year-range', this.range)
    },

    redrawExistingLines (lines) {
      lines
        .style('clip-path', 'url(#graphs-clip-path)')
        .select('g path')
        .attr('d', (prenomData) => this.lineGenerator(prenomData.births))
    },

    placeLabel (labels) {
      const self = this
      const css = []
      labels
        .each(function (nameData, i) {
          const { year, births } =
            _(nameData.births)
              .filter(({ year }) => year >= self.range.from && year <= self.range.to - 1)
              .maxBy('births')

          // console.log(this.getBoundingClientRect())
          const top = self.yScale(births)
          // if (top > this.getBoundingClientRect())
          css[i] = { left: self.xScale(year), top }
        })
      labels
        .style('left', (_, i) => css[i].left + 'px')
        .style('top', (_, i) => css[i].top + 'px')
        .style('background-color', nameColor)
    },

    onresize () {
      const width = this.$el.offsetWidth
      const height = this.$el.offsetHeight

      this.xScale.range([50, width - 100])
      this.yScale.range([height - 50, 25])

      this.yAxis.tickSize(-(this.xScale.range()[1] - this.xScale.range()[0]), 0, 1)
      this.xAxis.tickSize(-(this.yScale.range()[0] - this.yScale.range()[1]), 0, 1)

      this.svg
        .select('.x-axis')
        .attr('transform', 'translate(0, ' + (this.yScale.range()[0] + 6) + ')')
        .call(this.xAxis)

      this.svg
        .select('.y-axis')
        .attr('transform', 'translate(' + (this.xScale.range()[0]) + ', 0)')
        .call(this.yAxis)

      this.svg
        .select('#graphs-clip-path rect')
        .attr('x', this.xScale.range()[0])
        .attr('y', 0)
        .attr('width', this.xScale.range()[1] - this.xScale.range()[0])
        .attr('height', height)

      this.svg
        .selectAll('.playground-bg, .playground')
        .attr('x', this.xScale.range()[0])
        .attr('y', this.yScale.range()[1])
        .attr('width', this.xScale.range()[1] - this.xScale.range()[0])
        .attr('height', this.yScale.range()[0] - this.yScale.range()[1])

      this.svg
        .select('.playground')
        .attr('width', this.xScale.range()[1] - this.xScale.range()[0] + 20)

      this.svg
        .selectAll('.prenoms .lines g')
        .call(this.redrawExistingLines)

      this.svg
        .selectAll('.circles > g')
        .attr('transform', this.transformForCircle)
    },

    transformForCircle (d) {
      const x = this.xScale(d.year)
      const y = this.yScale(d.births)
      return `translate(${x} ${y})`
    },

    updateAxis () {
      this.xScale.domain([this.range.from, this.range.to - 1])
      this.xAxis.tickValues(_.range(this.range.from, this.range.to, 5))

      const maxBirths = Math.max(maxBirthsCount(this.names, this.range) * 1.1, 300)
      this.yScale.domain([0, maxBirths])
    },

    updateLines () {
      this.popup.show = this.popup.show && this.names.length > 0

      this.updateAxis()

      this.svg
        .select('.y-axis')
        .transition()
        .duration(defaultDuration)
        .call(this.yAxis)

      const initialLine = this.lineGenerator(years.map(year => ({ year, births: 0 })))

      const lines =
        this.svg
          .select('.prenoms .lines')
          .selectAll('g')
          .data(this.names, d => d.id)

      const newLines =
        lines
          .enter()
          .append('g')
          .attr('opacity', 1)
          .classed('line', true)

      lines
        .transition()
        .duration(defaultDuration)
        .call(_.partial(this.redrawExistingLines))

      function clipPathId (prenomData, i) {
        return `clip_path_prenom_${i}`
      }

      newLines
        .append('clipPath')
        .attr('class', 'clippath')
        .attr('id', clipPathId)
        .append('rect')
        .attr('x', this.xScale.range()[0])
        .attr('y', this.yScale.range()[1] - 10)
        .attr('width', 0)
        .attr('height', this.yScale.range()[0] - this.yScale.range()[1] + 20)

      newLines
        .append('path')
        .attr('stroke', nameColor)
        .style('clip-path', (prenomData, i) => `url(#${clipPathId(prenomData, i)})`)
        // .attr('d', initial_line)
        // .transition()
        // .duration(defaultDuration)
        .attr('d', (d) => {
          return this.lineGenerator(d.births)
        })

      const leftToRightAppearTransition =
        newLines
          .transition()
          .duration(defaultDuration)
          .ease(d3.easeLinear)

      leftToRightAppearTransition
        .select('.clippath')
        .remove()
        .select('rect')
        .attr('width', this.xScale.range()[1] - this.xScale.range()[0])

      leftToRightAppearTransition
        .select('path')
        .on('end', function () {
          this.style.clipPath = 'url(#graphs-clip-path)'
        })

      const labels =
        d3.select(this.$refs.labels)
          .selectAll('* > div')
          .data(this.names, (d) => d.id)

      labels
        .transition()
        .duration(defaultDuration)
        .call(this.placeLabel.bind(this))

      labels
        .exit()
        .remove()

        .transition()
        .duration(defaultDuration)
        .style('opacity', 0)

      labels
        .enter()
        .append('div')
        .style('opacity', 0)
        .style('cursor', 'pointer')
        .text(d => d.name)
        .on('click', d => {
          this.$emit('name:remove', d)
        })
        .call(this.placeLabel.bind(this))
        .transition()
        .duration(defaultDuration)
        .style('opacity', 1)

      const circleData = _.flatMap(this.names, (nameData) => {
        const color = nameColor(nameData)
        return _.map(nameData.births, ({ births, year }) => {
          return { color, year, births, id: nameData.id + '-' + year }
        })
      })

      const circles = this.svg
        .select('.circles')
        .selectAll('g')
        .data(circleData, d => d.id)

      circles
        .transition()
        .duration(defaultDuration)
        .attr('transform', this.transformForCircle)

      circles
        .exit()
        .remove()

      const newCircles = circles
        .enter()
        .append('g')
        .attr('transform', this.transformForCircle)
        .attr('visibility', 'hidden')

      newCircles
        .append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 7)
        .attr('fill', d => d.color)

      newCircles
        .append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 5)
        .attr('fill', 'white')

      newCircles
        .append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 4)
        .attr('fill', d => d.color)

      function disappear (sel) {
        return sel
          .exit()
          .transition()
          .ease(d3.easeExpOut)
          .duration(defaultDuration)
          .attr('opacity', 0)
          .remove()
      }

      disappear(lines)
        .select('g.line path')
        .attr('d', initialLine)

      disappear(labels)
        .attr('transform', prenomData => {
          const yearRange = d3.extent(this.xScale.domain())
          let maxCount = 0
          let maxYear = yearRange[0]

          prenomData.births.forEach(({ births, year }) => {
            if (!_.includes(yearRange, year)) return
            if (births > maxCount) {
              maxCount = births
              maxYear = year
            }
          })
          const pt = [this.xScale(maxYear) + 5, this.yScale(maxCount) - 15]
          pt[1] = this.yScale.range()[0]

          return `translate(${pt[0]} ${pt[1]})`
        })
    }
  }

}

</script>
<style lang="stylus">
@import "./css/colors"

.svg-container
  position relative
  height calc(100% - 180px)
  top 90px
  max-height 600px
  margin-bottom 60px

  > *
    position absolute

.labels
  margin-top -100px
  > div
    position absolute
    color white
    padding 5px 10px
    white-space nowrap

.graph
  width 100%
  height 100%

  svg
    height calc(100% - 32px)
    width 100%
    margin-top -50px
    .y-axis .major:nth-child(1)
      visibility hidden
    .axis
      text
        fill color-male
        font-size 13px
      .tick line
        stroke color1
        stroke-dasharray 2, 3
        stroke-width 0.3px
      path.domain
        fill none
        stroke none

    .prenoms
      .lines > g
        path
          stroke-width 3px
          fill none
        circle
          stroke none

    .playground-bg
      fill #edf4f8

    .playground
      fill black
      opacity 0

  .year-zoomers
    font-family "HelveticaLTStd-Roman"
    font-size 13px
    color color-male
    display flex
    width calc(100% - 146px)
    margin-left 50px
    > *
      text-decoration none
      color inherit
      border 1px solid color2
      padding 5px 0
      width: 100%
      margin-right: 5px
      text-align: center
      overflow hidden
      white-space nowrap
      &:last-child
        margin-right: 0
      &.selected
        color white
        background-color color-male
      .year
        /*font-family "HelveticaLTStd-Bold"*/
        font-weight bold
</style>
