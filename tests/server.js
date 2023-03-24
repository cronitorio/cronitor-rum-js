const express = require('express');
const path = require('path');

const app = express();
const port = 8888;

app.use(express.static(path.join(__dirname, 'fixtures'), { maxAge: 0, cacheControl: false }));

app.post('/api/rum/events', (req, res) => {
  res
    .status(200)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST')
    .setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    .setHeader('Pragma', 'no-cache')
    .setHeader('Expires', '0')
    .contentType('text/plain')
    .send('');
});

app.listen(port, () => {
  console.log(`Test server listening on port ${port}`);
});
