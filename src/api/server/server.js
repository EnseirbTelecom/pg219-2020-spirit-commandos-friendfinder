const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

// Express middleware to parse requests' body
const bodyParser = require("body-parser")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const url = 'mongodb://localhost:27017';
  
// Clé pour le cryptage du token
const privatekey = "privatekey";

let archivePosition = function(position, positions) {
    positions.updateOne(position, { $set: { status: "Archivée"}}).then((err, res) => {
        console.log("une position a été archivée");
    })
}

// On ouvre une connexion à notre base de données
MongoClient.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    })
    // On commence par récupérer la collection que l'on va utiliser et la passer
    .then(function (client) {
        let users = client.db("FriendFinder").collection("users");
        let positions = client.db("FriendFinder").collection("positions");

        // Rajouter les routes et les traitements
        app.post("/signup", (req, res) => {
            let user = {
                mail: req.query.mail,
                password: req.query.password,
                nom: req.query.nom,
                prenom: req.query.prenom,
                pseudo: req.query.pseudo,
                date: req.query.date
            };
            let userExists = {
                mail : req.query.mail
            };
            // On cherche si l'@ mail existe déjà dans la base de données
            users.findOne(userExists, (err, result) => {
                if (result !== null) {
                    // L'utilisateur existe déjà dans la base de données
                    console.log("Cette @ mail est déjà utilisée");
                    res.json(null);
                }
                else {
                    users.insertOne(user, (err, resu) => {
                        console.log("Utilisateur Ajouté");
                        res.json(user);
                    })
                }
            })
        })
        .post("/signin", (req, res) => {
            let user = {
                mail: req.query.mail,
                password: req.query.password
            };
            // On cherche l'utilisateur dans la base de données
            users.findOne(user, (err, result) => {
                if (result === null) {
                    console.log("Vous n'êtes pas enregistré");
                    res.json(null);
                }
                else {
                    console.log("Bienvenue sur notre application !");
                    // Génération d'un token crypté
                    let token = jwt.sign({
                        data: result._id
                    }, privatekey, { expiresIn: '24h' });
                    console.log("token: " + token);
                    res.json(token);
                }
            })
        })
        .get("/position/:token", (req, res) => {
            try {
                let decoded = jwt.verify(req.params.token, privatekey);
                console.log("decoded:" + decoded.data);
                let position = {
                    lat: req.query.lat,
                    long: req.query.long,
                    date_activation: req.query.date,
                    heure_activation: req.query.heure,
                    msg: req.query.msg,
                    duree: req.query.duree,
                    user: decoded.data,
                    status: "active"
                }
                //  Si on a une position active lors de l'ajout d'une nouvelle position, on l'archive
                positions.findOne({status: "active"})
                .then(item => (item) ? archivePosition(item, positions) : console.log("Pas de position active trouvée"))
                positions.insertOne(position, (err, resu) => {
                    console.log("Position Ajoutée");
                    res.json(position);
                })
            } catch(err) {
                console.log("erreur lors du décodage");
            }
        });
        app.listen(3000, () => {
            console.log("En attente de requêtes...");
        })
    })
    .catch(function (err) {
      throw err;
    });