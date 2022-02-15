const passport = require('passport')
const mongoose = require('mongoose')
const User = require("../models/User.model")
const mailer = require("../config/mailer.config")

module.exports.register = (req, res, next) => {
  res.render('auth/register')
}

module.exports.doRegister = (req, res, next) => {
  const user = req.body

  const renderWithErrors = (errors) => {
    res.render('auth/register', { 
      errors, 
      user 
    })
  }

  User.findOne({ email: user.email })
    .then((userFound) => {
      if (userFound) {
        renderWithErrors({ email: 'This email is already in use' })
      } else {
        if (req.file) {
          user.image = req.file.path
        }
        return User.create(user)
          .then((newUser) => {
            mailer.sendActivationMail(newUser.email, newUser.activationToken)
            res.redirect('/login')
          })
      }
    })
    .catch(error =>  {
      if (error instanceof mongoose.Error.ValidataionError) {
        renderWithErrors(error.errors)
      } else {
        next(error)
      }
    })
}

module.exports.login = (req, res, next) => {
  res.render('auth/login')
}

const doLogin = (req, res, next, provider) => {
  passport.authenticate(provider, (error, user, validations) => {
    if (error) {
      next(error)
    } else if (!user) {
      res.status(404).render('auth/login', { errorMessage: validations.error })
    } else {
      req.login(user, (loginError) => {
        console.log({user})

        if (loginError) {
          next(loginError)
        } else {
          req.flash('flashMessage', 'Login succesful!')
          res.redirect('/profile')
        }
      })
    }
  })(req, res, next)
}

module.exports.doLogin = (req, res, next) => {
  doLogin(req, res, next, 'local-auth')
}

module.exports.googleLogin = (req, res, next) => {
  doLogin(req, res, next, 'google-auth')
}

module.exports.logout = (req, res, next) => {
  req.logout()
  res.redirect('/login')
}

module.exports.activate = (req, res, next) => {
  const token = req.params.token

  User.findOneAndUpdate({ activationToken: token, active: false}, { active: true })
    .then((userFound) => {
      req.flash('flashMessage', 'Sign up succesful!')
      res.redirect('/login')
    })
    .catch(error => next(error))
}