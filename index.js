const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/theAcmeIceCreamShop"
);
const express = require("express");
const app = express();

// parse the body into JS Objects
app.use(express.json());
// log the requests as they come in
app.use(require("morgan")("dev"));

// return an array of flavors
app.get("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `
            SELECT * from flavors ORDER BY created_at DESC;
        `;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (ex) {
    next(ex);
  }
});

// returns a single flavor
app.get("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
            SELECT * from flavors
            WHERE id=$1
        `;
    const response = await client.query(SQL, [req.params.id]);
    res.send(response.rows[0]);
  } catch (ex) {
    next(ex);
  }
});

//  Has the flavor to create as the payload, and returns the created flavor.
app.post("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `
        INSERT INTO flavors(name)
        VALUES($1)
        RETURNING *
        `;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.is_favorite,
    ]);
    res.send(response.rows[0]);
  } catch (ex) {
    next(ex);
  }
});

// Delete flavor
app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
            DELETE from flavors
            WHERE id = $1
        `;
    const response = await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

// update flavors-Has the updated flavor as the payload, and returns the updated flavor.
app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
        UPDATE flavors
        SET name=$1, ranking=$2, updated_at= now()
        WHERE id=$3 RETURNING *
        `;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.ranking,
      req.params.id,
    ]);
    res.send(response.rows[0]);
  } catch (ex) {
    next(ex);
  }
});

// Create the express server.
// Have the express server listen.
// Test your routes by using cURL, Postman, or both, again using the guided practice as a reference.

// Create the flavors table. Consider the columns that you need to add and the most appropriate data types. Remember to add code to drop a table before re-creating it.
const init = async () => {
  await client.connect();
  let SQL = `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        ranking INTEGER DEFAULT 3 NOT NULL,
        name VARCHAR(255) NOT NULL
        );
    `;
  await client.query(SQL);
  console.log("tables created");

  // Seed the table with some flavors of your choice.
  SQL = `
        INSERT INTO flavors(name, ranking) VALUES('Chocolate', 1);
        INSERT INTO flavors(name, ranking) VALUES('Strawberry', 2);
        INSERT INTO flavors(name, ranking) VALUES('Vanilla', 3);
        INSERT INTO flavors(name, ranking) VALUES('CookieDough', 4); 
        `;

  await client.query(SQL);
  console.log("data seeded");
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
