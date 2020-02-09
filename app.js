require("log-node")();

const port = 8000;
const express = require('express');
const log = require('log');



const app = express();

log.debug("Log level debug");
log.info("Log level info");
log.notice("Log level notice");
log.error("Log level error");
log.warning("Log level warning");



async function quickstart() {
    // Imports the Google Cloud client library
    const vision = require('@google-cloud/vision');
 
    // Creates a client
    const client = new vision.ImageAnnotatorClient();
 
    // Performs label detection on the image file
    const [result] = await client.labelDetection('./can.jpeg');
    const labels = result.labelAnnotations;
    console.log('Labels:');
    labels.forEach(label => console.log(label.description));
}

// POST /label?location=lat,long
// BODY: jpg image compressed
app.post('/label', function (req, res) {
    log.debug("Received request POST /label");
    let location = req.query.location.split(',');
    location[0] = Number(location[0]);
    location[1] = Number(location[1]);
  res.send('hello world')
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

// quickstart();

