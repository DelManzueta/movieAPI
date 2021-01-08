 const express = require('express'),
     morgan = require('morgan'),
     bodyParser = require('body-parser');

 const app = express();

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
         genre: ['Action', 'Drama']
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
     res.send('Welcom to myFlix');
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

 // GET info by Director
 app.get('/movies/:title/:director', (req, res) => {
     res.send('Successful GET request returning data on director: ' + req.params.director);
 });

 // POST new user
 app.post('/users', (req, res) => {
     res.send('Successful request for New User')
 })

 // PUT  users info
 app.put('/users/:name', (req, res) => {
     res.send('Update' + req.params.name + '\s info.');
 });

 // POST new movie to users fav. list
 app.post('/users/:name/movies/:title', (req, res) => {
     res.send('Successful POST request to add movie ' + req.params.title + ' too ' + req.params.name + ' favorite list');
 });

 // DELETE movie from list
 app.delete('/users/:name/movies/:title', (req, res) => {
     res.send('Successful DELETE request. movie ' + req.params.title + ' was deleted from ' + req.params.name + ' favorite list');
 });

 // DELETE user profile
 app.delete('/users/:id', (req, res) => {
     res.status(201).send('This account has been deleted.');
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