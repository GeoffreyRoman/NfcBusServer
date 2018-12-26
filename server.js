var express = require("express");
var mysql = require("mysql");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  port: "8888" /* port on which phpmyadmin run */,
  password: "root",
  database: "nfcbus",
  socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock" //for mac and linux
});

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

app.use(myRouter);

// Démarrer le serveur
app.listen(port, hostname, function() {
  console.log("Mon serveur fonctionne sur http://" + hostname + ":" + port);
});
