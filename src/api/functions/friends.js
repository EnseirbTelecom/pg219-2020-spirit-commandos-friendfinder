// import { ObjectID } from "mongodb";
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

// Une fonction qui récupère la liste de samis d'un utilisateur
async function getFriendsList(id, friends, usersB) {
    // id: id de l'utilisateur
    // friends: la collection "friends" de la BDD
    console.log("GET FRIENDS LIST");
    friends.find({}).toArray().then(users => {
        let friendsList = [];
        console.log("FRIENDS: " + JSON.stringify(users));
        users.forEach(element => {
            if (element.id_1 === id) {
                console.log("friend found 1! ")
                friendsList.push(element.id_2);
            } else if (element.id_2 === id) {
                console.log("friend found 2! ")
                friendsList.push(element.id_1);
            }
        });
        console.log("FF: " + JSON.stringify(friendsList));
        let FriendsProfile = [];
        // friendsList.forEach(elt => {
        for (let i = 0, len = friendsList.length; i < len; i++) {
            usersB.findOne({ _id: ObjectID(friendsList[i]) }, (error, search) => {
                // return search;
                console.log("user: " + JSON.stringify(search));
                FriendsProfile.push(search);
                console.log("profile 1: " + JSON.stringify(FriendsProfile));
            })
        }
        console.log("profile 2: " + JSON.stringify(FriendsProfile));
        return FriendsProfile;
        // return friendsList;
    })
}

// Une fonction qui permet de récupérer le profil d'un ami donné
let getFriendsProfile = function(id, users) {
    // id: l'id de l'ami en question
    // users: la collection "users" dans la BDD

}

// Une fonction qui permet de supprimer un ami
let deleteFriend = function(id_user, id_friend, friends) {
    let friend1 = {
        id_1: id_user,
        id_2: id_friend
    };
    let friend2 = {
        id_1: id_friend,
        id_2: id_user
    };
    friends.deleteOne(friend1, (err, res) => {
        if (res.deletedCount === 0) {
            friends.deleteOne(friend2, (error, result) => {
                console.log(result.deletedCount + " document supprimé !!");
            })
        }
    })
}

// Une fonction qui permet d'accepter une amitié
let AcceptFriend = function() {

}

exports.getFriendsList = getFriendsList;