# 💡 Idées & prochaines features

> Carnet d'idées pour les prochaines évolutions du projet.

---

## 🚀 Features prioritaires

- [ ] Notifications push / temps-réel pour les nouveaux messages dans les workspaces
- [ ] Avatar / photo de profil pour les membres
- [ ] Filtres et tri dans le DbTableViewer (actuellement lecture seule)
- [ ] Export CSV des tables dans le DB Manager
- [ ] Historique des actions dans un workspace (audit log)

## 🎨 UI/UX

- [ ] Onboarding animé pour les nouveaux membres d'un workspace
- [ ] Page de profil utilisateur (changer mot de passe, email)
- [ ] Tableau de bord (dashboard) pour les stats d'un workspace
- [ ] Mode plein-écran pour le DbTableViewer

## 🔧 Technique

- [ ] Nettoyer les dépendances mortes (voir [[🐛 Bugs connus & dette technique]])
- [ ] Déplacer les appels `supabaseDbAdmin` vers des Edge Functions Supabase
- [ ] Remplir `guidelines/Guidelines.md`
- [ ] Tests E2E (Playwright ou Vitest)

## 💼 Business

- [ ] Intégration paiement (Stripe / virement bancaire) pour les commandes
- [ ] Interface client `MesCommandes.tsx` — suivi en temps réel
- [ ] Système de notifications email pour les nouvelles commandes

---

## ✅ Idées réalisées

- [x] Mobile responsive complet
- [x] Dark mode complet
- [x] DB Manager avec workspaces et permissions
- [x] Messagerie temps-réel
- [x] Pages légales (CGU, Confidentialité, Mentions légales)
- [x] Hub navigation centré (suppression sidebar)
- [x] Modale Membres accessible à tous les rôles

---

*Lié à : [[🐛 Bugs connus & dette technique]] · [[📅 Journal des sessions]]*
