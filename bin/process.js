const _ = require('lodash')
const { loadJSON, saveJSON } = require('./services/data-file')
const yearsRange = _.range(1945, 2016)

Promise
  .all([loadJSON('src/data/raw.json'), loadJSON('src/data/homonyms.json')])
  .then(([json, homonyms]) => {
    // const data = _.filter(processForenames(json), d => d.total > 2000)
    const forenames = processForenames(json)
    const computeKey = (forename, sex) => _.deburr(forename + ':' + sex).toLowerCase()

    const forenamesByForename = _.groupBy(forenames, d => computeKey(d.forename, d.sex))

    _.each(homonyms, alternative => {
      const [masterForename, ...others] = alternative.forenames
      const masterKey = computeKey(masterForename, alternative.sex)

      if (!forenamesByForename[masterKey]) {
        console.log(`alternative ${masterKey} not found`)
        return
      }

      _.each(others, forename => {
        const key = computeKey(forename, alternative.sex)
        const alternativeData = forenamesByForename[key]
        // delete forenamesByForename[key]

        if (!alternativeData) {
          console.log(`alternative ${key} not found`)
          return
        }

        forenamesByForename[masterKey] = forenamesByForename[masterKey].concat(alternativeData)
      })
    })
    // console.log(_.map(forenamesByForename['louane:f'], 'forename'))

    _.each(forenamesByForename, (forenameDatas, key) => {
      if (forenameDatas.length === 1) return

      const alternatives = _(forenameDatas)
        .map('forename')
        .flatMap(altForename => {
          const key = computeKey(altForename, forenameDatas[0].sex)
          const altForenameDatas = forenamesByForename[key]

          if (!altForenameDatas) {
            console.log(`${key} ${forenameDatas} alternative not found`)
            return
          }
          return altForenameDatas
        })
        // .reject(d => d.rejected)
        .uniqBy('forename')
        .value()

      // if (['aicha:f', 'louane:f'].includes(key)) {
      //   console.log(_.map(alternatives, 'forename'))
      //   // console.log(forenameDatas)
      // }

      const [forenameData, ...others] =
        _(alternatives)
          .sortBy(a => _(a.births).map('births').sum())
          .reverse()
          .value()

      forenameData.alternatives = []

      _.each(others, alternative => {
        alternative.rejected = true
        forenameData.alternatives.push(alternative.forename)
        _.each(forenameData.births, (d, i) => {
          d.births += alternative.births[i].births
        })
      })
      if (key === 'louane:f') {
        // console.log('%j', forenameData)
      }
    })

    const filteredForenames = _(forenames)
      .filter(d => !d.rejected && _(d.births).map('births').sum() >= 2000)
      .sortBy(d => computeKey(d.forename, d.sex))
      .value()

    _(filteredForenames)
      .groupBy('forename')
      .each((forenames, forename) => {
        const baseId = _.deburr(forename).toLowerCase()

        forenames.forEach(d => {
          if (forenames.length === 1) {
            d.forenameUnique = forename
            d.id = baseId
          } else {
            d.forenameUnique = `${d.forename} (${d.sex})`
            d.id = baseId + '-' + d.sex
          }
          const birthsByYear = _.keyBy(d.births, 'year')
          d.births = _.map(yearsRange, year => _.get(birthsByYear, [year, 'births'], 0))
        })
      })

    return saveJSON('src/data/forenames.json', filteredForenames)
  })

function processForenames (rawForenames) {
  const forenames = _(rawForenames)
    .groupBy(rp => rp.forename + ':' + rp.sex)
    .map(datas => {
      const birthsByYear = _(datas)
        .keyBy('year')
        .mapValues('births')
        .value()

      const forename = _(datas[0].forename)
        .split('-')
        .map(_.capitalize)
        .join('-')

      const sex = datas[0].sex

      return {
        forename,
        sex,
        births: _.map(yearsRange, year => ({ year, births: birthsByYear[year] || 0 }))
      }
    })
    .value()

  return forenames
}
