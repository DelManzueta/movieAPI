const { response } = require('express');
const
    express = require('express'),
    morgan = require('morgan'),
    app = express(),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    uuid = require('uuid');




let movies = [{
        id: 1,
        title: 'Star Wars: Episode IV - A New Hope',
        director: 'George Lucas',
        year: '1972',
        genre: ['Adventure', 'Fantasy', 'Sci-Fi']
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

//public documentation
app.get('/public', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

//get list of data of all movies
app.get('/movies', (req, res) => {
    res.json(movies);
});


//get data about a single movie by title
app.get('/movies/:title', (req, res) => {
    res.json(
        movies.find((title) => {
            return title.name === req.params.name
        })
    )
});
//data about a single director
app.get('/movies/:title/:directors', (req, res) => {

    res.json(
        movies.find((director) => {
            return director.name === req.params.name
        }))
});
//get data about a single genre
app.get('/movies/:title/:directors/:genres', (req, res) => {
    res.json(
        movies.find((genre) => {
            return genre.name === req.params.name
        })
    )
});

//add a new movie to the list
app.post('/movies', (req, res) => {
    let newMovie = req.body
    if (!newMovie.name) {
        const message = 'Missing Movie Ttile'
        res.status(400).send(message)
    } else {
        newMovie.id = uuid.v11()
        movies.push(newMovie)
        res.status(201).send(newMovie)
    }
});


app.use(morgan('common'))
app.use('/', express.static('public'));
app.use(express.static('public'));


//home page
app.get('/', (req, res) => {
    res.send('Welcome to myFlix')
});

app.get('/secreturl', (req, res) => {
    res.send('This is a secret URL')
});

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(bodyParser.json());
app.use(methodOverride());


// User //////////////////////////////////////////////////
app.get('/users', (req, res) => {
    res.send('User welcome page')
});

app.get('/users/:accounts', (req, res) => {
    res.send('User Profile Page')
});

// POST Requests //////////////////////////////////////////////////
app.post('/users', (req, res) => {
    let newUser = req.body;
    if (!newUser.name) {
        const message = 'Missing User Name';
        res.status(400).send(message);
    } else {
        newUser.id = uuid.v11();
        movies.push(newUser);
        res.status(201).send(newUser);
    }
});

// PUT Requests //////////////////////////////////////////////////
app.put('/users/:accounts', (req, res) => {
    let update = req.body;
    res.status(201).send(update);
});
app.put('/users/:accounts/:favorites/:name', (req, res) => {
    let update = req.body;
    res.status(201).send(update);
});

// DELETE Requests //////////////////////////////////////////////////
app.delete('/users/:accounts/:favorite/:name', (req, res) => {
    res.status(201).send('This movie has been removed');
});
app.delete('/users/:id', (req, res) => {
    res.status(201).send('This account has been deleted.');
});




// express error handling //////////////////////////////////////////////////
app.use(function(err, req, res, next) {
    console.error(err.stack),
        res.status(500).send('Try Again')
});

// listen for requests //////////////////////////////////////////////////
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});