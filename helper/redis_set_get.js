"use strict";
const redis = require('redis');
const axios = require('axios');

const redisAPIForWindows= process.env.REDIS_FOR_WINDOWS_URL;
const redisEnv = process.env.REDIS_IS_WINDOWS;


if (redisEnv == true) {
    const client = redis.createClient({
        socket: {
          host: '0.0.0.0', // or 'localhost'
          port: 6379
        },
        password: process.env.REDIS_PASSWORD // 🔹 Use this instead of `auth`
      });

  client.connect() // Required in newer Redis versions
    .then(() => console.log('Connected to Redis'))
    .catch((err) => console.error('Redis connection error:', err));

  client.on('error', (err) => {
    console.error('Redis error:', err);
  });
}

let cacheStorageSet = async(sKey, sVal) => {
  if (redisEnv == true) {
    // Set a cache entry
    await client.set(sKey, sVal);
  } else {
    const options = {
      method: 'POST',
      url: redisAPIForWindows+'/set',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({ "skey": sKey, "svalue": sVal })
    };

    axios.request(options).then(async function (result) {
      // return result.data;
    }).catch(function (error) {
      // return res.status(400).send(response({}, "Something went wrong.!!!", false,null,error.stack));
    });


  }
}

let cacheStorageGet = async(keyVal) => {
  if (redisEnv == true) {
    // Retrieve the cache entry
    const value = await client.get(keyVal);
    console.log("Retrieved from Redis cache:", value);
    return value;
  } else {

    const options = {
      method: 'POST',
      url: redisAPIForWindows+'/get',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({ "skey": keyVal })
    };

    return axios.request(options).then( function (result) {
      return result.data.value;
    }).catch(function (error) {
      // return res.status(400).send(response({}, "Something went wrong.!!!", false,null,error.stack));
    });





    // return getData["value"];
  }
}

module.exports = { cacheStorageSet, cacheStorageGet };