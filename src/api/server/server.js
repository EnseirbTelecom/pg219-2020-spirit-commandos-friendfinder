const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
let nodemailer = require('nodemailer');
//test timer
function myFunc() {
    console.log("Debut code test timer après 10secondes");
}
setTimeout(myFunc, 10000, 'funky');

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
// Math.random().toString(36).substring(7)
const privatekey = "privatekey";

let archivePosition = function(position, positions) {
    positions.updateOne(position, { $set: { status: "Archivée" } }).then((err, res) => {
        console.log("une position a été archivée");
    })
}

let answerFriendshipInvitation = function(token, id, str) {
    try {
        // On décode le token fourni
        console.log("requête GET accept friend");
        let decoded = jwt.verify(token, privatekey);
        console.log("decoded:" + decoded.data);
        notifications.findOne({ _id: ObjectID(id) }, (error, notif) => {
            let friend = {
                id_1: notif.id_src,
                id_2: notif.id_dst
            };
            friends.findOne(friend, (err, result) => {
                console.log(JSON.stringify(result));
                friends.updateOne(result, { $set: { status: str } }, (error, resu) => {
                    console.log(error);
                    console.log("opération réussie !");
                    console.log(JSON.stringify(resu));
                })
            })
        })

    } catch (err) {

    }
}

// On ouvre une connexion à notre base de données
MongoClient.connect(url, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    // On commence par récupérer la collection que l'on va utiliser et la passer
    .then(function(client) {
        let users = client.db("FriendFinder").collection("users");
        let positions = client.db("FriendFinder").collection("positions");
        let friends = client.db("FriendFinder").collection("friends");
        let notifications = client.db("FriendFinder").collection("notifications");

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
                    mail: req.body.mail
                };
                // On cherche si l'@ mail existe déjà dans la base de données
                users.findOne(userExists, (err, result) => {
                    if (result !== null) {
                        // L'utilisateur existe déjà dans la base de données
                        console.log("Cette @ mail est déjà utilisée");
                        res.statusCode = 403;
                        console.log(res.statusCode);
                        res.json();
                    } else {
                        users.insertOne(user, (err, resu) => {
                            console.log("Utilisateur Ajouté");
                            // Génération d'un token crypté
                            let token = jwt.sign({
                                data: user._id
                            }, privatekey, { expiresIn: '24h' });
                            res.status(200).json({
                                text: token,
                            });
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
                        res.statusCode = 403;
                        res.json();
                    } else {
                        console.log("Bienvenue sur notre application !");
                        // Génération d'un token crypté
                        let token = jwt.sign({
                            data: result._id
                        }, privatekey, { expiresIn: '24h' });
                        res.status(200).json({
                            text: token,
                        });
                    }
                })
                //test timer
                function myFunc() {
                console.log("Apres signin test timer après 1minute");
                }
                setTimeout(myFunc, 60000, 'funky');
            })
            .get("/users/:token", (req, res) => {
                try {
                    let decoded = jwt.verify(req.params.token, privatekey);
                    console.log("decoded:" + decoded.data);
                    users.find({}).toArray().then(usersList => {
                        usersList.forEach(user => {
                            delete user.password;
                            delete user.date;
                            delete user.prenom;
                            delete user.nom;
                            delete user.pseudo;
                            delete user._id;
                        })
                        console.log("users: " + JSON.stringify(usersList));
                        res.json(usersList);
                    })
                } catch (err) {

                }
            })
            .post("/position/:token", (req, res) => {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                try {
                    let decoded = jwt.verify(req.params.token, privatekey);
                    console.log("decoded:" + decoded.data);
                    console.log("reqBody:" + req.body);
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
                    positions.findOne({ status: "active" })
                        .then(item => (item) ? archivePosition(item, positions) : console.log("Pas de position active trouvée"))
                    positions.insertOne(position, (err, resu) => {
                        console.log("Position Ajoutée");
                        console.log(decoded.data);
                        friends.find({ $or: [{ id_1: decoded.data }, { id_2: decoded.data }] }).toArray().then(result => {
                            console.log(JSON.stringify(result));
                            result.forEach(friend => {
                                let notif = {
                                    code: 1,
                                    id_src: decoded.data,
                                    status: "en attente"
                                };
                                if (result.id_1 === decoded.data) {
                                    notif.id_dst = ObjectID(friend.id_2).toString();
                                } else {
                                    notif.id_dst = ObjectID(friend.id_1).toString();
                                }
                                notifications.insertOne(notif).then((err, notifInserted) => {
                                    console.log(JSON.stringify(notifInserted));
                                })
                            })

                            res.json("success");
                        })
                    })
                } catch (err) {
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
                    users.findOne({ mail: req.query.mail }, (err, user) => {
                        if (user !== null) {
                            let friend = {
                                id_1: id_1,
                                id_2: ObjectID(user._id).toString(),
                            };
                            // On vérifie que les deux utilisateurs ne sont pas déjà amis
                            friends.findOne({ id_1: id_1 }, (error, search) => {
                                console.log("search: " + JSON.stringify(search));
                                if (search !== null) {
                                    if (search.id_2 === friend.id_2) {
                                        console.log("Vous êtes déjà amis");
                                        res.statusCode = 401;
                                        res.json();
                                    }
                                } else {
                                    friend.status = "pending";
                                    console.log("FRIEND: " + JSON.stringify(friend));
                                    // Le deux utilisateurs ne sont pas amis
                                    friends.insertOne(friend, (err, result) => {
                                        console.log("Friendship added successfully");
                                    })
                                    let notif = {
                                        code: 0,
                                        id_src: id_1,
                                        id_dst: ObjectID(user._id).toString(),
                                        status: "en attente"
                                    }
                                    notifications.insertOne(notif, (err, success) => {
                                        console.log("nouvelle notification");
                                        res.statusCode = 200;
                                        res.json();
                                    })
                                }
                            });
                        } else {
                            console.log("User not found");
                            res.statusCode = 403;
                            res.json();
                        }
                    })
                } catch (err) {
                    console.log("Une erreur s'est produite lors du décodage");
                }
            })
            // Récupérer la liste des amis
            .get("/friends/:token", (req, res) => {
                try {
                    // on décode le token fourni
                    let decoded = jwt.verify(req.params.token, privatekey);
                    console.log("decoded:" + decoded.data);
                    let id = decoded.data;
                    let friendsListId = [];
                    friends.find({ $or: [{ id_1: id }, { id_2: id }] }).toArray().then(result => {
                        console.log("friends: " + JSON.stringify(result));
                        result.forEach(item => {
                            if (item.id_1 === id) {
                                friendsListId.push(ObjectID(item.id_2));
                            } else {
                                friendsListId.push(ObjectID(item.id_1));
                            }
                        });
                        console.log("length: " + friendsListId.length); // correct
                        users.find({ _id: { $in: friendsListId } }).toArray().then(friendsListProfile => {
                            console.log("LISTE: " + JSON.stringify(friendsListProfile));
                            res.json(friendsListProfile);
                        })
                    })
                } catch (err) {
                    console.log("Erreur s'est produite lors du décodage");
                }
            })
            .get("/getUserProfile/:token/:id", (req, res) => {
                try {
                    // on décode le token fourni
                    let decoded = jwt.verify(req.params.token, privatekey);
                    users.findOne({ _id: ObjectID(req.params.id) }, (err, user) => {
                        delete user.password;
                        res.json(user);
                    })
                } catch (err) {
                    console.log("Erreur s'est produite lors du décodage");
                }
            })
            .delete("/friend/:token/:id", (req, res) => {
                try {
                    // on décode le token fourni
                    let decoded = jwt.verify(req.params.token, privatekey);
                    let id_1 = decoded.data;
                    let id_2 = req.params.id;
                    friends.findOne({ id_1: id_1 }, { id_2: id_2 }, (err, friend) => {
                        console.log(JSON.stringify(friend));
                        if (friend === null) {
                            friends.findOne({ id_1: id_2 }, { id_2: id_1 }, (err, friend1) => {
                                if (friend1 === null) {
                                    console.log("Ces deux utilisateurs ne sont pas amis !!!");
                                } else {
                                    console.log(JSON.stringify(friend1));
                                    friends.deleteOne({ _id: ObjectID(friend1._id) }, (err, result) => {
                                        console.log(result.deletedCount);
                                        res.statusCode = 200;
                                        res.json();
                                    })
                                }
                            })
                        } else {
                            friends.deleteOne({ _id: ObjectID(friend._id) }, (err, result) => {
                                console.log(result.deletedCount);
                                res.statusCode = 200;
                                res.json();
                            })
                        }
                    })
                } catch (err) {
                    console.log("Erreur s'est produite lors du décodage");
                }
            })
            .get("/changePassword", (req, res) => {
                let mail = req.query.mail;
                console.log("MAIL: " + mail);
                // ON DOIT VÉRIFIER D'ABORD QUE L'UTILISATEUR EST BIEN INSCRIT DANS LA BDD
                users.findOne({ mail: mail }, (err, user) => {
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
                                users.updateOne(user, { $set: { password: randString } }).then((err, result) => {
                                        console.log("Mot de passe modifié avec succès");
                                        res.json(user);
                                    })
                                    // })
                            }
                        })
                    } else {
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
                    users.findOne({ "_id": ObjectID(id) }, (err, result) => {
                        console.log("right: " + result.password);
                        console.log("wrong: " + oldPassword);
                        if (result.password === oldPassword) {
                            console.log("Password conforme !");
                            users.updateOne(result, { $set: { password: newPassword } }).then((err, res) => {
                                console.log("Mot de passe modifié avec succès");
                            });
                            res.statusCode = 200;
                            res.json();
                        } else {
                            console.log("Le password entré n'est pas conforme !");
                            res.statusCode = 403;
                            res.json();
                        }
                    })
                } catch (err) {

                }
            })
            .get("/acceptFriend/:token", (req, res) => {
                res.header("Access-Control-Allow-Origin", "*");
                // answerFriendshipInvitation(req.params.token, req.query.id, "accepted");
                try {
                    // On décode le token fourni
                    console.log("requête GET accept friend");
                    let decoded = jwt.verify(req.params.token, privatekey);
                    notifications.findOne({ _id: ObjectID(req.query.id) }, (error, notif) => {
                        let friend = {
                            id_1: notif.id_src,
                            id_2: notif.id_dst
                        };
                        friends.findOne(friend, (err, result) => {
                            console.log(JSON.stringify(result));
                            friends.updateOne(result, { $set: { status: "accepted" } }, (error, resu) => {})
                        })
                    })

                } catch (err) {

                }
            })
            .get("/refuseFriend/:token", (req, res) => {
                res.header("Access-Control-Allow-Origin", "*");
                try {
                    // On décode le token fourni
                    let decoded = jwt.verify(req.params.token, privatekey);
                    notifications.findOne({ _id: ObjectID(req.query.id) }, (error, notif) => {
                        let friend = {
                            id_1: notif.id_src,
                            id_2: notif.id_dst
                        };
                        friends.findOne(friend, (err, result) => {
                            friends.updateOne(result, { $set: { status: "refused" } }, (error, resu) => {})
                        })
                    })

                } catch (err) {

                }
            })
            // On doit retourner uniquement les notifs non vues
            .get("/notifs/:token", (req, res) => {
                console.log("Notifsssss");
                try {
                    // on décode le token fourni
                    let decoded = jwt.verify(req.params.token, privatekey);
                    console.log("decoded:" + decoded.data);
                    let id = decoded.data;
                    let notifToLookFor = {
                        id_dst: id,
                        status: "en attente"
                    };
                    notifications.find(notifToLookFor).toArray().then(notifs => {
                        console.log("notifs: " + JSON.stringify(notifs));
                        res.json(notifs);
                    })
                } catch (err) {
                    console.log("Erreur lors du décodage");
                }
            })
            .get("/AllNotifs/:token", (req, res) => {
                try {
                    // on décode le token fourni
                    let decoded = jwt.verify(req.params.token, privatekey);
                    // console.log("decoded:" + decoded.data);
                    let id = decoded.data;
                    notifications.find({ id_dst: id }).toArray().then(notifs => {
                        res.json(notifs);
                    })
                } catch (err) {
                    console.log("Erreur lors du décodage");
                }
            })
            .get("/SetNotifAsSeen/:token", (req, res) => {
                // res.header("Access-Control-Allow-Origin", "*");
                try {
                    // On décode le token fourni
                    let decoded = jwt.verify(req.params.token, privatekey);
                    console.log("decoded:" + decoded.data);
                    let id = decoded.data;
                    notifications.update({ _id: ObjectID(req.query.id) }, { $set: { status: "vue" } }, (err, result) => {
                        console.log("notifs mise à jour");
                        res.statusCode = 403;
                        res.json();
                    })
                } catch (err) {
                    console.log("Erreur lors du décodage");
                }
            })
            .get("/ArchivePosition/:token", (req, res) => {
                console.log("Position archivée!!!!!!!!");
                try {
                    // On décode le token fourni
                    let decoded = jwt.verify(req.params.token, privatekey);
                    console.log("decoded:" + decoded.data);
                    //  On cherche la position active dans la BDD
                    positions.findOne({ status: "active" })
                        .then(item => (item) ? archivePosition(item, positions) : console.log("Pas de position active trouvée"))
                } catch (err) {
                    console.log("Erreur lors du décodage");
                }
            });
        app.listen(3000, () => {
            console.log("En attente de requêtes...");
        })
    })

.catch(function(err) {
    throw err;
});