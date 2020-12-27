const express = require('express'),
    morgan = require('morgan'),
    app = express(),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    uuid = require('uuid');


let movies = [{
    id: 1,
    title: 'The Godfather',
    genres: {
        crime: 'Crime',
        drama: 'Drama'
    },
    id: 2,
    title: 'City of God',
    genres: {
        crime: 'Crime',
        drama: 'Drama'
    },
    id: 3,
    title: 'Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb',
    genres: {
        comedy: 'Comedy'
    },
    id: 4,
    title: 'Her',
    genres: {
        drama: 'Drama',
        romance: 'Romance'
    },
    id: 5,
    title: 'Romeo + Juliet',
    genres: {
        drama: 'Drama',
        romance: 'Romance'
    },
    id: 6,
    title: '12 Angry Men',
    genres: {
        crime: 'Crime',
        drama: 'Drama'
    },
    id: 7,
    title: 'Ad Astra',
    genres: {
        adventure: 'Adventure',
        drama: 'Drama',
        mystery: 'Mystery'
    },
    id: 8,
    title: '2001: A Space Odyssey',
    genres: {
        adventure: 'Adventure',
        sci_fi: 'Sci-Fi'
    },
    id: 9,
    title: 'V for Vendetta',
    genres: {
        action: 'Action',
        drama: 'Drama',
        sci_fi: 'Sci-Fi'
    },
    id: 10,
    title: 'Léon: The Professional',
    genres: {
        action: 'Action',
        crime: 'Crime',
        drama: 'Drama'
    }
}];


//get list of data about all movies
app.get('/movies', (req, res) => {
    res.json(movies);
});

//get data about a single movie by name
app.get('/movies/:title', (req, res) => {
    res.json(movies.find((movies) => {
        return movies.name === req.params.name
    }));
});

//add a new movie to the list
app.post('/movies', (req, res) => {
    let newMovie = req.body;
    if (!newMovie.name) {
        const message = 'Missing movie title';
        res.status(400).send(message);
    } else {
        newMovie.id = uuid.v11();
        movies.push(newMovie);
        res.status(201).send(newMovie);
    }
});

/*
app.use(morgan('common'));
// app.use('/', express.static('public'));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Welcome to my app!');
});

app.get('/secreturl', (req, res) => {
    res.send('This is a secret url with super top-secret content.');
});

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());
app.use(methodOverride());

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.get('/', (req, res) => {
    res.send('Successful GET request returning data on all the movies');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});

*/