
const {commentary_score_list,series_team_stats_list,series_match_lists} = require('../src/view_model/matchcontroller')

async function commentary_score (send_array) {
   let commentary_list = await commentary_score_list(send_array)
   return commentary_list
}

async function series_team_stats(send_array){
  let series_team_list = await series_team_stats_list(send_array)
  return series_team_list
}
async function series_match_list(send_array){ 
  let series_team_detail = await series_match_lists(send_array)
  return series_team_detail
}


module.exports = {
    commentary_score, series_team_stats, series_match_list
  }