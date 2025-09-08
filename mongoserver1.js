require('dotenv').config(); // env initialize

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const mongoose= require('mongoose');
const app = express()
const {connectMongo} =require("./config/mongodb");
const bodyparser = require('body-parser')

app.use(cors({
    origin: '*'
}));


//git1

// connectMongo().then((res) => {
//   }).catch((err) => {
//         console.error('Server failed to start due to error: %s', err);
//   });






//admin

const contestRoutes = require('./admin/router/contestrouter')
const poolmasterRoutes = require('./admin/router/poolmasterrouter')
const matchRoutes = require('./admin/router/matchrouter')
const footballRoutes = require('./admin/router/footballrouter')
// const categoryadminRoutes = require('./admin/routes/category.router')


//src
// const contestfrontRoutes = require('./src/router/contestrouter')
const matchfrontRoutes = require('./src/router/matchrouter')


const db = require('./models');
db.sequelize.sync(); //db sync



const {
    MONGOPORT
} = process.env

app.use(express.json()) //json allow
app.use(express.urlencoded({
    extended: true
})) //json allow

app.use(morgan('dev'))


//admin


app.use('/admin/contest',contestRoutes)  //contest router
app.use('/admin/poolmaster',poolmasterRoutes)  //poolmaster router
app.use('/admin/match',matchRoutes) //match router
app.use('/admin/football',footballRoutes)  //football router


//src
// app.use('/app/contest',contestfrontRoutes)  //contest front router
app.use('/app/match',matchfrontRoutes)  //match front router
// global error handler
// app.use(errorHandler);


app.listen(MONGOPORT, () => {
    console.log(`Server running on ${MONGOPORT}`);
    
});