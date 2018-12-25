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

// var hostname = "localhost";
// var port = 3000;

// // Nous créons un objet de type Express.
// var app = express();

// //Afin de faciliter le routage (les URL que nous souhaitons prendre en charge dans notre API), nous créons un objet Router.
// //C'est à partir de cet objet myRouter, que nous allons implémenter les méthodes.
// var myRouter = express.Router();

myRouter
  .route("/all")
  // GET
  .get(function(req, res) {
    res.json({
      message: "Tous les itineraires",
      methode: req.method
    });
  });
// //   //POST
// //   .post(function(req, res) {
// //     res.json({
// //       message: "Ajoute une nouvelle piscine à la liste",
// //       methode: req.method
// //     });
// //   })
// //   //PUT
// //   .put(function(req, res) {
// //     res.json({
// //       message: "Mise à jour des informations d'une piscine dans la liste",
// //       methode: req.method
// //     });
// //   })
// //   //DELETE
// //   .delete(function(req, res) {
// //     res.json({
// //       message: "Suppression d'une piscine dans la liste",
// //       methode: req.method
// //     });
// //   });

// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);

// Démarrer le serveur
app.listen(port, hostname, function() {
  console.log("Mon serveur fonctionne sur http://" + hostname + ":" + port);
});
