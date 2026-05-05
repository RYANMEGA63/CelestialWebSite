# ⚙️ Conventions de code

## Règles absolues

> Ces règles sont définies dans `antigravity.md` et doivent être respectées impérativement.

### ❌ Interdit

- Utiliser `<form>` HTML natif → utiliser handlers React (`onClick`, `onChange`)
- Utiliser `<a href>` pour les liens internes → utiliser `<Link to>` (react-router)
- Coder des classes `dark:bg-xxx` en dur → passer par les tokens CSS
- Modifier un fichier sans vérifier les impacts croisés
- Livrer sans avoir testé

### ✅ Obligatoire

- **Alias `@`** pour les imports → `@/lib/...` au lieu de `../../../lib/...`
- **Animations** → `motion/react` uniquement
- **Composants UI** → priorité : composants custom (`Button`, `Card`) → shadcn/ui → native HTML
- **Dark mode** → `useTheme()` hook + tokens CSS
- **Routing** → `useNavigate()` ou `<Link>` de `react-router`

## Structure d'un composant React

```tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Icon } from "lucide-react";
import { supabaseDb } from "@/lib/supabase";

// Types en haut
interface Props { ... }

// Composant nommé (pas default anonymous)
export function MyComponent({ prop }: Props) {
  // 1. Hooks d'état
  const [data, setData] = useState(null);
  
  // 2. Hooks d'effet
  useEffect(() => { ... }, []);
  
  // 3. Handlers
  const handleClick = () => { ... };
  
  // 4. Early returns (loading, error, empty)
  if (!data) return <Loader />;
  
  // 5. JSX principal
  return (...);
}
```

## Tailwind v4 — Spécificités

Pas de fichier `tailwind.config.js`. Toute la config est dans `src/styles/theme.css` :

```css
@theme inline {
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  /* ... */
}
```

## Imports Supabase

```typescript
// Site public
import { supabase } from "@/lib/supabase";

// DB Manager
import { supabaseDb, supabaseDbAdmin } from "@/lib/supabaseDb";
// ⚠️ supabaseDbAdmin = Service Role Key, utilisé côté client uniquement pour l'admin
```

## Gestion des erreurs

```tsx
try {
  const { data, error } = await supabaseDb.from("table").select();
  if (error) throw error;
  setData(data);
} catch (e) {
  console.error(e);
  toast.error("Une erreur est survenue");
} finally {
  setLoading(false);
}
```

---

*Lié à : [[🏗️ Architecture & Stack]] · [[📅 Journal des sessions]]*
