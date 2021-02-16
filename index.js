const express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    mongoose = require('mongoose'),
    Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true }); // heroku 
// mongoose.connect('mongodb://del:gniwled@myflixdb.qjwyf.mongodb.net/myFlixDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true }); // debug locally

const app = express();

app.use(morgan('common'));

app.use(bodyParser.json());

app.use(express.static('public'));

let cors = require('cors');
app.use(cors());

let auth = require('./auth')(app);

let passport = require('passport');
require('./passport');


//
const { check, validationResult } = require('express-validator');
//


app.get('/', (res) => { res.send('Welcome to myFlix') });

// GET all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (res) => {
    Movies.find().then((movies) => {
        res.status(201).json(movies);
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
});

//GET Movie by Title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.Title }).then((movie) => {
        res.status(201).json(movie)
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//GET info about Director
app.get('/movies/Directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ "Director.Name": req.params.Name }).then((movie) => {
        res.status(201).json(movie.Director.Name + ": " + movie.Director.Bio);
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// GET all users
app.get('/users', passport.authenticate('jwt', { session: false }), (res) => {
    Users.find().then((users) => {
        res.status(201).json(users);
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// GET User by Username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ Username: req.params.Username }).then((user) => {
        res.json(user);
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// POST new user
app.post('/users', [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + ' already exists');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: hashedPassword,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday
                    })
                    .then((user) => { res.status(201).json(user) })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

// PUT update user info
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        let hashedPassword = Users.hashPassword(req.body.Password);
        Users.findOneAndUpdate({ Username: req.params.Username }, {
            $set: {
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            }
        }, { new: true },
            (err, updatedUser) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error: ' + err);
                } else {
                    res.json(updatedUser);
                }
            });
    });


// POST new movie to fav list
app.post('/users/:Username/Favorites/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: { FavoriteMovies: req.params.MovieID }
    },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.status(201).json(updatedUser);
            }
        });
});

//DELETE user account
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//DELETE remove movie from user fav list
app.delete('/users/:Username/Favorites/:MovieID', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Users.findOneAndUpdate({ Username: req.params.Username }, { $pull: { FavoriteMovies: req.params.MovieID } }, { new: true },
            (error, updatedUser) => {
                if (error) {
                    console.error(error);
                    res.status(500).send('Error: ' + error);
                } else {
                    res.json(updatedUser);
                }
            }
        );
    }
);

app.use((err, res) => {
    console.error(err.stack);
    res.status(500).send('Nope, try again...');
});


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});