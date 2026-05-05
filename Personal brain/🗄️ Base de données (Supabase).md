# 🗄️ Base de données (Supabase)

## Deux projets Supabase

Voir [[🏗️ Architecture & Stack]] pour le contexte global.

---

## Supabase Principal (site public)

Géré via `src/lib/supabase.ts`

### Tables principales

| Table | Usage |
|---|---|
| `offers` | Offres / pricing |
| `services` | Services additionnels |
| `orders` | Commandes clients |
| `home_categories` | Catégories page d'accueil |
| `features` | Features dynamiques |
| `team_members` | Membres de l'équipe |
| `realizations` | Portfolio / réalisations |
| `doc_themes` | Thèmes documentation |
| `doc_pages` | Pages documentation |
| `changelogs` | Historique versions |
| `legal_pages` | Pages légales |

---

## Supabase DB Manager (Celestial DB)

Géré via `src/lib/supabaseDb.ts`

### Variables d'environnement

```
VITE_DB_SUPABASE_URL=...
VITE_DB_SUPABASE_ANON_KEY=...
VITE_DB_SUPABASE_SERVICE_ROLE_KEY=...  ← ⚠️ Utilisé côté client (admin uniquement)
VITE_DB_ADMIN_EMAIL=...
```

### Tables DB Manager

| Table | Description |
|---|---|
| `workspaces` | Espaces de travail |
| `workspace_roles` | Rôles personnalisés par workspace |
| `workspace_members` | Membres avec permissions granulaires |
| `messages` | Messages temps-réel par workspace |

### Schéma `workspace_members`

```sql
CREATE TABLE workspace_members (
  id                UUID PRIMARY KEY,
  workspace_id      UUID REFERENCES workspaces(id),
  user_id           UUID NOT NULL,
  user_email        TEXT NOT NULL,        -- ← sauvegardé à l'invitation
  role              TEXT DEFAULT 'viewer',
  can_send_messages BOOLEAN DEFAULT true,
  can_view_database BOOLEAN DEFAULT true,
  can_manage_members BOOLEAN DEFAULT false,
  joined_at         TIMESTAMPTZ
);
```

### Schéma `workspaces`

```sql
CREATE TABLE workspaces (
  id                 UUID PRIMARY KEY,
  name               TEXT NOT NULL,
  description        TEXT,
  color              TEXT DEFAULT '#7c3aed',
  emoji              TEXT DEFAULT '🏢',
  image_url          TEXT,
  company_id         UUID,
  features_messaging BOOLEAN DEFAULT true,
  features_database  BOOLEAN DEFAULT true,
  allowed_tables     TEXT[],              -- ← tables accessibles aux membres
  created_at         TIMESTAMPTZ
);
```

### RLS (Row Level Security)

| Table | Politique |
|---|---|
| `workspaces` | Visible aux membres du workspace |
| `workspace_members` | Visible à tous les membres du même workspace |
| `workspace_roles` | Visible aux membres |
| `messages` | Lecture aux membres, écriture si `can_send_messages=true` |

> ℹ️ Le client `supabaseDbAdmin` (Service Role Key) **bypass le RLS** pour les opérations admin.

### Fichiers SQL de setup

| Fichier | Description |
|---|---|
| `schema.sql` | Schéma Supabase principal |
| `setup_db_manager.sql` | Schéma + RLS du DB Manager |
| `setup_dynamic_content.sql` | Contenu dynamique (home, features) |
| `setup_docs_advanced.sql` | Documentation avancée |
| `storage_setup.sql` | Configuration Storage Supabase |

---

*Lié à : [[🔐 Celestial DB — DB Manager]] · [[🏗️ Architecture & Stack]]*
