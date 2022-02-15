const expressSession = require('express-session')
const MongoStore = require('connect-mongo')
const mongoose = require('mongoose')
const User = require('../models/User.model')

const sessionMaxAge = process.env.SESSION_AGE || 7

const sessionConfig = expressSession({
    secret: process.env.COOKIE_SECRET || 'Super secret (change it!)',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.COOKIE_SECURE || false,
      maxAge: 24 * 3600 * 1000 * sessionMaxAge,
      httpOnly: true
    },
    store: new MongoStore({
      mongoUrl: mongoose.connection._connectionString,
      ttl: 24 * 3600 * sessionMaxAge,
    })
})
  
module.exports = sessionConfig;