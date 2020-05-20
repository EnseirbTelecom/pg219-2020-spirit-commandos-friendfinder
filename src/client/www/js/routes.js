var routes = [{
        path: '/',
        componentUrl: './pages/home.html',
        options: {
            transition: 'f7-circle',
        }
    },
    {
        path: '/signup/',
        componentUrl: './pages/signup.html',
        options: {
            transition: 'f7-circle',
        }
    },
    {
        path: '/signin',
        componentUrl: './pages/signin.html',
        options: {
            transition: 'f7-circle',
        }
    },
    {
        path: '/accueil/:token?',
        componentUrl: './pages/accueil.html',
        options: {
            transition: 'f7-circle',
        }
    },
    {
        path: '/amis/:token?',
        componentUrl: './pages/amis.html',
        options: {
            transition: 'f7-circle',
        }
    },
    {
        path: '/amis/:token/:id',
        componentUrl: './pages/amis.html',
        options: {
            transition: 'f7-circle',
        }
    },
    {
        path: "/parameters/:token?",
        componentUrl: './pages/params.html',
        options: {
            transition: 'f7-circle',
        }
    },
    {
        path: '/AddPosition/:token',
        componentUrl: './pages/Position.html',
        options: {
            transition: 'f7-circle',
        }
    },
    {
        path: '/off/',
        componentUrl: './pages/bye.html',
        options: {
            transition: 'f7-circle',
        }
    },
    {
        path: '/notifs/:token',
        componentUrl: "./pages/notifs.html",
        options: {
            transition: 'f7-circle',
        }
    },
    {
        path: '/map/:token',
        componentUrl: "./pages/map.html",
        options: {
            transition: 'f7-circle',
        }
    },
    {
        path: '/historique/:token',
        componentUrl: "./pages/historique.html"
    },
    {
        path: '/profile/:token/:friend',
        componentUrl: "./pages/profile.html",
        options: {
            transition: 'f7-circle',
        }
    },
    // Default route (404 page). MUST BE THE LAST
    {
        path: '(.*)',
        url: './pages/404.html',
    },
];

// {
//   path: '/about/',
//   url: './pages/about.html',
// },
// {
//   path: '/form/',
//   url: './pages/form.html',
// },


// {
//   path: '/dynamic-route/blog/:blogId/post/:postId/',
//   componentUrl: './pages/dynamic-route.html',
// },
// {
//   path: '/request-and-load/user/:userId/',
//   async: function (routeTo, routeFrom, resolve, reject) {
//     // Router instance
//     var router = this;

//     // App instance
//     var app = router.app;

//     // Show Preloader
//     app.preloader.show();

//     // User ID from request
//     var userId = routeTo.params.userId;

//     // Simulate Ajax Request
//     setTimeout(function () {
//       // We got user data from request
//       var user = {
//         firstName: 'Vladimir',
//         lastName: 'Kharlampidi',
//         about: 'Hello, i am creator of Framework7! Hope you like it!',
//         links: [
//           {
//             title: 'Framework7 Website',
//             url: 'http://framework7.io',
//           },
//           {
//             title: 'Framework7 Forum',
//             url: 'http://forum.framework7.io',
//           },
//         ]
//       };
//       // Hide Preloader
//       app.preloader.hide();

//       // Resolve route to load page
//       resolve(
//         {
//           componentUrl: './pages/request-and-load.html',
//         },
//         {
//           context: {
//             user: user,
//           }
//         }
//       );
//     }, 1000);
//   },
// },