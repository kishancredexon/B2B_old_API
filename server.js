require('dotenv').config(); // env initialize
require("./instrument.js");

const Sentry = require("@sentry/node");
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
const {
    PORT
} = process.env
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
const { dateTimeChange, dateTimeChangeFor, WriteErrorLogs, apiVersion, keyGen, currentTimeZoneDate } = require("./helper/common");
const { connectWithMasterDb } = require('./config/mongodb_connections.js');

//app.use(express.limit('2mb'));
var http = require('http');
// var {io}   = require( 'socket.io' )( http );
const { commentary_score, series_team_stats, series_match_list } = require('./service/sockets')

app.use(cors({
    origin: '*'
}));

var sessionVal = "";

// app.use(cors({
//     origin: ['http://localhost:8882','http://localhost','https://credexon.com','https://admin.credexon.com','https://phpapi.credexon.com']
// }));

// app.use((req, res, next) => {
//     const allowedOrigins = ['http://localhost'];
//     const origin = req.headers.origin;
//     if (allowedOrigins.includes(origin)) {
//          res.setHeader('Access-Control-Allow-Origin', origin);
//     }
//     //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
//     res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.header('Access-Control-Allow-Credentials', true);
//     return next();
//   });

Sentry.setupExpressErrorHandler(app);
const server = http.createServer(app);

// Increase server timeout if needed (default is 2 minutes)
server.setTimeout(600000);

//const server = http.listen(PORT, () => console.log(`Server running on ${PORT}`))
const io = require("socket.io")(server, {
    //pingTimeout: 60000,
    //pingInterval: 25000,
    cors: {
        origin: "*"
    }
})

app.get("/debug-sentry-io", function mainHandler(req, res) {
    throw new Error("My first Sentry error!");
  });


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

//Android
app.get('/a/:clientkey', function (req, res) {
    res.sendFile(__dirname + '/public/iptrack_' + req.params.clientkey + '.html');
});



const { connectMongo } = require("./config/mongodb");
// const {connectMongo} =require("./config/mongodb");




// app.use(cors('*'));
// const { createProxyMiddleware } = require('http-proxy-middleware');
// app.use(createProxyMiddleware({ 
//     target: 'https://credexon-admin.sandboxdevelopment.in', //original url 
//     changeOrigin: true, 
//     //secure: false,
//     onProxyRes: function (proxyRes, req, res) {
//        proxyRes.headers['Access-Control-Allow-Origin'] = '*'; 
//     }
// }));

// app.use(createProxyMiddleware({ 
//     target: 'https://credexon.sandboxdevelopment.in', //original url
//     changeOrigin: true, 
//     //secure: false,
//     onProxyRes: function (proxyRes, req, res) {
//        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
//     }
// }));


//git1

// connectMongo().then((res) => {

//   }).catch((err) => {
//         console.error('Server failed to start due to error: %s', err);
//   });




//src
const userappRoutes = require('./src/router/userrouter')
const contactusRoutes = require('./src/router/contactusrouter')
const contactusAdminRoutes = require('./admin/router/contactusrouter')
const matchfrontRoutes = require('./src/router/matchrouter')
const PoolRoutes = require('./src/router/poolroutes')
const bannerfrontRoutes = require('./src/router/bannerrouter')
const paymentRoutes = require('./src/router/paymentrouter')
const cmsfrontRoutes = require('./src/router/cmsrouter')

//admin
const useradminRoutes = require('./admin/router/userrouter')
const contestRoutes = require('./admin/router/contestrouter')
// const categoryadminRoutes = require('./admin/routes/category.router')
const tdsRoutes = require('./admin/router/tdsrouter')
const dashboardRoutes = require('./admin/router/dashboardrouter')
const subadminRoutes = require('./admin/router/subadminrouter')

const poolmasterRoutes = require('./admin/router/poolmasterrouter')
const matchRoutes = require('./admin/router/matchrouter')
const footballRoutes = require('./admin/router/footballrouter')
const cmsroutes = require('./admin/router/cmsrouter')
const matchaccumulatorroutes = require('./admin/router/matchaccumulatorrouter')
const teamroutes = require('./admin/router/teamrouter')
const bannerroutes = require('./admin/router/bannerrouter')
const playermangerroutes = require('./admin/router/playermanagerrouter')
//const paymentRoutes = require('./admin/router/paymentrouter')
const sereisroutes = require('./admin/router/seriesmanagerrouter')
const statemangerroutes = require('./admin/router/statemangerrouter')
const plymetadataroutes = require('./admin/router/playerrouter')
const categoryroutes = require('./admin/router/categoryrouter')
const faqroutes = require('./admin/router/faqrouter')
const transactionroutes = require('./admin/router/transactionrouter')
const wallletroutes = require('./admin/router/walletrouter')
const settingroutes = require('./admin/router/settingrouter')
const playeraccumulatorroutes = require('./admin/router/playeraccumulatorrouter')
const notificationRoutes = require('./admin/router/notificationrouter');
const notificationAppRoutes = require('./src/router/notificationrouter');
const reportManagementRoutes = require("./admin/router/reportmanagementrouter")
const usercontroller = require('./src/controller/usercontroller');
const vendorAdminRoutes = require('./admin/router/vendorrouter');
const masterUserRoutes = require('./admin/router/masteruserrouter.js');



//const db = require('./models');
const { poolDetail, poolDetailSeries, myPoolDetail } = require('./src/view_model/contest.viewmodel');
const { plyAccumulator, plyAllAccumulator } = require('./src/view_model/accumulator.viewmodel');
const { userWinningContest, tmAccumulator } = require('./src/view_model/tmAcc.viewmodel');
const { poolpzAccumulator, match_cricket_pool_contest_list, match_football_pool_contest_list, series_cricket_pool_contest_list, series_football_pool_contest_list, filter_contest_ckt } = require('./src/view_model/poolpz.viewmodel');
const { publish_active_match_list, publish_active_football_list, player_list_view, myFixLiveResultMatchData, series_match_contest_list } = require('./src/view_model/matchcontroller');

//db.sequelize.sync(); //db sync


app.use(express.json()) //json allow
app.use(express.urlencoded({
    extended: true
})) //json allow

app.use(morgan('dev'))

//Todo: Need to remove after complete changes
connectMongo().then((res) => {
    console.log(res, "response");
}).catch((err) => {
    console.error('Server failed to start due to error: %s', err);
});

connectWithMasterDb().then((res) => {
    console.log("Db Connected");
}).catch((err) => {
    console.error('Server failed to start due to error: %s', err);
});

//admin

app.use('/admin/'+apiVersion.v1+'/users', useradminRoutes) //user router
app.use('/admin/'+apiVersion.v1+'/contest', contestRoutes)  //contest router
app.use('/admin/'+apiVersion.v1+'/poolmaster', poolmasterRoutes)  //poolmaster router
app.use('/admin/'+apiVersion.v1+'/match', matchRoutes) //match router
app.use('/admin/'+apiVersion.v1+'/football', footballRoutes)  //football router
app.use('/admin/'+apiVersion.v1+'/cms', cmsroutes) //cms router
app.use('/admin/'+apiVersion.v1+'/accumulator', matchaccumulatorroutes) //match accumultaor
app.use('/admin/'+apiVersion.v1+'/series', sereisroutes) //sereis router
app.use('/admin/'+apiVersion.v1+'/team', teamroutes) //cms router
app.use('/admin/'+apiVersion.v1+'/banner', bannerroutes)  //banner router
app.use('/admin/'+apiVersion.v1+'/playermanager', playermangerroutes)  //playermangerroutes
//app.use('/admin/'+apiVersion.v1+'/payment', paymentRoutes);
app.use('/admin/'+apiVersion.v1+'/statemanger', statemangerroutes)  //statemangerroutes
app.use('/admin/'+apiVersion.v1+'/plymetadata', plymetadataroutes)  //plymetadataroutes
app.use('/admin/'+apiVersion.v1+'/category', categoryroutes) //categoryroutes
app.use('/admin/'+apiVersion.v1+'/faq', faqroutes) //faqroutes
app.use('/admin/'+apiVersion.v1+'/transaction', transactionroutes)  //transactionroutes
app.use('/admin/'+apiVersion.v1+'/wallet', wallletroutes) //wallletroutes
app.use('/admin/'+apiVersion.v1+'/setting', settingroutes) //settingroutes
app.use('/admin/'+apiVersion.v1+'/playeraccumulator', playeraccumulatorroutes) //playeraccumulatorroutes
app.use('/admin/'+apiVersion.v1+'/tds', tdsRoutes) //tdsRoutes
app.use('/admin/'+apiVersion.v1+'/dashboard', dashboardRoutes)  //dashboardRoutes
app.use('/admin/'+apiVersion.v1+'/subadmin', subadminRoutes) ///subadminRoutes
app.use('/admin/'+apiVersion.v1+'/notification', notificationRoutes)
app.use('/admin/'+apiVersion.v1+'/contactus', contactusAdminRoutes) //contactus router
app.use('/admin/'+apiVersion.v1+'/vendor', vendorAdminRoutes) //vendor router

//MasterUser
app.use('/admin/'+apiVersion.v1+'/masterUser', masterUserRoutes) //master user router

//src
app.use('/app/'+apiVersion.v1+'/users', userappRoutes)   //user router
app.use('/app/'+apiVersion.v1+'/contactus', contactusRoutes) //contactus router


app.use('/app/'+apiVersion.v1+'/match', matchfrontRoutes)  //match front router
app.use('/app/'+apiVersion.v1+'/pool', PoolRoutes)  //pool front router
app.use('/app/'+apiVersion.v1+'/banners', bannerfrontRoutes)  //bannerRoutes
app.use('/app/'+apiVersion.v1+'/payment', paymentRoutes);
app.use('/app/'+apiVersion.v1+'/cms', cmsfrontRoutes) //cmsfrontRoutes
app.use('/app/'+apiVersion.v1+'/notification', notificationAppRoutes)
app.use('/admin/'+apiVersion.v1+'/report', reportManagementRoutes) // report management route

app.use('/image', express.static('./upload/images'));
app.use('/profile_doc', express.static('./upload/profile_doc'));

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./helper/swagger.json');

// Configure Swagger UI options
const swaggerUiOptions = {
    customCss: '.swagger-ui .topbar { display: none }', // Remove topbar
    swaggerOptions: {
      dom_id: '#swagger-ui', // Specify the div to render Swagger UI
      displayRequestDuration: false, // Hide request duration header
    },
  };
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument,swaggerUiOptions));
///a/:id
//app.use('/a/:id', usercontroller.countApiHit);

app.use(express.static('https://phpapi.credexon.com'));

//const usercontroller = require('./src/controller/usercontroller');
app.post('/getipinfo', usercontroller.countApiHit);



//WriteErrorLogs("ErrorLog", "ErrorLog", "sdsds", "error==SS=");

var CronJob = require('cron').CronJob;

let livePoolDataObj = {};
let publishActiveMatchList = {};
let playerListObj = {};
let matchCktPoolContestObj = {};
let matchFbPoolContestObj = {};
let matchCktSPoolContestObj = {};
let matchFbSPoolContestObj = {};
let seriesMatchDataObj = {};
let livePoolSeriesDataObj = {};

const jwt = require('jsonwebtoken');//
const {
    secretA
} = require('./config.json');
const authorize = require("./middleware/authorize_session.middleware");
const nonauthorize = require("./middleware/non_authorize_session.middleware.js");
const { cacheStorageGet, cacheStorageSet } = require('./helper/redis_set_get.js');
const importCSV = require('./admin/controller/importcsvinmongodb.js');

let isActive=true;
let cntt=0;
io.on('connection', async function (socket) {
    console.log(`New connection: ${socket.id}`);
    //let userData =socket?.handshake?.query?.authorization && await authorize(socket.handshake.query.authorization);
       
        socket.on('fix_live_result_match_data_v2', async function (send_array) {
            console.log("----fix_live_result_match_data_v2-----");//Done
            
            let userData={};
            if(send_array.cronapikey){
                userData=await nonauthorize(send_array.cronapikey);
            }else{
                userData=await authorize(send_array.authorization);
            }

            let emit_detail = `fix_live_result_match_data_v2_${userData.dbName}_${send_array.rstatus}_${send_array.type}`;
            let getRedisData=await cacheStorageGet(emit_detail);
            if (isActive || !(getRedisData) || send_array.fetch_latest === 1) { 
                let match_list = null;
                send_array={...send_array,userData}
                if (send_array.type === "Cricket") {
                    match_list = await publish_active_match_list(send_array);
                } else {
                    match_list = await publish_active_football_list(send_array);
                }
                //publishActiveMatchList[send_array.rstatus + send_array.type + userData.apikey] = match_list;
                let convertDataString=match_list?JSON.stringify(match_list):"";
                await cacheStorageSet(emit_detail,convertDataString);
                let currentDates = currentTimeZoneDate();
                match_list.current_timezone = currentDates;
                match_list.currenttime = currentDates * 1;
                io.emit(emit_detail, JSON.stringify(match_list));
            } else {
                let match_list =JSON.parse(getRedisData); //publishActiveMatchList[send_array.rstatus + send_array.type + userData.apikey];
                let currentDates = currentTimeZoneDate();
                match_list.current_timezone = currentDates;
                match_list.currenttime = currentDates * 1;
                io.emit(emit_detail, JSON.stringify(match_list));
            }
        })

        socket.on('live_match_data', async function (send_array) {
            console.log("----live_match_data-----",send_array)
            if (send_array) {
                
                let userData={};
                if(send_array.cronapikey){
                    userData=await nonauthorize(send_array.cronapikey);
                }else{
                    userData=await authorize(send_array.authorization);
                }
                
                send_array={...send_array,userData};
                
                let emit_detail = `live_match_data_${send_array.match_id}_${send_array.type}`;//_${send_array.status}_${send_array.userid}
                console.log("emit_detail--->>",emit_detail)
                let getRedisData=await cacheStorageGet(emit_detail);
                let commentary_scores=null;
                if(isActive || !(getRedisData)){
                    commentary_scores = await commentary_score(send_array)
                    let convertDataString=commentary_scores?JSON.stringify(commentary_scores):"";
                    await cacheStorageSet(emit_detail,convertDataString);
                }else{
                    commentary_scores =JSON.parse(getRedisData);
                }

                let currentDates = currentTimeZoneDate();
                if (!commentary_scores) {
                    commentary_scores = {};
                }
                commentary_scores.current_timezone = currentDates;
                commentary_scores.currenttime = currentDates * 1;
                io.emit(emit_detail, JSON.stringify(commentary_scores));
            }

        });

        socket.on('series_team_stats_data', async function (send_array) {
            console.log("----series_team_stats_data-----")
            if (send_array) {
                let userData=await authorize(send_array.authorization);
                send_array={...send_array,userData}
                
                let emit_detail = `series_team_stats_data_${send_array.cid}_${send_array.type}_${send_array.status}_${send_array.userid}`;
                let getRedisData=await cacheStorageGet(emit_detail);
                let series_team_stats_list=null;
                if(1==1 || !(getRedisData)){
                    series_team_stats_list = await series_team_stats(send_array);
                    let convertDataString=series_team_stats_list?JSON.stringify(series_team_stats_list):"";
                    await cacheStorageSet(emit_detail,convertDataString);
                }else{
                    series_team_stats_list =JSON.parse(getRedisData);
                }

                let currentDates = currentTimeZoneDate();
                series_team_stats_list.current_timezone = currentDates;
                series_team_stats_list.currenttime = currentDates * 1;
                io.emit(emit_detail, JSON.stringify(series_team_stats_list));

            }

        });

        socket.on('series_match_data_with_status_v2', async function (send_array) {
            console.log("----series_match_data_with_status_v2-----",send_array)
            //if (send_array) {
                let userData=await authorize(send_array.authorization);
                let emit_detail = `series_match_data_with_status_v2_${userData.dbName}_${send_array.cid}_${send_array.type}_${send_array.status}`;    
                let getRedisData=await cacheStorageGet(emit_detail);
                
            if (isActive || !(getRedisData) || send_array.fetch_latest === 1) {
                let series_match_detail = await series_match_list(send_array)
                //seriesMatchDataObj[send_array.cid + send_array.type + userData.apikey] = series_match_detail;
                let convertDataString=series_match_detail?JSON.stringify(series_match_detail):"";
                await cacheStorageSet(emit_detail,convertDataString);

                series_match_detail=(series_match_detail)?series_match_detail:{};
                let currentDates = currentTimeZoneDate();
                series_match_detail.current_timezone = currentDates;
                series_match_detail.currenttime = currentDates * 1;
                io.emit(emit_detail, JSON.stringify(series_match_detail));
            } else {
                //let series_match_list = seriesMatchDataObj[send_array.cid + send_array.type + userData.apikey];
                let series_match_list =JSON.parse(getRedisData);
                let currentDates = currentTimeZoneDate();

                series_match_list=(series_match_detail)?series_match_detail:{};

                series_match_list.current_timezone = currentDates;
                series_match_list.currenttime = currentDates * 1;
                io.emit(emit_detail, JSON.stringify(series_match_list));
            }
        });

        socket.on('series_match_data_contest_v2', async function (send_array) {
            console.log("----series_match_data_contest_v2-----")
            let userData=await authorize(send_array.authorization);
            let emit_detail = `series_match_data_contest_v2_${userData.dbName}_${send_array.cid}_${send_array.type}_${send_array.contest_id}`;
            let getRedisData=await cacheStorageGet(emit_detail); 
            let series_match_detail=null;
            if (send_array.contest_id) {
                if(1==1 || !(getRedisData)){
                        send_array={...send_array,userData}
                        series_match_detail = await series_match_contest_list(send_array);
                        let convertDataString=series_match_detail?JSON.stringify(series_match_detail):"";
                        await cacheStorageSet(emit_detail,convertDataString);
                }else{
                    series_match_detail =JSON.parse(getRedisData);
                }
                let currentDates = currentTimeZoneDate();
                series_match_detail.current_timezone = currentDates;
                series_match_detail.currenttime = currentDates * 1;
                io.emit(emit_detail, JSON.stringify(series_match_detail));
            }
        });



        //{"match_id":"56214","pool_id":"639c442e55b796420bd13cbc","type":"cricket","status":2}
        socket.on('live_pool_data', async function (send_array) {
            console.log("----live_pool_data-----")
            if (send_array) {
                let userData=await authorize(send_array.authorization);
                send_array={...send_array,userData};
                let emit_detail = `live_pool_data_${send_array.match_id}_${send_array.pool_id}_${send_array.type}_${send_array.status}_${send_array.userid}`;
                let getRedisData=await cacheStorageGet(emit_detail); 
                let sPoolDetail=null;
                if(isActive || !(getRedisData)){
                    sPoolDetail = await poolDetail(send_array);
                    let convertDataString=sPoolDetail?JSON.stringify(sPoolDetail):"";
                    await cacheStorageSet(emit_detail,convertDataString);
                }else{
                    sPoolDetail =JSON.parse(getRedisData);
                }

                let currentDates = currentTimeZoneDate();
                sPoolDetail.current_timezone = currentDates;
                sPoolDetail.currenttime = currentDates * 1;
                io.emit(emit_detail, JSON.stringify(sPoolDetail));
            }

        });


        socket.on('live_pool_data_v2', async function (send_array) {
            console.log("----live_pool_data_v2-----")
            if (send_array) {
                //let userData=await authorize(send_array.authorization,send_array.auth);
               
                let userData={};
                if(send_array.cronapikey){
                    userData=await nonauthorize(send_array.cronapikey);
                }else{
                    userData=await authorize(send_array.authorization,send_array.auth);
                }

                send_array={...send_array,userData};
                let emit_detail = `live_pool_data_v2_${userData.dbName}_${send_array.match_id}_${send_array.pool_id}_${send_array.type}`;
                let cacheKeyName=emit_detail+"_"+userData.user.apikey;
                let getRedisData=await cacheStorageGet(cacheKeyName); 
                
                let sPoolDetail=null;
                if (isActive || !(getRedisData) || send_array.fetch_latest === 1) {
                    sPoolDetail = await poolDetail(send_array);
                    
                    //livePoolDataObj[send_array.match_id + "_" + send_array.pool_id + userData.apikey] = sPoolDetail;
                    let convertDataString=sPoolDetail?JSON.stringify(sPoolDetail):"";
                    await cacheStorageSet(cacheKeyName,convertDataString);
                } else {
                    //let currentPool = livePoolDataObj[send_array.match_id + "_" + send_array.pool_id + userData.apikey];
                    sPoolDetail =JSON.parse(getRedisData);
                }
                let currentDates = currentTimeZoneDate();
                
                sPoolDetail.current_timezone = currentDates;
                sPoolDetail.currenttime = currentDates * 1;
                io.emit(emit_detail, JSON.stringify(sPoolDetail));
                
            }
        });

        socket.on('live_pool_series_data', async function (send_array) {
            console.log("----live_pool_series_data-----")
            if (send_array) {
                let userData=await authorize(send_array.authorization);
                send_array={...send_array,userData};
                let emit_detail = `live_pool_series_data_${send_array.league_id}_${send_array.pool_id}_${send_array.type}_${send_array.status}_${send_array.userid}`;
                let getRedisData=await cacheStorageGet(emit_detail); 
                let sPoolDetail=null;
                if(!(getRedisData)){
                    sPoolDetail = await poolDetailSeries(send_array);
                    let convertDataString=sPoolDetail?JSON.stringify(sPoolDetail):"";
                    await cacheStorageSet(emit_detail,convertDataString);
                }else{
                    sPoolDetail =JSON.parse(getRedisData);
                }

                let currentDates = currentTimeZoneDate();
                sPoolDetail.current_timezone = currentDates;
                sPoolDetail.currenttime = currentDates * 1;
                io.emit(emit_detail, JSON.stringify(sPoolDetail));
            }

        });

        socket.on('live_pool_series_data_v2', async function (send_array) {
            console.log("----live_pool_series_data_v2-----")
            if (send_array) {
                let userData=await authorize(send_array.authorization);
                send_array={...send_array,userData};
                
                let emit_detail = `live_pool_series_data_v2_${userData.dbName}_${send_array.league_id}_${send_array.pool_id}_${send_array.type}`;
                let getRedisData=await cacheStorageGet(emit_detail); 
                let sPoolDetail=null;
                if (1==1 || !(getRedisData) || send_array.fetch_latest === 1) {
                    sPoolDetail = await poolDetailSeries(send_array);
                    //livePoolSeriesDataObj[send_array.league_id + "_" + send_array.pool_id + userData.apikey] = sPoolDetail;
                    let convertDataString=sPoolDetail?JSON.stringify(sPoolDetail):"";
                    await cacheStorageSet(emit_detail,convertDataString);
                } else {
                    //let currentPool = livePoolSeriesDataObj[send_array.league_id + "_" + send_array.pool_id + userData.apikey];
                    sPoolDetail =JSON.parse(getRedisData);
                }
                sPoolDetail=sPoolDetail?sPoolDetail:{}
                    let currentDates = currentTimeZoneDate();
                    sPoolDetail.current_timezone = currentDates;
                    sPoolDetail.currenttime = currentDates * 1;
                    io.emit(emit_detail, JSON.stringify(sPoolDetail));
            }
        });

        socket.on('live_plyacc_data', async function (send_array) {
            console.log("----live_plyacc_data-----")
            if (send_array) {
                
                //////
                let userData={};
                if(send_array.cronapikey){
                    userData=await nonauthorize(send_array.cronapikey);
                }else{
                    userData=await authorize(send_array.authorization,send_array.auth);
                }
                send_array={...send_array,userData}
                ////////
                
                let emit_detail = `live_plyacc_data_${send_array.match_id}_${send_array.type}_${send_array.status}_${send_array.userid}`;
                let cacheKeyName=emit_detail+"_"+userData.user.apikey;
                let getRedisData=await cacheStorageGet(cacheKeyName); 
                let sPoolDetail=null;
                if(isActive || !(getRedisData)){
                    sPoolDetail = await plyAccumulator(send_array);
                    let convertDataString=sPoolDetail?JSON.stringify(sPoolDetail):"";
                    await cacheStorageSet(cacheKeyName,convertDataString);
                }else{
                    sPoolDetail =JSON.parse(getRedisData);   
                }
                let currentDates = currentTimeZoneDate();
                sPoolDetail.current_timezone = currentDates;
                sPoolDetail.currenttime = currentDates * 1;
                io.emit(emit_detail, JSON.stringify(sPoolDetail));

            }
        });

        socket.on('live_plyacc_leaderboard', async function (send_array) {
            console.log("----live_plyacc_leaderboard-----")

            if (send_array) {
                let userData=await authorize(send_array.authorization);
                send_array={...send_array,userData}
                let emit_detail = `live_plyacc_leaderboard_${send_array.match_id}_${send_array.type}_${send_array.status}_${send_array.userid}`;
                let getRedisData=await cacheStorageGet(emit_detail); 
                let sPoolDetail=null;
                if(isActive || !(getRedisData)){
                    sPoolDetail = await plyAllAccumulator(send_array);
                    let convertDataString=sPoolDetail?JSON.stringify(sPoolDetail):"";
                    await cacheStorageSet(emit_detail,convertDataString);
                }else{
                    sPoolDetail =JSON.parse(getRedisData); 
                }

                let currentDates = currentTimeZoneDate();
                sPoolDetail.current_timezone = currentDates;
                sPoolDetail.currenttime = currentDates * 1;
                io.emit(emit_detail, JSON.stringify(sPoolDetail));

            }
        });


        socket.on('live_tmacc_data', async function (send_array) {
            console.log("----live_tmacc_data-----")
            if (send_array) {
                let userData=await authorize(send_array.authorization);
                send_array={...send_array,userData}
                
                let emit_detail = `live_tmacc_data_${send_array.league_id}_${send_array.type}_${send_array.status}_${send_array.userid}`;
                let getRedisData=await cacheStorageGet(emit_detail); 
                let sPoolDetail=null;
                if(!(getRedisData)){
                    sPoolDetail = await tmAccumulator(send_array);
                    let convertDataString=sPoolDetail?JSON.stringify(sPoolDetail):"";
                    await cacheStorageSet(emit_detail,convertDataString);
                }else{
                    sPoolDetail =JSON.parse(getRedisData);
                }
                let currentDates = currentTimeZoneDate();
                sPoolDetail.current_timezone = currentDates;
                sPoolDetail.currenttime = currentDates * 1;
                io.emit(emit_detail, JSON.stringify(sPoolDetail));

            }
        });

        socket.on('live_poolpz_data', async function (send_array) {
            console.log("----live_poolpz_data-----")
            if (send_array) {
                let userData=await authorize(send_array.authorization);
                send_array={...send_array,userData}
                
                let emit_detail = `live_poolpz_data_${send_array.league_id}_${send_array.type}_${send_array.status}_${send_array.userid}`;
                let getRedisData=await cacheStorageGet(emit_detail); 
                let sPoolDetail=null;
                if(!(getRedisData)){
                    sPoolDetail = await poolpzAccumulator(send_array);
                    let convertDataString=sPoolDetail?JSON.stringify(sPoolDetail):"";
                    await cacheStorageSet(emit_detail,convertDataString);
                }else{
                    sPoolDetail =JSON.parse(getRedisData);
                }

                let currentDates = currentTimeZoneDate();
                sPoolDetail.current_timezone = currentDates;
                sPoolDetail.currenttime = currentDates * 1;
                io.emit(emit_detail, JSON.stringify(sPoolDetail));
            }
        });


        socket.on('myportfolio_series_data', async function (send_array) {
            console.log("----myportfolio_series_data-----")
            if (send_array) {
                let userData=await authorize(send_array.authorization);
                send_array={...send_array,userData};

                let emit_detail = `myportfolio_series_data_${send_array.league_id}_${send_array.type}_${send_array.status}_${send_array.userid}`;
                let getRedisData=await cacheStorageGet(emit_detail);
                let Detail=null;
                
                if(1==1 || !(getRedisData)){
                    let steamAccDetail = await tmAccumulator(send_array);
                    let sPoolDetails = await poolpzAccumulator(send_array);
                    Detail = { seriesDetail: steamAccDetail.seriesDetail, teamAccumulator: { coins_summry: steamAccDetail.coins_summry, teamAccData: steamAccDetail.teamAccData }, prizePool: { coins_summry: sPoolDetails.coins_summry, prizePoolData: sPoolDetails.prizePoolData } }
                    let convertDataString=Detail?JSON.stringify(Detail):"";
                    await cacheStorageSet(emit_detail,convertDataString);
                }else{
                    Detail =JSON.parse(getRedisData);
                }

                let currentDates = currentTimeZoneDate();
                Detail.current_timezone = currentDates;
                Detail.currenttime = currentDates * 1;
                io.emit(emit_detail, JSON.stringify(Detail));
            }
        });

        socket.on('player_list_v2', async function (send_array) {
            console.log("----player_list_v2-----")

            if (send_array) {
                let userData=await authorize(send_array.authorization);
                send_array={...send_array,userData};
                let emit_detail = `player_list_v2_${userData.dbName}_${send_array.match_id}_${send_array.type}`;
                let getRedisData=await cacheStorageGet(emit_detail);
                if (isActive || send_array.fetch_latest === 1 || !(getRedisData)) {
                    let sPlayerList = await player_list_view(send_array);
                    //playerListObj[send_array.match_id + userData.apikey] = sPlayerList;
                    let convertDataString=sPlayerList?JSON.stringify(sPlayerList):"";
                    await cacheStorageSet(emit_detail,convertDataString);

                    let currentDates = currentTimeZoneDate();
                    sPlayerList.current_timezone = currentDates;
                    sPlayerList.currenttime = currentDates * 1;
                    io.emit(emit_detail, JSON.stringify(sPlayerList));

                } else {
                    //let currentPool = playerListObj[send_array.match_id + userData.apikey];
                    let currentPool =JSON.parse(getRedisData);
                    let currentDates = currentTimeZoneDate();
                    currentPool.current_timezone = currentDates;
                    currentPool.currenttime = currentDates * 1;
                    io.emit(emit_detail, JSON.stringify(currentPool));
                }
            }
        });

        //////////////////
        socket.on('match_cricket_pool_contest_list_v2', async function (send_array) {
            console.log("----match_cricket_pool_contest_list_v2-----")
            if (send_array) {
                //userData=await authorize(send_array.authorization,send_array.auth);
                if(send_array.cronapikey){
                    userData=await nonauthorize(send_array.cronapikey);
                }else{
                    userData=await authorize(send_array.authorization,send_array.auth);
                }
                send_array={...send_array,"userData":userData}
                
                let emit_detail = `match_cricket_pool_contest_list_v2_${userData.dbName}_${send_array.match_id}_${send_array.type}`;
                let getRedisData=await cacheStorageGet(emit_detail);
                
                if(isActive || send_array.fetch_latest === 1 || !(getRedisData)) {
                    let sCricketPoolContestList = await match_cricket_pool_contest_list(send_array);
                    //matchCktPoolContestObj[send_array.match_id + userData.apikey] = sCricketPoolContestList;
                    
                    let convertDataString=sCricketPoolContestList?JSON.stringify(sCricketPoolContestList):"";
                    await cacheStorageSet(emit_detail,convertDataString);
                    let currentDates = currentTimeZoneDate();
                    sCricketPoolContestList.current_timezone = currentDates;
                    sCricketPoolContestList.currenttime = currentDates * 1;
                    io.emit(emit_detail, JSON.stringify(sCricketPoolContestList));

                } else {
                    //let currentPool = matchCktPoolContestObj[send_array.match_id + userData.apikey];
                    let currentPool =JSON.parse(getRedisData);
                    let currentDates = currentTimeZoneDate();
                    currentPool.current_timezone = currentDates;
                    currentPool.currenttime = currentDates * 1;
                    io.emit(emit_detail, JSON.stringify(currentPool));
                }
            }
        });

        socket.on('match_football_pool_contest_list_v2', async function (send_array) {
            console.log("----match_football_pool_contest_list_v2-----")

                if (send_array) {
                    let userData={};
                if(send_array.cronapikey){
                    userData=await nonauthorize(send_array.cronapikey);
                }else{
                    userData=await authorize(send_array.authorization,send_array.auth);
                }
                
                send_array={...send_array,userData};
                
                let emit_detail = `match_football_pool_contest_list_v2_${userData.dbName}_${send_array.match_id}_${send_array.type}`;
                let getRedisData=await cacheStorageGet(emit_detail);

                if (isActive || send_array.fetch_latest === 1 || !(getRedisData)) {
                    let sFootballPoolContestList = await match_football_pool_contest_list(send_array);
                    //matchFbPoolContestObj[send_array.match_id + userData.apikey] = sFootballPoolContestList;
                    let convertDataString=sFootballPoolContestList?JSON.stringify(sFootballPoolContestList):"";
                    await cacheStorageSet(emit_detail,convertDataString);
                    let currentDates = currentTimeZoneDate();
                    sFootballPoolContestList.current_timezone = currentDates;
                    sFootballPoolContestList.currenttime = currentDates * 1;
                    io.emit(emit_detail, JSON.stringify(sFootballPoolContestList));

                } else {
                    //let currentPool = matchFbPoolContestObj[send_array.match_id + userData.apikey];
                    let currentPool =JSON.parse(getRedisData);
                    let currentDates = currentTimeZoneDate();
                    currentPool.current_timezone = currentDates;
                    currentPool.currenttime = currentDates * 1;
                    io.emit(emit_detail, JSON.stringify(currentPool));
                }
            }
        });

        socket.on('series_cricket_pool_contest_list_v2', async function (send_array) {
            console.log("----series_cricket_pool_contest_list_v2-----")

            if (send_array) {
                let userData=await authorize(send_array.authorization);
                send_array={...send_array,userData};
                
                let emit_detail = `series_cricket_pool_contest_list_v2_${userData.dbName}_${send_array.match_id}_${send_array.type}`;
                let getRedisData=await cacheStorageGet(emit_detail);
                
                if (isActive || !(getRedisData) || send_array.fetch_latest === 1) {
                    let sCricketPoolContestList = await series_cricket_pool_contest_list(send_array);
                    //matchCktSPoolContestObj[send_array.match_id + userData.apikey] = sCricketPoolContestList;
                    let convertDataString=sCricketPoolContestList?JSON.stringify(sCricketPoolContestList):"";
                    await cacheStorageSet(emit_detail,convertDataString);
                    let currentDates = currentTimeZoneDate();
                    sCricketPoolContestList.current_timezone = currentDates;
                    sCricketPoolContestList.currenttime = currentDates * 1;
                    io.emit(emit_detail, JSON.stringify(sCricketPoolContestList));

                } else {
                    //let currentPool = matchCktSPoolContestObj[send_array.match_id + userData.apikey];
                    let currentPool =JSON.parse(getRedisData);
                    let currentDates = currentTimeZoneDate();
                    currentPool.current_timezone = currentDates;
                    currentPool.currenttime = currentDates * 1;
                    io.emit(emit_detail, JSON.stringify(currentPool));
                }
            }
        });

        socket.on('series_football_pool_contest_list_v2', async function (send_array) {
            console.log("----series_football_pool_contest_list_v2-----")

            if (send_array) {
                let userData=await authorize(send_array.authorization);
                send_array={...send_array,userData};
                let emit_detail = `series_football_pool_contest_list_v2_${userData.dbName}_${send_array.match_id}_${send_array.type}`;
                let getRedisData=await cacheStorageGet(emit_detail);
                
                if (isActive || !(getRedisData) || send_array.fetch_latest === 1) {
                    let sFootballPoolContestList = await series_football_pool_contest_list(send_array);
                    //matchFbSPoolContestObj[send_array.match_id + userData.apikey] = sFootballPoolContestList;
                    let convertDataString=sFootballPoolContestList?JSON.stringify(sFootballPoolContestList):"";
                    await cacheStorageSet(emit_detail,convertDataString);
                    let currentDates = currentTimeZoneDate();
                    sFootballPoolContestList.current_timezone = currentDates;
                    sFootballPoolContestList.currenttime = currentDates * 1;
                    io.emit(emit_detail, JSON.stringify(sFootballPoolContestList));

                } else {
                    //let currentPool = matchFbSPoolContestObj[send_array.match_id + userData.apikey];
                    let currentPool =JSON.parse(getRedisData);
                    let currentDates = currentTimeZoneDate();
                    currentPool.current_timezone = currentDates;
                    currentPool.currenttime = currentDates * 1;
                    io.emit(emit_detail, JSON.stringify(currentPool));
                }
            }
        });


        socket.on('my_fix_live_result_match_data_v2', async function (send_array) {
            console.log("----my_fix_live_result_match_data_v2-----")
            if (send_array) {
                let userData=await authorize(send_array.authorization);
                send_array={...send_array,userData}
                let emit_detail = `my_fix_live_result_match_data_v2_${userData.dbName}_${send_array.rstatus}_${send_array.type}_${send_array.userid}`;
                let getRedisData=await cacheStorageGet(emit_detail);
                
                let getUserMatchIds=null;
                //if(isActive || !(getRedisData)){
                    getUserMatchIds = await myFixLiveResultMatchData(send_array);
                    //let convertDataString=getUserMatchIds?JSON.stringify(getUserMatchIds):"";
                    //await cacheStorageSet(emit_detail,convertDataString);
                // }else{
                //     getUserMatchIds =JSON.parse(getRedisData);
                // }

                let currentDates = currentTimeZoneDate();
                getUserMatchIds.current_timezone = currentDates;
                getUserMatchIds.currenttime = currentDates * 1;
                io.emit(emit_detail, JSON.stringify(getUserMatchIds));
            }
        });

        socket.on(`my_match_cricket_pool_contest_list_v2`, async function (send_array) {
            console.log("----my_match_cricket_pool_contest_list_v2-----")

            if (send_array) {
                let userData=null;
                if(send_array.cronapikey){
                    userData=await nonauthorize(send_array.cronapikey);
                }else
                if(send_array.auth==1){
                    userData=await authorize(send_array.authorization,send_array.auth);
                }
                else{
                    userData=await authorize(send_array.authorization);
                }
                send_array={...send_array,userData}
                send_array["sportType"] = "cricket";
                let emit_detail = `my_match_cricket_pool_contest_list_v2_${userData.dbName}_${send_array.match_id}_${send_array.type}_${send_array.userid}`;
                let getRedisData=await cacheStorageGet(emit_detail);
                
                let getUserPoolIds=null;
                if(isActive || send_array.fetch_latest === 1 || !(getRedisData)){
                     getUserPoolIds = await myPoolDetail(send_array);
                     let convertDataString=getUserPoolIds?JSON.stringify(getUserPoolIds):"";
                    await cacheStorageSet(emit_detail,convertDataString);
                }else{
                    getUserPoolIds =JSON.parse(getRedisData);
                }

                let currentDates = currentTimeZoneDate();
                getUserPoolIds.current_timezone = currentDates;
                getUserPoolIds.currenttime = currentDates * 1;
                io.emit(emit_detail, JSON.stringify(getUserPoolIds));
            }
        });

        socket.on(`my_match_football_pool_contest_list_v2`, async function (send_array) {
            console.log("----my_match_football_pool_contest_list_v2-----")

            if (send_array) {
                //let userData=await authorize(send_array.authorization);
                let userData=null;
                if(send_array.cronapikey){
                    userData=await nonauthorize(send_array.cronapikey);
                }else
                if(send_array.auth==1){
                    userData=await authorize(send_array.authorization,send_array.auth);
                }
                else{
                    userData=await authorize(send_array.authorization);
                }
                send_array={...send_array,userData}
                send_array["sportType"] = "football";
                //let emit_detail = `my_match_football_pool_contest_list_v2_${userData.user.dbName}_${send_array.match_id}_${send_array.type}_${send_array.userData.user._id}`;
                let emit_detail = `my_match_football_pool_contest_list_v2_${userData.dbName}_${send_array.match_id}_${send_array.type}_${send_array.userid}`;
                let getRedisData=await cacheStorageGet(emit_detail);
                let getUserPoolIds=null;
                if(isActive || send_array.fetch_latest == 1 || !(getRedisData)){
                    getUserPoolIds = await myPoolDetail(send_array);
                    let convertDataString=getUserPoolIds?JSON.stringify(getUserPoolIds):"";
                    await cacheStorageSet(emit_detail,convertDataString);
                }else{
                    getUserPoolIds =JSON.parse(getRedisData);
                }
                let currentDates = currentTimeZoneDate();
                getUserPoolIds.current_timezone = currentDates;
                getUserPoolIds.currenttime = currentDates * 1;
                io.emit(emit_detail, JSON.stringify(getUserPoolIds));
            }
        });

        socket.on('series_match_data_v2', async function (send_array) {
            console.log("----series_match_data_v2-----")
            let userData=await authorize(send_array.authorization);
            
            send_array={...send_array,userData}
            let emit_detail = `series_match_data_v2_${userData.dbName}_${send_array.cid}_${send_array.type}`;
            let getRedisData=await cacheStorageGet(emit_detail);
            //if (send_array) {
            if (1==1 || !(getRedisData) || send_array.fetch_latest === 1) {
                let series_match_detail = await series_match_list(send_array)
                
                
                //seriesMatchDataObj[send_array.cid + send_array.type + userData.apikey] = series_match_detail;
                let convertDataString=series_match_detail?JSON.stringify(series_match_detail):"";
                await cacheStorageSet(emit_detail,convertDataString);

                let currentDates = currentTimeZoneDate();
                series_match_detail=(series_match_detail)?series_match_detail:{};
                series_match_detail.current_timezone = currentDates;
                series_match_detail.currenttime = currentDates * 1;
                io.emit(emit_detail, JSON.stringify(series_match_detail));
            } else {
                //let series_match_list = seriesMatchDataObj[send_array.cid + send_array.type + userData.apikey];
                let series_match_list =JSON.parse(getRedisData);
                let currentDates = currentTimeZoneDate();
                series_match_list.current_timezone = currentDates;
                series_match_list.currenttime = currentDates * 1;
                io.emit(emit_detail, JSON.stringify(series_match_list));
            }

        });
})

/**
 * For authorization - Use this
 * //----my_match_cricket_pool_contest_list_v2-----
        let liveEmitData = {
            "match_id": params.match_id, "type": "m", "fetch_latest": 1, "authorization": req.headers.authorization,"auth":1,
            "userid":req.user.id,"cronapikey":req.user.apikey,
        }
        let sktUrl = (params.type == "Cricket") ? "my_match_cricket_pool_contest_list_v2" : "my_match_football_pool_contest_list_v2";
        socketConnection()
        socket.emit(sktUrl, liveEmitData);
 */


server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});