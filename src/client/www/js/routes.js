
var routes = [
  {
    path: '/',
    componentUrl: './pages/home.html'
  },
  {
    path: '/signup/',
    componentUrl: './pages/signup.html'
  },
  {
    path: '/signin',
    componentUrl: './pages/signin.html'
  },
  {
    path: '/accueil/:token?',
    componentUrl: './pages/accueil.html'
  },
  // {
  //   path: '/changePassword',
  //   componentUrl: './pages/changePassword.html'
  // },
  {
    path: "/parameters/:token?",
    componentUrl:'./pages/params.html'
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