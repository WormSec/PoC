# Documentation du Projet WormSec

## Présentation Générale

WormSec est une application web permettant de visualiser les connexions entre différentes machines d'un réseau. Elle affiche graphiquement l'état des machines (connectées ou isolées) et les relations entre elles, tout en fournissant des informations détaillées sur chaque machine sélectionnée.

## Architecture de l'Application

L'application est structurée selon une architecture React moderne avec des composants fonctionnels et des hooks. Elle utilise TypeScript pour le typage statique. Elle se compose des éléments suivants:

### Composants Principaux

1. **App** - Composant racine qui gère l'état global et l'orchestration
2. **Header** - Affiche le logo et le titre de l'application
3. **Footer** - Contient les liens vers les réseaux sociaux (Discord)
4. **Visualizer** - Affiche la représentation graphique des machines et de leurs connexions
5. **Information** - Affiche les détails d'une machine sélectionnée
6. **Machine** - Représente graphiquement une machine dans le visualiseur
7. **MachineLink** - Représente les connexions entre les machines

### Types de Données

Les types de données sont définis dans le fichier `types.ts` :

```typescript
export interface Machine {
    id: string;
    name: string;
    ip: string;
    mac: string;
    lastUpdate: string;
    status: "connected" | "isolated";
}

export interface Link {
    source: string;  // ID de la machine source
    target: string;  // ID de la machine cible
    type: "connected" | "isolated";
}

interface Position {
    x: number;
    y: number;
}
```

## Fonctionnalités Principales

### 1. Visualisation du Réseau

Le composant `Visualizer` affiche un graphe où:
- Les **nœuds** représentent des machines
- Les **arêtes** représentent les connexions entre machines
- Les couleurs indiquent l'état des machines et des connexions:
  - **Vert**: Machines connectées
  - **Rouge**: Machines isolées
  - **Ligne continue avec flèches**: Connexion active
  - **Ligne pointillée**: Connexion inactive

### 2. Interaction avec le Graphe

L'utilisateur peut:
- **Sélectionner une machine** pour afficher ses détails
- **Déplacer les machines** par glisser-déposer
- **Zoomer/Dézoomer** avec la molette de la souris ou les boutons +/-
- **Déplacer la vue** en maintenant le clic gauche et en déplaçant la souris
- **Réinitialiser la disposition** avec le bouton Reset

### 3. Affichage des Informations

Lorsqu'une machine est sélectionnée, le panneau `Information` s'affiche avec:
- ID de la machine
- Adresse IP
- Adresse MAC (si disponible)
- Date de dernière mise à jour
- Statut (connecté ou isolé)

### 4. Mise à Jour Automatique

- L'application interroge automatiquement l'API toutes les 10 secondes
- Elle met à jour l'état des machines et leurs connexions
- En cas d'erreur de l'API, des données d'exemple sont affichées

### 5. Persistance des Positions

- Les positions des machines sont sauvegardées dans le localStorage
- Elles sont restaurées lorsque l'utilisateur revient sur l'application

## Flux de Données

1. L'application charge les données des machines depuis `/api/machines`
2. Les connexions entre machines sont générées automatiquement
3. Les positions sont initialisées en cercle ou chargées depuis le localStorage
4. L'interface utilisateur est mise à jour en fonction des interactions
5. Les données sont rafraîchies périodiquement

## Guide Technique

### Initialisation de l'Application

Le projet utilise la méthode moderne de création d'une racine React avec TypeScript comme montré dans le fichier `index.tsx` :

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Structure d'API Attendue

L'API doit renvoyer un tableau de machines au format suivant:

```json
[
  {
    "id": "1", 
    "name": "Machine1", 
    "ip": "192.168.1.1", 
    "mac": "00:11:22:33:44:55", 
    "lastUpdate": "01/03/2025", 
    "status": "connected"
  },
  {
    "id": "2", 
    "name": "Machine2", 
    "ip": "192.168.1.2", 
    "mac": "00:11:22:33:44:56", 
    "lastUpdate": "28/02/2025", 
    "status": "isolated"
  }
]
```

### Tests

Le projet contient des tests unitaires comme montré dans le fichier `App.test.tsx` :

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
```

Ces tests utilisent la bibliothèque Testing Library pour tester les composants React.

## Dépannage

### Problèmes Courants

1. **L'API ne répond pas**
   - L'application affiche un message d'erreur
   - Des données d'exemple sont utilisées à la place
   - Un bouton "Retry" permet de réessayer la connexion

2. **Positions des machines incorrectes**
   - Utiliser le bouton "Reset" pour réinitialiser les positions
   - Vérifier que le localStorage du navigateur est activé

3. **Problèmes de compilation TypeScript**
   - Vérifier que les types sont correctement définis et importés
   - S'assurer que les interfaces sont respectées dans l'implémentation

## Évolutions Possibles

1. Ajouter un filtrage des machines par statut
2. Implémenter un historique des changements d'état
3. Ajouter des statistiques sur l'état général du réseau
4. Permettre la création de groupes de machines
5. Implémenter un mode sombre pour l'interface
6. Améliorer la couverture des tests unitaires

## Notes Techniques

- L'application utilise React avec des hooks (useState, useEffect, useRef, useCallback)
- TypeScript est utilisé pour le typage statique des données et composants
- Les positions sont calculées dynamiquement en fonction du nombre de machines
- L'application est réactive et s'adapte aux différentes tailles d'écran
- Les animations sont gérées via CSS pour des performances optimales
