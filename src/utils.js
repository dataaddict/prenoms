import * as d3 from 'd3'
import _ from 'lodash'

const colorScales = {
  h: d3.scaleOrdinal().range(['#4c5d91', '#4c92b9', '#53a488', '#a5ad5c']),
  f: d3.scaleOrdinal().range(['#a15599', '#d57599', '#b98c6f', '#e0da2f'])
}

export const years = _.range(1929, 2020)

export function nameColor (d) {
  return colorScales[d.sex](d.name)
}

export const fullRange = d3.extent(years)

export const defaultDuration = 750

export function maxBirthsCount (names, range) {
  return _(names)
    .flatMap(d =>
      _(d.births)
        .filter(({ year }) => year >= range.from && year <= range.to)
        .map('births')
        .max()
    )
    .max() || 0
}

export const initialRange = { from: years[0], to: _.last(years) + 1 }
