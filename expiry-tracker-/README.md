#  Expiry Tracker

**Expiry Tracker** est une application web qui permet de suivre la validité de vos documents, abonnements, produits de santé ou de consommation.  
Elle vous aide à ne plus rien oublier grâce à une interface simple et des rappels avant expiration.

---

## Structure du projet

expiry-tracker/
├─ backend/ # API Express + PostgreSQL (Sequelize + JWT)
│ ├─ config/
│ ├─ controllers/
│ ├─ middleware/
│ ├─ models/
│ ├─ routes/
│ ├─ server.js
│ ├─ .env
│ └─ package.json
│
└─ frontend/ # Site statique HTML/CSS/JS
├─ css/
├─ js/
├─ index.html
├─ login.html
├─ register.html
├─ dashboard.html
├─ categories.html
├─ type.html
└─ create.html


---

## Prérequis

Avant de commencer, assurez-vous d’avoir installé sur votre système :

- **Node.js** v18 ou plus récent  
- **npm** v8 ou plus récent  
- **PostgreSQL** v13 ou plus récent  
- Un terminal (Linux, macOS ou WSL sous Windows)

---

## Installation

### 1️⃣ Cloner le projet

```bash
git clone <votre-repo> expiry-tracker
cd expiry-tracker-
```

### 2️⃣ Installer les dépendances du backend

```bash
cd backend
npm install
```

### 3️⃣ Installer les outils du frontend (optionnel)

```bash
cd ../frontend
npm install --no-package-lock --no-fund http-server@14 -D
```

### 🛠️ Configuration
```bash

Créez un fichier .env dans le dossier backend avec le contenu suivant :

# Serveur
PORT=5432
NODE_ENV=development

# Base de données PostgreSQL
DB_HOST=localhost
DB_PORT=3000
DB_NAME=expiry_tracker
DB_USER=postgres
DB_PASS=votre_mot_de_passe

# Sécurité JWT
JWT_SECRET=Changez_ce_secret_pour_un_vrai
JWT_EXPIRES_IN=1d

    ⚠️ Si votre mot de passe PostgreSQL contient un symbole spécial, placez-le entre guillemets "...".

```
🗄️ Création de la base de données

Ouvrez votre terminal PostgreSQL :

psql -U postgres

Puis exécutez les commandes suivantes :

CREATE DATABASE expiry_tracker;
\q

▶️ Lancement du projet
1️⃣ Démarrer le backend

Depuis le dossier backend :

npm run dev

Résultat attendu :

✅ DB connection OK
🌐 Server running at http://localhost:3000

L’API Express est alors disponible sur http://localhost:3000
2️⃣ Démarrer le frontend

Dans un autre terminal, à partir du dossier frontend :

npx http-server -p 3001 -c-1

Puis ouvrez http://127.0.0.1:3001

dans votre navigateur.

si problème de permission :

 npm run dev

> expiry-tracker-backend@1.0.0 dev
> nodemon server.js

sh: 1: nodemon: Permission denied


veuillez vérifiez si nodemon est bien installé :
npm list nodemon

si ce n'est pas le cas, installez le avec la commande :
npm install --save-dev nodemon

ensuite, veuillez chmodez :
chmod +x ./node_modules/.bin/nodemon

et relancez le script :
npm run dev


Si toujours “Permission denied”, ouvrez psql
psql -h localhost -U postgres -d postgres

tapez cvbn pour le mot de passe. si ça ne fonctionne pas, veuillez le réinitialiser :
sudo -u postgres psql
ALTER USER postgres WITH PASSWORD 'cvbn';
\q

n'oubliez pas de chmoder :
chmod +x ./node_modules/.bin/nodemon

et relancez le serveur :
npm run dev



Le front communique automatiquement avec l’API sur http://localhost:3000.
🧪 Tests rapides avec cURL

Ces commandes permettent de vérifier le bon fonctionnement de l’API.
1️⃣ Inscription

curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ex.com","password":"secret12","name":"Jean"}'

2️⃣ Connexion (récupération du token)

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ex.com","password":"secret12"}'

La réponse contiendra un token JWT, par exemple :

{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}

3️⃣ Création d’un élément

curl -X POST http://localhost:3000/api/items \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" \
  -H "Content-Type: application/json" \
  -d '{"name":"Passeport","expiration_date":"2027-01-01","category":"Administration"}'

4️⃣ Lecture des éléments

curl -H "Authorization: Bearer VOTRE_TOKEN_ICI" http://localhost:3000/api/items


🖥️ Fonctionnement du Frontend

    Dashboard : affiche les documents enregistrés (lecture seule).

    + Ajoute une date d’expiration : ouvrez la page de sélection des catégories.

    Categories : Santé / Administration / Nourriture / Abonnements.

    Type : permet de choisir un sous-type (exemple : Carte d’identité, Passeport, etc.).

    Create : formulaire d’ajout d’un nouvel élément (envoyé via l’API).

🔒 Sécurité

    Les mots de passe sont hachés avec bcrypt.

    Les tokens JWT ont une durée de vie configurable (JWT_EXPIRES_IN).

    Le middleware authMiddleware vérifie que chaque requête authentifiée correspond bien à l’utilisateur connecté.

    Le backend accepte uniquement les origines front autorisées (CORS configuré dans server.js).

Exemple de configuration CORS :

app.use(cors({
  origin: ["http://127.0.0.1:3001", "http://localhost:3001"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

🧩 Dépannage
Erreur	Cause probable	Solution
password authentication failed	Mauvais mot de passe PostgreSQL	Modifier DB_PASS dans .env
SASL: client password must be a string	Mot de passe vide ou mal encodé	S’assurer qu’il est bien défini et sans espaces
CORS policy	Front non autorisé	Vérifier la configuration du CORS
GET /js/... 404	Mauvais chemin ou cache	Relancer http-server avec -c-1 et recharger la page (Ctrl+F5)
Texte invisible dans le tableau	Couleur blanche sur fond clair	Ajouter : .panel, .table td { color: #223041; } dans le CSS
