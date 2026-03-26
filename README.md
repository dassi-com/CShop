# CShop — Frontend

Frontend React + DaisyUI connecté à **api-final** (Node.js / Express / MongoDB).

## Stack
- React 19 + Vite
- TailwindCSS + DaisyUI
- Framer Motion
- Axios

## Installation

```bash
npm install
```

## Configuration

Créer un fichier `.env` à la racine :

```env
VITE_API_URL=https://api-final-m259.onrender.com/api
```

## Lancement

```bash
npm run dev
```

## Build (Vercel)

```bash
npm run build
```

## Variables d'environnement Vercel

| Variable | Valeur |
|---|---|
| `VITE_API_URL` | URL de l'API déployée sur Render |

## Fonctionnalités

- 🛍️ Catalogue produits depuis l'API MongoDB
- 🛒 Panier persistant (localStorage)
- 🔐 Auth JWT (login / register / logout)
- 👑 Dashboard admin (CRUD produits, upload image)
- 💳 Paiement CinetPay (Mobile Money XAF)
- ✅ Détection automatique du rôle admin depuis l'API

## Endpoints API utilisés

| Méthode | Route | Description |
|---|---|---|
| POST | `/auth/register` | Inscription |
| POST | `/auth/login` | Connexion → JWT |
| POST | `/auth/logout` | Déconnexion |
| GET | `/users/:id` | Profil + rôles |
| GET | `/products` | Liste produits |
| GET | `/products/:id` | Détail produit |
| POST | `/products/add-product` | Créer (admin) |
| PUT | `/products/update-product?_id=` | Modifier (admin) |
| DELETE | `/products/delete-product?_id=` | Supprimer (admin) |
| POST | `/orders` | Créer commande |
| GET | `/orders` | Mes commandes |
| POST | `/payments/cinetpay/initiate` | Initier paiement |
