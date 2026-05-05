# 📋 Vue d'ensemble du projet

## Identité

| Champ | Valeur |
|---|---|
| **Nom** | Celestial |
| **Type** | Site vitrine B2B + SaaS DB Manager |
| **Langue** | Français |
| **Marché** | Algérie / B2B |
| **Monnaie** | DZD |
| **Email** | @celestial.dz |

## Description

Celestial est une agence de solutions informatiques proposant :
1. **Un site vitrine public** — présentation des offres, réalisations, équipe, contact
2. **Celestial DB** — une application SaaS de gestion de bases de données multi-comptes avec système de workspaces, rôles et permissions

## Pages publiques

| Route | Page | Description |
|---|---|---|
| `/` | Home | Hero, features, stats, code demo |
| `/offres` | Offres | Pricing Starter / Pro / Enterprise |
| `/a-propos` | À propos | Équipe, valeurs, timeline |
| `/realisations` | Réalisations | Portfolio avec filtres |
| `/documentation` | Documentation | Docs avec sidebar + recherche |
| `/contact` | Contact | Formulaire de contact |
| `/changelog` | Changelog | Historique des versions |
| `/mentions-legales` | Mentions légales | — |
| `/confidentialite` | Confidentialité | — |
| `/cgu` | CGU | — |
| `/mes-commandes` | Mes Commandes | Suivi commandes client |
| `/*` | 404 | Page introuvable |

## Module DB Manager (routes `/celestial-db/*`)

| Route | Description |
|---|---|
| `/celestial-db` | Login |
| `/celestial-db/workspaces` | Liste des workspaces (admin) |
| `/celestial-db/workspace/:id` | Vue workspace — Hub + onglets |
| `/celestial-db/users` | Gestion utilisateurs (admin) |
| `/celestial-db/database` | Explorateur DB admin |

---

*Lié à : [[🏗️ Architecture & Stack]] · [[🔐 Celestial DB — DB Manager]]*
