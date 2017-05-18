const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))

exports.saveJSON = function saveJSON (filename, data) {
  return fs.writeFileAsync(filename, JSON.stringify(data, null, 2))
}

exports.loadJSON = function loadJSON (filename) {
  return fs.readFileAsync(filename)
    .then(d => JSON.parse(d))
}
