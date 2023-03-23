const express = require('express');
const path = require('path');

const app = express();
const port = 8888;

app.use(express.static(path.join(__dirname, 'fixtures')));

app.listen(port, () => {
  console.log(`Test server listening on port ${port}`);
});
