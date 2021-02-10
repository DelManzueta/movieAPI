const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');


const Models = require('./models.js');
const uuid = require('uuid');
const passport = require('./passport');


const
    Movies = Models.Movie,
    Users = Models.User;

const app = express();

const { check, validationResult } = require('express-validator');

mongoose.connect(process.env.CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() =>
    console.log("Database Connected Successfully")
).catch(err => console.log(err));


require('./passport')
require('./auth');
require(Models);

app.use(morgan('common'));
app.use(bodyParser.json());



var whiteList = [
    'http://localhost:8080',
    'http://localhost:1234',
    'https://myflixdbs-z.herokuapp.com',
];
var corsOption = {
    origin: function(origin, callback) {
        if (whiteList.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}
app.use(cors(corsOption));


app.get('/public', (res) => {
    res.sendFile('public/documentation.html', {
        root: __dirname
    });
});
app.use(express.static('public'));

app.get('/', cors(corsOption), (res) => {
    res.send('Welcome to myFlix');
})


// GET

app.get('/movies', cors(corsOption), (res) => {
    Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        }).catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.get('/movies/:title', cors(corsOption), (req, res) => {
    Movies.findOne({ Title: req.params.title })
        .then((movie) => {
            res.status(201).json(movie)
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.get('/directors/:name', cors(corsOption), (req, res) => {
    Directors.findOne({ Name: req.params.name })
        .then((director) => {
            res.status(201).json(director)
        })
        .catch((err) => {
            res.status(500).send("Error: " + err);
        })
});

app.get('/genres/:name', cors(corsOption), (req, res) => {
    Genres.findOne({ Name: req.params.name })
        .then((genre) => {
            res.status(201).json(genre)
        })
        .catch((err) => {
            res.status(500).sent("Error: " + err);
        })
});


// POST

app.get('/users', passport.authenticate('jwt', { session: false }),
    (res) => {
        Users.find()
            .then((users) => {
                res.status(201).json(users);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    });

app.get('/users/:Username',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Users.findOne({ Username: req.params.Username })
            .then((user) => {
                res.json(user);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    });

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

app.post('/users/:Username/Movies/:MovieID', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Users.findOneAndUpdate({ Username: req.params.Username }, {
                $push: { FavoriteMovies: req.params.MovieID }
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


// PUT

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


// DELETE

app.delete('/users/:Username/Movies/:MovieID', passport.authenticate('jwt', { session: false }),
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

app.delete('/users/:Username', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Users.findOneAndRemove({ Username: req.params.Username })
            .then((user) => {
                if (!user) {
                    res.status(400).send(req.params.Username + ' was not found');
                } else {
                    res.status(200).send(req.params.Username + ' was deleted! ');
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    });

app.use((err, res) => {
    console.error(err.stack);
    res.status(500).send('Nope, try again...');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0/0', () => {
    console.log('Running the show on ' + PORT);
});