const express = require('express');
const fs = require('fs');
const https = require('https');
const bodyParser = require('body-parser');
require('dotenv').config()

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// set view engine
app.set("view engine", "ejs");

app.use(express.static('public'))

app.get('/', function (req, res) {
  res.render('index');
});

const url_loc = require('./locations.json')

app.get('/locations', function (req, res) {
  res.json(url_loc);
})

app.post('/', function (req, res) {
  var place = req.body.place;
  var del = req.body.del;
  const url = "https://geocoder.ls.hereapi.com/6.2/geocode.json?apiKey=" + process.env.apiKey + "&searchtext=" + place;
  https.get(url, (response) => {
    response.on("data", (data) => {
      var locationData = JSON.parse(data);
      var latitude = Math.trunc(locationData.Response.View[0].Result[0].Location.DisplayPosition.Latitude);
      var longitude = Math.trunc(locationData.Response.View[0].Result[0].Location.DisplayPosition.Longitude);
      // var location = { name: place, latitude: Math.trunc(latitude), longitude: Math.trunc(longitude) };
      // convert JSON object to string
      fs.readFile('./locations.json', 'utf-8', (err, data) => {
        if (err) {
          throw err;
        }
        var arrayOfObjects = JSON.parse(data);
        arrayOfObjects.push({
          name: place.split(',')[0]
          , lat: Math.trunc(latitude), long: Math.trunc(longitude)
        });
        removeByAttr(arrayOfObjects, 'name', del);
        // write JSON string to a file
        fs.writeFile('./locations.json', JSON.stringify(arrayOfObjects, null, 4), 'utf-8', (err) => {
          if (err) {
            throw err;
          }
          console.log('JSON data is saved.');
        });
      });
      res.redirect('/');
    })
  });
});

var removeByAttr = function (arr, attr, value) {
  var i = arr.length;
  while (i--) {
    if (arr[i]
      && arr[i].hasOwnProperty(attr)
      && (arguments.length > 2 && arr[i][attr] === value)) {

      arr.splice(i, 1);

    }
  }
}

app.listen(process.env.PORT || 3000, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})