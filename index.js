const { response } = require('express');
const
    express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    morgan = require('morgan');

const
    app = express(),
    http = require('http'),
    url = require('url');


let movies = [{
        id: 1,
        title: '12 Angry Men',
        director: 'Sidney Lumet',
        mainActors: ['Henry Fonda', 'Lee J. Cobb', 'Martin Balsam'],
        genre: ['Drama', 'Crime'],
        year: '1957',
        collection: null
    },
    {
        id: 2,
        title: 'Fight Club',
        director: 'David Fincher',
        mainActors: ['Brad Pitt', 'Edward Norton', 'Helena Bonham Carter'],
        genre: 'Drama',
        year: '1999',
        collection: null
    },
    {
        id: 3,
        title: 'American Pop',
        director: 'Ralph Bakshi',
        mainActors: 'Ron Thompson',
        genre: ['Animation', 'Drama'],
        year: '1981',
        collection: null
    },
    {
        id: 4,
        title: 'The Wiz',
        director: 'Sindey Lumet',
        mainActors: ['Michael Jackson', 'Diana Ross', 'Nipsey Russell'],
        genre: ['Adventure', 'Family', 'Fantasy'],
        year: '1978',
        collection: null
    },
    {
        id: 5,
        title: 'Hook',
        director: 'Steven Spielberg',
        mainActors: ['Robin Williams', 'Dustin Hoffman', 'Julia Roberts'],
        genre: ['Adventure', 'Comedy', 'Family'],
        year: '1991',
        collection: null
    },
    {
        id: 6,
        title: 'Dog Day Afternoon',
        director: 'Sidney Lumet',
        mainActors: ['Al Pacino', 'John Cazale'],
        genre: ['Biography', 'Crime', 'Drama'],
        year: '1975',
        collection: null
    },
    {
        id: 7,
        title: 'Ready Player One',
        director: 'Steven Spielberg',
        mainActors: ['Tye Sheridan', 'Olivia Cooke', 'Ben Mendelsohn'],
        genre: ['Action', 'Adventure', 'Sci-Fi'],
        year: '2018',
        collection: null
    },
    {
        id: 8,
        title: 'Rogue One: A Star Wars Story',
        director: 'Gareth Edwards',
        mainActors: ['Felicity Jones', 'Diego Luna', 'Ben Mendelsohn'],
        genre: ['Action', 'Adventure', 'Sci-Fi'],
        year: '2016',
        collection: 'Star Wars'
    },
    {
        id: 9,
        title: 'The Lord of the Rings: The Fellowship of the Ring',
        director: 'Peter Jackson',
        author: 'J.R.R Tolkien',
        mainActors: ['Elijah Wood', 'Ian McKellen', 'Viggo Mortensen'],
        genre: ['Action', 'Adventure', 'Fantasy'],
        year: '2001',
        collection: 'The Lord of the Rings'
    },
    {
        id: 10,
        title: 'Carlito\'s Way',
        director: 'Brian De Palma',
        mainActors: ['Al Pacino', 'Sean Penn', 'Viggo Mortensen'],
        year: '1993',
        genre: ['Crime', 'Drama', 'Thriller'],
        collection: null
    },
];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride());
app.use(morgan('common'));
app.use(express.static('public/documentation.html'));

// GET requests //////////////////////////////////
app.get('/', (req, res) => {
    res.send('Welcome to myFlix')
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies', (req, res) => {
    res.json(movies);
});

app.get('/movies/:title', (req, res) => {
    res.send(movies.title);

});


// express error handling
app.use(function(err, req, res, next) {
    console.error(err.stack),
        res.status(500).send('Try Again')
})

// listen for requests //////////////////////////////////
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});