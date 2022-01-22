const _ = require('lodash')
const fs = require('fs').promises
const path = require('path')
const { parse } = require('csv-parse/sync')

const computeId = ({ name, sex }) => `${name.toLowerCase()}-${sex}`
const yearsRange = _.range(1929, 2020)

;(async function () {
  const [rows, homonyms] = await Promise.all([
    (async function () {
      const csv = await fs.readFile(path.join('data', 'nat2020.csv'))

      const parsed = parse(csv, { columns: true, delimiter: ';' })

      return _(parsed)
        .reject({ annais: 'XXXX' })
        .reject({ preusuel: '_PRENOMS_RARES' })
        .map(row => ({
          sex: row.sexe === '1' ? 'h' : 'f',
          name: row.preusuel,
          year: parseInt(row.annais),
          births: parseInt(row.nombre)
        }))
        .filter(({ year }) => _.includes(yearsRange, year))
        .value()
    })(),

    (async function () {
      const csv = await fs.readFile(path.join('data', 'homonyms.csv'))

      const parsed = parse(csv)

      return _.map(parsed, ([sex, ...names]) => ({ sex, names: _.takeWhile(names, f => !_.isEmpty(f)) }))
    })()

  ])
  // .groupBy(({ forename, sex }) => `${forename}:${sex}`)

  const rowsById = _(rows)
    .groupBy(computeId)
    .map((fornameRows, id) => {
      const birthsByYear = _(fornameRows)
        .keyBy('year')
        .mapValues('births')
        .value()

      const name = _(fornameRows[0].name)
        .split('-')
        .map(_.capitalize)
        .join('-')

      return {
        id,
        name,
        sex: fornameRows[0].sex,
        births: _.map(yearsRange, year => birthsByYear[year] || 0)
      }
    })
    .values()
    .keyBy('id')
    .value()

  const idsToMerge = _(rowsById)
    .values()
    .groupBy(({ name, sex }) => `${_.deburr(name).toLowerCase()}-${sex}`)
    .values()
    .filter(rows => rows.length > 1)
    .map(rows => _.map(rows, 'id'))
    .value()

  const homonynsRowsToMerge = _.map(homonyms, ({ sex, names }) => _.map(names, name => computeId({ name, sex })))

  _.each(homonynsRowsToMerge, homonyms => {
    const mergeGroups = _.filter(idsToMerge, ids => _.some(ids, id => _.includes(homonyms, id)))

    const newGroup = _([homonyms, ...mergeGroups]).flatten().uniq().value()

    _.pull(idsToMerge, ...mergeGroups)

    idsToMerge.push(newGroup)
  })

  _.each(idsToMerge, ids => {
    const newRow = _
      .chain(ids)
      .map(id => {
        // if (rowsById[id]) return { ...rowsById[id], total: _.sum(rowsById[id].births) }
        if (rowsById[id]) return rowsById[id]
        throw new Error(`id not found ${id}`)
      })

    // .orderBy(
    //   [
    //     ({ name }) => _.sumBy(
    //       name.toLowerCase().split(''),
    //       letter => _.includes(['à', 'â', 'ä', 'é', 'è', 'ê', 'ë', 'ï', 'î', 'ô', 'ö', 'ù', 'û', 'ü', 'ÿ'], letter) ? 1 : 0
    //     ),
    //     ({ births }) => _.sum(births)
    //   ],
    //   ['desc', 'desc']
    // )

      .sortBy(({ births }) => _.sum(births))
      .reverse()

      // .tap(console.log)
      .reduce((merged, { id, births, name }) => {
        delete rowsById[id]

        return {
          ...merged,
          alternateNames: [...merged.alternateNames || [], name],
          births: _.zipWith(merged.births, births, (a, b) => a + b)
        }
      })
      .value()

    rowsById[newRow.id] = newRow
  })

  const filteredForenames = _(rowsById)
    .values()
    .filter(({ births }) => _.sum(births) >= 2000)
    .sortBy(({ name }) => _.deburr(name).toLowerCase())
    .value()

  await fs.writeFile(path.join('src', 'data.json'), JSON.stringify(filteredForenames))
})()
