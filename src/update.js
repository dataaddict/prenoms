import * as d3 from 'd3'
import data from './data'
import {forenameColor} from './svg'

export default function update () {
  updateList()
}

function updateList () {
  const overallMax = d3.max([].concat.apply([], data.map(d => d.years)))

  const sizes = [
    [0.9, 1],
    [1.2, 0.7],
    [1.7, 0.625],
    [2.0, 0.55],
    [2.5, 0.47]
  ]

  d3.select('#app')
    .selectAll('.forenames-list li')
    .classed('selected', d => d.selected)
    .style('background-color', d => d.selected ? forenameColor(d) : null)
    .each(function (forenameData) {
      const currentMax = d3.max(forenameData.years)
      const i = currentMax / overallMax

      let level
      if (i > 1) {
        level = 4
      } else if (i > 0.8) {
        level = 3
      } else if (i > 0.5) {
        level = 2
      } else if (i > 0.3) {
        level = 1
      } else {
        level = 0
      }

      const [fontSize, lineHeight] = sizes[level]
      this.style.fontSize = (fontSize * 17) + 'px'
      this.style.lineHeight = lineHeight
    })
}
