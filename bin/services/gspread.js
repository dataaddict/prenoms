const Promise = require('bluebird')
const _ = require('lodash')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
// https://github.com/theoephraim/node-google-spreadsheet
const GoogleSpreadsheet = require('google-spreadsheet')

module.exports = function (spreadsheetName) {
  const creds = require(path.join(process.env.HOME, '.google-oauth.json'))
  const doc = Promise.promisifyAll(new GoogleSpreadsheet(spreadsheetName))

  return fs
    .readFileAsync(path.join(process.env.HOME, '.google.pem'))
    .then(privateKey => doc.useServiceAccountAuthAsync({ 'client_email': creds.email, 'private_key': privateKey }))
    .then(() => doc.getInfoAsync())
    .then(infos => {
      const sheet = Promise.promisifyAll(infos.worksheets[0])
      return sheet.getCellsAsync({ 'min-row': 1, 'max-row': sheet.rowCount })
    })
    .then(cells => {
      return _(cells)
        .groupBy('row')
        .values()
        .map(cols => {
          const [sex, ...forenames] = _(cols)
            .sortBy('col')
            .map(v => v.value.trim())
            .reject(v => v.startsWith('#'))
            .value()
          return { sex, forenames }
        })
        .value()
    })
    .catch(err => {
      console.error('error, did you share your doc to [%s] ?', creds.email, err)
    })
}
