import { Link } from "react-router";
import { Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

// Social SVG Icons
const SocialIcons: Record<string, React.FC<{ className?: string }>> = {
  facebook: ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  messenger: ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
    </svg>
  ),
  instagram: ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  ),
  linkedin: ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  whatsapp: ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
  x: ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
};

const SOCIAL_KEYS = [
  { key: "social_facebook",  label: "Facebook",    icon: "facebook"  },
  { key: "social_messenger", label: "Messenger",   icon: "messenger" },
  { key: "social_instagram", label: "Instagram",   icon: "instagram" },
  { key: "social_linkedin",  label: "LinkedIn",    icon: "linkedin"  },
  { key: "social_whatsapp",  label: "WhatsApp",    icon: "whatsapp"  },
  { key: "social_x",         label: "X (Twitter)", icon: "x"         },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from("site_settings").select("key, value").then(({ data }) => {
      const map: Record<string, string> = {};
      (data || []).forEach((s: any) => { map[s.key] = s.value; });
      setSettings(map);
    });
  }, []);

  const activeSocials = SOCIAL_KEYS.filter(s => settings[s.key]);

  return (
    <footer className="bg-foreground border-t border-primary-foreground/10 pt-16 sm:pt-24 pb-8 relative overflow-hidden">
      {/* Subtle ambient blue glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(45,125,210,0.06) 0%, transparent 70%)" }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 items-start">

          {/* Brand column */}
          <div className="space-y-8 sm:col-span-2 lg:col-span-1">
            {/* Wordmark — matches Header */}
            <Link to="/" className="inline-block">
              <span
                className="text-primary-foreground/90 hover:text-primary-foreground transition-colors"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.75rem",
                  fontWeight: 400,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                Celestial
              </span>
            </Link>

            <p className="font-body text-sm text-primary-foreground/35 leading-relaxed font-light max-w-xs">
              L'ingénierie logicielle au service des visionnaires algériens. L'excellence comme standard par défaut.
            </p>

            {/* Social links — minimal dots */}
            {activeSocials.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {activeSocials.map(({ key, label, icon }) => {
                  const SocialIcon = SocialIcons[icon];
                  const href = settings[key];
                  const isWhatsApp = key === "social_whatsapp" && !href.startsWith("http");
                  const finalHref = isWhatsApp
                    ? `https://wa.me/${href.replace(/\D/g, "")}`
                    : href;
                  return (
                    <a
                      key={key}
                      href={finalHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 flex items-center justify-center border border-primary-foreground/10 text-primary-foreground/30 hover:border-secondary hover:text-secondary transition-all duration-300"
                      aria-label={label}
                    >
                      <SocialIcon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div>
            <p className="font-body text-[10px] tracking-[0.25em] uppercase text-primary-foreground/25 mb-8">
              Navigation
            </p>
            <ul className="space-y-4">
              {[
                { to: "/",            label: "Accueil"      },
                { to: "/a-propos",    label: "À propos"     },
                { to: "/offres",      label: "Les offres"   },
                { to: "/realisations",label: "Portfolio"    },
              ].map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-3 font-body text-sm text-primary-foreground/35 hover:text-primary-foreground transition-colors duration-200"
                  >
                    <span className="w-0 h-px bg-secondary group-hover:w-4 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="font-body text-[10px] tracking-[0.25em] uppercase text-primary-foreground/25 mb-8">
              Ressources
            </p>
            <ul className="space-y-4">
              {[
                { to: "/documentation", label: "Documentation" },
                { to: "/changelog",     label: "Changelog"     },
                { to: "/contact",       label: "Support élite" },
              ].map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-3 font-body text-sm text-primary-foreground/35 hover:text-primary-foreground transition-colors duration-200"
                  >
                    <span className="w-0 h-px bg-secondary group-hover:w-4 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="font-body text-[10px] tracking-[0.25em] uppercase text-primary-foreground/25 mb-8">
              Contact
            </p>
            <ul className="space-y-5">
              {(settings["contact_address_line1"] || settings["contact_address_line2"]) && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-3.5 h-3.5 text-secondary mt-0.5 shrink-0" strokeWidth={1.5} />
                  <span className="font-body text-sm text-primary-foreground/40 leading-relaxed font-light">
                    {settings["contact_address_line1"]}
                    {settings["contact_address_line2"] && <><br />{settings["contact_address_line2"]}</>}
                  </span>
                </li>
              )}
              {settings["contact_phone_1"] && (
                <li className="flex items-center gap-3">
                  <Phone className="w-3.5 h-3.5 text-secondary shrink-0" strokeWidth={1.5} />
                  <span className="font-body text-sm text-primary-foreground/40">{settings["contact_phone_1"]}</span>
                </li>
              )}
              {settings["contact_email_main"] && (
                <li className="flex items-center gap-3">
                  <Mail className="w-3.5 h-3.5 text-secondary shrink-0" strokeWidth={1.5} />
                  <span className="font-body text-sm text-primary-foreground/40">{settings["contact_email_main"]}</span>
                </li>
              )}
            </ul>

            {/* CTA */}
            <Link
              to="/contact"
              className="mt-8 group inline-flex items-center gap-2 font-body text-[11px] tracking-[0.15em] uppercase text-secondary hover:gap-4 transition-all duration-300"
            >
              Nous contacter
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 sm:mt-24 pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="font-body text-[11px] text-primary-foreground/20 tracking-[0.1em]">
            © {currentYear} Celestial Systems. Tous droits réservés.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { to: "/mentions-legales", label: "Mentions légales"  },
              { to: "/confidentialite",  label: "Confidentialité"   },
              { to: "/cgu",              label: "CGU"               },
            ].map(l => (
              <Link
                key={l.to}
                to={l.to}
                className="font-body text-[10px] tracking-[0.15em] uppercase text-primary-foreground/20 hover:text-primary-foreground/50 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
