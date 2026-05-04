# HuwiyaTech Platform — Guide de démarrage

## Prérequis

### 1. Installer Node.js
Téléchargez **Node.js v18 ou supérieur** :
- [https://nodejs.org/en/download](https://nodejs.org/en/download) → choisir **LTS (Windows Installer)**
- Cochez "Automatically install necessary tools" pendant l'installation
- Redémarrez votre ordinateur après l'installation

Vérifiez :
```
node --version   # doit afficher v18.x ou supérieur
npm --version    # doit afficher 9.x ou supérieur
```

### 2. Créer une base de données PostgreSQL (gratuit)
- Créez un compte sur [https://neon.tech](https://neon.tech) (gratuit)
- Créez un nouveau projet → copiez la **connection string**
- Elle ressemble à : `postgresql://user:pass@host/neon?sslmode=require`

### 3. Créer un compte Cloudinary (gratuit)
- Créez un compte sur [https://cloudinary.com](https://cloudinary.com)
- Depuis le tableau de bord, notez : **Cloud Name**, **API Key**, **API Secret**

---

## Installation (une seule fois)

### Étape 1 — Double-cliquez sur `install.bat`

Cela installe toutes les dépendances npm et génère le client Prisma.

### Étape 2 — Configurez le fichier `.env`

Ouvrez `C:\Users\moham\huwiyatech\.env` et remplissez :

```env
# Base de données (votre connection string Neon ou PostgreSQL local)
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"

# NextAuth — générez une clé secrète aléatoire :
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="collez-ici-une-chaine-aleatoire-longue"

# Cloudinary (depuis cloudinary.com/console)
CLOUDINARY_CLOUD_NAME="votre_cloud_name"
CLOUDINARY_API_KEY="votre_api_key"
CLOUDINARY_API_SECRET="votre_api_secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="votre_cloud_name"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Étape 3 — Créez les tables en base de données

Ouvrez un terminal dans le dossier du projet et lancez :

```bat
cd C:\Users\moham\huwiyatech
npx prisma db push
```

---

## Démarrage

Double-cliquez sur **`DEMARRER.bat`**

Le navigateur s'ouvrira automatiquement sur `http://localhost:3000`

Ou manuellement :
```bat
start.bat       ← démarre le serveur dans un terminal visible
```

---

## Premier compte administrateur

1. Inscrivez-vous sur `http://localhost:3000/register`
2. Ouvrez un terminal dans le dossier et lancez :
```
npx prisma studio
```
3. Dans Prisma Studio → table **User** → trouvez votre compte → changez `role` de `USER` à `ADMIN`
4. Vous avez maintenant accès au panneau `/admin`

---

## Structure du projet

```
huwiyatech/
├── prisma/
│   └── schema.prisma          ← Schéma base de données
├── src/
│   ├── app/
│   │   ├── (auth)/            ← Pages Login / Inscription
│   │   ├── (dashboard)/       ← Tableau de bord + Admin
│   │   │   ├── dashboard/     ← Accueil, Édition profil, Analytiques
│   │   │   └── admin/         ← Gestion utilisateurs + tags NFC
│   │   ├── u/[username]/      ← Page profil publique (mobile-first)
│   │   └── api/               ← Toutes les routes API
│   ├── components/            ← Composants réutilisables
│   ├── lib/                   ← auth, db, cloudinary, utils
│   └── types/                 ← Types partagés + config thèmes
├── .env                       ← Configuration (à remplir !)
├── DEMARRER.bat               ← Lancement en 1 clic
├── install.bat                ← Installation des dépendances
└── start.bat                  ← Démarrage en mode visible
```

---

## Fonctionnalités

| Page | Description |
|------|-------------|
| **`/`** | Page d'accueil publique |
| **`/register`** | Créer un compte |
| **`/login`** | Se connecter |
| **`/dashboard`** | Tableau de bord personnel |
| **`/dashboard/edit`** | Éditer le profil, liens, avatar, CV |
| **`/dashboard/analytics`** | Statistiques des scans |
| **`/admin`** | Gestion des utilisateurs *(admin uniquement)* |
| **`/admin/nfc`** | Assigner les tags NFC aux utilisateurs *(admin)* |
| **`/u/[username]`** | Page profil publique — s'ouvre au scan NFC |

---

## Intégration NFC

1. L'admin enregistre l'UID du bracelet dans `/admin/nfc`
2. L'admin assigne le tag à un utilisateur
3. Le bracelet physique est programmé pour ouvrir :
   ```
   http://localhost:3000/u/username?src=nfc
   ```
4. **Application pour programmer les tags** : *NFC Tools* (iOS/Android, gratuit)
   - Type d'enregistrement : **URL**
   - URL : `https://votre-domaine.com/u/username?src=nfc`

---

## Thèmes disponibles

| Thème | Style |
|-------|-------|
| Default | Dégradé violet/indigo |
| Minimal | Blanc épuré |
| Bold | Rose/violet, effet glassmorphism |
| Glass | Verre dépoli |
| Nature | Dégradé vert |
| Sunset | Dégradé orange/rouge |
| Ocean | Dégradé bleu |
| Dark Pro | Mode sombre |

---

## Dépannage

**`npm install` échoue :**
- Vérifiez que Node.js v18+ est installé : `node --version`
- Supprimez `node_modules/` et relancez `install.bat`

**`prisma db push` échoue :**
- Vérifiez que `DATABASE_URL` dans `.env` est correct
- Testez la connexion à votre base depuis Neon.tech

**Le serveur ne démarre pas (port 3000 occupé) :**
- `DEMARRER.bat` tue automatiquement le processus sur le port 3000
- Ou manuellement : `taskkill /F /IM node.exe`

**Les images ne s'uploadent pas :**
- Vérifiez les 3 variables `CLOUDINARY_*` dans `.env`
- Vérifiez vos clés sur [cloudinary.com/console](https://cloudinary.com/console)

**Page profil `/u/username` vide :**
- Connectez-vous et complétez votre profil depuis `/dashboard/edit`
- Vérifiez que "Profil public" est activé dans les paramètres

---

## Déploiement en ligne (optionnel)

Pour un vrai site en production :

1. **Vercel** (frontend + API) : `npm i -g vercel && vercel`
2. **Neon.tech** (base de données) : gratuit jusqu'à 500 Mo
3. Mettez à jour `NEXTAUTH_URL` avec votre vrai domaine
4. Programmez vos bracelets avec votre vrai domaine
