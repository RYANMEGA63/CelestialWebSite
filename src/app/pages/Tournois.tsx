import { useState } from "react";
import { Button } from "../components/Button";
import { Card, CardHeader, CardContent } from "../components/Card";
import { motion } from "motion/react";
import {
  Trophy,
  Calendar,
  Users,
  MapPin,
  Clock,
  Award,
  Star,
  Medal,
  Target,
  Zap,
} from "lucide-react";

export function Tournois() {
  const [selectedCategory, setSelectedCategory] = useState("upcoming");

  const categories = [
    { id: "upcoming", label: "À venir" },
    { id: "ongoing", label: "En cours" },
    { id: "past", label: "Terminés" },
  ];

  const tournaments = [
    {
      category: "upcoming",
      title: "Hackathon Innovation 2026",
      date: "15-17 Avril 2026",
      location: "Paris, France",
      participants: "200",
      prize: "15 000€",
      description: "48h pour développer des solutions innovantes utilisant l'IA et le cloud computing.",
      status: "Inscriptions ouvertes",
      color: "from-blue-500 to-cyan-500",
      icon: Zap,
    },
    {
      category: "upcoming",
      title: "Code Challenge Printemps",
      date: "5 Mai 2026",
      location: "En ligne",
      participants: "500+",
      prize: "10 000€",
      description: "Compétition de programmation avec des défis algorithmiques de difficulté croissante.",
      status: "Bientôt",
      color: "from-green-500 to-emerald-500",
      icon: Target,
    },
    {
      category: "ongoing",
      title: "Developer League S3",
      date: "1 Mars - 30 Avril 2026",
      location: "En ligne",
      participants: "1000+",
      prize: "25 000€",
      description: "Ligue mensuelle avec classement et défis hebdomadaires pour les développeurs.",
      status: "Inscrivez-vous maintenant",
      color: "from-purple-500 to-pink-500",
      icon: Trophy,
    },
    {
      category: "past",
      title: "Winter Code Jam 2026",
      date: "15-16 Février 2026",
      location: "Lyon, France",
      participants: "150",
      prize: "8 000€",
      description: "Competition de développement web avec focus sur les performances et l'accessibilité.",
      status: "Terminé",
      winner: "Team DevMasters",
      color: "from-indigo-500 to-blue-500",
      icon: Medal,
    },
    {
      category: "past",
      title: "AI Challenge 2025",
      date: "10-12 Décembre 2025",
      location: "En ligne",
      participants: "300+",
      prize: "20 000€",
      description: "Développement de solutions basées sur l'intelligence artificielle et le machine learning.",
      status: "Terminé",
      winner: "AI Innovators",
      color: "from-orange-500 to-red-500",
      icon: Star,
    },
  ];

  const filteredTournaments = tournaments.filter(
    (tournament) => tournament.category === selectedCategory
  );

  const upcomingCount = tournaments.filter((t) => t.category === "upcoming").length;
  const ongoingCount = tournaments.filter((t) => t.category === "ongoing").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-6">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Tournois & Challenges</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Participez à nos compétitions de développement et gagnez des prix exceptionnels
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{upcomingCount}</div>
                <div className="text-sm text-muted-foreground">Tournois à venir</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">{ongoingCount}</div>
                <div className="text-sm text-muted-foreground">En cours</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">60K€</div>
                <div className="text-sm text-muted-foreground">Prix total</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* Tournaments Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {filteredTournaments.map((tournament, index) => (
            <motion.div
              key={tournament.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="h-full">
                <CardHeader>
                  {/* Header Badge */}
                  <div className={`w-full h-40 rounded-lg bg-gradient-to-br ${tournament.color} flex items-center justify-center mb-6 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <tournament.icon className="w-16 h-16 text-white/90 relative z-10" />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                        {tournament.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-3">{tournament.title}</h3>
                  <p className="text-muted-foreground mb-6">{tournament.description}</p>

                  {/* Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{tournament.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{tournament.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{tournament.participants} participants</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Award className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-semibold text-primary">{tournament.prize} en prix</span>
                    </div>
                  </div>

                  {/* Winner (if past tournament) */}
                  {tournament.winner && (
                    <div className="p-4 bg-primary/10 rounded-lg mb-6">
                      <div className="flex items-center gap-2 text-primary">
                        <Trophy className="w-5 h-5" />
                        <span className="font-semibold">Vainqueur: {tournament.winner}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {tournament.category === "upcoming" && (
                    <Button href="/contact" className="w-full">
                      S'inscrire maintenant
                    </Button>
                  )}
                  {tournament.category === "ongoing" && (
                    <Button href="/contact" variant="secondary" className="w-full">
                      Participer
                    </Button>
                  )}
                  {tournament.category === "past" && (
                    <Button href="#" variant="outline" className="w-full">
                      Voir les résultats
                    </Button>
                  )}
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Why Participate Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">
            Pourquoi participer à nos tournois ?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Trophy,
                title: "Prix attractifs",
                description: "Des récompenses financières et matérielles pour les meilleurs participants.",
              },
              {
                icon: Users,
                title: "Networking",
                description: "Rencontrez d'autres développeurs et élargissez votre réseau professionnel.",
              },
              {
                icon: Target,
                title: "Montée en compétences",
                description: "Relevez des défis techniques et améliorez vos compétences de développement.",
              },
              {
                icon: Star,
                title: "Reconnaissance",
                description: "Gagnez en visibilité et construisez votre portfolio avec des projets concrets.",
              },
              {
                icon: Zap,
                title: "Innovation",
                description: "Explorez de nouvelles technologies et développez des solutions créatives.",
              },
              {
                icon: Award,
                title: "Opportunités",
                description: "Des opportunités de carrière et de collaboration avec les sponsors.",
              },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-12">
            <Trophy className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl font-bold mb-4">Prêt à relever le défi ?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Inscrivez-vous à notre newsletter pour être informé des prochains tournois
            </p>
            <Button href="/contact" size="lg">
              Je m'inscris
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
