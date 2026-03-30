import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { Home } from "./pages/Home";
import { Documentation } from "./pages/Documentation";
import { Changelog } from "./pages/Changelog";
import { Offres } from "./pages/Offres";
import { APropos } from "./pages/APropos";
import { Realisations } from "./pages/Realisations";
import { Contact } from "./pages/Contact";
import { MentionsLegales } from "./pages/MentionsLegales";
import { Confidentialite } from "./pages/Confidentialite";
import { CGU } from "./pages/CGU";
import { NotFound } from "./pages/NotFound";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { Login } from "./pages/admin/Login";
import { Dashboard } from "./pages/admin/Dashboard";

import { AdminDocs } from "./pages/admin/AdminDocs";
import { AdminDocsEditor } from "./pages/admin/AdminDocsEditor";
import { AdminAccueil } from "./pages/admin/AdminAccueil";
import { AdminChangelog } from "./pages/admin/AdminChangelog";
import { AdminOffres } from "./pages/admin/AdminOffres";
import { AdminRealisations } from "./pages/admin/AdminRealisations";
import { AdminAPropos } from "./pages/admin/AdminAPropos";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { AdminLegal } from "./pages/admin/AdminLegal";
import { AdminMessages } from "./pages/admin/AdminMessages";
import { AdminCommandes } from "./pages/admin/AdminCommandes";
import { MesCommandes } from "./pages/MesCommandes";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "documentation", Component: Documentation },
      { path: "changelog", Component: Changelog },
      { path: "offres", Component: Offres },
      { path: "a-propos", Component: APropos },
      { path: "realisations", Component: Realisations },
      { path: "mes-commandes", Component: MesCommandes },
      { path: "contact", Component: Contact },
      { path: "mentions-legales", Component: MentionsLegales },
      { path: "confidentialite", Component: Confidentialite },
      { path: "cgu", Component: CGU },
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "/celestial-cms",
    Component: AdminLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "accueil", Component: AdminAccueil },
      { path: "docs", Component: AdminDocs },
      { path: "docs/:id", Component: AdminDocsEditor },
      { path: "changelog", Component: AdminChangelog },
      { path: "offres", Component: AdminOffres },
      { path: "portfolio", Component: AdminRealisations },
      { path: "apropos", Component: AdminAPropos },
      { path: "settings", Component: AdminSettings },
      { path: "legal", Component: AdminLegal },
      { path: "commandes", Component: AdminCommandes },
      { path: "messages", Component: AdminMessages },
    ]
  },
  { path: "/celestial-cms/login", Component: Login }
]);
