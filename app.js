require("log-node")();

const port = 8000;
const express = require('express');
const bodyParser = require('body-parser');
const log = require('log');

const app = express();

const rawBodyParser = bodyParser.raw({"type": "image/jpeg"});

/*
log.debug("Log level debug");
log.info("Log level info");
log.notice("Log level notice");
log.error("Log level error");
log.warning("Log level warning");
*/

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

function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

// POST /label?location=lat,long
// BODY: jpg image compressed
app.post('/label', rawBodyParser, function (req, res) {
    log.debug(`Received request POST ${req.originalUrl}`);
    if (Object.keys(req.query).indexOf('location') == -1) {
        log.warning("POST did not contain location in query. Sending error");
        res.send("Error! No location sent!\n");
        return;
    }
    let location = req.query.location.split(',');
    location[0] = Number(location[0]);
    location[1] = Number(location[1]);
    let imageData = req.body;
    console.log(imageData);
    res.send('hello world\n')
});

app.listen(port, () => console.log(`Listening on port ${port}!`))

// quickstart();

