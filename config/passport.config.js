const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const mongoose = require('mongoose')

const User = require('../models/User.model')

passport.serializeUser((user, next) =>  {
    next(null, user.id)
})

passport.deserializeUser((id, next) => {
    User.findById(id)
      .then(user => {
        next(null, user)
      })
      .catch(err => next(err))
})

// local-auth

passport.use('local-auth', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (email, password, next) => {
    User.findOne({ email })
        .then(userFound => {
            if (!userFound) {
                next(null, false, { error: 'Email or password are incorrect.'})
            } else {
                return userFound.checkPassword(password)
                .then((match) => {
                    if (!match) {
                        next(null, false, { error: 'Incorrect email or password.' })
                    } else {
                        next(null, userFound)
                    }
                })
            }
        })
        .catch(error => next(error))
}
))

// fin local-auth


// google-auth

passport.use('google-auth', new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    },
    (accessToken, refreshToken, profile, next) => {
        const googleID = profile.id
        const name = profile.displayName
        const email = profile.emails && profile.emails[0].value || undefined
        const image = profile.photos && profile.photos[0].value || undefined
        if (googleID && email) {
            User.findOne({ $or: [
                { googleID },
                { email }
            ]})
                .then(userFound => {
                    if(userFound) {
                        next(null, userFound)
                    } else {
                        return User.create({ 
                            name,
                            email,
                            password: mongoose.Types.ObjectId(),
                            googleID,
                            image
                         })
                            .then(newUser => {
                                next(null, newUser)
                            })
                    }
                })
                .catch(error => next(error))
        } else {
            next(null, false, { error: 'Error connecting with Google Auth' })
        }
    }
))