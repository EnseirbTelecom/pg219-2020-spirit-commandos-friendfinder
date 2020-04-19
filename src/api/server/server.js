const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

let nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'SpiritCommandos2020@gmail.com',
      pass: 'SpiritCommandos123'
    }
});

// Express middleware to parse requests' body
const bodyParser = require("body-parser")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH');
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
        let friends = client.db("FriendFinder").collection("friends");

        // Rajouter les routes et les traitements
        app.post("/signup", (req, res) => {
            console.log("BODY: " + JSON.stringify(req.body));
            let user = {
                mail: req.body.mail,
                password: req.body.password,
                nom: req.body.nom,
                prenom: req.body.prenom,
                pseudo: req.body.pseudo,
                date: req.body.date
            };
            let userExists = {
                mail : req.body.mail
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
                        // Génération d'un token crypté
                        let token = jwt.sign({
                            data: user._id
                        }, privatekey, { expiresIn: '24h' });
                        res.json(token);
                    })
                }
            })
        })
        .post("/signin", (req, res) => {
            let user = {
                mail: req.body.mail,
                password: req.body.password
            };
            console.log("USER: " + JSON.stringify(user));
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
                    res.json(token);
                }
            })
        })
        .get("/position/:token", (req, res) => {
            try {
                let decoded = jwt.verify(req.params.token, privatekey);
                console.log("decoded:" + decoded.data);
                let position = {
                    lat: req.body.lat,
                    long: req.body.long,
                    date_activation: req.body.date,
                    heure_activation: req.body.heure,
                    msg: req.body.msg,
                    duree: req.body.duree,
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
        })
        
        .post("/friends/:token", (req, res) => {
            // Ajouter un nouvel ami
            try {
                // on décode le token fourni
                let decoded = jwt.verify(req.params.token, privatekey);
                console.log("decoded:" + decoded.data);
                let id_1 = decoded.data;
                // On récupère l'id de l'ami
                users.findOne({mail: req.body.mail}, (err, user) => {
                    if (user !== null) {
                        let friend = {
                            id_1: id_1,
                            id_2: ObjectID(user._id).toString()
                        };
                        // On vérifie que les deux utilisateurs ne sont pas déjà amis
                        friends.insertOne(friend, (err, result) => {
                            console.log("Friendship added successfully");
                            res.json(result);
                        })
                    } 
                    else {
                        console.log("User not found");
                        res.json(null);
                    }
                }) 
            } catch(err) {
                console.log("Une erreur s'est produite lors du décodage");
            }
        })
        .get("/changePassword", (req, res) => {
            let mail = req.query.mail;
            console.log("MAIL: " + mail);
            // ON DOIT VÉRIFIER D'ABORD QUE L'UTILISATEUR EST BIEN INSCRIT DANS LA BDD
            users.findOne({mail: mail}, (err, user) => {
                console.log("USER: " + JSON.stringify(user));
                if (user !== null) {
                    let randString = Math.random().toString(36).substring(7);
                    console.log("random", randString);
                    // Envoyer des mails
                    let mailOptions = {
                        from: 'SpiritCommandos2020@gmail.com',
                        to: mail,
                        subject: 'Réinitialisation du mot de passe FriendFinder',
                        // text: 'à modifier',
                        // html: '<p>Bonjour, <br/>' +
                        // 'Merci de votre inscription sur notre site. <br/>' + 
                        // 'Afin de confirmer votre inscription, merci de cliquer sur le lien suivant: <a href="http://localhost:8082/pages/changePassword.php?mail=' + mail + '">Formulaire</a></p>'
                        text: "Veuillez trouvez ci-dessous vos nouveaux identifiants pour l'application mobile FriendFinder: \n" + 
                            "mail: " + mail + 
                            "\npassword: " + randString
                    };
                    transporter.sendMail(mailOptions, function(error, info) {
                        if (error) {
                            console.log("ERROR: " + error);
                            res.json(null);
                        } else {
                            // On modifie le mot de passe de cet utilisateur dans la BDD
                            // users.findOne({mail: mail}).then(user => {
                                users.updateOne(user, { $set: { password: randString}}).then((err, result) => {
                                    console.log("Mot de passe modifié avec succès");
                                    res.json(user);
                                })
                            // })
                        }
                })         
                } 
                else {
                    res.json(null);
                }
            })
           
    })
        .post("/newPassword/:token", (req, res) => {
            res.header("Access-Control-Allow-Origin", "*");
            try {
                // on décode le token fourni
                let decoded = jwt.verify(req.params.token, privatekey);
                console.log("decoded:" + decoded.data);
                let id = decoded.data;
                console.log("id: " + id);
                console.log("BODY: " + JSON.stringify(req.body));
                let oldPassword = req.body.old;
                let newPassword = req.body.new_mdp;
                // On vérifie que l'ancien mot de passe envoyé est le bon
                users.findOne( {"_id": ObjectID(id)}, (err, result) => {
                    console.log("right: " + result.password);
                    console.log("wrong: " + oldPassword);
                    if (result.password === oldPassword) {
                        console.log("Password conforme !");
                        users.updateOne(result, { $set: { password: newPassword}}).then((err, res) => {
                            console.log("Mot de passe modifié avec succès");
                        });
                        res.json("OK");
                    }
                    else {
                        console.log("Le password entré n'est pas conforme !");
                        res.json(null);
                    }
                })
            } catch (err) {

            }
        });
        app.listen(3000, () => {
            console.log("En attente de requêtes...");
        })
    })
    
    .catch(function (err) {
      throw err;
    });