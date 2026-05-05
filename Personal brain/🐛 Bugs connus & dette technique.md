# 🐛 Bugs connus & dette technique

## ⚠️ Dette technique active

### Dépendances mortes (jamais utilisées dans `src/`)
Ces packages gonflent le bundle inutilement et peuvent être retirés :

| Package | Statut |
|---|---|
| `@mui/material` + `@mui/icons-material` | ❌ Non utilisé |
| `@emotion/react` + `@emotion/styled` | ❌ Non utilisé |
| `react-dnd` + `react-dnd-html5-backend` | ❌ Non utilisé |
| `react-slick` | ❌ Non utilisé |
| `embla-carousel-react` | ❌ Non utilisé |
| `recharts` | ❌ Non utilisé |
| `canvas-confetti` | ❌ Non utilisé |
| `react-responsive-masonry` | ❌ Non utilisé |

> 💡 **Action recommandée** : `npm uninstall [packages]` lors d'un prochain nettoyage

### Guidelines vides
- `guidelines/Guidelines.md` — template non rempli

---

## ✅ Bugs résolus

| Bug | Session | Fix |
|---|---|---|
| `<form>` HTML natif dans Contact.tsx | Session 5 | Remplacé par handlers React |
| Liens légaux → `#` dans Footer | Session 6 | Branchés sur vraies routes |
| Références Figma Make dans le projet | Session 7 | Supprimées |
| Carte "Base de données" visible sans permission | Avril 2026 | Condition `canViewDb` corrigée |
| Modale Membres vide pour non-admin | Avril 2026 | Lecture de `user_email` dans `workspace_members` |
| Bouton Membres non cliquable sur Hub | Avril 2026 | Modal dupliqué dans le bon return |
| Navigation mobile DB Manager inaccessible | Avril 2026 | Hamburger menu mobile ajouté |

---

## 💡 Points d'attention

### `supabaseDbAdmin` côté client
La Service Role Key est actuellement exposée côté client (dans `.env.local`). Pour un environnement de production critique, il faudrait déplacer ces appels vers des **Edge Functions Supabase** ou un backend dédié.

### Deux librairies de carousel
`react-slick` et `embla-carousel-react` sont toutes les deux installées mais non utilisées. À consolider si un carousel est nécessaire à l'avenir.

---

*Lié à : [[📅 Journal des sessions]] · [[💡 Idées & prochaines features]]*
