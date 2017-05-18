#!/usr/bin/env node

const { loadJSON } = require('./services/data-file')
const Promise = require('bluebird')
const _ = require('lodash')

Promise
  .join(
    loadJSON('src/data/forenames.json'),
    loadJSON('src/data/prenoms-2010.json')
  )
  .spread((forenames, forenamesOld) => {
    _.each(forenames, forename => {
      const key = sanitizeStr(forename.forename) + '-' + forename.sex
      const forenameOld = _.find(forenamesOld, ({ prenom, sexe, alt }) => {
        return _([prenom])
          .concat(alt || [])
          .map(p => sanitizeStr(p) + '-' + (sexe === 'h' ? 'm' : 'f'))
          .find(k => k === key)
      })
      if (!forenameOld) {
        console.log(forename.forename)
      }
    })
  })

function sanitizeStr (s) {
  return _.lowerCase(_.deburr(s))
}
