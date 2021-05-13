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
  'https://myflixdbs-z.herokuapp.com',
  'https://myflix-del.netlify.app'
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

app.get('/', function (req, res) {
  var responseText =
    'Welcome to myFlix API.';
  res.send(responseText);
});

app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  function (req, res) {
    Movies.find()
      .then(function (movies) {
        res.status(201).json(movies);
      })
      .catch(function (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

// Get single movie, by title

app.get(
  '/movies/:Title',
  passport.authenticate('jwt', { session: false }),
  function (req, res) {
    Movies.findOne({ Title: req.params.Title })
      .then(function (movie) {
        res.json(movie);
      })
      .catch(function (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Get data about genre, by name

app.get(
  '/movies/genres/:Name',
  passport.authenticate('jwt', { session: false }),
  function (req, res) {
    Movies.findOne({ 'Genre.Name': req.params.Name })
      .then(function (movie) {
        res.json(movie.Genre);
      })
      .catch(function (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Get data about a director, by name
app.get(
  '/movies/directors/:Name',
  passport.authenticate('jwt', { session: false }),
  function (req, res) {
    Movies.findOne({ 'Director.Name': req.params.Name })
      .then(function (movie) {
        res.json(movie.Director);
      })
      .catch(function (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/*
*************************************
USER Queries
*************************************
*/

/* Adds a new user, password hashed when user registers before being stored in db
 We'll expect JSON in this format
{
ID : Integer,
Username: String,
Password: String,
Email: String,
Birthday: Date
}*/
app.post(
  '/users',
  [
    check('Username', 'Username has to be at least five characters long').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required')
      .not()
      .isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  function (req, res) {
    var errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    var hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then(function (user) {
        if (user) {
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
            .then(function (user) {
              res.status(201).json(user);
            })
            .catch(function (error) {
              console.log(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch(function (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

// Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), function (
  req,
  res
) {
  Users.find()
    .then(function (users) {
      res.status(201).json(users);
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  function (req, res) {
    Users.findOne({ Username: req.params.Username })
      .then(function (user) {
        res.json(user);
      })
      .catch(function (err) {
        console.error(err);
        res.status(500).send('Error: ' + error);
      });
  }
);

// Update user information, by username
/* We'll expect JSON in this format
{
  Username: String (required),
  Password: String (required),
  Email: String (required),
  Birthday: Date
}*/

app.put(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  function (req, res) {
    // Checks whether object with same username as indicated in the requestURL has been found
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }
      },
      // makes sure that the updated document is returned
      { new: true },
      function (err, updatedUser) {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// Adds movie to list of favorites by MovieID
app.post(
  '/users/:Username/Movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  function (req, res) {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $push: { Favorites: req.params.MovieID } },
      { new: true },
      function (err, updatedUser) {
        if (err) {
          console.error(err);
          res.status(500).send('Error' + err);
        } else {
          res
            .status(201)
            .send(
              'The movie with ID ' +
              req.params.MovieID +
              ' was successfully added to list of favorites. ' +
              'Favorites of ' +
              updatedUser.Username +
              ': ' +
              updatedUser.Favorites
            );
        }
      }
    );
  }
);

// Removes movie from list of favorites by ID
app.delete(
  '/users/:Username/Movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  function (req, res) {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $pull: { Favorites: req.params.MovieID } },
      { new: true },
      function (err, updatedUser) {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res
            .status(200)
            .send(
              'The movie with ID ' +
              req.params.MovieID +
              ' was successfully deleted from the list of favorites. ' +
              'Favorites of ' +
              updatedUser.Username +
              ': ' +
              updatedUser.Favorites
            );
        }
      }
    );
  }
);

// Deletes user by username
app.delete(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  function (req, res) {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then(function (user) {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found.');
        } else {
          res.status(200).send(req.params.Username + ' was deleted.');
        }
      })
      .catch(function (err) {
        console.error(err);
        res.status(400).send('Error: ' + err);
      });
  }
);

// Listens for requests
var port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', function () {
  console.log('Listening on Port 3000');
});
