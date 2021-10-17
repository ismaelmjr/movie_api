const express = require('express');
const app = express();

app.use(express.static('public'));

// Note that app routing is required in any Express application, so you’ll need to define it in your myFlix application. Along with app routing, you’ll also need to define one middleware function for logging your request, and another one for authenticating your users. The order in which you should do so is as follows:

// Logging
// User authentication
// App routing
// Note that app routing is rarely a single function, rather, multiple functions depending on the number of routes you want to specify for your app. You’ll learn more about user authentication later in this Achievement.

let topBooks = [
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: 'J.K. Rowling',
  },
  {
    title: 'Lord of the Rings',
    author: 'J.R.R. Tolkien',
  },
  {
    title: 'Twilight',
    author: 'Stephanie Meyer',
  },
];

let topMovies = [
  {
    title: 'The Shawshank Redemption',
    year: '1994',
  },
  {
    title: 'The Godfather',
    year: '1972',
  },
  {
    title: 'The Godfather: Part II',
    year: '1974',
  },
  {
    title: '12 Angry Men',
    year: '1957',
  },
  {
    title: 'Schindlers List ',
    year: '1993',
  },
  {
    title: 'The Lord of the Rings: The Return of the King',
    year: '2003',
  },
  {
    title: 'Pulp Fiction',
    year: '1994',
  },
  {
    title: 'The Good, the Bad and the Ugly',
    year: '1966',
  },
  {
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    year: '2001',
  },
];

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to myFlix app!');
});

app.get('/books', (req, res) => {
  res.json(topBooks);
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
