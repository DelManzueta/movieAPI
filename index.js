const express = require("express"),
  morgan = require("morgan"),
  bodyParser = require('body-parser'),
  app = express(),
  passport = require('passport'),
  mongoose = require("mongoose"),
  Models = require("./models.js"),
  Movies = Models.Movie,
  Users = Models.User,
  cors = require('cors');

const {
  check,
  validationResult
} = require('express-validator');


app.use(cors());

app.use(morgan("common"));

app.use(bodyParser.json());



require('./passport');

let auth = require('./auth')(app);



/*mongoose.connect("mongodb://localhost:27017/faveFlixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
*/


mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// List of top ten movies
let topTenMovies = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];



// GET requests
app.get("/", (req, res) => {
  res.send("Welcome to faveFlix!");
});

app.get("/movies/top", (req, res) => {
  res.json(topTenMovies);
});

//Get a list of data about all movies
app.get("/movies", passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Get data about a single movie, by title
app.get("/movies/:Title", passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Movies.findOne({
      Title: req.params.Title,
    })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get data about a genre by title
app.get("/movies/:Title/genre", passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Movies.findOne({
      Title: req.params.Title,
    })
    .then((movie) => {
      res.status(201).json(movie.Genre.Name + " : " + movie.Genre.Description);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get data about a director by name
app.get("/movies/Director/:Name", passport.authenticate('jwt', {
  session: false
}), (req, res) => {
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
});

// Post new users
app.post("/users",
  // Validation logic for request.
  [check("Username", "Username is required.").isLength({
      min: 5
    }),
    check("Username", "Username contains non alphanumeric characters- not allowed.").isAlphanumeric(),
    check("Password", "Password is required.").not().isEmpty(),
    check("Email", "Email does not appear to be valid.").isEmail()
  ], (req, res) => {

    //Checking the validation object for errors.
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array()
      });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({
        Username: req.body.Username
      })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + "already exists");
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
  });
// Update user info
app.put("/users/:Username/info",
  // Validation logic for request.
  [check("Username", "Username is required.").isLength({
      min: 5
    }),
    check("Username", "Username contains non alphanumeric characters- not allowed.").isAlphanumeric(),
    check("Password", "Password is required.").not().isEmpty(),
    check("Email", "Email does not appear to be valid.").isEmail()
  ], passport.authenticate('jwt', {
    session: false
  }), (req, res) => {

    //Checking the validation object for errors.
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array()
      });
    }

    Users.findOneAndUpdate({
        Username: req.params.Username,
      }, {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
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
  });

// Add users list of favorite movies
app.post("/users/:Username/Movies/:MovieID", passport.authenticate('jwt', {
  session: false
}), (req, res) => {
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
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

//Delete a movie from the users list of favorites
app.delete("/users/:Username/Movies/:MovieID", passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Users.findOneAndUpdate({
      Username: req.params.Username
    }, {
      $pull: {
        FavoriteMovies: req.params.MovieID
      },
    }, {
      new: true
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
});

// Deregister a user
app.delete("/users/:Username", passport.authenticate('jwt', {
  session: false
}), (req, res) => {
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
});

app.use(express.static("public"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Listen for requests
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});