var express = require("express");
var mysql = require("mysql");

var con = mysql.createConnection({
  host: "82.253.136.83",
  user: "root",
  password: "geoffrey",
  database: "nfcbus"
});

con.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("Connection à la BDD réussi");
});

var hostname = "0.0.0.0";
var port = 3000;

var app = express();

var myRouter = express.Router();

myRouter
  .route("/bus")
  // Retourne tous les numeros de bus passant a l'arret mis en parametre
  .get(function(req, res) {
    let stopNumber = req.query.stop;
    let busTab = [];
    let getAllBusFromStop =
      "SELECT DISTINCT route_short_name FROM allData WHERE idStop LIKE '" +
      stopNumber +
      "'";
    console.log(getAllBusFromStop);

    con.query(getAllBusFromStop, function(err, result) {
      if (err) {
        console.log(err);
      }
      // Requete reussite
      else {
        console.log("Fin du calcul pour : " + getAllBusFromStop);
        result.forEach(element => {
          busTab.push(element.route_short_name);
        });
        res.json({
          result: busTab,
          methode: req.method
        });
      }
    });
  });

myRouter
  .route("/informations")
  // Retourne toutes les informations necessaire sur le numero du bus passe en parametre
  .get(function(req, res) {
    // TODO Ameliorer la vitesse de calcul en prenant que les bus passant dans max 2H
    let busNumber = req.query.bus;
    var date = new Date();
    let hour =
      (date.getHours() < 10 ? "0" : "") +
      date.getHours() +
      ":" +
      (date.getMinutes() < 10 ? "0" : "") +
      date.getMinutes() +
      ":" +
      (date.getSeconds() < 10 ? "0" : "") +
      date.getSeconds();
    getInformationsFromBus =
      "SELECT route_short_name, stop_lat, stop_lon, departure_time, idTrips, stop_id FROM allData WHERE route_short_name LIKE '" +
      busNumber +
      "' AND departure_time > '" +
      hour +
      "'";
    console.log(getInformationsFromBus);

    con.query(getInformationsFromBus, function(err, result) {
      if (err) {
        console.log(err);
      }
      // Requete reussite
      else {
        console.log("Fin du calcul pour : " + getInformationsFromBus);
        res.json({
          result: result,
          methode: req.method
        });
      }
    });
  });

myRouter
  .route("/tripsId")
  // Retourne tous les tripsId (trip == bus physique) par rapport au numero du bus passe en parametre
  .get(function(req, res) {
    // TODO Ameliorer la vitesse de calcul en prenant que les bus passant dans max 2H
    let busNumber = req.query.bus;
    var date = new Date();
    let hour =
      (date.getHours() < 10 ? "0" : "") +
      date.getHours() +
      ":" +
      (date.getMinutes() < 10 ? "0" : "") +
      date.getMinutes() +
      ":" +
      (date.getSeconds() < 10 ? "0" : "") +
      date.getSeconds();
    getTripsIdFromBus =
      "SELECT DISTINCT idTrips FROM allData WHERE route_short_name LIKE '" +
      busNumber +
      "' AND departure_time > '" +
      hour +
      "'";
    console.log(getTripsIdFromBus);

    con.query(getTripsIdFromBus, function(err, result) {
      if (err) {
        console.log(err);
      }
      // Requete reussite
      else {
        tabRes = [];
        for (let i = 0; i < result.length; i++) {
          tabRes.push(result[i].idTrips);
        }
        console.log("Fin du calcul pour : " + getTripsIdFromBus);
        res.json({
          result: tabRes,
          methode: req.method
        });
      }
    });
  });

myRouter
  .route("/stops")
  // Retourne tous les arrets de bus
  .get(function(req, res) {
    let getAllStops = "SELECT idStop, stop_name, stop_lat, stop_lon FROM stops";
    con.query(getAllStops, function(err, result) {
      if (err) {
        console.log(err);
      }
      // Requete reussite
      else {
        console.log("Fin du calcul pour : " + getAllStops);
        res.json({
          result: result,
          methode: req.method
        });
      }
    });
  });

myRouter
  .route("/nearestBusStop")
  // Retourne l'arret le plus proche ainsi que sa distance en fonction de la position du marker (long, lat), et du stopId (arret de bus ou l'utilisateur attend)
  .get(function(req, res) {
    // Marker position
    let long = req.query.long;
    let lat = req.query.lat;
    // On recupère les bus
    let stopNumber = req.query.stop;
    var arretTeste = 0;
    var tourDeBoucle = 0;

    console.log(stopNumber);

    var distance = Number.MAX_SAFE_INTEGER;
    var nearestStop = null;
    let busTab = [];
    let getAllBusFromStop =
      "SELECT DISTINCT route_short_name FROM allData WHERE idStop LIKE '" +
      stopNumber +
      "'";
    console.log(getAllBusFromStop);

    con.query(getAllBusFromStop, (err, result) => {
      if (err) {
        console.log(err);
      }
      // Requete reussite
      else {
        console.log("Fin du calcul pour : " + getAllBusFromStop);
        var itemsProcessed = 0;
        result.forEach(element => {
          // busTab.push(element.route_short_name);
          console.log("ELEMENT = " + element.route_short_name);

          let getAllStops =
            "SELECT DISTINCT route_short_name, idStop, stop_name, stop_lat, stop_lon FROM allData where route_short_name LIKE '" +
            element.route_short_name +
            "'";
          con.query(getAllStops, (err, result) => {
            if (err) {
              console.log(err);
            }
            // Requete reussite
            else {
              console.log("Fin du calcul pour : " + getAllStops);
              console.log("RESULTA TAILE ------->> " + result.length);

              result.forEach(stop => {
                let stopDistance = getDistanceFromLongLat(
                  long,
                  lat,
                  stop.stop_lon,
                  stop.stop_lat,
                  "K"
                );
                arretTeste++;

                if (stopDistance < distance) {
                  distance = stopDistance;
                  nearestStop = stop;
                }
                // console.log("DANS la BOUCLE");
              });
              tourDeBoucle++;
              console.log("FIN de BOUCLE");
            }
          });
        });

        console.log(distance);
        console.log(nearestStop);
      }
    });
    setTimeout(() => {
      console.log("Nombre d'arret teste : " + arretTeste);
      console.log("Nombre de tour : " + tourDeBoucle);
      res.json({
        result: nearestStop,
        distance: distance,
        methode: req.method
      });
    }, 5000);
  });

// function callback(req, res, distance, nearestStop) {
function callback(distance, nearestStop, res, req, arret, stop) {
  console.log("CALLBACK");

  console.log(distance);
  console.log(nearestStop);
  console.log("Nombre Total d'arret teste : " + arret);
  console.log("Stop: " + stop);

  res.json({
    result: nearestStop,
    distance: distance,
    methode: req.method
  });
}

// route get tous les TripId des bus qui passe par le stop le plus proche

// String res = "AND route_short_name LIKE '" + busArray[0].route_short_name;
// for (let i = 1; i < busArray.length; i++) {
//   const bus = busArray[i].route_short_name;
//   res += 'OR route_short_name LIKE "13"';
// }

// SELECT DISTINCT idTrips
// FROM allData
// WHERE idStop LIKE '1'
// AND
//  route_short_name LIKE "12"
// OR route_short_name LIKE "13"

// Tous les bus passant à l'arret de depart

function getDistanceFromLongLat(lon1, lat1, lon2, lat2, unit) {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
      dist = dist * 1.609344;
    }
    if (unit == "N") {
      dist = dist * 0.8684;
    }
    return dist;
  }
}

app.use(myRouter);

// Démarrer le serveur
app.listen(port, hostname, function() {
  console.log("Mon serveur fonctionne sur http://" + hostname + ":" + port);
});
