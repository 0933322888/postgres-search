const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "naukma",
  password: "admin",
  post: 5432
});

const getData = (request, response) => {
  const query = `SELECT doc, doc_tsv, filenum, linenum FROM test where to_tsvector(doc) @@ to_tsquery('${request.query.q}')`;
  //   const query = "SELECT * FROM test";
  pool.query(query, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const createRecord = (request, response) => {
  let query = "INSERT INTO test(filenum, doc, linenum) VALUES";
  let data = request.body.data;

  let list = [];

  for (let i = 0; i < data.length; i++) {
    let purifiedString = data[i].split("'").join("");
    let splittedByLine = purifiedString.split(/\r?\n/).filter(el => el !== "");
    list.push({ file: i, lines: splittedByLine });
  }

  for (let i = 0; i < list.length; i++) {
    for (let k = 0; k < list[i].lines.length; k++) {
      query += "(" + i + ",'" + list[i].lines[k] + "'," + k + "),";
    }
  }

  query = query.substr(0, query.length - 1);
  pool.query(query, (error, result) => {
    if (error) {
      throw error;
    }
    pool.query("UPDATE test SET doc_tsv = to_tsvector(doc)", (err, res) => {
      response.status(201).send("All ok:)");
    });
  });
};

module.exports = {
  getData,
  createRecord
};
