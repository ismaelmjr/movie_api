const express = require('express'), // import express files locally to be used within the file.
  morgan = require('morgan'); // import morgan logger.

 const body_parser = require('body-parser'); //import body-parser.
 const mongoose = require('mongoose'); // import mongoose.
 const Models = require('./models.js'); // link model.js file.

  const Movies = Models.Movie, // Then import the models from the model.js file to use in my index.js file.
  Users = Models.User;

mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true }); // Connect my REST API to the MongoDB database.

const app = express(); //encapsulate express functionality to configure the web server.


app.use(morgan('common')); //Middelware for logger.
app.use(express.static('public')); //Middleware for static files.
app.use(body_parser.json()); //Middleware for body parsing.
app.use(body_parser.urlencoded({ extended: true}));

// Note that app routing is required in any Express application, so you’ll need to define it in your myFlix application. Along with app routing, you’ll also need to define one middleware function for logging your request, and another one for authenticating your users. The order in which you should do so is as follows:

// Logging
// User authentication
// App routing
// Note that app routing is rarely a single function, rather, multiple functions depending on the number of routes you want to specify for your app. You’ll learn more about user authentication later in this Achievement.


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
app.get('/newUser', (req, res) => {
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
app.get('/newUser/:user_name', (req, res) => {
  Users.findOne({ user_name: req.params.user_name })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

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
app.get('/movies/:title', (req, res) => {
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
app.get('/movies/genre/:name', (req, res) => {
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
app.get('/movies/director/:name', (req, res) => {
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
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/newUser', (req, res) => {
  Users.findOne({ user_name: req.body.user_name }) // check to see if a user already exist. 
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.user_name + ' already exists'); 
      } else {
        Users  
          .create({ // create and register a new user.
            user_name: req.body.user_name,
            Password: req.body.Password,
            Email: req.body.Email,
            birth_day: req.body.birth_day
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
app.post('/newUser/:user_name/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ user_name: req.params.user_name }, {
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
app.put('/newUser/:user_name', (req, res) => {
  Users.findOneAndUpdate({ user_name: req.params.user_name }, { $set:
    {
      user_name: req.body.user_name,
      Password: req.body.Password,
      Email: req.body.Email,
      birth_day: req.body.birth_day
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
app.delete('/newUser/:user_name/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ user_name: req.params.user_name }, {
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
app.delete('/newUser/:user_name', (req, res) => {
  Users.findOneAndRemove({ user_name: req.params.user_name })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.user_name + ' was not found');
      } else {
        res.status(200).send(req.params.user_name + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});