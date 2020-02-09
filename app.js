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
    img = './imgs/milk.jpg';

    const [logo_result] = await client.logoDetection(img);
    const logos = logo_result.logoAnnotations;
    console.log('Logos:');
    logos.forEach(logo => console.log(logo.description));
    console.log();

    const [label_result] = await client.labelDetection(img);
    var labels = label_result.labelAnnotations;
    labels = labels.filter(label => filt(label));
    console.log('Labels:');
    labels.forEach(label => console.log(label.description));

    // const [ob_result] = await client.objectLocalization(img);
    // const objects = ob_result.localizedObjectAnnotations;

    // objects.forEach(object => {
    //     log.info(`Name: ${object.name}`);
    //     log.info(`Confidence: ${object.score}`);
    // })
    // console.log('First of Labels: ');
    // console.log(getFirst(labels).description)
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
    res.send('hello world');
});


// accepts label, returns boolean representing if name applicable
function filt(a) {
    keywords = ["can", "bottle", "glass", "plastic"];
    for (i = 0; i < keywords.length; i++) {
        if (a.description.toLowerCase().includes(keywords[i])) {
            return true;
        }
    }
    return false;
}
    let imageData = req.body;
    console.log(imageData);
    res.send('hello world\n')
});


// app.listen(port, () => console.log(`Example app listening on port ${port}!`))
quickstart();
