// 📍 Ruta: src/App.tsx

import React from "react";
import { MotionConfig } from "motion/react";
import OrdersDashboard from "./features/admin/orders/OrdersDashboard";
import ProductsAdminDashboard from "./features/admin/products/ProductsAdminDashboard";
import ProductOptionsDashboard from "./features/admin/product-options/ProductOptionsDashboard";
import AdminPortalHome from "./features/admin/AdminPortalHome";
import { ContactSection } from "./components/ContactSection";
import { FeatureStrip } from "./components/FeatureStrip";
import { FloatingWhatsApp } from "./components/FloatingWhatsApp";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { LegalModal } from "./components/LegalModal";
import { LocationSection } from "./components/LocationSection";
import { MenuSection } from "./components/MenuSection";
import { Navbar } from "./components/Navbar";
import type { Lang, LegalModalType } from "./types";
import { getBusinessStatus } from "./utils/businessStatus";
import { useCart } from "./hooks/useCart";
import CartDrawer from "./features/cart/components/CartDrawer";
import { ReviewsSection } from "./components/ReviewsSection";
import AdminLoginPage from "./features/admin/auth/AdminLoginPage";
import ProtectedAdminRoute from "./features/admin/auth/ProtectedAdminRoute";
import AdminPOSPage from "./features/admin/pos/AdminPOSPage";

export default function App() {
  const pathname = window.location.pathname;

if (pathname === "/admin/login") {
  return <AdminLoginPage />;
}

if (pathname === "/admin") {
  return (
    <ProtectedAdminRoute>
      <AdminPortalHome />
    </ProtectedAdminRoute>
  );
}

if (pathname === "/admin/pos") {
  return (
    <ProtectedAdminRoute allowedRoles={["admin", "employee", "cashier"]}>
      <AdminPOSPage />
    </ProtectedAdminRoute>
  );
}

if (pathname === "/admin/orders") {
  return (
    <ProtectedAdminRoute allowedRoles={["admin", "employee", "cashier", "kitchen"]}>
      <OrdersDashboard />
    </ProtectedAdminRoute>
  );
}

if (pathname === "/admin/product-options") {
  return (
    <ProtectedAdminRoute allowedRoles={["admin"]}>
      <ProductOptionsDashboard />
    </ProtectedAdminRoute>
  );
}

if (pathname === "/admin/products") {
  return (
    <ProtectedAdminRoute allowedRoles={["admin"]}>
      <ProductsAdminDashboard />
    </ProtectedAdminRoute>
  );
}

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState("Tacos");
  const [legalModal, setLegalModal] = React.useState<LegalModalType>(null);
  const [timeTick, setTimeTick] = React.useState(0);

  const [lang, setLang] = React.useState<Lang>(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "es" || saved === "en") return saved;
    if (typeof navigator !== "undefined" && navigator.language.startsWith("en")) {
      return "en";
    }
    return "es";
  });

  React.useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeTick((value) => value + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const businessStatus = React.useMemo(
    () => getBusinessStatus(lang),
    [lang, timeTick]
  );

  const cart = useCart();

  const t = {
    navHome: lang === "es" ? "Inicio" : "Home",
    navMenu: lang === "es" ? "Menú" : "Menu",
    navLocation: lang === "es" ? "Ubicación" : "Location",
    navContact: lang === "es" ? "Contacto" : "Contact",
    orderNow: lang === "es" ? "Ordenar Ahora" : "Order Now",
    call: lang === "es" ? "Llamar" : "Call",
    viewLocation: lang === "es" ? "Ver Ubicación" : "View Location",
    openNow: businessStatus.label,
    hero1: lang === "es" ? "LOS MEJORES" : "THE BEST",
    hero2: lang === "es" ? "TACOS" : "TACOS",
    hero3: lang === "es" ? "EN HOUSTON" : "IN HOUSTON",
    heroText:
      lang === "es"
        ? "Sabor auténtico, comida hecha al momento y una experiencia mexicana con fuego."
        : "Authentic flavor, made-to-order food, and a Mexican experience with fire.",
    menuTitle: lang === "es" ? "Nuestro Menú" : "Our Menu",
    menuSubtitle:
      lang === "es"
        ? "Hecho al momento, con el auténtico sabor mexicano"
        : "Made to order, with authentic Mexican flavor",
    popular: lang === "es" ? "Especialidades Populares" : "Popular Specials",
    proteins: lang === "es" ? "Proteínas disponibles" : "Available proteins",
    ask: lang === "es" ? "Pregunte por disponibilidad" : "Ask for availability",
    reviews: lang === "es" ? "Lo que dicen nuestros clientes" : "What customers say",
    locationTitle: lang === "es" ? "Encuéntranos" : "Find Us",
    contactTitle: lang === "es" ? "¿Listo para ordenar?" : "Ready to order?",
    contactText:
      lang === "es"
        ? "Llámanos o mándanos mensaje por WhatsApp para hacer tu pedido."
        : "Call us or message us on WhatsApp to place your order.",
    terms: lang === "es" ? "Términos y condiciones" : "Terms & Conditions",
    privacy: lang === "es" ? "Política de privacidad" : "Privacy Policy",
    food: lang === "es" ? "Aviso de alimentos" : "Food Disclaimer",
    close: lang === "es" ? "Cerrar" : "Close",
  };

  const legalText = {
    terms:
      lang === "es"
        ? "Los precios, disponibilidad de productos, horarios y ubicación pueden cambiar sin previo aviso."
        : "Prices, product availability, hours, and location may change without notice.",
    privacy:
      lang === "es"
        ? "La información del cliente solo se utiliza para responder pedidos, llamadas o mensajes relacionados con el negocio."
        : "Customer information is only used to respond to orders, calls, or business-related messages.",
    food:
      lang === "es"
        ? "Los alimentos pueden contener alérgenos. Si tienes alergias, pregunta antes de ordenar."
        : "Food may contain allergens. If you have allergies, please ask before ordering.",
  };

  const scrollTo = (id: string) => {
    setIsMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const legalModalTitle =
    legalModal === "terms"
      ? t.terms
      : legalModal === "privacy"
        ? t.privacy
        : t.food;

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#050505] text-white">
        <Navbar
          lang={lang}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          setLang={setLang}
          scrollTo={scrollTo}
          t={t}
        />

        <Hero businessStatus={businessStatus} t={t} />
        <FeatureStrip lang={lang} />

        <MenuSection
          lang={lang}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          t={t}
          addItem={cart.addItem}
        />

        <ReviewsSection lang={lang} title={t.reviews} />
        <LocationSection lang={lang} title={t.locationTitle} />
        <ContactSection title={t.contactTitle} text={t.contactText} orderNow={t.orderNow} />
        <Footer setLegalModal={setLegalModal} t={t} />
        <FloatingWhatsApp />

        {legalModal && (
          <LegalModal
            legalModal={legalModal}
            setLegalModal={setLegalModal}
            title={legalModalTitle}
            text={legalText[legalModal]}
            closeLabel={t.close}
          />
        )}

        <CartDrawer
          lang={lang}
          items={cart.items}
          subtotal={cart.subtotal}
          totalItems={cart.totalItems}
          increaseItem={cart.increaseItem}
          decreaseItem={cart.decreaseItem}
          removeItem={cart.removeItem}
          updateItemNotes={cart.updateItemNotes}
          clearCart={cart.clearCart}
        />
      </main>
    </MotionConfig>
  );
}