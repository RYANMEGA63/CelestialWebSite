# 🗺️ Roadmap Refonte Industrial Utilitarian (Delphi 6 Style)

Ce document décrit le plan d'action étape par étape pour refactoriser l'interface web de Celestial et l'aligner sur le nouveau Design System "Industrial Utilitarian" inspiré du logiciel ERP Delphi 6 "BusinessProces".

## Phase 1 : Mise à jour des Fondations (Design Tokens & CSS)

1. **Refactoriser `theme.css` / `index.css` / Tailwind Config :**
   - Remplacer les couleurs actuelles (indigo, cyan, etc.) par la palette industrielle (gris métalliques, accents `Celestial Gold`).
   - Mettre à jour les variables CSS pour les fonds (`--background`, `--surface`), les textes et les bordures.
   - Écraser les valeurs de `--radius` pour forcer des angles droits (0px ou 2px max).
   - Ajuster la typographie globale : forcer une taille de base plus petite (12px-13px) et un line-height réduit sur le `<body>`.

2. **Suppression des animations globales :**
   - Désactiver ou retirer les transitions CSS globales (`transition-all duration-300`).
   - Retirer les effets `Framer Motion` (ou équivalents) qui ajoutent des délais d'apparition ou des fondus inutiles pour un ERP.

## Phase 2 : Refonte de la Bibliothèque de Composants (UI Components)

1. **Refactoriser `Button.tsx` :**
   - Supprimer les paddings larges, réduire à une taille compacte.
   - Retirer les bordures arrondies (`rounded-md`, `rounded-lg`).
   - Implémenter des bordures nettes et des états hover instantanés (sans transition).

2. **Créer / Refactoriser `DataGrid.tsx` (Le cœur de l'ERP) :**
   - Remplacer les affichages en liste/cartes par un composant DataGrid robuste.
   - Implémenter des en-têtes de colonnes style VCL (fond gris, bordures distinctes).
   - Ajouter le support du tri, des bordures de cellules 1px, et du survol de ligne (row highlight).

3. **Refactoriser `Card.tsx` en `Panel.tsx` ou `GroupBox.tsx` :**
   - Retirer les ombres portées (`shadow-lg`, `shadow-md`).
   - Ajouter des bordures fines (1px solid).
   - Rendre le header de la carte plus dense.

4. **Refactoriser les Modales (`Dialog`, `Sheet`) :**
   - Transformer les modales web-modernes en fenêtres de dialogue denses.
   - Réduire les paddings internes.
   - Aligner les actions de manière utilitaire.

5. **Refonte des Inputs et Formulaires :**
   - Réduire la hauteur des champs de texte, selects et checkboxes.
   - Bordures nettes, pas de glow externe, simple changement de couleur de bordure au focus (Accent Gold).

## Phase 3 : Restructuration des Pages et des Layouts

1. **Refactoriser `RootLayout.tsx` & Navigation :**
   - Passer d'une navigation aérée à une barre d'outils (Toolbar/Menubar) ou une barre latérale très dense, typique d'un logiciel de bureau.
   - Retirer les espaces blancs entre la navigation et le contenu.

2. **Refactoriser les vues de données (ex: `DbTableViewer.tsx`) :**
   - Implémenter le nouveau `DataGrid`.
   - Organiser les contrôles (recherche, filtres) dans une barre d'outils compacte juste au-dessus de la grille.

3. **Refactoriser les pages de contenu (`DocPage.tsx`, `Changelog.tsx`, etc.) :**
   - Appliquer la typographie compacte.
   - Remplacer les séparateurs décoratifs par des lignes 1px franches (black ou gris foncé).
   - Structurer le texte avec moins d'espace vertical.

## Phase 4 : Recette et Ajustements

1. **Audit de la Densité :** Vérifier que la quantité d'informations affichées à l'écran a significativement augmenté sans nécessiter de scroll.
2. **Audit Visuel :** S'assurer de l'absence d'éléments "flottants", d'ombres douces, d'arrondis ou d'animations.
3. **Validation Mobile :** Bien que l'approche soit "Desktop-Native", adapter les grilles et panneaux pour rester utilisables sur mobile (scroll horizontal des grilles, empilement des panneaux).
