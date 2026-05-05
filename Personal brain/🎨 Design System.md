# 🎨 Design System

## Couleurs

| Token | Mode clair | Mode sombre | Usage |
|---|---|---|---|
| `--primary` | `#6366F1` (Indigo) | — | CTA, liens actifs |
| `--secondary` | `#06B6D4` (Cyan) | — | Accents |
| `--accent` | `#8B5CF6` (Violet) | — | Highlights |
| `--golden` | `#D4A017` | `#F5C842` | Badges premium |
| `--background` | `#FAFBFC` | sombre | Fond page |
| `--foreground` | `#0F172A` | clair | Texte principal |
| `--muted` | `#F1F5F9` | — | Fonds secondaires |
| `--border` | `rgba(100,116,139,0.2)` | — | Bordures |
| `--radius` | `0.75rem` | — | Border radius |

## Typo

| Rôle | Font |
|---|---|
| Titres | **Inter** |
| Corps | **Source Sans 3** |

## Composants custom

### `Button.tsx`
- **Variants** : `primary` · `secondary` · `outline` · `ghost`
- **Sizes** : `sm` · `md` · `lg`
- Support `href` (Link) ou `onClick`

### `Card.tsx`
- **Props** : `hover` (lift effect) · `gradient` (overlay hover)
- **Sous-composants** : `CardHeader` · `CardContent` · `CardFooter`
- Animé via `motion/react` (`whileInView`)

### `OrderWizard.tsx`
- Wizard 4 étapes : Offre → Services → Infos → Récapitulatif
- Intégration webhook pour notifications LinkedIn

## shadcn/ui

40+ composants Radix UI dans `src/app/components/ui/` :
`Dialog`, `Dropdown`, `Toast`, `Popover`, `Select`, `Tabs`, `Sheet`, `Badge`...

## Animations

Toutes les animations via **motion/react** :
```tsx
// Entrée au scroll
<motion.div whileInView={{ opacity: 1 }} initial={{ opacity: 0 }} />

// Hover interactif
<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} />

// Transitions de pages
<AnimatePresence mode="wait">...</AnimatePresence>
```

## Dark Mode

- Provider : `next-themes` `ThemeProvider` dans `App.tsx`
- Attribute : `class` → injecte `.dark` sur `<html>`
- Tokens `.dark {}` dans `theme.css`
- Hook : `useTheme()` de `next-themes`

**Ne jamais :**
```tsx
// ❌ Mauvais - classes dark: codées en dur
<div className="dark:bg-gray-900">

// ✅ Correct - via token CSS
<div className="bg-background">
```

---

*Lié à : [[🏗️ Architecture & Stack]]*
