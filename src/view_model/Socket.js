'use strict';
const { io } =require("socket.io-client");

let SOCKET_URL= process.env.apiurl;
console.log("SOCKET_URL===>>",SOCKET_URL)
// export const socket = io(SOCKET_URL)

const socket = io(SOCKET_URL, {
    autoConnect: false
});

socket.on('error', (error) => {
    console.error('Socket connection error:', error);
});

const socketDisconnect = () => {
    //console.log('----Disconnect----');
    socket.disconnect();
};
const removeSocketAllListeners = () => {
    console.log('----removeSocketAllListeners----');
    //socket.removeAllListeners();
};

const socketConnection = () => {
    socket.connect()
};

const socketOnConnect =  (reqstring) => {
    io.on('connection',  (socket) => {
        socket.on(reqstring, async (data) => {
        return data;
        })
    })
};

const socketEmitConnect = (reqstring,reqpara) => {
    // socket.connect()
     socket.emit(reqstring, reqpara);
    //io.emit(reqstring, reqpara);
};


module.exports={socket,socketDisconnect,removeSocketAllListeners,socketConnection,socketEmitConnect,socketOnConnect};