import * as d3 from 'd3'
import { axis, years, forenameColor, getSelectedFornames } from './svg'

const svg = d3.select('#app svg')

const popupEl =
  svg.select('#app .popup')
     .attr('opacity', 0)

const popupWidth = 300

function constrain (v, min, max) {
  return Math.min(Math.max(v, min), max)
}

function moveCircles (sel) {
  sel.attr('transform', (prenomData) => {
    const xPos = axis.x(currentYear)
    const yPos = axis.y(prenomData.years[currentYear - years[0]])
    return `translate(${xPos} ${yPos})`
  })
}
/*
eventBus.on('fornames:selection', () => {
  if (getSelectedFornames().length <= 1) {
    popupEl.transition().attr('opacity', 0)
  }
})

eventBus.on('axis:y:update', () => {
  svg
    .select('#circles')
    .selectAll('.circle')
    .transition()
    .duration(defaultDuration)
    .call(moveCircles)
})
*/
popupEl
  .append('rect')
  .attr('class', 'bg')
  .attr('width', popupWidth)
  .attr('height', 150)

popupEl
  .append('text')
  .attr('class', 'year')
  .attr('x', 10)
  .attr('y', 27)

function mouseenter () {
  if (getSelectedFornames()().length) {
    popupEl.transition().attr('opacity', 1)
    svg
      .selectAll('#circles .circle')
      .transition()
      .attr('opacity', 1)
  }
}

function mouseleave () {
  popupEl.transition().attr('opacity', 0)
  svg
    .selectAll('#circles .circle')
    .transition()
    .attr('opacity', 0)
}

let popupPosition = null
let lastMouseX = -1
let currentYear = years[0]

svg
  .on('mouseenter', mouseenter)
  .on('mouseleave', mouseleave)
  .on('mousemove', () => {
    const [mouseX, mouseY] = d3.mouse(this)

    if (mouseY > axis.y.range()[0]) {
      mouseleave()
      return
    }

    mouseenter()
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
