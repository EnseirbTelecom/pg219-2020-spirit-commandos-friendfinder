var $$ = Dom7;

var app = new Framework7({
    root: '#app', // App root element

    id: 'io.framework7.friendfinder', // App bundle ID
    name: 'FriendFinder', // App name
    theme: 'auto', // Automatic theme detection
    // App root data
    data: function() {
        // user: {
        //     firstName: 'John',
        //     lastName: 'Doe',
        // },
    },
    // App root methods
    methods: {
        params: function(router, token) {
            console.log("Vous voulez modifier votre mot de passe");
            router.navigate("/parameters/" + token);
        },
        getPos: function(router, token) {
            router.navigate("/AddPosition/" + token);
        },
        show_menu: function(menu, container) {
            if (document.getElementById(menu).classList.contains("d-none")) {
                document.getElementById(menu).classList.remove("d-none");
                document.getElementById(container).style.marginLeft = "70px";
            } else {
                document.getElementById(menu).classList.add("d-none");
                document.getElementById(container).classList.remove("w3-container");
                document.getElementById(container).style.marginLeft = "0px";
            }
        },
        amis: function(router, token) {
            router.navigate("/amis/" + token);
        },
        back: function(router) {
            router.back();
        },
        deconnecter: function(router) {
            // this.$app.dialog.confirm("Êtes vous sûr de vouloir quitter cette session ?", function() {
            //     // router.navigate("/");
            //     this.$app.dialog.alert("GREAT!");
            // });
            router.navigate("/");
        },
        bell: function(router, token) {
            router.navigate("/notifs/0/" + token);
        },
        historique: function(router, token) {
            router.navigate("/historique/" + token);
        },
        home: function(router, token) {
            router.navigate("/accueil/" + token);
        }

        // getData: async function(router, token) {
        //     console.log("DATAAAAAAA");
        //     let url;
        //     if (window.cordova === undefined) {
        //         url = "http://localhost:3000/notifs/" + self;
        //         console.log("Browser");
        //     } else {
        //         url = "http://10.0.2.2:3000/notifs/" + self;;
        //         console.log(window.cordova.platformId);
        //     }
        //     // On cherche les notifications de l'utilisateur
        //     let notifs = [];
        //     let cpt = 0;
        //     try {
        //         notifs = await fetch(url)
        //             .then(res =>
        //                 res.json())
        //     } catch (err) {
        //         this.$app.dialog.alert("Error " + err);
        //     }

        //     // console.log("notifs: " + JSON.stringify(notifs));
        //     cpt = notifs.length;
        //     console.log("CPT: " + cpt);
        //     return { cpt };
        // return {
        //     notifs: notifs
        //         // cpt: cpt
        // };
        // }
    },
    // App routes
    routes: routes,


    // Input settings
    input: {
        scrollIntoViewOnFocus: Framework7.device.cordova && !Framework7.device.electron,
        scrollIntoViewCentered: Framework7.device.cordova && !Framework7.device.electron,
    },
    // Cordova Statusbar settings
    statusbar: {
        iosOverlaysWebView: true,
        androidOverlaysWebView: false,
    },
    on: {
        init: function() {
            var f7 = this;
            if (f7.device.cordova) {
                // Init cordova APIs (see cordova-app.js)
                cordovaApp.init(f7);
            }
        },
    },
});
// Login Screen Demo
$$('#my-login-screen .login-button').on('click', function() {
    var username = $$('#my-login-screen [name="username"]').val();
    var password = $$('#my-login-screen [name="password"]').val();

    // Close login screen
    app.loginScreen.close('#my-login-screen');

    // Alert username and password
    app.dialog.alert('Username: ' + username + '<br>Password: ' + password);
});

app.views.create('.view-main', {
    url: '/'
});