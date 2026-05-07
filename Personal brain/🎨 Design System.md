# 🎨 Design System: Industrial Utilitarian (Delphi 6 / BusinessProces)

## 🏗️ Principes Fondamentaux (Industrial Utilitarian)

L'interface de Celestial adopte désormais une esthétique "Industrial Utilitarian" fortement inspirée des logiciels ERP natifs comme Delphi 6 (projet "BusinessProces").
L'objectif est d'offrir une expérience utilisateur de type logiciel de bureau (Desktop-Native) au sein d'une application web.

**Principes clés :**
1. **Haute Densité d'Information :** L'espace est précieux. Réduction drastique des espaces blancs (paddings et margins) pour afficher le maximum de données à l'écran, sans scroll inutile.
2. **Aspect Logiciel Bureau Natif :** L'interface doit ressembler à une application métier lourde. Utilisation de bordures franches, de séparateurs nets et d'une structure en panneaux.
3. **Fonctionnalité avant tout :** Les composants doivent être immédiatement compréhensibles et hyper-fonctionnels.
4. **Zéro fioriture :** Pas d'ombres diffuses (drop-shadows) excessives, pas d'animations lentes ou inutiles, pas d'arrondis trop prononcés (border-radius très faible, voire nul).

---

## 🎨 Tokens de Design

### Couleurs Utilitaires & Accents
La palette de couleurs abandonne les tons trop "modern-web" (indigo, cyan, violet) au profit d'une palette industrielle de gris métalliques, rehaussée par des accents "Celestial Gold".

| Token | Mode clair | Mode sombre | Usage (VCL Style) |
|---|---|---|---|
| `--primary` | `#D4A017` (Celestial Gold) | `#F5C842` | Boutons d'action principaux, focus, accents |
| `--background` | `#E0E0E0` ou `#F0F0F0` | `#1E1E1E` | Fond des fenêtres principales et de l'application |
| `--surface` | `#FFFFFF` | `#2D2D2D` | Fond des panneaux de données, grilles, champs de saisie |
| `--border` | `#808080` ou `#A0A0A0` | `#404040` | Bordures franches (1px solid) pour séparer les zones |
| `--foreground` | `#000000` | `#D4D4D4` | Texte principal |
| `--muted` | `#C0C0C0` | `#3A3A3A` | Éléments désactivés, fonds de headers de tableaux |
| `--radius` | `0` à `2px` | `0` à `2px` | Très angulaire, aspect Windows classique |

### Typographie Compacte
La typographie doit maximiser la lisibilité à petite taille pour s'adapter à la haute densité.

| Rôle | Font | Tailles |
|---|---|---|
| Interface / Data | **Inter** ou **Tahoma** / **Segoe UI** | Compact (11px, 12px, 13px maximum) |
| Titres de fenêtres | **Inter** (Bold) | Modéré (14px, 16px) |
| Lignes de code/Logs | **Fira Code** ou **Consolas** | Compact (11px, 12px) |

---

## 📏 Règles de Densité et Espacement

- **Paddings / Margins :** Réduits au strict minimum. Par exemple, un bouton aura `padding: 2px 8px` plutôt que `padding: 8px 16px`.
- **Interlignage (Line-height) :** Serré (`1.2` à `1.4` max) pour les listes et les grilles de données.
- **Grilles et Panneaux :** Utilisation de séparateurs (lignes noires ou gris foncé de 1px) entre chaque section, typiques des UI Delphi. Pas d'espaces blancs flottants.

---

## 🧩 Composants "Desktop-Native" (VCL-Style)

### `DataGrid` (Grille de données interactive)
- **Le composant central du système.**
- Entêtes de colonnes cliquables (pour le tri) avec un fond gris métallique (`--muted`) et des bordures 1px.
- Lignes alternées (zebra-striping) très subtiles.
- Sélection de ligne entière (highlight avec `--primary` ou une variante bleutée/grisée).
- Colonnes fixes (sticky) pour la navigation.

### `Button` (Style VCL)
- Aspect plat ou très légèrement biseauté (inset shadow 1px pour simuler le relief classique si nécessaire, ou totalement flat design industriel).
- Pas d'arrondis (border-radius: 0).
- Changement d'état immédiat au `:hover` et `:active` (fond s'assombrit ou s'éclaircit), sans transition lente.

### `Modal` (Fenêtres denses)
- Doivent ressembler à des fenêtres de dialogue système (Dialog boxes).
- Titre avec fond plein, bouton de fermeture [X] classique.
- Contenu ultra-structuré (groupes de champs encadrés par des `fieldset` avec `legend`).
- Boutons d'action ("OK", "Annuler", "Appliquer") alignés en bas à droite.

### `Panel` / `GroupBox`
- Blocs d'informations entourés d'une bordure fine 1px avec un titre incrusté sur la ligne supérieure, typique de l'organisation visuelle d'un logiciel métier.

---

## ⚡ Animations
Les animations fluides de type "motion/react" doivent être **supprimées ou réduites à néant**. 
Dans un logiciel métier type ERP, la réactivité perçue passe par l'instantanéité. 
- Les changements de page doivent être instantanés.
- Les états `:hover` et `:active` ne doivent pas avoir de `transition-duration`.
- Seuls les loaders (si chargement de données lourd) sont tolérés, sous forme de spinners simples ou barres de progression classiques.
