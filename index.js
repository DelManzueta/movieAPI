const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const Models = require('./models.js')
const passport = require('passport')
const app = express()
const path = require('path')

const cors = require('cors')
const { check, validationResult } = require('express-validator')

require('./passport')

const Movies = Models.Movie
const Users = Models.User
const Directors = Models.Director
const Genres = Models.Genre

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

app.use(morgan('common'))
app.use(bodyParser.json())
app.use(cors())
auth = require('./auth')(app)

let allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:1234',
  'https://myflixdbs-z.herokuapp.com'
]
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true)
      if (allowedOrigins.indexOf(origin) === -1) {
        var message =
          'The CORS policy for this application does not allow access from origin ' +
          origin
        return callback(new Error(message), false)
      }
      return callback(null, true)
    }
  })
)

app.use('/client', express.static(path.join(__dirname, 'client', 'dist')))
app.get('/client/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'))
})
app.use(express.static('public'))

// GET Requests

app.get('/', (req, res) => {
  res.send("Welcome to Del's myFlix API")
})

app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.find()
      .then(movies => {
        res.status(201).json(movies)
      })
      .catch(error => {
        console.error(error)
        res.status(500).send('Error: ' + error)
      })
  }
)

app.get(
  '/movies/:title',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.title })
      .then(movie => {
        res.status(201).json(movie)
      })
      .catch(error => {
        console.error(error)
        res.status(500).send('Error: ' + error)
      })
  }
)

app.get(
  '/directors/:name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Directors.findOne({ Name: req.params.name })
      .then(director => {
        res.status(201).json(director)
      })
      .catch(err => {
        res.status(500).send('Error: ' + err)
      })
  }
)

app.get(
  '/genres/:name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Genres.findOne({ Name: req.params.name })
      .then(genre => {
        res.status(201).json(genre)
      })
      .catch(err => {
        res.status(500).sent('Error: ' + err)
      })
  }
)

app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.find()
      .then(users => {
        res.status(201).json(users)
      })
      .catch(err => {
        console.error(err)
        res.status(500).send('Error: ' + err)
      })
  }
)

app.get(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then(user => {
        res.status(201).json(user)
      })
      .catch(err => {
        console.error(err)
        res.status(500).send('Error: ' + err)
      })
  }
)

app.post(
  '/users',
  [
    check('Username', 'Username is required').isLength({ min: 6 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required')
      .not()
      .isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  (req, res) => {
    let errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    let hashedPassword = Users.hashPassword(req.body.Password)
    Users.findOne({ Username: req.body.Username })
      .then(user => {
        if (user) {
          return res.status(400).send(req.body.Username + ' already exists')
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
            .then(user => {
              res.status(201).json(user)
            })
            .catch(error => {
              console.error(error)
              res.status(500).send('Error: ' + error)
            })
        }
      })
      .catch(error => {
        console.error(error)
        res.status(500).send('Error: ' + error)
      })
  }
)

app.post(
  '/users/:Username/Movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID }
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err)
          res.status(500).send('Error: ' + err)
        } else {
          res.json(updatedUser)
        }
      }
    )
  }
)

//PUT Requests

app.put(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    let hashedPassword = Users.hashPassword(req.body.Password)
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err)
          res.status(500).send('Error: ' + err)
        } else {
          res.json(updatedUser)
        }
      }
    )
  }
)

// DELETE Requests

app.delete(
  '/users/:Username/Movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $pull: { FavoriteMovies: req.params.MovieID } },
      { new: true },
      (error, updatedUser) => {
        if (error) {
          console.error(error)
          res.status(500).send('Error: ' + error)
        } else {
          res.json(updatedUser)
        }
      }
    )
  }
)
app.delete(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then(user => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found')
        } else {
          res.status(200).send(req.params.Username + ' was deleted! ')
        }
      })
      .catch(err => {
        console.error(err)
        res.status(500).send('Error: ' + err)
      })
  }
)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something made an Uh-Oh!')
})

const port = process.env.PORT || 8080
app.listen(port, '0.0.0.0', () => {
  console.log('All Ears on Port ' + port + '!')
})
