require("log-node")();

const port = 8000;
const express = require('express');
const bodyParser = require('body-parser');
const log = require('log');

const app = express();

const rawBodyParser = bodyParser.raw({ "type": "image/jpeg", "limit": "50mb" });

const mysql = require('mysql');

const con = mysql.createConnection({
    host: "34.68.221.19",
    user: "root",
    password: "password",
    database: "recyclevision"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

/*
log.debug("Log level debug");
log.info("Log level info");
log.notice("Log level notice");
log.error("Log level error");
log.warning("Log level warning");
*/

// img: string or Buffer
// takes image, returns dictionary of applicable labels
async function imageDetect(img) {
    ret = {};
    ret['labels'] = [];
    ret['confidence'] = [];
    ret['logos'] = [];
    const vision = require('@google-cloud/vision');

    const client = new vision.ImageAnnotatorClient();

    const [logo_result] = await client.logoDetection(img);
    const logos = logo_result.logoAnnotations;
    if (logos) {
        logos.forEach(logo => {
            log.debug(`Got logo ${logo.description}`);
            ret['logos'].push(logo.description);
        });
    }
    const [label_result] = await client.labelDetection(img);
    var labels = label_result.labelAnnotations;
    if (labels) {
        labels = labels.filter(label => {
            log.debug(`Got label ${label.description}`);
            if (filt(label)) {
                log.debug(`${label.description} passes filter`);
                ret['labels'].push(label.description);
                ret['confidence'].push(label.score);
            }
        });
    }
    return ret;
}

// POST /label?location=lat,long
// BODY: jpg image compressed
// handler for post to app
// called each time an image is sent
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
    imageDetect(req.body).then(labels => {
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify(labels));
        res.send(verdict(labels["labels"]));    // pushback verdict to phone
        var sql = "INSERT INTO analytics (Latitude, Longitude, Label1, Label2, Label3, Confidence1, Confidence2, Confidence3, Logo) VALUES ?";
        var values = [buildValues(labels, location)];   // build values for database
        con.query(sql, [values], function (err, result) {
            if (err) throw err;
            console.log("Number of records inserted: " + result.affectedRows);
        });
    });
});

// accepts label, returns boolean representing if name applicable
function filt(a) {
    keywords = ["can", "bottle", "glass", "plastic", "cardboard", "cleaning", "beer", "book"];
    for (i = 0; i < keywords.length; i++) {
        if (a.description.toLowerCase().includes(keywords[i])) {
            return true;
        }
    }
    return false;
}

// accepts a dictionary and location data, builds the data packet to send to mysql
function buildValues(dp, loc) {
    var values = [];
    values.push(loc[0]);
    values.push(loc[1]);
    addValues(dp["labels"], values);
    addValues(dp["confidence"], values);
    if (dp["logos"].length > 0) {
        values.push(dp["logos"][0]);
    } else {
        values.push("");
    }
    return values;
}

// accepts data location and array to place, places data in array
// also protects for index errors, filling in empty entries with ""
function addValues(dl, values) {
    for (i = 0; i < 3; i++) {
        if (i < dl.length) {
            values.push(dl[i]);
        } else {
            values.push("");
        }
    }
}

// accepts list of labels, returns boolean value representing recyclability
function verdict(labels) {
    if (labels.length == 0) {
        return false;
    }
    if (labels.indexOf("plastic") & !labels.indexOf("bottle")) {
        return false;
    }
    return true;
}



// app.listen(port, () => console.log(`Example app listening on port ${port}!`))

// function fakelaunch(img) {
//     location = [0, 1];
//     imageDetect(img).then(labels => {
//         // res.set('Content-Type', 'application/json');
//         // res.send(JSON.stringify(labels));
//         var sql = "INSERT INTO analytics (Latitude, Longitude, Label1, Label2, Label3, Confidence1, Confidence2, Confidence3, Logo) VALUES ?";
//         var values = [buildValues(labels, location)];
//         console.log(verdict(labels["labels"]));
//         // con.query(sql, [values], function (err, result) {
//         //     if (err) throw err;
//         //     console.log("Number of records inserted: " + result.affectedRows);
//         // });
//     });
// }

// img = "imgs/plastic.jpg";
// fakelaunch(img);