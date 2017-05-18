const { saveJSON } = require('./services/data-file')
const gspread = require('./services/gspread')

gspread('156q0s394oFT2orOOT89kIlSbR8Xg_I9HRnPGvSn_TNs')
  .then(data => saveJSON('src/data/homonyms.json', data))
