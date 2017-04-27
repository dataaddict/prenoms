const Promise = require('bluebird')
const axios = require('axios')
const csv = Promise.promisifyAll(require('csv'))
const _ = require('lodash')
const BASEURL = 'http://localhost:3333/command/core'
const querystring = require('querystring')

/*
refine.create-project \test, \assets/test.csv
  .then (project-id) ->
    console.log project-id
  .then ->
    refine.export-project \test
      .then (rows) ->
        console.log rows
*/

function getHttp (url, opts = {}) {
  return Promise.resolve(axios(_.assign({
    url: BASEURL + '/' + url,
    json: true
  }, opts)))
  .then(resp => resp.data)
}

/*
exports.createProject = function (projectName, data) {
  const csvData = fastCsv.writeToStringAsync(data, {
    headers: true
  })

    return new Promise(function(resolve, reject){
      return axios
        .post(
          BASEURL + '/create-project-from-upload',
          querystring.stringify({'project-name': projectName, })
        )
        .then(function(resp) {
          return resp.headers.location.match(/\=(\d+)$/)[1]
        })
      })
      x$.append('project-file', csvData, {
        filename: 'dummy.csv'
      })
      return x$
    })
  })
}
*/

exports.load = function (projectName, options = {}) {
  return getHttp('get-all-project-metadata')
    .then(function (body) {
      const project = _(body.projects)
      .toPairs()
      .map(it => _.assign({ id: it[0] }, it[1]))
      .sortBy('created')
      .reverse()
      .find(it => it.name === projectName)

      if (!project) throw new Error('refine project not found')

      return axios.post(
        BASEURL + '/export-rows/' + project.name + '.csv',
        querystring.stringify({
          engine: '{"facets":[],"mode":"row-based"}',
          project: project.id,
          format: 'csv'
        })
      )
    })
    .then(resp =>
      Promise.fromCallback(cb =>
        csv.parse(resp.data, { delimiter: ',', columns: true, 'auto_parse': !options.noConvert }, cb)
      )
    )
}

exports.applyHistory = function (fromProjectId, toProjectId) {
  return getHttp('get-operations', {
    params: {
      project: fromProjectId
    }
  })
}

/*
{
  "format": "tsv",
  "separator": "\t",
  "lineSeparator": "\n",
  "encoding": "UTF-8",
  "outputColumnHeaders": true,
  "outputBlankRows": true,
  "columns": [
    {
      "name": "aoc-id",
      "reconSettings": {
        "output": "entity-name",
        "blankUnmatchedCells": false,
        "linkToEntityPages": true
      },
      "dateSettings": {
        "format": "iso-8601",
        "useLocalTimeZone": false,
        "omitTime": false
      }
    },
    {
      "name": "nom",
      "reconSettings": {
        "output": "entity-name",
        "blankUnmatchedCells": false,
        "linkToEntityPages": true
      },
      "dateSettings": {
        "format": "iso-8601",
        "useLocalTimeZone": false,
        "omitTime": false
      }
    },
    {
      "name": "url",
      "reconSettings": {
        "output": "entity-name",
        "blankUnmatchedCells": false,
        "linkToEntityPages": true
      },
      "dateSettings": {
        "format": "iso-8601",
        "useLocalTimeZone": false,
        "omitTime": false
      }
    },
    {
      "name": "labels",
      "reconSettings": {
        "output": "entity-name",
        "blankUnmatchedCells": false,
        "linkToEntityPages": true
      },
      "dateSettings": {
        "format": "iso-8601",
        "useLocalTimeZone": false,
        "omitTime": false
      }
    },
    {
      "name": "categorie1",
      "reconSettings": {
        "output": "entity-name",
        "blankUnmatchedCells": false,
        "linkToEntityPages": true
      },
      "dateSettings": {
        "format": "iso-8601",
        "useLocalTimeZone": false,
        "omitTime": false
      }
    },
    {
      "name": "categorie2",
      "reconSettings": {
        "output": "entity-name",
        "blankUnmatchedCells": false,
        "linkToEntityPages": true
      },
      "dateSettings": {
        "format": "iso-8601",
        "useLocalTimeZone": false,
        "omitTime": false
      }
    }
  ]
}
*/
