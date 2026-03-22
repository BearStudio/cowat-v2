# Firebase Cloud Messaging (FCM)

Cowat utilise FCM pour envoyer des notifications push web aux utilisateurs — sur desktop et mobile, même lorsque l'application est en arrière-plan.

---

## Comment ça fonctionne

### Vue d'ensemble

```
Utilisateur ouvre l'app
        │
        ▼
usePushNotifications()          ← hook dans le layout authentifié
  │  Demande la permission navigateur
  │  Enregistre le service worker (/firebase-messaging-sw.js)
  │  Récupère le FCM token (via VAPID key)
  └─► POST /account/fcm-token   ← token sauvegardé en base (table fcm_token)

Action dans l'app (booking accepté, trajet annulé, etc.)
        │
        ▼
notifier.notify(event)          ← appelé dans les handlers ORPC
        │
        ▼
pushChannel.send()
  │  Charge les tokens FCM du destinataire depuis la DB
  │  Appelle Firebase Admin SDK → messaging.sendEachForMulticast()
  └─► Notification reçue sur le device
```

### Foreground vs Background

| Situation | Comportement |
|-----------|-------------|
| App ouverte (foreground) | `onMessage` dans le hook — pas de notif système automatique, à gérer en-app (toast, etc.) |
| App en arrière-plan / onglet fermé | Service worker `firebase-messaging-sw.js` — notif système affichée automatiquement |

### Tokens FCM

- Un token est généré **par navigateur/device**.
- Il est stocké dans la table `fcm_token`, rattaché à l'`userId` (pas au membre, pour fonctionner sur toutes les orgs).
- Les tokens invalides ou expirés sont **supprimés automatiquement** après un échec d'envoi.
- Un utilisateur peut avoir **plusieurs tokens** (plusieurs appareils/navigateurs).

### Événements notifiés

| Événement | Destinataire | Message |
|-----------|-------------|---------|
| `booking.requested` | Conducteur | Nouvelle demande d'un passager |
| `booking.accepted` | Passager | Réservation acceptée par le conducteur |
| `booking.refused` | Passager | Réservation refusée par le conducteur |
| `booking.canceled` | Conducteur | Un passager a annulé |
| `commute.updated` | Passagers | Trajet modifié par le conducteur |
| `commute.canceled` | Passagers | Trajet annulé par le conducteur |
| `commute.created` | — | Événement broadcast, pas de push |
| `commute.requested` | — | Événement broadcast, pas de push |

---

## Setup local (développement)

### 1. Créer un projet Firebase

1. Aller sur [console.firebase.google.com](https://console.firebase.google.com)
2. Créer un projet (ou utiliser un existant)
3. Ajouter une **Web app** dans les paramètres du projet

### 2. Récupérer la config Firebase

Dans **Project Settings → General → Your apps → Web app**, copier la config :

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=mon-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mon-projet
VITE_FIREBASE_STORAGE_BUCKET=mon-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

Ces mêmes valeurs servent aussi au service worker (sans le préfixe `VITE_`) :

```env
FIREBASE_API_KEY=AIza...
FIREBASE_AUTH_DOMAIN=mon-projet.firebaseapp.com
FIREBASE_PROJECT_ID=mon-projet
FIREBASE_STORAGE_BUCKET=mon-projet.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
```

### 3. Récupérer la clé VAPID publique

Dans **Project Settings → Cloud Messaging → Web Push certificates** :

- Générer une paire de clés si elle n'existe pas encore
- Copier la **clé publique** :

```env
VITE_FIREBASE_VAPID_PUBLIC_KEY=BK...
```

> La clé privée n'est pas nécessaire — Firebase Admin SDK gère l'authentification en interne.

### 4. Configurer les credentials serveur (pour envoyer les notifications)

Le serveur utilise **Application Default Credentials (ADC)** via le Google Cloud SDK — pas besoin de télécharger de fichier JSON.

```bash
# Installer gcloud CLI : https://cloud.google.com/sdk/docs/install

# S'authentifier (ouvre le navigateur)
gcloud auth application-default login

# Définir le projet par défaut
gcloud config set project <FIREBASE_PROJECT_ID>
```

Les credentials sont stockés localement dans `~/.config/gcloud/application_default_credentials.json` et détectés automatiquement au démarrage du serveur.

### 5. Démarrer l'app

```bash
pnpm dev
```

Le service worker `public/firebase-messaging-sw.js` est **généré automatiquement** au démarrage avec la config Firebase baked-in.

---

## Setup production

En production (Vercel, Railway, Fly.io, etc.), il n'y a pas de `gcloud` disponible — il faut un **Service Account**.

### 1. Générer un Service Account

Dans **Project Settings → Service Accounts → Generate new private key** → télécharger le JSON.

### 2. Encoder en base64

```bash
base64 -i path/to/service-account.json | tr -d '\n'
```

### 3. Ajouter la variable d'environnement

```env
FIREBASE_SERVICE_ACCOUNT=eyJ0eXBlIjoic2Vydmljz...
```

Le code utilise `FIREBASE_SERVICE_ACCOUNT` en priorité si défini, sinon tombe sur ADC :

```ts
// src/server/firebase.ts
const credential = envServer.FIREBASE_SERVICE_ACCOUNT
  ? cert(JSON.parse(Buffer.from(envServer.FIREBASE_SERVICE_ACCOUNT, 'base64').toString()))
  : applicationDefault();
```

### Variables d'environnement complètes en production

```env
# Credentials serveur
FIREBASE_SERVICE_ACCOUNT=<base64_du_json>

# Config Firebase pour le service worker (rendu côté serveur)
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...

# Config Firebase côté client (injectée par Vite au build)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_VAPID_PUBLIC_KEY=...
```

> Les valeurs `FIREBASE_*` et `VITE_FIREBASE_*` sont identiques — les deux blocs sont nécessaires car l'un est utilisé côté serveur (service worker généré dynamiquement), l'autre côté client (SDK Firebase navigateur).

---

## Architecture des fichiers

```
src/
├── server/
│   ├── firebase.ts                          # Init Firebase Admin (ADC ou service account)
│   ├── notifications/
│   │   ├── channels/push.ts                 # Channel push — envoie via Admin SDK
│   │   └── index.ts                         # Enregistrement du channel
│   └── repositories/
│       └── fcm-token.repository.ts          # CRUD des tokens en base
├── features/notification/
│   ├── firebase-client.ts                   # Init Firebase client + getFcmToken()
│   └── use-push-notifications.ts            # Hook React (permission + enregistrement)
├── server/routers/account.ts
│   └── registerFcmToken / unregisterFcmToken  # Endpoints API
└── layout/app/layout.tsx                    # Appel du hook dans le layout authentifié

public/
└── firebase-messaging-sw.js                 # Généré par Vite au démarrage (gitignored)

vite.config.ts                               # Plugin qui génère le service worker
prisma/schema.prisma                         # Modèle FcmToken
```
