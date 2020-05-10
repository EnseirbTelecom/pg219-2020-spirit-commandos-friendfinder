var $$ = Dom7;

var app = new Framework7({
    root: '#app', // App root element

    id: 'io.framework7.friendfinder', // App bundle ID
    name: 'FriendFinder', // App name
    theme: 'auto', // Automatic theme detection
    // App root data
    data: function() {
        return {
            user: {
                firstName: 'John',
                lastName: 'Doe',
            },

        };
    },
    // App root methods
    methods: {
        helloWorld: function() {
            app.dialog.alert('Hello World!');
        },
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

// Template7.registerPartial("menu", '<div class="w3-sidebar w3-bar-block w3-black w3-xxlarge" style="width:70px">' +
//     '<a href="#" class="w3-bar-item w3-button"><i class="fa fa-home" title="page d\'accueil"></i></a>' +
//     '<a href="#" @click="getPos" class="w3-bar-item w3-button"><i class="fa fa-thumb-tack"' +
//     'title="Ajouter une nouvelle position"></i></a>' +
//     '<a href="#" @click="params" class="w3-bar-item w3-button"><i class="fa fa-gear"' +
//     'title="modifier les paramètres de votre compte"></i></a>' +
//     '<a href="#" class="w3-bar-item w3-button"><i class="fa fa-search" title="rechercher"></i></a>' +
//     '<a href="#" @click="amis" class="w3-bar-item w3-button"><i class="fa fa-group"' +
//     'title="liste des amis"></i></a>' +
//     '<a href="#" class="w3-bar-item w3-button"><i class="fa fa-history"' +
//     'title="historique des positions"></i></a>' +
//     '<a href="#" @click="deconnecter" class="w3-bar-item w3-button"><i class="fa fa-power-off"' +
//     'title="Déconnexion"></i></a>' +
//     '</div>' +
//     '<script> return { ' +
//     'methods: {' +
//     'params: function() {' +
//     ' this.$router.navigate("/parameters/" + this.$route.params.token);' +
//     '},' +
//     'getPos: function() {' +
//     'this.$router.navigate("/AddPosition/" + this.$route.params.token);' +
//     '},' +
//     'amis: function() { this.$router.navigate("/amis/" + this.$route.params.token);},' +
//     'deconnecter: function() {  this.$router.navigate("/off/"); }' +
//     '}}' +
//     '</script>'
// );