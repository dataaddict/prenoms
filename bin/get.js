const refine = require('node-refine')
const { saveJSON } = require('./lib/data-file')

refine
  .load('prenoms')
  .then(json => saveJSON('src/data/raw.json', json))
