import { Outlet, useLocation } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useEffect } from "react";
import { trackPageVisit } from "../../lib/supabase";
import { useUIStore } from "../../store/useUIStore";
import { OrderWizard } from "../components/OrderWizard";

export function RootLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { isWizardOpen, selectedOffer, closeWizard } = useUIStore();

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageVisit(location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* 
        The header is fixed (position:fixed).
        Home page manages its own top padding internally (hero is full-bleed dark).
        All other pages need a top offset so content isn't hidden behind the header.
      */}
      <main className={`flex-grow${isHome ? "" : " pt-20"}`}>
        <Outlet />
      </main>
      <Footer />
      {isWizardOpen && (
        <OrderWizard 
          initialOffer={selectedOffer} 
          onClose={closeWizard} 
        />
      )}
    </div>
  );
}
