const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
let nodemailer = require('nodemailer');
// Mail service added to the app
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

const userChecker = (req, res, next) => {
    const user = {
        mail: req.body.mail,
        password: req.body.password,
        nom: req.body.nom,
        prenom: req.body.prenom,
        pseudo: req.body.pseudo,
        date: req.body.date
    }
    for (let attr in user) {
        if (user[attr] === undefined)
            return res.status(400).json({ error: "Bad user parameters." })
    }
    next()
}

const positionChecker = (req, res, next) => {
    const position = {
        lat: req.body.lat,
        long: req.body.long,
        date_activation: req.body.date,
        heure_activation: req.body.heure,
        duree: req.body.duree
    }
    for (let attr in position) {
        if (position[attr] === undefined)
            return res.status(400).json({ error: "Bad position parameters." })
    }
    next()
}

const jwtErrorHandler = function(err, res) {
    if (err.name === "TokenExpiredError") {
        // Thrown error if the token is expired
        console.log(err.message);
        res.statusCode = 400;
        res.json();
    } else if (err.name === "JsonWebTokenError") {
        // Error object
        console.log(err.message);
        res.statusCode = 401;
        res.json();
    } else if (err.name === "NotBeforeError") {
        // Thrown if current time is before the nbf claim.
        console.log(err.message);
        res.statusCode = 402;
        res.json();
    }
};

// Token's encryption key
const privatekey = Math.random().toString(36).substring(7);

let archivePosition = function(position, positions) {
    positions.updateOne(position, { $set: { status: "Archivée" } }).then((err, res) => {
        console.log("a position has been archived");
    })
}

// connection to the database
MongoClient.connect(url, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    // Collections' fetching
    .then(function(client) {
        let users = client.db("FriendFinder").collection("users");
        let positions = client.db("FriendFinder").collection("positions");
        let friends = client.db("FriendFinder").collection("friends");
        let notifications = client.db("FriendFinder").collection("notifications");
        //checking if there are positions to archive after reopening the server
        let archPosAfterOpening = function() {
            let now = new Date().getTime();
            //console.log("Parcours des positions et test d'archivage");
            //console.log("Date en H ouverture serveur : " + now);
            positions.find({ status: "active" }).toArray().then(positionList => {
                // console.log("Active positions : " + JSON.stringify(positionList));
                positionList.forEach(position => {
                    //console.log("calcul date ajout de la position");
                    //Data parsing 
                    let activationDate = position.date_activation.match(/([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4})/);
                    //console.log("activationDate: " + activationDate);
                    //Reconstructing date's string
                    let addedIn = new Date(activationDate[2] + "/" + activationDate[1] + "/" + activationDate[3] + " " + position.heure_activation);
                    // console.log("diff deux dates");
                    //Calcul en milliseconde de la date d'archivage
                    let archivingDate = addedIn.getTime() + position.duree * 1000;
                    // console.log(archivingDate);
                    // console.log(now);
                    if ((archivingDate - now) <= 0) {
                        console.log("Position needs to be archived");
                        archivePosition(position, positions);
                    } else {
                        let dureeNv = (archivingDate - now) / 1000;
                        console.log("Position still valid for : " + dureeNv);
                        setTimeout(() => { archivePosition(position, positions) }, dureeNv * 1000);
                    }
                })
            })
        }
        setTimeout(archPosAfterOpening, 1);
        // Rajouter les routes et les traitements
        /***********************************************************************************************************************************************************************************\
                                                                                            Users                                                                                               
        \***********************************************************************************************************************************************************************************/
        //Signup
        app.post("/signup", userChecker, (req, res) => {
                // console.log("BODY: " + JSON.stringify(req.body));
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
                // Check if the mail address already exists
                users.findOne(userExists, (err, result) => {
                    if (result !== null) {
                        // User already subscribed 
                        console.log("This mail address is already used");
                        res.statusCode = 403;
                        // console.log(res.statusCode);
                        res.json();
                    } else {
                        users.insertOne(user, (err, resu) => {
                            console.log("User added successfully ");
                            // Encrypted token generated
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
            // signin
            .post("/signin", (req, res) => {
                let user = {
                    mail: req.body.mail,
                    password: req.body.password
                };
                // console.log("USER: " + JSON.stringify(user));
                // On cherche l'utilisateur dans la base de données
                users.findOne(user, (err, result) => {
                    if (result === null) {
                        console.log("Please signup. ");
                        res.statusCode = 403;
                        res.json();
                    } else {
                        console.log("Welcome to our App !");
                        // Génération d'un token crypté
                        let token = jwt.sign({
                            data: result._id
                        }, privatekey, { expiresIn: '24h' });
                        res.status(200).json({
                            text: token,
                        });
                    }
                })
            })
            // Get all users
            .get("/users/:token", (req, res) => {
                jwt.verify(req.params.token, privatekey, (err, decoded) => {
                    if (err) {
                        jwtErrorHandler(err, res);
                    } else {
                        users.find({}).toArray().then(usersList => {
                            usersList.forEach(user => {
                                delete user.password;
                                delete user.date;
                                delete user.prenom;
                                delete user.nom;
                                delete user.pseudo;
                                delete user._id;
                            })
                            res.json(usersList);
                        })
                    }
                });
            })
            // change password if forgotten 
            .get("/changePassword", (req, res) => {
                let mail = req.query.mail;
                // check if the user exists in the data base
                users.findOne({ mail: mail }, (err, user) => {
                    if (user !== null) {
                        let randString = Math.random().toString(36).substring(7);
                        // Send mail
                        let mailOptions = {
                            from: 'SpiritCommandos2020@gmail.com',
                            to: mail,
                            subject: 'Réinitialisation du mot de passe FriendFinder',
                            text: "Veuillez trouvez ci-dessous vos nouveaux identifiants pour l'application mobile FriendFinder: \n" +
                                "mail: " + mail +
                                "\npassword: " + randString
                        };
                        transporter.sendMail(mailOptions, function(error, info) {
                            if (error) {
                                console.log("ERROR: " + error);
                                res.json(null);
                            } else {
                                users.updateOne(user, { $set: { password: randString } }).then((err, result) => {
                                    console.log("New Password added successfully ");
                                    res.json(user);
                                })
                            }
                        })
                    } else {
                        res.json(null);
                    }
                })
            })
            // change password if wanted
            .post("/newPassword/:token", (req, res) => {
                res.header("Access-Control-Allow-Origin", "*");
                // token decoding
                jwt.verify(req.params.token, privatekey, (err, decoded) => {
                    if (err) {
                        jwtErrorHandler(err, res);
                    } else {
                        let id = decoded.data;
                        let oldPassword = req.body.old;
                        let newPassword = req.body.new_mdp;
                        // check if oldPassword is correct
                        users.findOne({ "_id": ObjectID(id) }, (err, result) => {
                            if (result.password === oldPassword) {
                                users.updateOne(result, { $set: { password: newPassword } }).then((err, res) => {
                                    console.log("Password successfully changed");
                                });
                                res.statusCode = 200;
                                res.json();
                            } else {
                                console.log("Given password is not correct !");
                                res.statusCode = 403;
                                res.json();
                            }
                        })
                    }
                })
            })
            /***********************************************************************************************************************************************************************************\
                                                                                                Positions                                                                                               
            \***********************************************************************************************************************************************************************************/
            // add a new position and send a notification to user's friends
            .post("/position/:token", positionChecker, (req, res) => {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                jwt.verify(req.params.token, privatekey, (err, decoded) => {
                    if (err) {
                        jwtErrorHandler(err, res);
                    } else {
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
                            //  Archive active position before adding to a new one
                        positions.findOne({ $and: [{ status: "active" }, { user: decoded.data }] })
                            .then(item => (item) ? archivePosition(item, positions) : console.log("Pas de position active trouvée"))
                        positions.insertOne(position, (err, resu) => {
                            console.log("Position added");
                            // console.log(decoded.data);
                            friends.find({ id_1: decoded.data }).toArray().then(result => {
                                result.forEach(friend => {
                                    let notif = {
                                        code: 1,
                                        id_src: decoded.data,
                                        id_dst: friend.id_2,
                                        target: resu.insertedId,
                                        status: "en attente"
                                    };
                                    notifications.insertOne(notif, (err, notifInserted) => {
                                        // console.log("notif inserted: " + JSON.stringify(notifInserted));
                                    })
                                })
                            });
                            friends.find({ id_2: decoded.data }).toArray().then(result => {
                                result.forEach(friend => {
                                    let notif = {
                                        code: 1,
                                        id_src: decoded.data,
                                        id_dst: friend.id_1,
                                        target: resu.insertedId,
                                        status: "en attente"
                                    };
                                    notifications.insertOne(notif, (err, notifInserted) => {
                                        //   console.log("notif inserted: " + JSON.stringify(notifInserted));
                                    })
                                })
                            });
                            // setting a specific time to archive the new position
                            setTimeout(() => { archivePosition(position, positions) }, position.duree * 1000);
                            res.status(200).json({
                                text: resu.insertedId,
                            })
                        })
                    }
                })
            })

        // get user's positions 
        .get("/positions/:token", (req, res) => {
                console.log("GET positions' list");
                jwt.verify(req.params.token, privatekey, (err, decoded) => {
                    if (err) {
                        jwtErrorHandler(err, res);
                    } else {
                        let id = decoded.data;;
                        // console.log(req.query.id);
                        // if an id is specified, positions of the corresponding user are returned
                        if (req.query.id !== undefined) {
                            id = req.query.id;
                        }
                        positions.find({ user: id }).sort({ date_activation: -1 }).toArray().then(positionList => {
                            // console.log(JSON.stringify(positionList));
                            res.json(positionList);
                        })
                    }
                })
            })
            // get active positions associated to the user's friends
            .get("/positionsActives/:token", (req, res) => {
                console.log("GET active positions' list");
                jwt.verify(req.params.token, privatekey, (err, decoded) => {
                    if (err) {
                        jwtErrorHandler(err, res);
                    } else {
                        let id = decoded.data;
                        let friendsListId = [];
                        friends.find({ $or: [{ id_1: id }, { id_2: id }] }).toArray().then(result => {
                            result.forEach(item => {
                                if (item.id_1 === id) {
                                    friendsListId.push(item.id_2);
                                } else {
                                    friendsListId.push(item.id_1);
                                }
                            });
                            // console.log("length: " + JSON.stringify(friendsListId));
                            positions.find({ $and: [{ status: "active" }, { user: { $in: friendsListId } }] }).toArray().then(positionsFriendsList => {
                                // console.log("Friends' active positions : " + JSON.stringify(positionsFriendsList));
                                res.statusCode = 200;
                                res.json(positionsFriendsList);
                            })
                        });
                    }
                })
            })
            // return a position's detail
            .get("/positionDetails/:token", (req, res) => {
                jwt.verify(req.params.token, privatekey, (err, decoded) => {
                    if (err) {
                        jwtErrorHandler(err, res);
                    } else {
                        positions.findOne({ _id: ObjectID(req.query.posId) }, (err, position) => {
                            if (position === null) {
                                console.log("Position not found ");
                                res.statusCode = 404;
                            } else {
                                res.statusCode = 200;
                                res.json(position);
                            }
                        })
                    }
                })
            })
            // delete a specific position
            .delete("/deletePos/:token/:posId", (req, res) => {
                jwt.verify(req.params.token, privatekey, (err, decoded) => {
                    if (err) {
                        jwtErrorHandler(err, res);
                    } else {
                        let idPos = req.params.posId;
                        positions.deleteOne({ _id: ObjectID(idPos) }, (err, result) => {
                            // console.log(result.deletedCount);
                            res.statusCode = 200;
                            res.json();
                        })
                        console.log("Position successfully deleted");

                    }
                })
            })
            // archive active position manually 
            .post("/archiverPos/:token/:posId", (req, res) => {
                jwt.verify(req.params.token, privatekey, (err, decoded) => {
                    if (err) {
                        jwtErrorHandler(err, res);
                    } else {
                        let idPos = req.params.posId;
                        positions.findOne({ _id: ObjectID(idPos) })
                            .then(item => (item) ? archivePosition(item, positions) : console.log("Position not found"))
                    }
                })
            })
            // return a user's profile
            .get("/getUserProfile/:token/:id", (req, res) => {
                jwt.verify(req.params.token, privatekey, (err, decoded) => {
                    if (err) {
                        jwtErrorHandler(err, res);
                    } else {
                        users.findOne({ _id: ObjectID(req.params.id) }, (err, user) => {
                            delete user.password;
                            res.json(user);
                        })
                    }
                })
            })

        /***********************************************************************************************************************************************************************************\
                                                                                            Friends                                                                                               
        \***********************************************************************************************************************************************************************************/
        // add a new friend
        .post("/friends/:token", (req, res) => {
                jwt.verify(req.params.token, privatekey, (err, decoded) => {
                    if (err) {
                        jwtErrorHandler(err, res);
                    } else {
                        let id_1 = decoded.data;
                        // get friend's id
                        users.findOne({ mail: req.query.mail }, (err, user) => {
                            if (user !== null) {
                                let friend = {
                                    id_1: id_1,
                                    id_2: ObjectID(user._id).toString()
                                };
                                let friend2 = {
                                    id_1: ObjectID(user._id).toString(),
                                    id_2: id_1
                                };
                                // check if id1 and id2 are friends already.
                                friends.findOne({ $or: [friend, friend2] }, (error, search) => {
                                    // console.log("search: " + JSON.stringify(search));
                                    if (search !== null) {
                                        console.log("This user is already your friend");
                                        res.statusCode = 401;
                                        res.json();
                                    } else {
                                        friend.status = "pending";
                                        // console.log("FRIEND: " + JSON.stringify(friend));
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
                                            console.log("new notification");
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
                    }
                })
            })
            // Get friends' list
            .get("/friends/:token", (req, res) => {
                jwt.verify(req.params.token, privatekey, (err, decoded) => {
                    if (err) {
                        jwtErrorHandler(err, res);
                    } else {
                        let id = decoded.data;
                        let friendsListId = [];
                        friends.find({ $or: [{ id_1: id }, { id_2: id }] }).toArray().then(result => {
                            // console.log("friends: " + JSON.stringify(result));
                            result.forEach(item => {
                                if (item.id_1 === id) {
                                    friendsListId.push(ObjectID(item.id_2));
                                } else {
                                    friendsListId.push(ObjectID(item.id_1));
                                }
                            });
                            // console.log("length: " + friendsListId.length); 
                            users.find({ _id: { $in: friendsListId } }).toArray().then(friendsListProfile => {
                                // console.log("LIST: " + JSON.stringify(friendsListProfile));
                                res.json(friendsListProfile);
                            })
                        })
                    }
                })
            })
            // delete a friend
            .delete("/friend/:token/:id", (req, res) => {
                jwt.verify(req.params.token, privatekey, (err, decoded) => {
                    if (err) {
                        jwtErrorHandler(err, res);
                    } else {
                        let id_1 = decoded.data;
                        let id_2 = req.params.id;
                        friends.findOne({ id_1: id_1 }, { id_2: id_2 }, (err, friend) => {
                            // console.log(JSON.stringify(friend));
                            if (friend === null) {
                                friends.findOne({ id_1: id_2 }, { id_2: id_1 }, (err, friend1) => {
                                    if (friend1 === null) {
                                        console.log("users are not friends ");
                                    } else {
                                        // console.log(JSON.stringify(friend1));
                                        friends.deleteOne({ _id: ObjectID(friend1._id) }, (err, result) => {
                                            // console.log(result.deletedCount);
                                            res.statusCode = 200;
                                            res.json();
                                        })
                                    }
                                })
                            } else {
                                friends.deleteOne({ _id: ObjectID(friend._id) }, (err, result) => {
                                    // console.log(result.deletedCount);
                                    res.statusCode = 200;
                                    res.json();
                                })
                            }
                        })
                    }
                })
            })
            // accept a friendship invitation
            .get("/acceptFriend/:token", (req, res) => {
                res.header("Access-Control-Allow-Origin", "*");
                jwt.verify(req.params.token, privatekey, (err, decoded) => {
                    if (err) {
                        jwtErrorHandler(err, res);
                    } else {
                        notifications.findOne({ _id: ObjectID(req.query.id) }, (error, notif) => {
                            let friend = {
                                id_1: notif.id_src,
                                id_2: notif.id_dst
                            };
                            friends.findOne(friend, (err, result) => {
                                // console.log(JSON.stringify(result));
                                friends.updateOne(result, { $set: { status: "accepted" } }, (error, resu) => {})
                            })
                        })

                    }
                })
            })
            // refuse a friendship invitation
            .get("/refuseFriend/:token", (req, res) => {
                res.header("Access-Control-Allow-Origin", "*");
                jwt.verify(req.params.token, privatekey, (err, decoded) => {
                    if (err) {
                        jwtErrorHandler(err, res);
                    } else {
                        notifications.findOne({ _id: ObjectID(req.query.id) }, (error, notif) => {
                            let friend = {
                                id_1: notif.id_src,
                                id_2: notif.id_dst
                            };
                            friends.findOne(friend, (err, result) => {
                                friends.updateOne(result, { $set: { status: "refused" } }, (error, resu) => {})
                            })
                        })

                    }
                })
            })

        /***********************************************************************************************************************************************************************************\
                                                                                Notifications                                                                                               
        \***********************************************************************************************************************************************************************************/

        // get 'not seen' notifications
        .get("/notifs/:token", (req, res) => {
                jwt.verify(req.params.token, privatekey, (err, decoded) => {
                    if (err) {
                        jwtErrorHandler(err, res);
                    } else {
                        let id = decoded.data;
                        let notifToLookFor = {
                            id_dst: id,
                            status: "en attente"
                        };
                        notifications.find(notifToLookFor).toArray().then(notifs => {
                            // console.log("Notifs: " + JSON.stringify(notifs));
                            res.json(notifs);
                        })
                    }
                })
            })
            // get all notifications
            .get("/AllNotifs/:token", (req, res) => {
                jwt.verify(req.params.token, privatekey, (err, decoded) => {
                    if (err) {
                        jwtErrorHandler(err, res);
                    } else {
                        notifications.find({ id_dst: id }).toArray().then(notifs => {
                            res.json(notifs);
                        })
                    }
                })
            })
            // change notification's status to seen
            .get("/SetNotifAsSeen/:token", (req, res) => {
                res.header("Access-Control-Allow-Origin", "*");
                jwt.verify(req.params.token, privatekey, (err, decoded) => {
                    if (err) {
                        jwtErrorHandler(err, res);
                    } else {
                        let id = decoded.data;
                        notifications.update({ _id: ObjectID(req.query.id) }, { $set: { status: "vue" } }, (err, result) => {
                            // console.log("notifs mise à jour");
                            res.statusCode = 200;
                            res.json();
                        })
                    }
                })
            })
            .get("/TargetNotif/:token/:id", (req, res) => {
                jwt.verify(req.params.token, privatekey, (err, decoded) => {
                    if (err) {
                        jwtErrorHandler(err, res);
                    } else {
                        notifications.findOne({ _id: ObjectID(req.params.id) }, (err, result) => {
                            res.json(result);
                        })
                    }
                })
            })
        app.listen(3000, () => {
            console.log("Waiting for new requests...");
        })
    })

.catch(function(err) {
    throw err;
});