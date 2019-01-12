var express = require("express");
var mysql = require("mysql");

// var con = mysql.createConnection({
//   host: "82.253.136.83",
//   user: "root",
//   password: "geoffrey",
//   database: "nfcbus"
// });

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  port: "8888" /* port on which phpmyadmin run */,
  password: "root",
  database: "nfcbus",
  socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock" //for mac and linux
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

var bus = [];
var nearestStop = null;
var firstStopNumber = "";
var tripId;
var departureTime;
var arrivalTime;
var stop_name_first;

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
    firstStopNumber = req.query.stop;
    var arretTeste = 0;
    var tourDeBoucle = 0;

    var distance = Number.MAX_SAFE_INTEGER;
    let busTab = [];
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

    let getAllBusFromStop =
      "SELECT DISTINCT route_short_name, direction_id, stop_name FROM allData WHERE idStop LIKE '" +
      firstStopNumber +
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
        bus = [];
        directionFirstStop = result[0].direction_id;
        stop_name_first = result[0].stop_name;
        console.log("----------------------");

        console.log(result.length);
        console.log("----------------------");

        result.forEach(element => {
          busTab.push(element.route_short_name);
          // console.log("ELEMENT = " + element.trip_id);
          // tripId.push(element.trip_id);
          let getAllStops =
            "SELECT route_short_name, idStop, stop_name, stop_lat, stop_lon, departure_time, trip_id FROM allData where route_short_name LIKE '" +
            element.route_short_name +
            "' AND departure_time > '" +
            hour +
            "' AND direction_id LIKE '" +
            directionFirstStop +
            "'";
          con.query(getAllStops, (err, result) => {
            if (err) {
              console.log(err);
            }
            // Requete reussite
            else {
              // console.log("Fin du calcul pour : " + getAllStops);
              // console.log("RESULTA TAILE ------->> " + result.length);

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
              // console.log("FIN de BOUCLE");
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
      // getFinalResult();
      console.log(bus);
      getInfoFromSecondStop(nearestStop, res, distance, req);
    }, 5000);
  });

function getInfoFromSecondStop(nearestStop, res, distance, req) {
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

  let query =
    "SELECT * FROM allData WHERE idStop LIKE '" +
    firstStopNumber +
    "' AND departure_time > '" +
    hour +
    "' AND route_short_name LIKE '" +
    nearestStop.route_short_name +
    "' order by departure_time";
  console.log(query);

  con.query(query, (err, result) => {
    if (err) {
      console.log(err);
    }
    // Requete reussite
    else {
      tripId = result[0].trip_id;
      departureTime = result[0].departure_time;
      console.log(">>>>>>>>>>>>>>>>>>-----");
      console.log(tripId);
      console.log(departureTime);
      console.log(">>>>>>>>>>>>>>>>>>-----");
      let query2 =
        "SELECT departure_time FROM allData WHERE idStop LIKE '" +
        nearestStop.idStop +
        "' AND departure_time > '" +
        hour +
        "' AND trip_id LIKE '" +
        tripId +
        "'";
      console.log(query2);

      con.query(query2, (err, result) => {
        if (err) {
          console.log(err);
        }
        // Requete reussite
        else {
          console.log("aaaaaaaaaaaaaaaaaa");
          console.log(result);
          // console.log(result[0].departure_time);

          if (result.length > 0) {
            nearestStop.departure_time_first = result[0].departure_time;
          }
          nearestStop.stop_name_first = stop_name_first;
          console.log("aaaaaaaaaaaaaaaaaa");
          res.json({
            result: nearestStop,
            distance: distance,
            methode: req.method
          });
        }
      });
    }
  });

  //     tripId;
  // var departureTime;
  // var arrivalTime;
}

// // function callback(req, res, distance, nearestStop) {
// function callback(distance, nearestStop, res, req, arret, stop) {
//   console.log("CALLBACK");

//   console.log(distance);
//   console.log(nearestStop);
//   console.log("Nombre Total d'arret teste : " + arret);
//   console.log("Stop: " + stop);

//   res.json({
//     result: nearestStop,
//     distance: distance,
//     methode: req.method
//   });
// }

myRouter
  .route("/tripsId")
  // Retourne tous les tripsId (trip == bus physique) par rapport au numero du bus passe en parametre
  .get(function(req, res) {});

myRouter.route("/result").get(function(req, res) {
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

  let query =
    "SELECT DISTINCT trip_id FROM allData WHERE idStop LIKE '" +
    firstStopNumber +
    "'";
  console.log(query);

  con.query(query, (err, result) => {
    if (err) {
      console.log(err);
    }
    // Requete reussite
    else {
      let direction_id = goodDirectionOfTrip(result[0].trip_id, res);

      // result.forEach(element => {
      // for (let i = 0; i < result.length; i++) {
      //   const element = result[i];
      //   goodDirectionOfTrip(element.trip_id, res);
      //   // console.log(goodTrips);
      //   // console.log(goodTrips.length);
      // }
    }
  });
});

// ------------------------------------------------------------

function getFinalResult() {
  // TODO Ameliorer la vitesse de calcul en prenant que les bus passant dans max 2H
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

  let busQuery = " AND (route_short_name LIKE '" + bus[0] + "' ";
  for (let i = 1; i < bus.length; i++) {
    busQuery += "OR route_short_name LIKE '" + bus[i] + "' ";
  }
  busQuery += ")";
  console.log(busQuery);

  getTripsIdFromBus =
    "SELECT route_short_name, stop_lat, stop_lon, departure_time, idTrips, stop_id FROM allData WHERE departure_time > '" +
    hour +
    "'" +
    busQuery +
    " AND stop_name LIKE '" +
    nearestStop.stop_name +
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
        tabRes.push(result[i]);
      }
      console.log("Fin du calcul pour : " + getTripsIdFromBus);
      // tripsId = tabRes;

      // Ici on a tous les heures d'arriver des bus à l'arret le plus proche
      // Il faut trouver la meilleure heure avec chacun des tripID
      console.log("--------------");
      console.log(tabRes);

      console.log(tabRes);
      tripsInfo = tabRes;
      let tripsQuery = " (";
      for (let i = 0; i < tripsInfo.length - 1; i++) {
        tripsQuery += "'" + tripsInfo[i].idTrips + "' ,";
      }
      tripsQuery += "'" + tripsInfo[tripsInfo.length - 1].idTrips + "' )";
      var query =
        "SELECT * FROM allData WHERE stop_id LIKE " +
        firstStopNumber +
        " AND departure_time > '" +
        hour +
        "' AND trip_id IN " +
        tripsQuery;

      console.log(query);

      con.query(query, function(err, result) {
        if (err) {
          console.log(err);
        }
        // Requete reussite
        else {
          console.log("----------------------");
          console.log("Resultat Final: ");

          console.log(result);
        }
      });
    }
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

// --------------

// let tripsQuery = "AND (idTrips LIKE '" + tripsInfo[0].idTrips + "' ";
// for (let i = 1; i < tripsInfo.length; i++) {
//   tripsQuery += 'OR idTrips LIKE "' + tripsInfo[i].idTrips + '" ';
// }
// tripsQuery += ")";

function goodDirectionOfTrip(trip, res) {
  // TODO return 0 ou 1
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
  let query =
    "SELECT * FROM `allData` WHERE `idTrips` LIKE '" +
    trip +
    "' ORDER BY `arrival_time` ASC";
  // if(firstStopNumber avant nearestStop )
  con.query(query, function(err, result) {
    let direction_id;
    if (err) {
      console.log(err);
    }
    // Requete reussite
    else {
      // result.forEach(element => {
      console.log("goodDirectionOfTrip : " + result.length);

      for (let i = 0; i < result.length; i++) {
        const element = result[i];

        if (element.stop_id == firstStopNumber) {
          // C'est correct
          console.log("good");
          direction_id = element.direction_id;
          break;
        } else if (element.stop_id == nearestStop.stop_id) {
          console.log("bad");
          direction_id = (element.direction_id + 1) % 2;
          break;
        }
      }
      let query2 =
        "SELECT DISTINCT trip_id FROM allData WHERE idStop LIKE '" +
        firstStopNumber +
        "' AND direction_id LIKE '" +
        1 +
        "' AND departure_time > '" +
        hour +
        "'";
      console.log(query2);

      con.query(query2, (err, result) => {
        if (err) {
          console.log(err);
        }
        // Requete reussite
        else {
          console.log("-----------------------------------------");
          console.log("DERNIERE");
          console.log(result.length);
          console.log("-----------------------------------------");

          let tripsQuery = " (";
          for (let i = 0; i < result.length - 1; i++) {
            tripsQuery += '"' + result[i].trip_id + '" ,';
          }
          tripsQuery += '"' + result[result.length - 1].trip_id + '" )';

          let query3 =
            'SELECT trip_id FROM allData WHERE idStop LIKE "' +
            nearestStop.idStop +
            '" AND trip_id IN ' +
            tripsQuery;
          console.log(query3);
          con.query(query3, (err, result) => {
            if (err) {
              console.log(err);
            }
            // Requete reussite
            else {
              console.log("<<<<<<<<<<<<<<<<<<<<<");
              console.log(result.length);
              console.log("<<<<<<<<<<<<<<<<<<<<<");
            }
          });
        }
      });
    }
  });
}

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
