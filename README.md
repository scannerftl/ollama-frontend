# Application de Chat Ollama

Application frontend Angular pour une interface de chat utilisant l'API Ollama. Cette application permet aux utilisateurs de discuter avec un modèle de langage IA et de gérer plusieurs conversations.

## Fonctionnalités principales

- Authentification utilisateur simplifiée
- Gestion des conversations multiples
- Interface de chat moderne et réactive
- Formatage Markdown des messages (gras, italique, sauts de ligne)
- Réponses en temps réel
- Gestion des erreurs et notifications

## Prérequis

- Node.js (version 16 ou supérieure)
- npm (version 8 ou supérieure) ou yarn
- Angular CLI (version 17.3.12)
- Backend Ollama fonctionnel (par défaut sur `http://localhost:8080`)

## Installation

1. Cloner le dépôt :
   ```bash
   git clone [URL_DU_DEPOT]
   cd ollama-frontend
   ```

2. Installer les dépendances :
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Configurer l'application :
   - Vérifiez l'URL de l'API dans `src/environments/environment.ts`
   - Ajustez les paramètres selon vos besoins

## Démarrage

Pour lancer l'application en mode développement :

```bash
ng serve
```

Ouvrez votre navigateur à l'adresse `http://localhost:4200`

## Structure du projet

```
src/app/
├── components/           # Composants principaux
│   ├── chat/            # Interface de chat
│   ├── login/           # Page de connexion
│   └── startup/         # Écran d'accueil
├── guards/              # Gardes de route
├── interceptors/        # Intercepteurs HTTP
├── pipes/               # Pipes personnalisés
└── services/            # Services partagés
```

## Configuration

### Variables d'environnement

Créez un fichier `src/environments/environment.ts` avec :

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'  // URL de votre backend
};
```

## Développement

### Générer un composant

```bash
ng generate component components/nom-du-composant
```

### Lancer les tests unitaires

```bash
ng test
```

### Construire pour la production

```bash
ng build --configuration production
```

## Formatage des messages

L'application prend en charge le formatage Markdown de base :
- `**gras**` pour le **texte en gras**
- `*italique*` pour le *texte en italique*
- Les sauts de ligne sont automatiquement convertis

## Gestion des erreurs

L'application affiche des notifications en cas d'erreur avec des messages explicites. Les erreurs courantes incluent :
- Problèmes de connexion au serveur
- Erreurs d'authentification
- Erreurs de validation des données

## Sécurité

- Toutes les entrées utilisateur sont échappées pour prévenir les attaques XSS
- L'authentification est requise pour accéder à l'application
- Les jetons d'authentification sont stockés de manière sécurisée

## Déploiement

Pour déployer en production :

1. Construire l'application :
   ```bash
   ng build --configuration production
   ```

2. Déployer le contenu du dossier `dist/ollama-frontend` sur votre serveur web

## Contribution

1. Créez une branche pour votre fonctionnalité
2. Committez vos modifications
3. Poussez vers la branche
4. Créez une Pull Request

---

Développé avec ❤️ par scannerFTL
