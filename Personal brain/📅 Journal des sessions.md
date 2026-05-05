# 📅 Journal des sessions

> Résumé chronologique de toutes les modifications importantes apportées au projet.

---

## Session 2 — 25 Mars 2026
- **Supprimé** : `Tournois.tsx` (page hors thème)
- **Modifié** : routes.tsx — route `/tournois` retirée
- **Implémenté** : Dark Mode complet (`next-themes` + toggle Header)

## Session 3 — 25 Mars 2026
- **Renommage** : "TechSolutions" → "Celestial" dans tous les fichiers
- **Emails** : `@techsolutions.fr` → `@celestial.dz`
- **Monnaie** : € → DZD dans `Offres.tsx`
- **Home.tsx** : bloc code factice Pascal pour demo BDD SQLite

## Session 5
- **Corrigé** : `Contact.tsx` — suppression `<form>` HTML natif (violation convention)

## Session 6 — 25 Mars 2026
- **Créé** : Pages légales (`MentionsLegales`, `Confidentialite`, `CGU`)
- **Corrigé** : Liens légaux Footer (plus de `to="#"`)
- **Audit** : dépendances mortes identifiées (MUI, react-dnd, recharts, etc.)

## Session 7 — 30 Mars 2026
- **Nettoyage** : suppression références Figma Make
- **Supprimé** : `figma/ImageWithFallback.tsx`

## Session 8 — 30 Mars 2026
- **Refactorisé** : `Documentation.tsx` — layout deux panneaux (sidebar + panel)
- **Modifié** : `DocPage.tsx` — prop `embedded?: boolean`

## Sessions DB Manager (Mars-Avril 2026)
- **Créé** : Module complet Celestial DB (`DbLayout`, `DbContext`, `DbLogin`, `DbWorkspacesPage`, `DbWorkspaceView`, `DbUsersPage`, `DbAdminDatabasePage`)
- **Implémenté** : Système de workspaces avec rôles et permissions granulaires
- **Implémenté** : Messagerie temps-réel (Supabase Realtime)
- **Implémenté** : Hub & Spoke navigation (page centrale → onglets)

## Session Avril 2026 — Responsive Mobile
- **Mobile** : Site public entièrement responsive
- **DB Manager** : Navigation mobile hamburger menu
- **WorkspaceView** : Suppression sidebar gauche → Hub centralisé
- **WorkspaceView** : Modale "Membres" avec email + rôle
- **WorkspaceView** : Fix permissions — carte BDD cachée si `canViewDb=false`
- **DbTableViewer** : Top navbar horizontale (au lieu de sidebar gauche)
- **DbTableViewer** : Tableau full-width sans troncature

---

## Session Mai 2026 — Refonte Réactive & Zustand
- **Créé** : `useUIStore.ts` — Implémentation d'un store global Zustand pour gérer l'état de l'UI (modal, offres).
- **Refactorisé** : `RootLayout.tsx` — Montage du `<OrderWizard />` au niveau global (z-50) au lieu d'un rendu local par page.
- **Modifié** : `Offres.tsx`, `Home.tsx`, `Header.tsx` — Suppression des états locaux de modal et remplacement par `useUIStore().openWizard()`. Les CTAs principaux ("Démarrer un projet", "Lancer un projet") déclenchent désormais le wizard de manière globale.
- **Refactorisé** : `Documentation.tsx`, `DocPage.tsx` — Application du workflow `@[/frontend-design]`. UI/UX épurée, suppression des dégradés/arrondis au profit d'une esthétique "NPM docs" industrielle (typographie forte, monospace, bordures franches, navbar pro).
- **Refactorisé** : `styles/theme.css` — Refonte de la palette de couleurs Light/Dark vers une esthétique "Slate Industrial" premium, moins agressive (blanc cassé papyrus vs noir profond). Ajout d'une transition CSS globale (`transition-duration: 500ms`) sur toutes les couleurs (`background-color`, `color`, `border-color`, etc.) pour un toggle de thème ultra-fluide.
- **Refactorisé** : `Home.tsx` — Suppression du "zebra-striping" (alternance brutale de sections `bg-foreground` / `bg-background`). La page d'accueil utilise désormais nativement la palette de couleurs du thème actif pour garantir une transition en douceur et une cohérence visuelle parfaite sans sauts chromatiques violents.

---

## Template nouvelle session

```markdown
## Session [N] — [Date]
- **[Action]** : [Fichier] — [Description]
- **[Action]** : [Fichier] — [Description]
```

---

*Lié à : [[🐛 Bugs connus & dette technique]] · [[⚙️ Conventions de code]]*
