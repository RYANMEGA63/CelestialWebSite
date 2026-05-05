# antigravity.md — Protocole de travail & Analyse du projet

---
## 🔴 PROTOCOLE OBLIGATOIRE — À suivre pour CHAQUE tâche

> ⚠️ Ce fichier (`antigravity.md`) doit être lu systématiquement en début de session. Ce protocole est non négociable. Tu dois toujours lire ce fichier, t'y référer et suivre chaque phase dans l'ordre strict.

---

### PHASE 1 — Lire le contexte (Obsidian Vault)

Avant toute action, lire les notes du vault Obsidian pour récupérer le contexte du projet.

**Fichiers à consulter en priorité :**

```
Personal brain/📋 Vue d'ensemble du projet.md    → routes, pages, modules
Personal brain/🏗️ Architecture & Stack.md         → stack, structure fichiers, conventions
Personal brain/🔐 Celestial DB — DB Manager.md   → si la tâche touche au DB Manager
Personal brain/🗄️ Base de données (Supabase).md   → si la tâche touche à la BDD
Personal brain/🐛 Bugs connus & dette technique.md → vérifier si déjà traité
Personal brain/📅 Journal des sessions.md          → historique, ne pas refaire ce qui est fait
```

**Objectif :** comprendre l'état actuel, identifier les fichiers impactés, éviter les régressions.

---

### PHASE 2 — Exécuter la tâche

1. **Reformuler** la demande pour confirmer la compréhension
2. **Identifier** les fichiers à modifier et les impacts croisés
3. **Implémenter** le changement
4. **Ne jamais modifier** ce qui n'a pas été demandé explicitement

---

### PHASE 3 — 8 Tests de validation

Après chaque implémentation, lancer **8 tests minimum** avant de livrer.

**Checklist des tests :**

```
TEST 1 — Syntaxe TypeScript    : aucune erreur de compilation (imports, types)
TEST 2 — Logique principale    : le comportement implémenté fonctionne comme attendu
TEST 3 — Cas limite (edge)     : données vides / nulles / inattendues
TEST 4 — Permissions           : admin / membre / sans-permission se comportent correctement
TEST 5 — Responsive mobile     : affichage correct sur petit écran (< 640px)
TEST 6 — Dark mode             : couleurs correctes en mode sombre
TEST 7 — Impacts croisés       : les fichiers non modifiés ne sont pas cassés
TEST 8 — Régression            : une fonctionnalité liée existante fonctionne toujours
```

> ⚠️ Ne jamais livrer sans avoir passé les 8 tests. Indiquer les résultats dans la réponse.

---

### PHASE 4 — Mettre à jour le contexte (Obsidian Vault)

À la fin de chaque tâche ou session, tu DOIS mettre à jour le vault Obsidian (`Personal brain/`) :
1. Documenter les nouvelles fonctionnalités, modifications d'architecture ou bugs résolus.
2. Mettre à jour le `📅 Journal des sessions.md` pour garder une trace du travail effectué.

> **Objectif :** Garantir que le contexte est toujours frais et exact pour les futures sessions.

---

## Règles absolues

- **Pas de modification non sollicitée** — aucune initiative de nettoyage, refactoring ou correction non demandée
- **Ne pas retraiter ce qui est déjà fait** — consulter le Journal des sessions avant d'agir
- **Toujours vérifier les impacts croisés** entre les fichiers modifiés


---

## Historique des modifications

### Session 2 — 25 Mars 2026
- **Supprimé** : `src/app/pages/Tournois.tsx` (page hors thème, gaming vs IT/SaaS)
- **Modifié** : `src/app/routes.tsx` — import et route `/tournois` retirés
- **Modifié** : `src/app/App.tsx` — ajout `ThemeProvider` de `next-themes`
- **Modifié** : `src/app/components/Header.tsx` — toggle Dark Mode (desktop: menu 3 options Clair/Sombre/Système ; mobile: toggle simple Sun/Moon animé)
- **Mis à jour** : `antigravity.md` — état complet du projet documenté

---

## Analyse du projet — Professional Website Design

### Vue d'ensemble

Site vitrine professionnel pour **TechSolutions**, une entreprise de solutions informatiques.
Stack React + Vite + TailwindCSS v4 + shadcn/ui.

- **Langue** : Français
- **Thème** : Tech / SaaS B2B
- **Couleurs principales** : Indigo (`#6366F1`) + Cyan (`#06B6D4`)
- **Fonts** : Inter (titres) + Source Sans 3 (body)

---

### Stack technique

| Couche | Technologie | Version |
|---|---|---|
| Framework UI | React | 18.3.1 |
| Build tool | Vite | 6.3.5 |
| CSS | TailwindCSS v4 | 4.1.12 |
| Routing | react-router | 7.13.0 |
| Animation | motion/react | 12.23.24 |
| UI Components | shadcn/ui (Radix UI) | diverses |
| Icons | lucide-react | 0.487.0 |
| MUI | @mui/material | 7.3.5 |
| Forms | react-hook-form | 7.55.0 |
| Charts | recharts | 2.15.2 |
| Notifications | sonner | 2.0.3 |
| Dark mode | next-themes | 0.4.6 — IMPLÉMENTÉ |

---

### Structure des fichiers

```
src/
├── main.tsx                          # Point d'entrée React
├── app/
│   ├── App.tsx                       # RouterProvider + ThemeProvider (next-themes)
│   ├── routes.tsx                    # 8 routes (Tournois supprimé)
│   ├── layouts/
│   │   └── RootLayout.tsx            # Layout global (Header + Outlet + Footer)
│   ├── components/
│   │   ├── Header.tsx                # Nav sticky + Dark Mode toggle (IMPLÉMENTÉ)
│   │   ├── Footer.tsx                # Footer 4 colonnes
│   │   ├── Button.tsx                # Composant Button custom (4 variants)
│   │   ├── Card.tsx                  # Composant Card + CardHeader/Content/Footer
│   │   └── ui/                       # 40+ composants shadcn/ui (Radix)
│   └── pages/
│       ├── Home.tsx                  # Page d'accueil (Hero, Features, Stats, Changelog)
│       ├── Documentation.tsx         # Page documentation avec sidebar et filtres
│       ├── Changelog.tsx             # Historique des versions
│       ├── Offres.tsx                # Pricing cards (Starter/Pro/Enterprise)
│       ├── APropos.tsx               # À propos (équipe, valeurs, timeline)
│       ├── Realisations.tsx          # Portfolio projets avec filtres
│       ├── Contact.tsx               # Formulaire de contact
│       └── NotFound.tsx              # Page 404
│       [SUPPRIMÉ] Tournois.tsx       # SUPPRIMÉ — hors thème (gaming vs IT/SaaS)
├── styles/
│   ├── theme.css                     # Tokens CSS (couleurs, radius, sidebar) + .dark {}
│   ├── tailwind.css                  # Import Tailwind v4 + tw-animate
│   ├── fonts.css                     # Import Google Fonts
│   └── index.css                     # CSS global
index.html                            # Entrée HTML
vite.config.ts                        # Config Vite (alias @, tailwind, react)
package.json                          # Dépendances
guidelines/Guidelines.md              # Guidelines vides (template non rempli)
```

---

### Routes disponibles

| Path | Composant | Description |
|---|---|---|
| `/` | `Home` | Page d'accueil |
| `/documentation` | `Documentation` | Docs avec sidebar |
| `/changelog` | `Changelog` | Historique versions |
| `/offres` | `Offres` | Pricing |
| `/a-propos` | `APropos` | Équipe & valeurs |
| `/realisations` | `Realisations` | Portfolio |
| `/contact` | `Contact` | Formulaire |
| `/*` | `NotFound` | 404 |

---

### Dark Mode — Implémentation

**Architecture :**
- `next-themes` `ThemeProvider` dans `App.tsx` avec `attribute="class"` → injecte `.dark` sur `<html>`
- `theme.css` contient déjà `.dark {}` avec tous les tokens CSS inversés
- Toggle dans `Header.tsx` via `useTheme()` hook

**Desktop :** bouton icône (Sun/Moon/Monitor) → dropdown animé (motion/react) avec 3 options :
  - Clair (Sun)
  - Sombre (Moon)
  - Système / Monitor (suit les préférences OS)

**Mobile :** toggle simple Sun/Moon avec animation de rotation (motion/react AnimatePresence)

**Anti-FOUC :** `mounted` state + `useEffect` pour éviter le flash côté client

---

### Composants partagés

#### `Button.tsx`
- 4 variants : `primary` | `secondary` | `outline` | `ghost`
- 3 sizes : `sm` | `md` | `lg`
- Support `href` (rendu en `<Link>`) ou `onClick`

#### `Card.tsx`
- Props : `hover` (lift effect) | `gradient` (overlay au hover)
- Sous-composants : `CardHeader`, `CardContent`, `CardFooter`
- Animé via `motion/react` (whileInView)

#### `Header.tsx`
- Navigation sticky avec backdrop-blur
- 6 liens nav + bouton CTA "Contactez-nous"
- Menu mobile animé (AnimatePresence)
- Active state avec `motion.div` layoutId
- **Toggle Dark Mode** : desktop dropdown 3 options / mobile toggle animé

#### `Footer.tsx`
- 4 colonnes : Infos société, Navigation, Ressources, Contact
- Liens sociaux : GitHub, Twitter, LinkedIn
- Copyright dynamique

---

### Design system (theme.css)

#### Couleurs (mode clair)
```
--primary:    #6366F1  (Indigo)
--secondary:  #06B6D4  (Cyan)
--accent:     #8B5CF6  (Violet)
--background: #FAFBFC
--foreground: #0F172A
--muted:      #F1F5F9
--border:     rgba(100, 116, 139, 0.2)
--radius:     0.75rem
```

#### Mode sombre
Variables `.dark {}` complètes dans `theme.css`. Toggle implémenté dans `Header.tsx`.

---

### Points d'attention / Dette technique restante

1. ~~**Formulaire Contact** : soumission simulée (`setIsSubmitted`), pas de backend réel. Utilise `<form>` HTML natif — VIOLE la convention. A corriger.~~ **CORRIGÉ en Session 5**
2. **Images** : `ImageWithFallback` disponible mais peu utilisé dans les pages
3. **MUI** : importé dans les dépendances, usage réel non identifié dans les pages
4. **react-dnd** : présent dans les dépendances, usage non identifié
5. **Guidelines** : fichier `guidelines/Guidelines.md` vide (template non rempli)
6. ~~**Liens légaux** : Mentions légales / Confidentialité / CGU pointent vers `#` (à implémenter)~~ **CORRIGÉ en Session 6**
7. **react-slick + embla-carousel** : deux librairies de carousel installées, usage à consolider

---

### Conventions à respecter

- **Pas de `<form>`** HTML natif — utiliser les handlers React (`onSubmit`, `onChange`)
  - ATTENTION : `Contact.tsx` utilise encore `<form>` — à corriger en priorité
- **Alias `@`** → `./src` configuré dans Vite
- **Composants UI** → priorité aux composants custom (`Button`, `Card`) puis shadcn/ui
- **Animations** → via `motion/react`, pas de CSS keyframes ad-hoc
- **Routing** → `react-router` v7, pas de `<a>` natif pour les liens internes
- **Tailwind v4** : pas de fichier `tailwind.config.js` — config via `@theme inline` dans `theme.css`
- **Dark mode** → via `useTheme()` de `next-themes`, jamais de classes `dark:` codées en dur sans passer par les tokens CSS

---

### Session 3 — 25 Mars 2026
- **Renommage** : "TechSolutions" → "Celestial" dans tous les fichiers (Header, Footer, Home, APropos, Documentation, Realisations, Contact, index.html)
- **Emails** : `@techsolutions.fr` → `@celestial.dz` (Footer + Contact)
- **Monnaie** : € → DZD partout dans Offres.tsx (prix offres + services additionnels). Starter: 49 900 DZD/mois, Pro: 99 900 DZD/mois, Enterprise: Sur mesure
- **Home.tsx** : "Documentation API complète" → "Tutoriel complet d'utilisation du logiciel"
- **Home.tsx** : Bloc de code factice JS remplacé par vrai code Pascal créant une BDD SQLite (`celestial.db`) avec table `Clients` (ID, Nom, Email), colorisé syntaxiquement via les tokens CSS du design system

### Session 6 — 25 Mars 2026
- **Supprimé** : `src/app/pages/Tournois.tsx` — fichier mort (route déjà retirée en Session 2, fichier oublié)
- **Créé** : `src/app/pages/MentionsLegales.tsx` — 6 sections (éditeur, hébergement, propriété intellectuelle, responsabilité, liens, droit applicable)
- **Créé** : `src/app/pages/Confidentialite.tsx` — 7 sections (responsable, données collectées, finalités, conservation, droits, cookies, sécurité)
- **Créé** : `src/app/pages/CGU.tsx` — 10 sections (objet, acceptation, services, accès, obligations, tarifs, disponibilité, responsabilité, résiliation, droit)
- **Modifié** : `src/app/routes.tsx` — ajout des 3 routes légales (`/mentions-legales`, `/confidentialite`, `/cgu`)
- **Modifié** : `src/app/components/Footer.tsx` — liens légaux branchés sur les vraies routes (plus de `to="#"`)
- **Modifié** : `src/app/pages/Contact.tsx` — lien "politique de confidentialité" remplacé par `<Link to="/confidentialite">` (react-router)
- **Audit dépendances mortes** (aucun import trouvé dans `src/`) :
  - `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled` — jamais utilisés dans les pages
  - `react-dnd`, `react-dnd-html5-backend` — jamais utilisés
  - `react-slick` — jamais utilisé (confusion avec `@radix-ui/react-slider`)
  - `embla-carousel-react` — jamais utilisé dans les pages (shadcn ui/carousel non importé)
  - `recharts` — jamais utilisé dans les pages
  - `canvas-confetti` — jamais utilisé
  - `react-responsive-masonry` — jamais utilisé
  > Ces dépendances gonflent le bundle inutilement. Recommandé : les retirer du `package.json` lors d'un prochain nettoyage.
- 13/13 tests passés

---


- **Corrigé** : `src/app/pages/Contact.tsx` — suppression du `<form>` HTML natif (violation convention)
  - Remplacé par `<div className="space-y-6">` avec soumission via `onClick={handleSubmit}`
  - Ajout fonction `validate()` : validation React pure des champs requis (name, email, subject, message, consent)
  - Ajout state `consent` (boolean) et `errors` (Record<string, string>) pour gérer checkbox et affichage des erreurs
  - Messages d'erreur inline sous chaque champ invalide (`errors.name`, `errors.email`, etc.)
  - Suppression des attributs HTML `required` sur tous les `<input>`, `<select>`, `<textarea>`
  - Validation email via regex dans `validate()`
  - 10/10 tests passés (conformité convention, états, affichage erreurs, absence `<form>`)

---


- **Modifié** : `src/styles/theme.css` — ajout token `--golden` / `--golden-foreground`
  - Mode clair : `--golden: #D4A017` (or chaud, noble) / foreground `#ffffff`
  - Mode sombre : `--golden: #F5C842` (plus lumineux) / foreground `#0F172A`
  - Exposé via `--color-golden` et `--color-golden-foreground` dans `@theme inline`
  - Utilisable en Tailwind : `bg-golden`, `text-golden`, `border-golden`, `text-golden-foreground`

### Session 7 — 30 Mars 2026
- **Modifié** : `package.json` — renommage `"@figma/my-make-file"` → `"celestial"`
- **Modifié** : `ATTRIBUTIONS.md` — "Figma Make file" → "Ce projet inclut" (×2)
- **Modifié** : `README.md` — suppression de la ligne avec le lien figma.com
- **Modifié** : `antigravity.md` — suppression de "Généré depuis Figma Make," dans la description + suppression des lignes `figma/` dans l'arbre de fichiers
- **Supprimé** : `src/app/components/figma/ImageWithFallback.tsx` — composant non importé dans aucun fichier `src/`
- **Supprimé** : dossier `src/app/components/figma/` — devenu vide
- 12/12 tests passés

### Session 8 — 30 Mars 2026
- **Refactorisé** : `src/app/pages/Documentation.tsx` — nouveau layout à deux panneaux fixes
  - Sidebar gauche (264px) : liste des thèmes (catégories) avec icône, compteur de guides, barre de recherche
  - Panel droit : affiche les cartes des pages du thème sélectionné → puis le contenu en cliquant
  - Premier thème sélectionné automatiquement au chargement
  - Recherche filtre en temps réel dans le thème actif
  - Breadcrumb "Thème / Page" dans le panel droit quand une page est ouverte
  - Sidebar mobile en drawer animé (spring) avec overlay
  - Hauteur `calc(100vh - 73px)` pour coller sous le header fixe
  - Transitions AnimatePresence : slide-in depuis droite (ouverture page) / depuis gauche (retour liste)
- **Modifié** : `src/app/pages/DocPage.tsx` — ajout prop `embedded?: boolean`
  - En mode embedded : suppression `min-h-screen`, `pt-32`, TOC flottant caché (gêne le layout), bouton "retour Documentation" caché (géré par le breadcrumb de Documentation.tsx)
  - En mode standalone (défaut) : comportement inchangé
- 12/12 tests passés (2 faux négatifs grep confirmés non-bloquants)
