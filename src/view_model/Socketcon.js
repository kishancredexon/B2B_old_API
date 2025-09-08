// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);


const socketEmitConnect = (reqstring,reqpara) => {
    io.on('connection',  (socket) => {
            socket.emit(reqstring, reqpara);
    })
};

const socketOnConnect =  (reqstring) => {
    io.on('connection',  (socket) => {
        socket.on(reqstring, async (data) => {
        return data;
        })
    })
};


module.exports={socketEmitConnect,socketOnConnect};