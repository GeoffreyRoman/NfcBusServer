//L'application requiert l'utilisation du module Express.
//La variable express nous permettra d'utiliser les fonctionnalités du module Express.
var express = require("express");
// Nous définissons ici les paramètres du serveur.
var mysql = require("mysql");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  port: "8888" /* port on which phpmyadmin run */,
  password: "root",
  database: "nfcbus",
  socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock" //for mac and linux
});
var fs = require("fs"),
  readline = require("readline");

// var rd = readline.createInterface({
//   input: fs.createReadStream("stopTimes.sql"),
//   console: false
// });
console.log(con);

con.connect(function(err) {
  var i = 0;

  if (err) {
    console.log(err);
  } else {
    console.log("Connexion reussite");

    // Ecriture dans la BBD (plus besoin maintenant)

    // fs.readFileSync("sql1.sql")
    //   .toString()
    //   .split("\n")
    //   .forEach(function(line) {
    //     con.query(line, function(err, result) {
    //       if (err) {
    //         console.log(err);
    //       } else {
    //         i++;
    //         console.log(i + " record inserted");
    //       }
    //     });
    //   });
  }
});

var hostname = "localhost";
var port = 3000;

// Nous créons un objet de type Express.
var app = express();

//Afin de faciliter le routage (les URL que nous souhaitons prendre en charge dans notre API), nous créons un objet Router.
//C'est à partir de cet objet myRouter, que nous allons implémenter les méthodes.
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
    con.query(getAllBusFromStop, function(err, result) {
      if (err) {
        console.log(err);
      }
      // Requete reussite
      else {
        console.log(result);
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
      "SELECT route_short_name, stop_lat, stop_lon, departure_time FROM allData WHERE route_short_name LIKE '" +
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
        console.log(result);

        res.json({
          result: result,
          methode: req.method
        });
      }
    });
  });

// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);

// Démarrer le serveur
app.listen(port, hostname, function() {
  console.log("Mon serveur fonctionne sur http://" + hostname + ":" + port);
});
