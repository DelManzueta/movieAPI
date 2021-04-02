const express = require("express"),
  bodyParser = require("body-parser"),
  morgan = require("morgan"),
  mongoose = require("mongoose"),
  Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;

// mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "myFlixDB",
});

const app = express();

app.use(morgan("common"));
app.use(bodyParser.json());
app.use(express.static("public"));

const cors = require("cors");
app.use(cors());

const auth = require("./auth")(app);

const passport = require("passport");
require("./passport");

//
const {
  check,
  validationResult
} = require("express-validator");
//

let allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:1234",
  "https://myflixdbs-z.herokuapp.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var message =
          "The CORS policy for this application does not allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

app.use('/client', express.static(path.join(__dirname, 'client', 'dist')));
app.get('/client/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.get("/", (req, res) => {
  res.send("Welcome to myFlix");
});

// GET all movies
app.get('/movies', passport.authenticate('jwt', {
    session: false
  }),
  (req, res) => {
    Movies.find({})
      .populate('Director')
      .populate('Genre')
      .exec((err, movie) => {
        if (err) return console.error(err);
        res.status(201).json(movie)
      });
  });

// GET Movie by Title
app.get("/movies/:Title", (req, res) => {
  Movies.findOne({
      Title: req.params.Title,
    })
    .then((movie) => {
      res.status(201).json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.get(
  "/movies/:Title/genre",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    Movies.findOne({
        Title: req.params.Title,
      })
      .then((movie) => {
        res
          .status(201)
          .json(movie.Genre.Name + " : " + movie.Genre.Description);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// GET info about Director
app.get(
  "/movies/Director/:Name",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    Movies.findOne({
        "Director.Name": req.params.Name,
      })
      .then((movies) => {
        res.json(movies.Director.Name + ": " + movies.Director.Bio);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// GET all users
app.get(
  "/users",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// GET User by Username
app.get(
  "/users/:Username",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    Users.findOne({
        Username: req.params.Username,
      })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// POST new user
app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({
      min: 5,
    }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array(),
      });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({
        Username: req.body.Username,
      })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday,
            })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// PUT update user info
app.put(
  "/users/:Username",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate({
        Username: req.params.Username,
      }, {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      }, {
        new: true,
      },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// POST new movie to fav list
app.post(
  "/users/:Username/Favorites/:MovieID",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    Users.findOneAndUpdate({
        Username: req.params.Username,
      }, {
        $push: {
          FavoriteMovies: req.params.MovieID,
        },
      }, {
        new: true,
      },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          cl;
          res.status(500).send("Error: " + err);
        } else {
          res.status(201).json(updatedUser);
        }
      }
    );
  }
);

//DELETE user account
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    Users.findOneAndRemove({
        Username: req.params.Username,
      })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//DELETE remove movie from user fav list
app.delete(
  "/users/:Username/Favorites/:MovieID",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    Users.findOneAndUpdate({
        Username: req.params.Username,
      }, {
        $pull: {
          FavoriteMovies: req.params.MovieID,
        },
      }, {
        new: true,
      },
      (error, updatedUser) => {
        if (error) {
          console.error(error);
          res.status(500).send("Error: " + error);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

app.use((err, res) => {
  console.error(err.stack);
  res.status(500).send("Nope, try again...");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Running the show on " + PORT + "!");
});