// Structure de données des pages de documentation
// Une page par carte de l'index

export interface DocPageData {
  id: string;
  category: string;
  title: string;
  description: string;
  time: string;
}

export interface DocSection {
  id: string;
  title: string;
  subsections: {
    id: string;
    title: string;
    content: string;
    image?: { src: string; alt: string; caption?: string };
    video?: { url: string; title: string };
    code?: { language: string; content: string };
  }[];
}

export interface DocPageContent {
  sections: DocSection[];
}

export const docPages: Record<string, DocPageContent> = {
  "quick-start": {
    sections: [
      {
        id: "installation",
        title: "Installation",
        subsections: [
          {
            id: "prerequis",
            title: "Prérequis système",
            content:
              "Avant d'installer Celestial, assurez-vous que votre système répond aux exigences minimales : Node.js 18+, npm 9+ ou pnpm 8+, et une connexion internet stable pour télécharger les dépendances.",
            image: {
              src: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80",
              alt: "Terminal Node.js",
              caption: "Un environnement Node.js propre est indispensable.",
            },
          },
          {
            id: "install-celestial",
            title: "Installer Celestial",
            content:
              "L'installation se fait via le gestionnaire de paquets de votre choix. Celestial est disponible sur npm et fonctionne avec tous les gestionnaires modernes.",
            code: {
              language: "bash",
              content: `# Avec npm\nnpm install @celestial/sdk\n\n# Avec pnpm\npnpm add @celestial/sdk\n\n# Avec yarn\nyarn add @celestial/sdk`,
            },
          },
        ],
      },
      {
        id: "configuration",
        title: "Configuration initiale",
        subsections: [
          {
            id: "env-setup",
            title: "Variables d'environnement",
            content:
              "Créez un fichier `.env` à la racine de votre projet et renseignez les clés nécessaires. Ne commitez jamais ce fichier dans votre dépôt Git.",
            code: {
              language: "bash",
              content: `CELESTIAL_API_KEY=votre_cle_api\nCELESTIAL_ENV=production\nCELESTIAL_ENDPOINT=https://api.celestial.dz`,
            },
          },
          {
            id: "init-sdk",
            title: "Initialiser le SDK",
            content:
              "Une fois les variables d'environnement configurées, initialisez le SDK Celestial dans le point d'entrée de votre application.",
            image: {
              src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
              alt: "Éditeur de code",
              caption: "Initialisez le client une seule fois, au niveau racine.",
            },
          },
        ],
      },
      {
        id: "premier-appel",
        title: "Premier appel API",
        subsections: [
          {
            id: "hello-world",
            title: "Hello Celestial",
            content:
              "Faites votre premier appel à l'API pour vérifier que tout est bien configuré. Cette requête retourne les informations de votre compte et confirme l'authentification.",
            video: {
              url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
              title: "Démo : votre premier appel API Celestial",
            },
          },
        ],
      },
    ],
  },

  "first-steps-api": {
    sections: [
      {
        id: "concepts-api",
        title: "Concepts fondamentaux",
        subsections: [
          {
            id: "rest-intro",
            title: "Qu'est-ce qu'une API REST ?",
            content:
              "L'API Celestial est une API RESTful qui communique via HTTPS. Elle utilise les méthodes HTTP standards (GET, POST, PUT, DELETE) et retourne des données en JSON. Chaque ressource est accessible via une URL unique appelée endpoint.",
            image: {
              src: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
              alt: "Schéma d'architecture REST",
              caption: "Architecture REST : client → requête HTTP → serveur → réponse JSON.",
            },
          },
          {
            id: "base-url",
            title: "URL de base et versioning",
            content:
              "Toutes les requêtes API doivent être faites vers l'URL de base. Le versioning est intégré dans l'URL pour garantir la compatibilité descendante.",
            code: {
              language: "bash",
              content: `# URL de base\nhttps://api.celestial.dz/v1\n\n# Exemples d'endpoints\nhttps://api.celestial.dz/v1/users\nhttps://api.celestial.dz/v1/projects`,
            },
          },
        ],
      },
      {
        id: "auth-basics",
        title: "Authentification de base",
        subsections: [
          {
            id: "api-key",
            title: "Utiliser votre clé API",
            content:
              "Toutes les requêtes doivent inclure votre clé API dans l'en-tête HTTP `Authorization`. La clé est disponible dans votre tableau de bord Celestial sous Paramètres → Clés API.",
            code: {
              language: "javascript",
              content: `const response = await fetch('https://api.celestial.dz/v1/me', {\n  headers: {\n    'Authorization': 'Bearer VOTRE_CLE_API',\n    'Content-Type': 'application/json',\n  }\n});\nconst data = await response.json();`,
            },
          },
        ],
      },
    ],
  },

  "api-reference": {
    sections: [
      {
        id: "endpoints-users",
        title: "Endpoints Utilisateurs",
        subsections: [
          {
            id: "get-user",
            title: "GET /users/{id}",
            content:
              "Récupère les informations d'un utilisateur spécifique à partir de son identifiant unique. Retourne un objet JSON avec l'ensemble des propriétés de l'utilisateur. Nécessite le scope `users:read`.",
            code: {
              language: "javascript",
              content: `// Requête\nGET /v1/users/usr_123abc\n\n// Réponse 200 OK\n{\n  "id": "usr_123abc",\n  "name": "Karim Benali",\n  "email": "k.benali@celestial.dz",\n  "plan": "pro",\n  "created_at": "2025-01-15T10:30:00Z"\n}`,
            },
          },
          {
            id: "list-users",
            title: "GET /users",
            content:
              "Liste tous les utilisateurs de votre organisation avec pagination. Utilisez les paramètres `page` et `limit` pour contrôler les résultats.",
            image: {
              src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
              alt: "Dashboard de gestion des utilisateurs",
              caption: "Visualisez et gérez vos utilisateurs depuis le tableau de bord.",
            },
          },
        ],
      },
      {
        id: "endpoints-projets",
        title: "Endpoints Projets",
        subsections: [
          {
            id: "create-project",
            title: "POST /projects",
            content:
              "Crée un nouveau projet dans votre espace Celestial. Vous devez fournir un nom et optionnellement une description et des métadonnées.",
            code: {
              language: "javascript",
              content: `// Corps de la requête\n{\n  "name": "Mon Projet",\n  "description": "Description du projet",\n  "visibility": "private",\n  "tags": ["web", "react"]\n}\n\n// Réponse 201 Created\n{\n  "id": "proj_xyz789",\n  "name": "Mon Projet",\n  "status": "active"\n}`,
            },
          },
        ],
      },
      {
        id: "gestion-erreurs",
        title: "Gestion des erreurs",
        subsections: [
          {
            id: "codes-erreur",
            title: "Codes d'erreur HTTP",
            content:
              "L'API Celestial utilise les codes HTTP standards. Les erreurs retournent toujours un objet JSON avec un code d'erreur interne et un message explicatif.",
            image: {
              src: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
              alt: "Tableau des codes d'erreur",
              caption: "400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Rate Limited.",
            },
          },
        ],
      },
    ],
  },

  "auth-tokens": {
    sections: [
      {
        id: "oauth2",
        title: "OAuth 2.0",
        subsections: [
          {
            id: "oauth-intro",
            title: "Introduction à OAuth 2.0",
            content:
              "Celestial utilise OAuth 2.0 comme protocole d'autorisation. Ce standard ouvert permet à vos applications d'accéder aux ressources Celestial au nom d'un utilisateur sans jamais manipuler son mot de passe.",
            video: {
              url: "https://www.youtube.com/embed/CPbvxxslDTU",
              title: "Comprendre OAuth 2.0 en 5 minutes",
            },
          },
          {
            id: "authorization-code",
            title: "Flux Authorization Code",
            content:
              "Le flux Authorization Code est recommandé pour les applications web avec un serveur backend. Il est le plus sécurisé car le token d'accès n'est jamais exposé au navigateur.",
            image: {
              src: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80",
              alt: "Schéma du flux OAuth 2.0",
              caption: "Flux Authorization Code : l'utilisateur autorise, le serveur échange le code contre un token.",
            },
          },
        ],
      },
      {
        id: "jwt",
        title: "Tokens JWT",
        subsections: [
          {
            id: "jwt-structure",
            title: "Structure d'un JWT",
            content:
              "Les tokens Celestial sont des JWT signés avec RS256. Ils contiennent trois parties encodées en Base64 : l'en-tête, la charge utile et la signature.",
            code: {
              language: "javascript",
              content: `const [, payload] = token.split('.');\nconst decoded = JSON.parse(atob(payload));\n\n// Payload Celestial\n{\n  "sub": "usr_123abc",\n  "org": "org_xyz",\n  "scope": ["users:read", "projects:write"],\n  "exp": 1735689600\n}`,
            },
          },
        ],
      },
    ],
  },

  "react-integration": {
    sections: [
      {
        id: "setup-react",
        title: "Configuration React",
        subsections: [
          {
            id: "install-react-sdk",
            title: "Installer le SDK React",
            content:
              "Le SDK React Celestial inclut des hooks et des composants prêts à l'emploi. Il est construit sur le SDK JavaScript principal et ajoute une couche d'abstraction adaptée à React.",
            code: {
              language: "bash",
              content: `npm install @celestial/react @celestial/sdk`,
            },
          },
          {
            id: "provider",
            title: "Configurer le CelestialProvider",
            content:
              "Enveloppez votre application avec le `CelestialProvider` pour rendre le client accessible dans tous vos composants via les hooks.",
            image: {
              src: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
              alt: "Architecture React avec Provider",
              caption: "Le Provider rend le client Celestial accessible dans tout l'arbre de composants.",
            },
          },
        ],
      },
      {
        id: "hooks",
        title: "Hooks disponibles",
        subsections: [
          {
            id: "use-celestial",
            title: "useCelestial()",
            content:
              "Le hook principal qui expose le client Celestial configuré. Utilisez-le pour accéder directement aux méthodes du SDK.",
            code: {
              language: "javascript",
              content: `import { useCelestial } from '@celestial/react';\n\nfunction MonComposant() {\n  const celestial = useCelestial();\n\n  const chargerProjets = async () => {\n    const projets = await celestial.projects.list();\n    console.log(projets);\n  };\n\n  return <button onClick={chargerProjets}>Charger</button>;\n}`,
            },
          },
          {
            id: "use-user",
            title: "useUser()",
            content:
              "Retourne l'utilisateur actuellement authentifié ainsi que son état de chargement. Parfait pour conditionner l'affichage selon l'état d'authentification.",
            video: {
              url: "https://www.youtube.com/embed/Ke90Tje7VS0",
              title: "Démo useUser() hook en action",
            },
          },
        ],
      },
    ],
  },

  "production-deploy": {
    sections: [
      {
        id: "checklist-prod",
        title: "Checklist pré-production",
        subsections: [
          {
            id: "env-prod",
            title: "Variables d'environnement de production",
            content:
              "En production, ne stockez jamais vos clés API dans le code source. Utilisez les secrets de votre plateforme (Vercel, Netlify, Railway) ou un gestionnaire de secrets.",
            image: {
              src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&q=80",
              alt: "Dashboard de déploiement",
              caption: "Configurez vos secrets directement dans l'interface de votre hébergeur.",
            },
          },
          {
            id: "rate-limits",
            title: "Limites de taux",
            content:
              "L'API Celestial applique des limites de taux. En plan Pro, vous disposez de 1 000 requêtes/minute. Implémentez un retry avec backoff exponentiel pour gérer les erreurs 429.",
            code: {
              language: "javascript",
              content: `async function fetchWithRetry(fn, maxRetries = 3) {\n  for (let i = 0; i < maxRetries; i++) {\n    try {\n      return await fn();\n    } catch (err) {\n      if (err.status !== 429 || i === maxRetries - 1) throw err;\n      await new Promise(r => setTimeout(r, 1000 * 2 ** i));\n    }\n  }\n}`,
            },
          },
        ],
      },
      {
        id: "monitoring",
        title: "Monitoring et alertes",
        subsections: [
          {
            id: "logs",
            title: "Centraliser les logs",
            content:
              "Celestial émet des événements que vous pouvez intercepter pour les envoyer vers votre système de logs (Datadog, Sentry, LogDNA).",
            video: {
              url: "https://www.youtube.com/embed/ysz5S6PUM-U",
              title: "Configurer le monitoring avec Celestial",
            },
          },
        ],
      },
    ],
  },

  "component-library": {
    sections: [
      {
        id: "overview",
        title: "Vue d'ensemble",
        subsections: [
          {
            id: "intro",
            title: "Présentation de la bibliothèque",
            content:
              "La bibliothèque de composants Celestial propose plus de 50 composants accessibles, entièrement personnalisables via notre design system. Chaque composant respecte les normes WCAG 2.1 AA.",
            image: {
              src: "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=800&q=80",
              alt: "Aperçu de la bibliothèque de composants",
              caption: "Buttons, Cards, Modals, Forms — tout ce qu'il faut pour construire votre UI.",
            },
          },
        ],
      },
      {
        id: "usage",
        title: "Utilisation",
        subsections: [
          {
            id: "import",
            title: "Importer un composant",
            content: "Tous les composants sont exportés depuis le package principal et peuvent être importés individuellement pour optimiser le bundle.",
            code: {
              language: "javascript",
              content: `import { Button, Card, Modal } from '@celestial/ui';\n\nfunction App() {\n  return (\n    <Card>\n      <Button variant="primary">Commencer</Button>\n    </Card>\n  );\n}`,
            },
          },
        ],
      },
    ],
  },

  "theming": {
    sections: [
      {
        id: "design-tokens",
        title: "Design tokens",
        subsections: [
          {
            id: "colors",
            title: "Palette de couleurs",
            content:
              "Le système de thèmes Celestial repose sur des tokens CSS. Chaque couleur est définie comme une variable CSS, ce qui permet de basculer entre les thèmes sans rechargement.",
            code: {
              language: "css",
              content: `:root {\n  --primary: #6366F1;\n  --secondary: #06B6D4;\n  --accent: #8B5CF6;\n  --background: #FAFBFC;\n  --foreground: #0F172A;\n}`,
            },
          },
          {
            id: "dark-mode",
            title: "Mode sombre",
            content: "Le mode sombre est géré automatiquement via la classe `.dark` sur l'élément `<html>`. Tous les tokens ont leur équivalent sombre défini.",
            image: {
              src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
              alt: "Comparaison mode clair et sombre",
              caption: "Chaque token possède sa version sombre — aucune surcharge manuelle nécessaire.",
            },
          },
        ],
      },
    ],
  },

  "data-models": {
    sections: [
      {
        id: "entites",
        title: "Entités principales",
        subsections: [
          {
            id: "user-model",
            title: "Modèle Utilisateur",
            content: "L'entité `User` représente un compte individuel dans Celestial. Elle est liée à une ou plusieurs organisations et possède des préférences et des permissions propres.",
            code: {
              language: "javascript",
              content: `{\n  id: string,           // usr_xxx\n  name: string,\n  email: string,\n  avatar_url?: string,\n  plan: "starter" | "pro" | "enterprise",\n  created_at: ISO8601,\n  orgs: Organisation[]\n}`,
            },
          },
          {
            id: "project-model",
            title: "Modèle Projet",
            content: "Un `Project` regroupe des ressources liées. Il appartient à une organisation et peut avoir plusieurs membres avec des rôles différents.",
            image: {
              src: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&q=80",
              alt: "Diagramme entité-relation",
              caption: "Relation entre Users, Projects et Organisations.",
            },
          },
        ],
      },
    ],
  },

  "queries": {
    sections: [
      {
        id: "filtres",
        title: "Filtres et tri",
        subsections: [
          {
            id: "query-params",
            title: "Paramètres de requête",
            content: "L'API supporte des paramètres de filtrage puissants sur tous les endpoints de liste. Combinez plusieurs filtres pour des requêtes précises.",
            code: {
              language: "bash",
              content: `# Filtrer par statut et trier par date\nGET /v1/projects?status=active&sort=-created_at&limit=20\n\n# Recherche textuelle\nGET /v1/users?search=karim&plan=pro`,
            },
          },
        ],
      },
      {
        id: "optimisation",
        title: "Optimisation",
        subsections: [
          {
            id: "pagination",
            title: "Pagination cursor-based",
            content: "Pour les grandes collections, utilisez la pagination par curseur plutôt que par offset. Elle est plus performante et évite les doublons lors des insertions concurrentes.",
            code: {
              language: "javascript",
              content: `// Première page\nconst page1 = await celestial.projects.list({ limit: 20 });\n\n// Page suivante via curseur\nconst page2 = await celestial.projects.list({\n  limit: 20,\n  after: page1.meta.next_cursor\n});`,
            },
          },
        ],
      },
    ],
  },

  "security-best-practices": {
    sections: [
      {
        id: "secrets",
        title: "Gestion des secrets",
        subsections: [
          {
            id: "ne-jamais-exposer",
            title: "Ne jamais exposer les clés API",
            content: "Une clé API exposée dans le code source est une faille critique. Utilisez des variables d'environnement et activez la rotation automatique des clés dans votre tableau de bord.",
            image: {
              src: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",
              alt: "Sécurité des clés API",
              caption: "Traitez vos clés API comme des mots de passe.",
            },
          },
          {
            id: "rotation",
            title: "Rotation des clés",
            content: "Faites tourner vos clés API régulièrement, au minimum tous les 90 jours. En cas de compromission, révoquez immédiatement la clé depuis votre tableau de bord.",
          },
        ],
      },
      {
        id: "https-cors",
        title: "HTTPS et CORS",
        subsections: [
          {
            id: "hsts",
            title: "Forcer HTTPS avec HSTS",
            content: "Activez HSTS pour empêcher les attaques de downgrade vers HTTP. L'API Celestial n'accepte que les connexions HTTPS.",
            code: {
              language: "javascript",
              content: `app.use((req, res, next) => {\n  res.setHeader(\n    'Strict-Transport-Security',\n    'max-age=31536000; includeSubDomains; preload'\n  );\n  next();\n});`,
            },
          },
        ],
      },
    ],
  },

  "permissions": {
    sections: [
      {
        id: "rbac",
        title: "Contrôle d'accès par rôle (RBAC)",
        subsections: [
          {
            id: "roles",
            title: "Les rôles Celestial",
            content: "Celestial propose quatre rôles prédéfinis : Propriétaire, Administrateur, Membre et Observateur. Chaque rôle définit un ensemble de permissions sur les ressources.",
            image: {
              src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
              alt: "Matrice des permissions par rôle",
              caption: "Chaque rôle cumule les permissions du rôle précédent.",
            },
          },
          {
            id: "scopes",
            title: "Scopes API",
            content: "Lors de la création d'une clé API, sélectionnez uniquement les scopes nécessaires — principe du moindre privilège.",
            code: {
              language: "javascript",
              content: `const SCOPES = [\n  'users:read',\n  'users:write',\n  'projects:read',\n  'projects:write',\n  'admin:all',\n];`,
            },
          },
        ],
      },
    ],
  },
};
