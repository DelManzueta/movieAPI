 const express = require('express'),
     morgan = require('morgan'),
     bodyParser = require('body-parser');

 const app = express();
 const mongoose = require('mongoose');
 const Models = require('./models.js');

 const Movies = Models.Movie;
 const Users = Models.User;

 mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

 app.use(morgan('common'));
 app.use(express.static('public'));

 app.use(bodyParser.urlencoded({ extended: true }));
 app.use(bodyParser.json());

 let movies = [{
         id: 1,
         title: '300',
         director: 'Zack Snyder',
         year: '2006',
         genre: ['Action', 'Drama', 'History']
     },
     {
         id: 2,
         title: 'Fight Club',
         director: 'David Fincher',
         year: '1999',
         genre: ['Action', 'Drama', 'Fantasy']
     },
     {
         id: 3,
         title: 'The Animatrix',
         director: ['Peter Chung', 'Andrew R. Jones'],
         year: '2003',
         genre: ['Animation', ' Action', ' Adventure']
     },
     {
         id: 4,
         title: 'Akira',
         director: 'SKatsuhiro Ôtomo',
         year: '1988',
         genre: ['Animation', 'Action', 'Sci-Fi']
     },
     {
         id: 5,
         title: 'Hook',
         director: 'Steven Spielberg',
         year: '1991',
         genre: ['Adventure', 'Comedy', 'Family']
     },
     {
         id: 6,
         title: 'Man of Steel',
         director: 'Zack Snyder',
         year: '2013',
         genre: ['Action', 'Adventure', 'Sci-Fi']
     },
     {
         id: 7,
         title: 'Ready Player One',
         director: 'Steven Spielberg',
         year: '2018',
         genre: ['Action', 'Adventure', 'Sci-Fi']
     },
     {
         id: 8,
         title: 'Field of Dreams',
         director: 'Phil Alden Robinson',
         year: '1989',
         genre: ['Drama', 'Family', 'Fantasy']
     },
     {
         id: 9,
         title: 'Batman',
         director: 'Peter Jackson',
         year: '1989',
         genre: ['Action', 'Adventure', 'Fantasy']
     },
     {
         id: 10,
         title: 'Carlito\'s Way',
         director: 'Brian De Palma',
         year: '1993',
         genre: ['Crime', 'Drama', 'Thriller']
     },

 ];

 app.get('/', (req, res) => {
     res.send('Welcome to myFlix');
 })

 //public doc
 app.get('/public', (req, res) => {
     res.sendFile('public/documentation.html', { root: __dirname });
 })

 // GET all movies
 app.get('/movies', (req, res) => {
     res.json(movies);
 });

 // GET movie by title
 app.get('/movies/:title', (req, res) => {
     res.json(
         movies.find((movie) => {
             return movie.title === req.params.title
         })

     );
 });

 // GET by Director
 app.get('/movies/:title/:director', (req, res) => {
     res.json(movies.find((movie) => {
         return movie.director === req.params.director
     }))
 });

 // adds data for a new movie to our list of movies
 app.post('/movies', (req, res) => {
     let newMovie = req.body;

     if (!newMovie.title) {
         const message = 'Missing "This Name" in request body';
         res.status(400).send(message);
     } else {
         newMovie.id = uuid.v4();
         movies.push(newMovie);
         res.status(201).send(newMovie);
     }
 });

 //Add a user
 /* We’ll expect JSON in this format
 {
   ID: Integer,
   Username: String,
   Password: String,
   Email: String,
   Birthday: Date
 }*/
 app.post('/users', (req, res) => {
     Users.findOne({ Username: req.body.Username })
         .then((user) => {
             if (user) {
                 return res.status(400).send(req.body.Username + 'already exists');
             } else {
                 Users
                     .create({
                         Username: req.body.Username,
                         Password: req.body.Password,
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

 // Get all users
 app.get('/users', (req, res) => {
     Users.find()
         .then((users) => {
             res.status(201).json(users);
         })
         .catch((err) => {
             console.error(err);
             res.status(500).send('Error: ' + err);
         });
 });

 // Get a user by username
 app.get('/users/:Username', (req, res) => {
     Users.findOne({ Username: req.params.Username })
         .then((user) => {
             res.json(user);
         })
         .catch((err) => {
             console.error(err);
             res.status(500).send('Error: ' + err);
         });
 });

 // Update a user's info, by username
 /* We’ll expect JSON in this format
 {
   Username: String,
   (required)
   Password: String,
   (required)
   Email: String,
   (required)
   Birthday: Date
 }*/
 app.put('/users/:Username', (req, res) => {
     Users.findOneAndUpdate({ Username: req.params.Username }, {
             $set: {
                 Username: req.body.Username,
                 Password: req.body.Password,
                 Email: req.body.Email,
                 Birthday: req.body.Birthday
             }
         }, { new: true }, // This line makes sure that the updated document is returned
         (err, updatedUser) => {
             if (err) {
                 console.error(err);
                 res.status(500).send('Error: ' + err);
             } else {
                 res.json(updatedUser);
             }
         });
 });

 // Add a movie to a user's list of favorites
 app.post('/users/:Username/Movies/:MovieID', (req, res) => {
     Users.findOneAndUpdate({ Username: req.params.Username }, {
             $push: { FavoriteMovies: req.params.MovieID }
         }, { new: true }, // This line makes sure that the updated document is returned
         (err, updatedUser) => {
             if (err) {
                 console.error(err);
                 res.status(500).send('Error: ' + err);
             } else {
                 res.json(updatedUser);
             }
         });
 });

 // Delete a user by username
 app.delete('/users/:Username', (req, res) => {
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


 // express error handling 
 app.use(function(err, req, res, next) {
     console.error(err.stack),
         res.status(500).send('Try Again')
 });

 // listen for requests
 app.listen(8080, () => {
     console.log('Your app is listening on port 8080.');
 });