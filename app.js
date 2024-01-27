// import express from "express";

// const app = express();
// const port = 3000;

// app.get('/', (req, res) => {
//   res.send('Welcome to my server!');
// });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

const express = require('express');
const app = express();
const router = express.Router();
// const app = express();
 const port = 3000;

app.get('/', (req, res) => {
  res.send('Welcome to my server! abc');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});