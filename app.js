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
    img = './imgs/egg carton 3.jpg';

    const [logo_result] = await client.logoDetection(img);
    const logos = logo_result.logoAnnotations;
    console.log('Logos:');
    logos.forEach(logo => console.log(logo.description));

    console.log()

    const [label_result] = await client.labelDetection(img);
    const labels = label_result.labelAnnotations;
    console.log('Labels:');
    labels.forEach(label => console.log(label.description));

    const [ob_result] = await client.objectLocalization(img);
    const objects = ob_result.localizedObjectAnnotations;

    objects.forEach(object =>
        console.log(object.))
    // console.log('First of Labels: ');
    // console.log(getFirst(labels).description)
}

<<<<<<< Updated upstream
// POST /lable?location=lat,long
// BODY: jpg image compressed
app.post('/lable', function (req, res) {
    log.debug("Received request POST /lable");
    let location = req.query.location.split(',');
    location[0] = Number(location[0]);
    location[1] = Number(location[1]);
  res.send('hello world')
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

// quickstart();

=======
// accepts list, returns highest match, throws error if list empty
function getFirst(a) {
    try {
        return a[0];
    } catch (err) {
        console.log('No labels detected');
    }
}


quickstart()
>>>>>>> Stashed changes
