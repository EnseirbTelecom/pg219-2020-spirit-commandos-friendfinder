# Friend Finder 

# Serveur : 

Pour démarrer le serveur : 

--> cd src/api.

--> nodemon server/server.js

NB : voir readme.md du dossier src/api pour retrouver les modules à installer côté serveur.

# Client :

Pour lancer le client : 

--> cd src/client

--> npm run start


 # Documentation de l'API : 
 
  - cd doc/api 
  - Pour lancer le serveur de Redoc et le lier au fichier json : 
  
  
      --> redoc-cli serve doc_api.json 
      
      
      --> Une fois le serveur lancer , il suffit d'accéder au http://127.0.0.1:8080
 
 - Pour créer une page statique de la documentation de l'API : 
 
 
      --> redoc-cli bundle doc_api.json
      
      
      --> Un fichier "redoc-static.html" est crée dans le dossier doc/api
