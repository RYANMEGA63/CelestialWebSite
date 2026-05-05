# 🔐 Celestial DB — DB Manager

## Vue d'ensemble

Application SaaS intégrée au site permettant la gestion de bases de données par workspace, avec système de rôles et permissions granulaires.

## Fichiers principaux

| Fichier | Rôle |
|---|---|
| `DbLayout.tsx` | Layout global admin + menu mobile hamburger |
| `DbContext.tsx` | Auth context + inactivity timer |
| `DbLogin.tsx` | Page de connexion |
| `DbWorkspacesPage.tsx` | Liste + gestion des workspaces (admin) |
| `DbWorkspaceView.tsx` | Vue principale d'un workspace (Hub + onglets) |
| `DbUsersPage.tsx` | Gestion des utilisateurs (admin) |
| `DbAdminDatabasePage.tsx` | Explorateur BDD admin |
| `components/DbTableViewer.tsx` | Composant tableau de données |

---

## Architecture — Vue Workspace (`DbWorkspaceView.tsx`)

### Modèle Hub & Spoke

```
Workspace → Hub (page centrale)
            ├── [Carte] Messages
            ├── [Carte] Base de données
            └── [Carte] Équipe & Rôles
```

- Quand on entre dans un workspace, on arrive sur le **Hub**
- Le Hub affiche les cartes des fonctionnalités activées pour l'espace
- Chaque carte navigue vers l'onglet correspondant
- Un bouton ← en haut permet de **revenir au Hub** depuis un onglet

### Système de permissions

```typescript
const isAdmin = authUser?.isAdmin;
const isOwner = isAdmin || (member?.role === "owner" && member?.can_manage_members);

const wsFeaturesMessaging = workspace?.features_messaging !== false;
const wsFeaturesDatabase  = workspace?.features_database !== false;

const canSend   = isAdmin || (wsFeaturesMessaging && member?.can_send_messages);
const canViewDb = isAdmin || (wsFeaturesDatabase  && member?.can_view_database);
const canManage = isAdmin || member?.can_manage_members;
```

**Règle clé** : si un utilisateur n'a aucune permission → Hub affiche "Vous n'avez aucune permission"

### Modale Membres

- Bouton "Membres" dans le header (Hub ET onglets)
- Le bouton "X membres · [rôle]" au centre du Hub est aussi cliquable
- Affiche `user_email` directement depuis `workspace_members` (pas besoin de récupérer tous les users)
- ✅ Fonctionne pour tous les rôles (admin et membres limités)

---

## Rôles & Permissions

| Rôle | can_send_messages | can_view_database | can_manage_members |
|---|---|---|---|
| `owner` | true | true | true |
| `member` | true | true | false |
| Custom | configurable | configurable | configurable |
| Admin système | bypass tout | bypass tout | bypass tout |

---

## DbTableViewer — Composant BDD

**Layout actuel :**
```
┌─────────────────────────────────────────────┐
│ 🔍 Search  │ [table1] [table2] [table3] ... │  ← Top navbar horizontale
├─────────────────────────────────────────────┤
│                                             │
│              Tableau de données             │  ← Full width, scroll horizontal
│                                             │
└─────────────────────────────────────────────┘
```

**Colonnes masquées par défaut :**
`id`, `company_id`, `_record_key`, `_record_idx`, `_table`, `_synced_at`

---

## DbLayout — Navigation mobile

Depuis la mise à jour responsive :
- **Desktop (lg+)** : sidebar gauche fixe avec tous les liens admin
- **Mobile/Tablet** : sidebar cachée → bouton hamburger ☰ dans le header → drawer overlay

---

*Lié à : [[🗄️ Base de données (Supabase)]] · [[👤 Système d'authentification]]*
