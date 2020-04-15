const express = require('express');
const app = express();
const http = require("http");

app.get('/', (req, res) => { 
    console.log('Redirection vers doc.html');   
    res.sendFile('doc_api.html', { root: '/Users/sarrajaballah/Desktop/applications_mobiles/projet/pg219-2020-spirit-commandos-friendfinder/doc/api/'});
});

app.listen(3000, () => {
    console.log("Serveur démarré");
});
