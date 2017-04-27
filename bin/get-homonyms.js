const { saveJSON } = require('./lib/data-file')
const gspread = require('./lib/gspread')

gspread('156q0s394oFT2orOOT89kIlSbR8Xg_I9HRnPGvSn_TNs')
  .then(data => saveJSON('src/data/homonyms.json', data))
