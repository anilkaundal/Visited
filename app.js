const express = require('express');
const fs = require('fs');
const https = require('https');
const bodyParser = require('body-parser');
const fetch = require("node-fetch");
require('dotenv').config()

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// set view engine
app.set("view engine", "ejs");

app.use(express.static('public'))

app.use(express.static(__dirname + '/public/img'));

app.get('/', function (req, res) {
  res.render('index');
});

/*const url_loc = require('./locations.json')

app.get('/locations', function (req, res) {
  res.json(url_loc);
})*/

app.post('/', function (req, res) {
  var place = req.body.place;
  var del = req.body.del;
  const url = "https://geocoder.ls.hereapi.com/6.2/geocode.json?apiKey=" + process.env.apiKey + "&searchtext=" + place;
  https.get(url, (response) => {
    response.on("data", (data) => {
      var locationData = JSON.parse(data);
      var latitude = Math.trunc(locationData.Response.View[0].Result[0].Location.DisplayPosition.Latitude);
      var longitude = Math.trunc(locationData.Response.View[0].Result[0].Location.DisplayPosition.Longitude);
      var location = { name: place.split(',')[0], lat: Math.trunc(latitude), long: Math.trunc(longitude) };
      // convert JSON object to string
      /*
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
      });*/
      // Send this object as JSON data to the server
      Promise.all([
        fetch("https://locations-database.herokuapp.com/locations", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(location)
        })
        // fetch("https://locations-database.herokuapp.com/locations")
      ])
        /*
          .then((results) => results.json())
          .then((data) => data.forEach((element) => {
            if (element.name == del) {
              const url_delete = "https://locations-database.herokuapp.com/locations?name=" + element.id;
              fetch(url_delete, {
                method: "DELETE",
              })
            }
          }))*/
        .catch(function (error) {
          // if there's an error, log it
          console.log(error);
        });
      res.redirect('/');
    })
  })
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
  console.log(`App is listening at http://localhost:3000`);
})