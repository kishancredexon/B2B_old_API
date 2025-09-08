const response = require("../../helper/response");
const { connectWithCricketDb, connectWithFootballDb } = require("../../config/mongodb_connections");
const createCricketPlayersModel = require("../../mongo_models_new/credexon_cricket/CktPlayerDetailsSchema");
const createFbPlayersModel = require("../../mongo_models_new/credexon_football/FbPlayersSchema");

module.exports = {
    player_list: async (req, res, next) => {
        try {
            const params = req.body;
            const user = req.user
            let limit = (req.query.page != undefined) ? parseInt(req.query.limit) : 10;
            let page = (req.query.page != undefined) ? parseInt(req.query.page) : 0;
            let skip = page * limit;
            if (params.type == "Cricket") {
                const cktDbConnection = await connectWithCricketDb();
                const CricketPlayersSchema = createCricketPlayersModel(cktDbConnection);

                //limit and pagination 
                let cricketplayerdetail = await CricketPlayersSchema.find({
                    match_id: params.match_id

                }).skip(skip).limit(limit)

                let data = cricketplayerdetail.map((item) => {

                    return (
                        {
                            _id: item._id,
                            match_id: item.match_id,
                            team_id: item.teama.team_id,
                            is_playing: item.is_playing11,
                            teama_name: item.teama.team.title,
                            teama_short_name: item.teama.team.abbr,
                            teama_logo_url: item.teama.team.thumb_url,
                            teama_country_name: item.teama.team.country,
                            teama_players: item.teama.players.map((item2, i) => {

                                return ({
                                    team_id: item.teama.team.tid,
                                    team_name: item.teama.team.title,
                                    team_short_name: item.teama.team.abbr,
                                    player_id: item2.pid,
                                    player_name: item2.title,
                                    country: item2.nationality,
                                    playing_role: item2.playing_role,
                                    batting_style: item2.batting_style,
                                    bowling_style: item2.bowling_style,
                                    rating: item2.fantasy_player_rating,
                                    recent_appearance: item2.recent_appearance,
                                    birthdate: item2.birthdate,
                                    // avg_point: item2.avg_point,
                                    avg_point: "",
                                    player_image: ""

                                })
                            }),

                            teamb_name: item.teamb.team.title,
                            teamb_short_name: item.teama.team.abbr,
                            teamb_logo_url: item.teamb.team.logo_url,
                            teamb_country_name: item.teamb.team.country,
                            team_id: item.teamb.team_id,
                            teamb_players: item.teamb.players.map((item3, i) => {
                                return ({
                                    team_id: item.teamb.team.tid,
                                    team_name: item.teamb.team.title,
                                    team_short_name: item.teamb.team.abbr,
                                    player_id: item3.pid,
                                    player_name: item3.title,
                                    country: item3.nationality,
                                    playing_role: item3.playing_role,
                                    batting_style: item3.batting_style,
                                    bowling_style: item3.bowling_style,
                                    rating: item3.fantasy_player_rating,
                                    recent_appearance: item3.recent_appearance,
                                    birthdate: item3.birthdate,
                                    avg_point: "",
                                    player_image: ""
                                })
                            })
                        })
                })

                //count 
                let total_count = await CricketPlayersSchema.find({ match_id: params.match_id, is_playing11: 1 }).count({})
                let status = cricketplayerdetail.length > 0 ? true : false

                return res.send(response({
                    total_count: total_count,
                    playerdetail: data,
                    status: cricketplayerdetail.length > 0 ? true : false,
                }, cricketplayerdetail.length > 0 ? "Cricket Player list view succesfully.!!!" : "No data found.!!!", true))

            }
            else if (params.type == "Football") {
                const footballDbConnection = await connectWithFootballDb();
                const FbPlayersSchema = createFbPlayersModel(footballDbConnection);

                //limit and pagination 
                const Footballplayerdetail = await FbPlayersSchema.find({
                    match_id: params.match_id
                }).skip(skip).limit(limit);

                let data = Footballplayerdetail.map((item) => {

                    return (
                        {
                            _id: item._id,
                            match_id: item.match_id,
                            team_id: item.teama.team_id,
                            is_playing: item.is_playing11,
                            teama_name: item.teama.team.title,
                            teama_short_name: item.teama.team.abbr,
                            teama_logo_url: item.teama.team.logo_url,
                            teama_country_name: item.teama.team.country,
                            // date_start: item.date_start,
                            // teama_country_name: item.teama.team.country,
                            teama_players: item.teama.squad.data.map((item2, i) => {





                                return ({
                                    team_id: item.teama.team_id,
                                    team_name: item.teama.team.title,
                                    team_short_name: item.teama.team.abbr,
                                    player_id: item2.player.data.player_id,
                                    player_name: item2.player.data.display_name,
                                    country: item2.player.data.nationality,
                                    playing_role: item2.player.data.position_id,
                                    player_image: item2.player.data.image_path,
                                    is_playing: item2.is_playing,
                                    rating: item2.rating,
                                    avg_point: "",
                                })
                            }),

                            teamb_id: item.teamb.team_id,
                            teamb_name: item.teamb.team.title,
                            teamb_short_name: item.teamb.team.abbr,
                            teamb_logo_url: item.teamb.team.logo_url,
                            teamb_country_name: item.teamb.team.country,
                            teamb_players: item.teamb.squad.data.map((item3, i) => {


                                return ({
                                    team_id: item.teamb.team_id,
                                    team_name: item.teamb.team.title,
                                    team_short_name: item.teamb.team.abbr,
                                    player_id: item3.player.data.player_id,
                                    player_name: item3.player.data.display_name,
                                    country: item3.player.data.nationality,
                                    playing_role: item3.player.data.position_id,
                                    player_image: item3.player.data.image_path,
                                    is_playing: item3.is_playing,
                                    rating: item3.rating,
                                    avg_point: "",

                                })
                            })
                        })
                })

                //count 
                let total_count = await FbPlayersSchema.find({ match_id: params.match_id }).count({})

                let status = Footballplayerdetail.length > 0 ? true : false

                return res.send(response({
                    total_count: total_count,
                    playerdetail: data,
                    status: Footballplayerdetail.length > 0 ? true : false,
                }, Footballplayerdetail.length > 0 ? "Player list view succesfully.!!!" : "No data found.!!!", true))
            }
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    }
}