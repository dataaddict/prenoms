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

  .forename
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

<template lang="pug">
.popup(:class="[position]", :style="{opacity: show ? 1 : 0}")
  .year {{year}}
  .forename(v-for="forenameData in forenames")
    div
      .circle(:style="{ backgroundColor: forenameColor(forenameData) }")
      | {{forenameData.forenameUnique}}
    div {{countForForename(forenameData)}}
</template>

<script>
import _ from 'lodash'
import { forenameColor } from './utils'

export default {
  name: 'popup',
  props: ['forenames', 'position', 'show', 'year'],
  methods: {
    countForForename (forenameData) {
      const d = _.find(forenameData.births, d => d.year === this.year)
      const count = _.get(d, 'births', 0)
      if (count === 0) {
        return 'aucune naissance'
      } else {
        return `${count} naissance${count === 1 ? '' : 's'}`
      }
    },
    forenameColor
  }
}

/*
let popupPosition = null
let lastMouseX = -1
let currentYear = years[0]

svg
  .on('mousemove', (evt) => {
    currentYear = parseInt(axis.x.invert(mouseX))
    currentYear = constrain(currentYear, axis.x.domain()[0], axis.x.domain()[1])
    popupEl.select('.year').text('' + currentYear)

    const xTranslations = [axis.x.range()[0] + 20, axis.x.range()[1] - popupWidth - 20]

    function changePos (pos) {
      popupPosition = pos
      popupEl
        .attr('transform', 'translate(#{xTranslations[popupPosition]} #{axis.y.range()[1] + 20})')
    }

    if (popupPosition === null ||
         (popupPosition === 1 &&
           (mouseX - lastMouseX > 0) &&
           mouseX > xTranslations[1] - 30)
    ) {
      changePos(0)
    } else if (popupPosition === 0 && (mouseX - lastMouseX < 0) && mouseX < xTranslations[0] + popupWidth + 30) {
      changePos(1)
    }
    lastMouseX = mouseX

    svg
      .select('#circles')
      .selectAll('.circle')
      .call(moveCircles)

    const prenomSummaries =
      popupEl
        .selectAll('g.prenom_summary')

    prenomSummaries
      .select('text.prenom')
      .text(d => d.forenameUnique)

    prenomSummaries
      .select('text.naissances')
      .text(prenomData => {
        const c = prenomData.years[currentYear - years[0]]
        return c === 0 ? 'aucune naissance' : c + ' naissance' + (c > 1 ? 's' : '')
      })
  })

popupEl.update = function () {
  const prenomSummaries =
    popupEl
      .selectAll('g.prenom_summary')
      .data(getSelectedFornames(), d => d.unique_id)

  prenomSummaries
    .exit()
    .remove()

  const newPrenomSummaries =
    prenomSummaries
      .enter()
      .append('g')
      .classed('prenom_summary', true)

  const content =
    newPrenomSummaries
      .append('g')

  const prenomSummaryHeight = 25
  const prenomSummaryWidth = popupWidth - 20

  content
    .append('rect')
    .attr('class', 'bg')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', prenomSummaryWidth)
    .attr('height', prenomSummaryHeight)

  content
    .append('circle')
    .attr('fill', forenameColor)
    .attr('cx', prenomSummaryHeight / 2)
    .attr('cy', prenomSummaryHeight / 2)
    .attr('r', 4)

  const yTextOffset = prenomSummaryHeight - 8
  content
    .append('text')
    .classed('prenom', true)
    .attr('y', yTextOffset)
    .attr('x', 25)
    .text(p => p.prenom)

  content
    .append('text')
    .classed('naissances', true)
    .attr('y', yTextOffset)
    .attr('x', prenomSummaryWidth - 10)
    .attr('text-anchor', 'end')

  const marginY = 1
  const totalHeight = prenomSummaryHeight + marginY

  prenomSummaries
    .attr('transform', (d, i) => `translate(10 ${(i + 1) * (totalHeight) + 10})`)

  popupEl
    .select('* > rect.bg')
    .attr('height', (getSelectedFornames().length - 1) * totalHeight + 75)

  const circles =
    svg
      .select('#circles')
      .selectAll('.circle')
      .data(getSelectedFornames(), d => d.id)

  circles
    .exit()
    .remove()

  const newCircles =
    circles
      .enter()
      .append('g')
      .attr('class', 'circle')
      .attr('opacity', 0)
      .attr('transform', '')

  newCircles
    .append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 7)
    .attr('fill', forenameColor)

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
    .attr('fill', forenameColor)
}
*/
</script>
