import { Button } from "../components/Button";
import { motion } from "motion/react";
import { Home, ArrowLeft, Search } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl"
      >
        {/* 404 Number */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative mb-8"
        >
          <h1 className="text-[150px] sm:text-[200px] font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-none">
            404
          </h1>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl -z-10"></div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Page introuvable</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Button href="/" size="lg">
            <Home className="w-5 h-5 mr-2" />
            Retour à l'accueil
          </Button>
          <Button href="/documentation" variant="outline" size="lg">
            <Search className="w-5 h-5 mr-2" />
            Documentation
          </Button>
        </motion.div>

        {/* Popular Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16"
        >
          <p className="text-sm text-muted-foreground mb-4">Pages populaires :</p>
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { label: "Offres", href: "/offres" },
              { label: "À propos", href: "/a-propos" },
              { label: "Réalisations", href: "/realisations" },
              { label: "Contact", href: "/contact" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-primary hover:underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
