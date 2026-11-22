# MercatoIQ — Client Web (frontend)

Application React qui consomme l'API REST MercatoIQ (`/api/v1`) et présente le tableau de bord utilisateur et le tableau de bord administrateur.

## Origine du client

Nouvelle application créée pour ce projet. Aucun ancien projet n'a été réutilisé.

**Éléments réutilisés** : gabarit officiel Vite (`npm create vite@latest`, gabarit `react` avec ESLint), sous licence MIT.
- Configuration : `vite.config.js`, `eslint.config.js`, `index.html`
- Point d'entrée `src/main.jsx` et icône `public/favicon.svg`

**Éléments retirés du gabarit** : page de démonstration (`App.jsx`, `App.css`, `src/assets/`, `public/icons.svg`) et sa feuille de style.

**Adaptations réalisées pour MercatoIQ** :
- `index.html` : langue française et titre de l'application
- `src/main.jsx` : ajout du routeur (`BrowserRouter`) et du contexte d'authentification (`AuthProvider`)
- Contenu de `src/` développé pour le projet : client API, données simulées alignées sur le contrat du backend NestJS, authentification, routes protégées et pages
- Dépendances ajoutées : React Router, Axios, Recharts

## Technologies

| Outil | Rôle |
|---|---|
| React 19 + Vite 8 | Interface et serveur de développement |
| React Router 7 | Navigation et routes protégées |
| Axios | Appels à l'API |
| Recharts | Graphiques des tableaux de bord |
| ESLint | Qualité du code |

## Prérequis

- Node.js 20.19+ ou 22.12+
- npm

## Installation et lancement

```bash
cd frontend
npm install
cp .env.example .env        # Windows PowerShell : Copy-Item .env.example .env
npm run dev
```

Application disponible sur http://localhost:5173.

## Variables d'environnement

| Variable | Description | Exemple |
|---|---|---|
| `VITE_API_URL` | URL de base de l'API versionnée | `http://localhost:3000/api/v1` |
| `VITE_USE_MOCKS` | `true` : données simulées (`src/mocks`), sans backend. `false` : vraie API | `true` |

Redémarrer `npm run dev` après toute modification du fichier `.env`.

## Scripts

| Commande | Action |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Prévisualisation du build |
| `npm run lint` | Analyse ESLint |

## Mode mock

Avec `VITE_USE_MOCKS=true`, les appels sont simulés selon le contrat du backend (formes des réponses et codes 400, 401, 409).

| Rôle | Courriel | Mot de passe |
|---|---|---|
| admin | `admin@mercatoiq.dev` | `admin1234` |
| user | `user@mercatoiq.dev` | `user12345` |

## Structure

```
src/
  api/         client Axios et services par ressource
  mocks/       données simulées
  context/     AuthContext (session de l'utilisateur)
  components/  Navbar, Layout, ProtectedRoute
  pages/       une page par route
  utils/       validation des formulaires
```

## Routes

| Route | Accès |
|---|---|
| `/login` | Public |
| `/register` | Public |
| `/dashboard` | Public |
| `/admin` | Rôle `admin` |

## Authentification

- Le JWT reçu à la connexion ou à l'inscription est conservé dans `localStorage`.
- Un intercepteur Axios l'envoie dans l'en-tête `Authorization: Bearer token`.
- Une réponse `401` (hors `/auth/*`) vide la session et redirige vers `/login`.
- `ProtectedRoute` ne fait que masquer l'interface : les autorisations sont vérifiées côté serveur.

## Avancement

- [x] #12 Socle technique (Vite, routing protégé, AuthContext, client Axios)
- [x] #13 Pages d'authentification (Login, Register, statut connecté)
- [ ] #14 Tableau de bord utilisateur
- [ ] #15 Tableau paginé, CRUD et tableau de bord administrateur
- [ ]  Déploiement HTTPS
