const express = require('express'), // import express files locally to be used within the file.
  morgan = require('morgan'), // import morgan logger.
  mongoose = require('mongoose'), // import mongoose.
  bodyParser = require('body-parser'), //import body-parser.
  Models = require('./models.js'); // link model.js file.

  const Movies = Models.Movie, // Then import the models from the model.js file to use in my index.js file.
  Users = Models.User;

const app = express(); //encapsulate express functionality to configure the web server.

// Connect my REST API to the MongoDB database.
// mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true }); 
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true }); 

const { check, validationResult } = require('express-validator');

const cors = require('cors'); // import Cross Refrence Sharing Resources files into api.
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234'];

app.use(cors({ // function for sharing resources to certain domains otherwise displaying an error message.
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

app.use(bodyParser.json()); //Middleware for body parsing.
app.use(bodyParser.urlencoded({ extended: true}));
app.use(morgan('common')); //Middelware for logger.
app.use(express.static('public')); //Middleware for static files.


let auth = require('./auth.js')(app); // import auth file into index.js.
const passport = require('passport'); // require passport into index.js.
require('./passport.js'); // import passport file into index.js.

// GET requests

//Get the home page of myFLix App.
app.get('/', (req, res) => {
  res.send('Welcome to myFlix app!');
});

// Get Documentation on Request, URL, and Response formats.
app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

// Get a list of all the users.
app.get('/users', passport.authenticate('jwt',{session: false}), (req, res) => {
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
app.get('/users/:Username', passport.authenticate('jwt',{session: false}), (req, res) => {
  Users.findOne({ Username : req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// passport.authenticate('jwt',{session: false}),
// Get a list of all the movies.
app.get('/movies', (req, res) => {
  Movies.find()
    .then((movie) => {
      res.status(201).json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user.
app.get('/movies/:title', passport.authenticate('jwt',{session: false}), (req, res) => {
  Movies.findOne({ Title : req.params.title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Return data about a genre (description) by name/title (e.g., “Thriller”).
app.get('/movies/genre/:name', passport.authenticate('jwt',{session: false}), (req, res) => {
  Movies.findOne({ "Genre.Name" : req.params.name })
    .then((genre) => {
      res.json(genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


// Return data about a director (bio, birth year, death year) by name.
app.get('/movies/director/:name', passport.authenticate('jwt',{session: false}), (req, res) => {
  Movies.findOne({ "Director.Name" : req.params.name })
    .then((director) => {
      res.json(director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// POST Request.

//Allow new users to register.
app.post('/users',  
// Validation logic here for request.
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {

// check the validation object for errors
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } 
 
  let hashedPassword = Users.hashPassword(req.body.Password);

  Users.findOne({ Username : req.body.Username }) // check to see if a user already exist. 
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists'); 
      } else {
        Users  
          .create({ // create and register a new user.
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) }) // Within this callback, you then send a response back to the client that contains both a status code and the document (called “user”).
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);  //error-handler if anything goes wrong registering a new user. 
        })
      }
    })
    .catch((error) => { // error-handler if anything goes wrong with the HTTP POST.
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt',{session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username : req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});



// PUT Request.

// Update a user's info, by username

app.put('/users/:Username', passport.authenticate('jwt',{session: false}), 
// Validation logic here for request.
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {

// check the validation object for errors
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } 

  let hashedPassword = Users.hashPassword(req.body.Password);


  Users.findOneAndUpdate({ Username : req.params.Username }, { $set:
    {
      Username : req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// DELETE Request.

// Remove a movie to a user's list of favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt',{session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username : req.params.Username }, {
     $pull: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
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
app.delete('/users/:Username', passport.authenticate('jwt',{session: false}), (req, res) => {
  Users.findOneAndRemove({ Username : req.params.Username })
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

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

