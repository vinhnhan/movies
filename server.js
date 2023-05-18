const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const MoviesDB = require('./modules/moviesDB.js');

const HTTP_PORT = process.env.PORT || 8080;
const httpOnStart = () => {
  console.log(`Server is starting on port ${HTTP_PORT}...`);
  console.log('Press Ctrl+C to cancel');
};

// ***** MIDDDLEWARE *****
app.use(cors());
dotenv.config({ path: 'keys.env' });
app.use(express.json());

// ***** DATABASE *****
const db = new MoviesDB();

db.initialize(process.env.MONGODB_CONN_STRING)
  .then(() => {
    app.listen(HTTP_PORT, httpOnStart);
    console.log('Connected to MongoDB');
  })
  .catch((err) => console.log(err));

// ***** ROUTES *****
app.get('/', (req, res) => {
  return res.send({ message: 'API Listening' });
});

// ADD
app.post('/api/movies', (req, res) => {
  const newMovie = req.body;

  db.addNewMovie(newMovie).then((movie) =>
    res
      .status(201)
      .json({ message: `New movie with ID ${movie._id} has been added` })
      .catch((err) => res.status(404).json({ message: err }))
  );
});

// GET ALL
app.get('/api/movies?', (req, res) => {
  const page = req.query.page;
  const perPage = req.query.perPage;
  const title = req.query.title;

  if (!page || !perPage) {
    return res
      .status(404)
      .json({ message: 'page or perPage cannot be empty!' });
  }

  db.getAllMovies(page, perPage, title)
    .then((movies) => res.status(200).json(movies))
    .catch((err) => res.status(404).json({ message: err }));
});

// GET ONE
app.get('/api/movies/:id', async (req, res) => {
  const movieId = req.params.id;

  if (!movieId) {
    return res.status(404).json({ message: 'Movie ID cannot be empty' });
  }

  db.getMovieById(movieId)
    .then((movie) => res.status(200).json(movie))
    .catch((err) => res.status(404).json({ message: err }));
});

// UPDATE
app.put('/api/movies/:id', (req, res) => {
  const movieId = req.params.id;
  const newData = req.body;

  if (!movieId) {
    return res.status(404).json({ message: 'Movie ID cannot be empty' });
  }

  db.updateMovieById(newData, movieId)
    .then((movie) => res.status(201).json({ message: movie }))
    .catch((err) => res.status(404).json({ message: err }));
});

// DELETE
app.delete('/api/movies/:id', (req, res) => {
  const movieId = req.params.id;

  if (!movieId) {
    return res.status(500).json({ message: 'Movie ID cannot be empty' });
  }

  db.deleteMovieById(movieId)
    .then((delObj) => {
      res.status(204).json({ message: `Deleted ${delObj.deletedCount} movie` });
    })
    .catch((err) => res.status(404).json({ message: err }));
});
