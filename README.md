# Friend Finder 

Cette application est développée dans le but de géolocaliser ses amis à travers les positions qu'ils partagent. 

# Démo : 

Vous pouvez retrouver sur ce lien une démonstration du fonctionnement de l'application : https://www.youtube.com/watch?v=APX-pdNyELo&feature=youtu.be

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
      
  NB : La documentation de l'API est déjà générée. Pour la consulter il suffit d'afficher la page HTML redoc-static.

# Équipe : Spirit-commandos

Membres : 

- Khadija Abdelouali

- Sarra Jaballah

- Hicham Larchi 

- Léo Ayral
