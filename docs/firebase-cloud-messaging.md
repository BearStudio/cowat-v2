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
  └─► POST account/registerFcmToken   ← token sauvegardé en base (table FcmToken)

Action dans l'app (booking accepté, trajet annulé, etc.)
        │
        ▼
context.notify(event, orgContext)    ← appelé dans les handlers oRPC
        │
        ▼
pushChannel.send()
  │  Charge les tokens FCM du destinataire depuis la DB
  │  Obtient un access token via google-auth-library
  │  Appelle l'API REST FCM v1 → POST /messages:send par token
  └─► Notification reçue sur le device
```

> **Note :** le serveur n'utilise PAS le SDK Firebase Admin. Les notifications sont envoyées via l'[API REST FCM HTTP v1](https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages/send) directement avec `fetch`, pour éviter les problèmes de bundling ESM avec Nitro/Vercel (voir [troubleshooting](./push-notifications-troubleshooting.md)).

### Foreground vs Background

| Situation | Comportement |
|-----------|-------------|
| App ouverte (foreground) | `onMessage` dans le hook — pas de notif système automatique, à gérer en-app (toast, etc.) |
| App en arrière-plan / onglet fermé | Service worker `firebase-messaging-sw.js` — notif système affichée automatiquement |

### Tokens FCM

- Un token est généré **par navigateur/device**.
- Il est stocké dans la table `FcmToken`, rattaché à l'`userId` (pas au membre, pour fonctionner sur toutes les orgs).
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

Dans **Project Settings → General → Your apps → Web app**, copier la config dans `.env` :

```env
FIREBASE_API_KEY=AIza...
FIREBASE_AUTH_DOMAIN=mon-projet.firebaseapp.com
FIREBASE_PROJECT_ID=mon-projet
FIREBASE_STORAGE_BUCKET=mon-projet.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
```

Ces variables sont utilisées côté serveur et exposées au client via un endpoint oRPC (`config.firebaseConfig`).

### 3. Récupérer la clé VAPID publique

Dans **Project Settings → Cloud Messaging → Web Push certificates** :

- Générer une paire de clés si elle n'existe pas encore
- Copier la **clé publique** :

```env
FIREBASE_VAPID_PUBLIC_KEY=BK...
```

### 4. Configurer les credentials serveur (pour envoyer les notifications)

Le serveur utilise `google-auth-library` avec un **Service Account** encodé en base64.

```bash
# Générer un Service Account :
# Firebase Console > Project Settings > Service Accounts > Generate new private key

# Encoder en base64 :
base64 -i path/to/service-account.json | tr -d '\n'
```

Ajouter dans `.env` :

```env
FIREBASE_SERVICE_ACCOUNT=eyJ0eXBlIjoic2Vydmljz...
```

Pour le développement local, vous pouvez aussi utiliser **Application Default Credentials (ADC)** via `gcloud` si vous préférez ne pas télécharger de fichier JSON :

```bash
gcloud auth application-default login
gcloud config set project <FIREBASE_PROJECT_ID>
```

### 5. Démarrer l'app

```bash
pnpm dev
```

Le service worker `public/firebase-messaging-sw.js` est un fichier statique minimal — il ne dépend pas du SDK Firebase et ne nécessite aucune configuration.

---

## Setup production

### Variables d'environnement complètes

```env
# Credentials serveur (base64 du JSON du Service Account)
FIREBASE_SERVICE_ACCOUNT=<base64_du_json>

# Config Firebase (servie au client via endpoint oRPC)
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
FIREBASE_VAPID_PUBLIC_KEY=...
```

Le code utilise `FIREBASE_SERVICE_ACCOUNT` pour s'authentifier via `google-auth-library` :

```ts
// src/server/firebase.ts
const auth = new GoogleAuth({
  credentials: JSON.parse(
    Buffer.from(config.serviceAccount, 'base64').toString('utf-8')
  ),
  scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
});
```

---

## Architecture des fichiers

```
src/
├── server/
│   ├── firebase.ts                          # Auth Google (google-auth-library) + envoi REST FCM v1
│   ├── notifications/
│   │   ├── channels/push.ts                 # Channel push — envoi via API REST FCM
│   │   └── index.ts                         # Enregistrement des channels
│   └── repositories/
│       └── fcm-token.repository.ts          # CRUD des tokens en base
├── features/push/
│   ├── firebase-client.ts                   # Init Firebase client + getFcmToken()
│   ├── use-push-notifications.ts            # Hook React (permission + enregistrement)
│   └── templates.ts                         # getPushContent() — titre/body/lien par type d'événement
├── server/routers/account.ts
│   └── registerFcmToken / unregisterFcmToken  # Endpoints API
└── layout/app/layout.tsx                    # Appel du hook dans le layout authentifié

public/
└── firebase-messaging-sw.js                 # Service worker statique (pas de SDK Firebase)

prisma/schema.prisma                         # Modèle FcmToken
```
