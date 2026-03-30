import { Outlet, useLocation } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useEffect } from "react";
import { trackPageVisit } from "../../lib/supabase";

export function RootLayout() {
  const location = useLocation();

  useEffect(() => {
    trackPageVisit(location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
