# Documentation Technique - Application de Chat Ollama

## Table des matières
1. [Architecture](#architecture)
2. [Structure du code](#structure-du-code)
3. [Services principaux](#services-principaux)
4. [Composants](#composants)
5. [Gestion d'état](#gestion-détat)
6. [Sécurité](#sécurité)
7. [Tests](#tests)
8. [Déploiement](#déploiement)
9. [Dépannage](#dépannage)

## Architecture

L'application est construite avec Angular 17 en suivant les bonnes pratiques et l'architecture modulaire. Elle communique avec un backend RESTful via des appels HTTP.

### Technologies utilisées

- **Framework** : Angular 17
- **Langage** : TypeScript
- **Styling** : SCSS
- **Gestion d'état** : Services Angular
- **Tests** : Jasmine, Karma
- **Outils de build** : Angular CLI

## Structure du code

```
src/
├── app/
│   ├── components/          # Composants d'interface utilisateur
│   │   ├── chat/           # Interface de chat principale
│   │   ├── login/          # Formulaire de connexion
│   │   └── startup/        # Écran d'accueil
│   │
│   ├── guards/           # Gardes de route
│   │   └── auth.guard.ts   # Protection des routes
│   │
│   ├── interceptors/     # Intercepteurs HTTP
│   │   └── auth.interceptor.ts  # Gestion du token d'authentification
│   │
│   ├── pipes/            # Pipes personnalisés
│   │   └── truncate.pipe.ts     # Troncature de texte
│   │
│   ├── services/         # Services partagés
│   │   ├── api.service.ts       # Service d'API
│   │   ├── auth.service.ts      # Gestion de l'authentification
│   │   └── cookie.service.ts    # Gestion des cookies
│   │
│   ├── app.component.ts     # Composant racine
│   └── app.module.ts        # Module principal
│
├── assets/               # Ressources statiques
├── environments/          # Configurations d'environnement
└── styles/                # Styles globaux
```

## Services principaux

### ApiService

Gère toutes les communications avec le backend. Méthodes principales :

- `getDiscussions(userId: string)` : Récupère la liste des discussions
- `getDiscussionMessages(discussionId: string)` : Récupère les messages d'une discussion
- `sendPrompt(prompt: string, model: string, discussionId: string)` : Envoie un message
- `createDiscussion(message: string, model: string)` : Crée une nouvelle discussion

### AuthService

Gère l'authentification et l'autorisation :

- `login(userId: string)` : Connecte un utilisateur
- `logout()` : Déconnecte l'utilisateur
- `isLoggedIn()` : Vérifie si un utilisateur est connecté
- `getUserId()` : Récupère l'ID de l'utilisateur connecté

## Composants

### ChatComponent

Composant principal de l'interface de chat. Gère :
- L'affichage des messages
- L'envoi de nouveaux messages
- La navigation entre les conversations
- Le formatage du texte (Markdown)

### LoginComponent

Gère l'authentification des utilisateurs.

## Gestion d'état

L'état de l'application est géré via des services Angular et des propriétés de composants. Les données sont mises à jour de manière réactive grâce aux Observables.

## Sécurité

- Protection XSS avec `DomSanitizer`
- Validation des entrées utilisateur
- Gestion sécurisée des jetons d'authentification
- Protection des routes avec les gardes

## Tests

### Tests unitaires

```bash
# Lancer les tests
ng test

# Lancer les tests avec couverture de code
ng test --code-coverage
```

### Tests d'intégration

Les tests d'intégration vérifient le bon fonctionnement des composants et services ensemble.

## Déploiement

### Préparation pour la production

1. Mettre à jour les variables d'environnement
2. Construire l'application :
   ```bash
   ng build --configuration production
   ```
3. Déployer le contenu de `dist/ollama-frontend`

### Variables d'environnement

| Variable       | Défaut                  | Description                     |
|----------------|-------------------------|---------------------------------|
| production    | false                  | Mode production/développement   |
| apiUrl        | http://localhost:8080  | URL de l'API backend           |

## Dépannage

### Problèmes courants

1. **Erreur de connexion au backend**
   - Vérifiez que le serveur backend est en cours d'exécution
   - Vérifiez l'URL de l'API dans `environment.ts`

2. **Problèmes d'authentification**
   - Vérifiez que l'utilisateur est correctement connecté
   - Vérifiez la validité du token d'authentification

3. **Erreurs de formatage**
   - Vérifiez la syntaxe Markdown
   - Assurez-vous que les caractères spéciaux sont correctement échappés

## Bonnes pratiques

1. **Nommage**
   - Utilisez des noms descriptifs pour les variables et méthodes
   - Suivez les conventions de nommage d'Angular

2. **Structure du code**
   - Gardez les composants légers
   - Déplacez la logique métier vers les services
   - Utilisez les interfaces pour typer les données

3. **Performance**
   - Utilisez `OnPush` pour la détection des changements
   - Évitez les opérations coûteuses dans les templates
   - Utilisez `async` pipe pour les observables

4. **Sécurité**
   - Ne faites jamais confiance aux données utilisateur
   - Validez toutes les entrées
   - Utilisez `DomSanitizer` pour le HTML dynamique
