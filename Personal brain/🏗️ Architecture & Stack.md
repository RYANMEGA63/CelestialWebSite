# 🏗️ Architecture & Stack

## Stack technique

| Couche | Technologie | Version |
|---|---|---|
| Framework UI | **React** | 18.3.1 |
| Build tool | **Vite** | 6.3.5 |
| CSS | **TailwindCSS v4** | 4.1.12 |
| Routing | **react-router** | 7.13.0 |
| Animation | **motion/react** | 12.23.24 |
| UI Components | **shadcn/ui** (Radix UI) | diverses |
| Icons | **lucide-react** | 0.487.0 |
| Forms | **react-hook-form** | 7.55.0 |
| Notifications | **sonner** | 2.0.3 |
| Dark mode | **next-themes** | 0.4.6 |
| Backend / Auth | **Supabase** | ^2.100.1 |
| Drag & Drop | **@hello-pangea/dnd** | ^18.0.1 |

## Structure des fichiers

```
📁 Celestial Website/
├── 📄 index.html
├── 📄 vite.config.ts          # Alias @ → ./src
├── 📄 package.json
├── 📄 antigravity.md          # Historique des sessions IA
├── 📁 src/
│   ├── 📄 main.tsx            # Point d'entrée React
│   ├── 📁 app/
│   │   ├── 📄 App.tsx         # RouterProvider + ThemeProvider
│   │   ├── 📄 routes.tsx      # Toutes les routes
│   │   ├── 📁 layouts/
│   │   │   └── RootLayout.tsx # Header + Outlet + Footer
│   │   ├── 📁 components/
│   │   │   ├── Header.tsx     # Nav sticky + Dark Mode
│   │   │   ├── Footer.tsx     # Footer 4 colonnes
│   │   │   ├── Button.tsx     # Composant Button custom
│   │   │   ├── Card.tsx       # Composant Card custom
│   │   │   ├── OrderWizard.tsx # Wizard commande client
│   │   │   └── 📁 ui/        # 40+ composants shadcn/ui
│   │   └── 📁 pages/
│   │       ├── 📁 db/         # Module DB Manager (voir [[🔐 Celestial DB — DB Manager]])
│   │       ├── 📁 admin/      # Module admin site
│   │       └── [pages publiques...]
│   ├── 📁 lib/
│   │   ├── supabase.ts        # Client Supabase principal
│   │   └── supabaseDb.ts      # Client Supabase DB Manager (2ème projet)
│   └── 📁 styles/
│       ├── theme.css          # Tokens CSS + .dark {}
│       ├── tailwind.css       # Import Tailwind v4
│       ├── fonts.css          # Google Fonts
│       └── index.css          # CSS global
├── 📁 Personal brain/         # ← ce vault Obsidian
└── [fichiers SQL setup...]
```

## Deux projets Supabase

Le projet utilise **deux instances Supabase distinctes** :

| Instance | Variable | Usage |
|---|---|---|
| **Principal** | `VITE_SUPABASE_URL` | Site public (offres, commandes, CMS) |
| **DB Manager** | `VITE_DB_SUPABASE_URL` | Module Celestial DB |

> ⚠️ Le client `supabaseDbAdmin` utilise la **Service Role Key** pour bypasser le RLS.

## Conventions importantes

- **Alias `@`** → `./src` (configuré dans Vite)
- **Tailwind v4** : config via `@theme inline` dans `theme.css`, pas de `tailwind.config.js`
- **Dark mode** : via `useTheme()` de `next-themes`, tokens CSS `.dark {}`
- **Pas de `<form>` HTML natif** — handlers React uniquement
- **Routing** : `react-router` v7, jamais `<a>` pour les liens internes
- **Animations** : via `motion/react`, pas de keyframes CSS ad-hoc

---

*Lié à : [[🎨 Design System]] · [[🗄️ Base de données (Supabase)]]*
