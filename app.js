const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//Get Movies API

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT *
    FROM movie`;

  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//Add Movie API

app.post("/movies/", async (request, response) => {
  const movieDetails = {
    directorId: 6,
    movieName: "Jurassic Park",
    leadActor: "Jeff Goldblum",
  };
  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `
  INSERT INTO 
    movie(director_id,movie_name,lead_actor)
  VALUES
    (
        ${directorId},
        '${movieName}',
        '${leadActor}'
    );
  `;

  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Added Successfully");
});

// Get Movie API

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;

  const getBookQuery = `
    SELECT *
    FROM movie
    WHERE movie_id = ${movieId}`;

  const dbResponse = await db.get(getBookQuery);
  response.send(dbResponse);
});

//Delete Movie API

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteMovieQuery = `
    DELETE FROM
        movie
    WHERE 
        movie_id = ${movieId};
    `;

  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Update Movie API

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const movieDetails = {
    directorId: 24,
    movieName: "Thor",
    leadActor: "Christopher Hemsworth",
  };
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieQuery = `
    UPDATE 
        movie
    SET
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE
        movie_id = ${movieId};
    `;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Get Directors API

app.get("/directors/", async (request, response) => {
  const dbQuery = `
    SELECT *
    FROM director
    `;

  const directorArray = await db.all(dbQuery);
  response.send(
    directorArray.map((eachMovie) => ({ directorName: eachMovie.movie_name }))
  );
});

//Get Movies From Specific Director API

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const dbQuery = `
    SELECT *
    FROM movie
    WHERE director_id = ${directorId}
    `;

  const moviesArray = await db.all(dbQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
