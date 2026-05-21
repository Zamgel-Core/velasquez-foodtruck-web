// 📍 Ruta: src/App.tsx

import React from "react";
import { MotionConfig } from "motion/react";
import OrdersDashboard from "./features/admin/orders/OrdersDashboard";
import ProductsAdminDashboard from "./features/admin/products/ProductsAdminDashboard";
import ProductOptionsDashboard from "./features/admin/product-options/ProductOptionsDashboard";
import AdminPortalHome from "./features/admin/AdminPortalHome";
import { ContactSection } from "./components/ContactSection";
import { FeatureStrip } from "./components/FeatureStrip";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { LegalModal } from "./components/LegalModal";
import { LocationSection } from "./components/LocationSection";
import { MenuSection } from "./components/MenuSection";
import { Navbar } from "./components/Navbar";
import type { Lang, LegalModalType } from "./types";
import { getBusinessStatus } from "./utils/businessStatus";
import { useBusinessSettings } from "./hooks/useBusinessSettings";
import { useCart } from "./hooks/useCart";
import CartDrawer from "./features/cart/components/CartDrawer";
import { ReviewsSection } from "./components/ReviewsSection";
import AdminLoginPage from "./features/admin/auth/AdminLoginPage";
import ProtectedAdminRoute from "./features/admin/auth/ProtectedAdminRoute";
import AdminPOSPage from "./features/admin/pos/AdminPOSPage";
import StaffAdminPage from "./features/admin/staff/StaffAdminPage";
import AdminRegisterPage from "./features/admin/register/AdminRegisterPage";
import AdminReportsPage from "./features/admin/reports/AdminReportsPage";
import OrderStatusPage from "./features/order-status/OrderStatusPage";
import TvMenuPage from "./features/tv-menu/TvMenuPage";
import SocialVideosAdminPage from "./features/admin/social-videos/SocialVideosAdminPage";
import AdminSettingsPage from "./features/admin/settings/AdminSettingsPage";
import InventoryPage from "./features/admin/inventory/InventoryPage";
import { TikTokSection } from "./components/TikTokSection";
import LoyaltyPage from "./features/admin/loyalty/LoyaltyPage";
import LoyaltyClientPage from "./features/loyalty/LoyaltyClientPage";
import KaizenAIPage from "./features/admin/kaizen/KaizenAIPage";

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
      <ProtectedAdminRoute
        allowedRoles={["super_admin", "admin", "employee", "cashier"]}
      >
        <AdminPOSPage />
      </ProtectedAdminRoute>
    );
  }

  if (pathname === "/admin/register") {
    return (
      <ProtectedAdminRoute
        allowedRoles={["super_admin", "admin", "employee", "cashier"]}
      >
        <AdminRegisterPage />
      </ProtectedAdminRoute>
    );
  }

  if (pathname === "/admin/orders") {
    return (
      <ProtectedAdminRoute
        allowedRoles={[
          "super_admin",
          "admin",
          "employee",
          "cashier",
          "kitchen",
        ]}
      >
        <OrdersDashboard />
      </ProtectedAdminRoute>
    );
  }

  if (pathname === "/admin/reports") {
    return (
      <ProtectedAdminRoute allowedRoles={["super_admin", "admin"]}>
        <AdminReportsPage />
      </ProtectedAdminRoute>
    );
  }

  if (pathname === "/admin/product-options") {
    return (
      <ProtectedAdminRoute allowedRoles={["super_admin", "admin"]}>
        <ProductOptionsDashboard />
      </ProtectedAdminRoute>
    );
  }

  if (pathname === "/admin/products") {
    return (
      <ProtectedAdminRoute allowedRoles={["super_admin", "admin"]}>
        <ProductsAdminDashboard />
      </ProtectedAdminRoute>
    );
  }

  if (pathname === "/admin/settings") {
    return (
      <ProtectedAdminRoute allowedRoles={["super_admin", "admin"]}>
        <AdminSettingsPage />
      </ProtectedAdminRoute>
    );
  }

  if (pathname === "/admin/inventory") {
    return (
      <ProtectedAdminRoute allowedRoles={["super_admin", "admin"]}>
        <InventoryPage />
      </ProtectedAdminRoute>
    );
  }

  if (pathname === "/admin/social-videos") {
    return (
      <ProtectedAdminRoute allowedRoles={["super_admin", "admin"]}>
        <SocialVideosAdminPage />
      </ProtectedAdminRoute>
    );
  }

  if (pathname === "/admin/staff") {
    return (
      <ProtectedAdminRoute allowedRoles={["super_admin", "admin"]}>
        <StaffAdminPage />
      </ProtectedAdminRoute>
    );
  }

  if (pathname === "/admin/loyalty") {
    return (
      <ProtectedAdminRoute allowedRoles={["super_admin", "admin"]}>
        <LoyaltyPage />
      </ProtectedAdminRoute>
    );
  }

  if (pathname === "/admin/kaizen") {
    return (
      <ProtectedAdminRoute allowedRoles={["super_admin", "admin"]}>
        <KaizenAIPage />
      </ProtectedAdminRoute>
    );
  }

  if (pathname === "/mi-pedido") {
    return <OrderStatusPage />;
  }

  if (pathname === "/tv-menu") {
    return <TvMenuPage />;
  }

  if (pathname === "/lealtad") {
    return <LoyaltyClientPage />;
  }

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState("Tacos");
  const [legalModal, setLegalModal] = React.useState<LegalModalType>(null);
  const [timeTick, setTimeTick] = React.useState(0);
  const { settings } = useBusinessSettings();

  const [lang, setLang] = React.useState<Lang>(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "es" || saved === "en") return saved;
    if (
      typeof navigator !== "undefined" &&
      navigator.language.startsWith("en")
    ) {
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
    () => getBusinessStatus(lang, settings.business_hours),
    [lang, timeTick, settings.business_hours],
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
    popular: lang === "es" ? "Antojitos Populares" : "Popular Specials",
    proteins: lang === "es" ? "Proteínas disponibles" : "Available proteins",
    ask: lang === "es" ? "Pregunte por disponibilidad" : "Ask for availability",
    reviews:
      lang === "es" ? "Lo que dicen nuestros clientes" : "What customers say",
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
        ? "Al usar este sitio aceptas que los precios, productos, horarios, promociones, tiempos de preparación y disponibilidad pueden cambiar sin previo aviso. Los pedidos están sujetos a confirmación del negocio. Velasquez Food Truck se reserva el derecho de cancelar o ajustar pedidos cuando sea necesario por disponibilidad, errores de captura o situaciones operativas."
        : "By using this site, you agree that prices, products, hours, promotions, preparation times, and availability may change without prior notice. Orders are subject to business confirmation. Velasquez Food Truck reserves the right to cancel or adjust orders when necessary due to availability, entry errors, or operational situations.",
    privacy:
      lang === "es"
        ? "La información proporcionada por el cliente, como nombre, teléfono, detalles del pedido y mensajes, se utiliza únicamente para procesar pedidos, responder solicitudes, dar seguimiento al servicio y mejorar la experiencia del cliente. No vendemos ni compartimos tu información personal con terceros para fines comerciales."
        : "Customer information such as name, phone number, order details, and messages is used only to process orders, respond to requests, provide service updates, and improve the customer experience. We do not sell or share your personal information with third parties for commercial purposes.",
    food:
      lang === "es"
        ? "Nuestros alimentos pueden contener o entrar en contacto con alérgenos como lácteos, gluten, soya, huevo, frutos secos, mariscos u otros ingredientes. Si tienes alergias o restricciones alimenticias, consulta antes de ordenar. El consumo de alimentos es responsabilidad del cliente."
        : "Our food may contain or come into contact with allergens such as dairy, gluten, soy, eggs, nuts, seafood, or other ingredients. If you have allergies or dietary restrictions, please ask before ordering. Food consumption is the customer's responsibility.",
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
          addItem={(item) => {
            if (settings.sound_enabled) {
              const audio = new Audio("/sounds/Add_to_cart.mp3");
              audio.volume = 0.35;
              audio.play().catch(() => {});
            }
            cart.addItem(item);
          }}
        />

        <ReviewsSection lang={lang} title={t.reviews} />
        <LocationSection
          lang={lang}
          title={t.locationTitle}
          settings={settings}
        />
        <ContactSection
          title={t.contactTitle}
          text={t.contactText}
          orderNow={t.orderNow}
          settings={settings}
        />
        {settings.tiktok_feed_enabled && <TikTokSection lang={lang} />}
        <Footer setLegalModal={setLegalModal} t={t} />
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
