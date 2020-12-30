const { response } = require('express');
const
    express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    morgan = require('morgan');

const
    app = express(),
    http = require('http'),
    url = require('url'),
    uuid = require('uuid');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride());
app.use(morgan('common'));
app.use(express.static('public/documentation.html'));

let movies = [{
        id: 1,
        title: '12 Angry Men',
        director: 'Sidney Lumet',
        genre: ['Drama', 'Crime'],
        year: '1957',
        collection: null
    },
    {
        id: 2,
        title: 'Fight Club',
        director: 'David Fincher',
        genre: 'Drama',
        year: '1999',
        collection: null
    },
    {
        id: 3,
        title: 'American Pop',
        director: 'Ralph Bakshi',
        genre: ['Animation', 'Drama'],
        year: '1981',
        collection: null
    },
    {
        id: 4,
        title: 'The Wiz',
        director: 'Sindey Lumet',
        genre: ['Adventure', 'Family', 'Fantasy'],
        year: '1978',
        collection: null
    },
    {
        id: 5,
        title: 'Hook',
        director: 'Steven Spielberg',
        genre: ['Adventure', 'Comedy', 'Family'],
        year: '1991',
        collection: null
    },
    {
        id: 6,
        title: 'Dog Day Afternoon',
        director: 'Sidney Lumet',
        genre: ['Biography', 'Crime', 'Drama'],
        year: '1975',
        collection: null
    },
    {
        id: 7,
        title: 'Ready Player One',
        director: 'Steven Spielberg',
        genre: ['Action', 'Adventure', 'Sci-Fi'],
        year: '2018',
        collection: null
    },
    {
        id: 8,
        title: 'Rogue One: A Star Wars Story',
        director: 'Gareth Edwards',
        genre: ['Action', 'Adventure', 'Sci-Fi'],
        year: '2016',
        collection: 'Star Wars'
    },
    {
        id: 9,
        title: 'The Lord of the Rings: The Fellowship of the Ring',
        director: 'Peter Jackson',
        author: 'J.R.R Tolkien',
        genre: ['Action', 'Adventure', 'Fantasy'],
        year: '2001',
        collection: 'The Lord of the Rings'
    },
    {
        id: 10,
        title: 'Carlito\'s Way',
        director: 'Brian De Palma',
        year: '1993',
        genre: ['Crime', 'Drama', 'Thriller'],
        collection: null
    },
];

// GET Requests //////////////////////////////////////////////////

app.get('/', (req, res) => {
    res.send('Welcome to myFlix')
});
app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});
app.get('/movies', (req, res) => {
    res.json(movies);
});
app.get('/movies/:titles/', (req, res) => {
    res.send('Single Movie Title and Genre')
});
app.get('/movies/:titles/:genre', (req, res) => {
    res.send('Movie Genres');
});
app.get('movies/:titles/:genre/:director/Name', (req, res) => {
    res.send('Bio about your favorite director.');
});

// POST Requests //////////////////////////////////////////////////
app.post('/users', (req, res) => {
    let newuser = req.body;
    if (!newuser.name) {
        const message = 'Missing name in request body';
        res.status(400).send(message);
    } else {
        newuser.id = uuid.v4();
        res.status(201).send(newuser);
    }
});

// PUT Requests //////////////////////////////////////////////////
app.put('/users/:account', (req, res) => {
    let update = req.body;
    res.status(201).send(update);
});
app.put('/users/:account/:favorites/:name', (req, res) => {
    let update = req.body;
    res.status(201).send(update);
});

// DELETE Requests //////////////////////////////////////////////////
app.delete('/users/:account/:favorite/:name', (req, res) => {
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