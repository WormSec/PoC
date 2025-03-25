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

## Style et Design

L'application utilise un design sombre moderne avec des accents colorés. Le thème principal se compose de :

- Fond principal : Dark (#1a1a1a)
- Couleur d'accent principale : Violet (#6a3de8) pour l'en-tête et le pied de page
- Couleur d'état connecté : Vert fluorescent (#00FF9D) avec des effets de lueur
- Couleur d'état isolé : Rouge (#FF3333) avec des effets de lueur
- Texte : Principalement blanc et nuances de gris pour une meilleure lisibilité

### Structure de la Mise en Page

L'application est structurée en trois sections principales :

1. **En-tête** (Header) - Hauteur fixe de 60px, fond violet avec logo et titre
2. **Contenu principal** (Main Content) - Occupe l'espace restant, contient le visualiseur et les informations
3. **Pied de page** (Footer) - Hauteur fixe de 60px, fond violet avec liens sociaux

```
+----------------------------------+
|             Header               |
+----------------------------------+
|                                  |
|                                  |
|          Main Content            |
|                                  |
|                                  |
+----------------------------------+
|             Footer               |
+----------------------------------+
```

### Styles Spécifiques des Composants

#### Header
- Fond violet (#6a3de8)
- Titre avec effet de lueur (text-shadow)
- Logo de 40px x 40px aligné à gauche

#### Visualizer
- Occupe l'espace disponible (flex: 1)
- Bordure blanche avec effet de lueur (box-shadow)
- Contrôles de zoom en bas à droite avec des boutons semi-transparents

#### Machine
- Représentée par un cercle avec bordure colorée selon l'état
- Texte en gras avec effet de lueur
- Effet de lueur dynamique (filter: drop-shadow)
- Cursor: pointer pour indiquer l'interactivité

#### Information
- Largeur fixe entre 250px et 300px
- Bordure colorée selon l'état de la machine sélectionnée
- Organisé en paires label/valeur
- Labels en gris (#999999) et valeurs en blanc

#### États Visuels
- **Connected** : Bordure verte (#00FF9D) avec lueur verte
- **Isolated** : Bordure rouge (#FF3333) avec lueur rouge

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
- **Déplacer les machines** par glisser-déposer (curseur "grab"/"grabbing")
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
- Indicateur de chargement (spinner) lors des requêtes
- Message d'erreur et bouton "Retry" en cas d'échec

### 5. Persistance des Positions

- Les positions des machines sont sauvegardées dans le localStorage
- Elles sont restaurées lorsque l'utilisateur revient sur l'application

## 6. Navigation au Clavier

La navigation au clavier est un aspect essentiel de l'accessibilité et de l'ergonomie de WormSec. Elle permet aux utilisateurs de naviguer et d'interagir avec l'application sans utiliser la souris.

### Modes de Navigation

#### Navigation dans le Visualiseur

1. **Sélection des Machines**
   - Touches fléchées (↑, ↓, ←, →) : Déplacement entre les machines
   - Touche `Enter` ou `Espace` : Sélectionner une machine
   - Touche `Échap` : Désélectionner la machine courante

2. **Contrôles de Vue**
   - `+` et `-` : Zoomer et dézoomer
   - `0` : Réinitialiser le zoom à la vue par défaut
   - `R` : Réinitialiser la disposition des machines

3. **Navigation Globale**
   - `Tab` : Naviguer entre les éléments interactifs (machines, boutons de contrôle)
   - `Shift + Tab` : Navigation inverse

#### Panneau d'Informations

1. **Interaction**
   - Flèches (↑, ↓) : Faire défiler les informations détaillées
   - `Ctrl + C` : Copier l'adresse IP ou MAC
   - `F` : Basculer en mode plein écran pour les détails

### Indicateurs Visuels

- Un outline coloré (par exemple en vert fluorescent `#00FF9D`) indique l'élément actuellement focus
- Un effet de pulsation subtil signale l'élément sélectionné

## Évolutions Possibles

1. Ajouter un filtrage des machines par statut
2. Implémenter un historique des changements d'état
3. Ajouter des statistiques sur l'état général du réseau
4. Permettre la création de groupes de machines
5. Implémenter un mode clair en complément du mode sombre actuel
6. Améliorer la couverture des tests unitaires
7. Ajouter des animations de transition entre les états des machines
8. **Améliorer la personnalisation de la navigation au clavier**

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

### Structure des fichiers CSS

L'application utilise plusieurs fichiers CSS pour une meilleure organisation du code :

- `index.css` - Styles globaux et réinitialisation
- `App.css` - Structure principale de l'application et styles communs
- `Header.css`, `Footer.css` - Styles spécifiques pour l'en-tête et le pied de page
- `Visualizer.css` - Styles pour la zone de visualisation et ses contrôles
- `Machine.css` - Styles pour la représentation des machines
- `MachineLink.css` - Styles pour les connexions entre machines
- `Information.css` - Styles pour le panneau d'informations

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

### Gestion des États de Chargement et d'Erreur

L'application gère les états de chargement et d'erreur avec des composants dédiés :

- **État de chargement** : Affiche un spinner animé
- **État d'erreur** : Affiche un message d'erreur et un bouton pour réessayer

```css
.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #00FF9D;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
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

4. **Problèmes d'affichage**
   - Vérifier que les règles CSS ne sont pas en conflit
   - S'assurer que tous les fichiers CSS sont importés dans les composants correspondants

## Évolutions Possibles

1. Ajouter un filtrage des machines par statut
2. Implémenter un historique des changements d'état
3. Ajouter des statistiques sur l'état général du réseau
4. Permettre la création de groupes de machines
5. Implémenter un mode clair en complément du mode sombre actuel
6. Améliorer la couverture des tests unitaires
7. Ajouter des animations de transition entre les états des machines

## Notes Techniques

- L'application utilise React avec des hooks (useState, useEffect, useRef, useCallback)
- TypeScript est utilisé pour le typage statique des données et composants
- Les positions sont calculées dynamiquement en fonction du nombre de machines
- L'application est responsive avec des styles flexbox
- Les animations sont gérées via CSS pour des performances optimales
- Les effets visuels (lueurs, ombres) utilisent les fonctionnalités CSS modernes comme `filter: drop-shadow` et `text-shadow`