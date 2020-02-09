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

// img: string or Buffer
async function quickstart(img) {
    ret = {};
    ret['labels'] = [];
    ret['logos'] = [];
    const vision = require('@google-cloud/vision');

    const client = new vision.ImageAnnotatorClient();

    const [logo_result] = await client.logoDetection(img);
    const logos = logo_result.logoAnnotations;
    logos.forEach(logo => {
        log.debug(`Got logo ${logo.description}`);
        ret['logos'].push(logo.description);
    });

    const [label_result] = await client.labelDetection(img);
    var labels = label_result.labelAnnotations;
    labels = labels.filter(label => {
        log.debug(`Got label ${label.description}`);
        if (filt(label)) {
            log.debug(`${label.description} passes filter`);
            ret['labels'].push(label.description);
        }
    });

    return ret;
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
    quickstart(req.body).then(labels => {
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify(labels));
    });
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


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
