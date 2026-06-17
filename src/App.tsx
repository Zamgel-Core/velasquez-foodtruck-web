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
import { LoyaltyPromoSection } from "./components/LoyaltyPromoSection";
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
import SurveysAdminPage from "./features/admin/surveys/SurveysAdminPage";
import { SurveySection } from "./components/SurveySection";
import AppUpdateNotice from "./components/AppUpdateNotice";
import AppModePage from "./features/admin/app-mode/AppModePage";

type AdminRouteProps = {
  children: React.ReactNode;
  allowedRoles?: Parameters<typeof ProtectedAdminRoute>[0]["allowedRoles"];
};

function AdminRoute({ children, allowedRoles }: AdminRouteProps) {
  return (
    <ProtectedAdminRoute allowedRoles={allowedRoles}>
      <>
        {children}
        <AppUpdateNotice lang="es" />
      </>
    </ProtectedAdminRoute>
  );
}

export default function App() {
  const pathname = window.location.pathname;

  if (pathname === "/admin/login") {
    return <AdminLoginPage />;
  }

  if (pathname === "/admin") {
    return (
      <AdminRoute>
        <AdminPortalHome />
      </AdminRoute>
    );
  }

  if (pathname === "/admin/pos") {
    return (
      <AdminRoute
        allowedRoles={["super_admin", "admin", "employee", "cashier"]}
      >
        <AdminPOSPage />
      </AdminRoute>
    );
  }

  if (pathname === "/admin/register") {
    return (
      <AdminRoute
        allowedRoles={["super_admin", "admin", "employee", "cashier"]}
      >
        <AdminRegisterPage />
      </AdminRoute>
    );
  }

  if (pathname === "/admin/orders") {
    return (
      <AdminRoute
        allowedRoles={[
          "super_admin",
          "admin",
          "employee",
          "cashier",
          "kitchen",
        ]}
      >
        <OrdersDashboard />
      </AdminRoute>
    );
  }

  if (pathname === "/admin/reports") {
    return (
      <AdminRoute allowedRoles={["super_admin", "admin"]}>
        <AdminReportsPage />
      </AdminRoute>
    );
  }

  if (pathname === "/admin/product-options") {
    return (
      <AdminRoute allowedRoles={["super_admin", "admin"]}>
        <ProductOptionsDashboard />
      </AdminRoute>
    );
  }

  if (pathname === "/admin/products" || pathname === "/admin/menu") {
    return (
      <AdminRoute allowedRoles={["super_admin", "admin"]}>
        <ProductsAdminDashboard />
      </AdminRoute>
    );
  }

  if (pathname === "/admin/settings") {
    return (
      <AdminRoute allowedRoles={["super_admin", "admin"]}>
        <AdminSettingsPage />
      </AdminRoute>
    );
  }

  if (pathname === "/admin/inventory") {
    return (
      <AdminRoute allowedRoles={["super_admin", "admin"]}>
        <InventoryPage />
      </AdminRoute>
    );
  }

  if (pathname === "/admin/social-videos") {
    return (
      <AdminRoute allowedRoles={["super_admin", "admin"]}>
        <SocialVideosAdminPage />
      </AdminRoute>
    );
  }

  if (pathname === "/admin/staff") {
    return (
      <AdminRoute allowedRoles={["super_admin", "admin"]}>
        <StaffAdminPage />
      </AdminRoute>
    );
  }

  if (pathname === "/admin/loyalty") {
    return (
      <AdminRoute allowedRoles={["super_admin", "admin"]}>
        <LoyaltyPage />
      </AdminRoute>
    );
  }

  if (pathname === "/admin/kaizen") {
    return (
      <AdminRoute allowedRoles={["super_admin", "admin"]}>
        <KaizenAIPage />
      </AdminRoute>
    );
  }

  if (pathname === "/admin/surveys") {
    return (
      <AdminRoute allowedRoles={["super_admin", "admin"]}>
        <SurveysAdminPage />
      </AdminRoute>
    );
  }

  if (pathname === "/admin/app-mode") {
    return (
      <AdminRoute allowedRoles={["super_admin", "admin"]}>
        <AppModePage />
      </AdminRoute>
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
    navLoyalty: lang === "es" ? "Lealtad" : "Rewards",
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
    sms: lang === "es" ? "Política de SMS" : "SMS Policy",
    close: lang === "es" ? "Cerrar" : "Close",
  };

  const legalText = {
    terms:
      lang === "es"
        ? `Al utilizar este sitio web y realizar un pedido en Velasquez Food Truck, aceptas los presentes Términos y Condiciones de uso.

• Los precios, promociones, productos, horarios, disponibilidad y tiempos estimados de preparación pueden cambiar sin previo aviso.

• Todos los pedidos están sujetos a confirmación por parte de Velasquez Food Truck y podrán ser modificados o cancelados en caso de falta de disponibilidad, errores de captura, problemas técnicos o situaciones operativas imprevistas.

• Los tiempos de preparación mostrados son aproximados y pueden variar según la demanda del servicio.

• Al proporcionar tu número telefónico durante el proceso de compra, aceptas recibir mensajes SMS relacionados exclusivamente con tu pedido, incluyendo confirmaciones, actualizaciones de estado y notificaciones cuando el pedido esté listo para recoger.

• Velasquez Food Truck no utiliza estos mensajes para campañas publicitarias masivas sin el consentimiento previo del cliente.

• Pueden aplicarse tarifas estándar de mensajería y datos según tu proveedor de telefonía móvil.

• El uso continuo de este sitio implica la aceptación de los presentes Términos y Condiciones.`
        : `By using this website and placing an order with Velasquez Food Truck, you agree to these Terms and Conditions.

• Prices, promotions, products, operating hours, availability, and estimated preparation times may change without prior notice.

• All orders are subject to confirmation by Velasquez Food Truck and may be modified or canceled due to product availability, data entry errors, technical issues, or operational circumstances.

• Preparation times are estimates and may vary depending on demand.

• By providing your phone number during checkout, you consent to receive SMS messages related solely to your order, including confirmations, status updates, and notifications when your order is ready for pickup.

• Velasquez Food Truck does not use these messages for mass marketing campaigns without your prior consent.

• Standard messaging and data rates may apply according to your mobile carrier.

• Continued use of this website constitutes acceptance of these Terms and Conditions.`,
    privacy:
      lang === "es"
        ? `En Velasquez Food Truck valoramos y protegemos la privacidad de nuestros clientes.

La información que recopilamos puede incluir nombre, número telefónico, dirección de correo electrónico cuando aplique, detalles del pedido y cualquier información proporcionada voluntariamente durante el proceso de compra.

Esta información se utiliza exclusivamente para:

• Procesar y administrar pedidos.
• Brindar atención y soporte al cliente.
• Enviar actualizaciones relacionadas con el estado del pedido.
• Notificar cuando un pedido esté listo para recoger.
• Mejorar la experiencia del usuario y la calidad de nuestros servicios.

El número telefónico proporcionado podrá utilizarse para enviar mensajes SMS relacionados únicamente con el servicio solicitado por el cliente.

No utilizamos esta información para enviar publicidad masiva o promociones mediante SMS sin el consentimiento previo del usuario.

Velasquez Food Truck no vende, alquila ni comercializa información personal con terceros. Algunos datos podrán ser procesados por proveedores tecnológicos necesarios para operar la plataforma, siempre bajo medidas razonables de seguridad y confidencialidad.

Al utilizar este sitio web y realizar un pedido, aceptas la presente Política de Privacidad.`
        : `At Velasquez Food Truck, we value and protect our customers' privacy.

The information we collect may include your name, phone number, email address when applicable, order details, and any information voluntarily provided during the ordering process.

This information is used exclusively to:

• Process and manage orders.
• Provide customer support.
• Send updates regarding order status.
• Notify you when your order is ready for pickup.
• Improve the user experience and quality of our services.

Your phone number may be used to send SMS messages related only to the service you requested.

We do not use this information to send mass marketing or promotional SMS messages without your prior consent.

Velasquez Food Truck does not sell, rent, or trade personal information with third parties. Certain data may be processed by trusted technology providers necessary to operate our platform under appropriate security and confidentiality measures.

By using this website and placing an order, you agree to this Privacy Policy.`,
    food:
      lang === "es"
        ? `La seguridad y satisfacción de nuestros clientes es una prioridad para Velasquez Food Truck.

Nuestros alimentos pueden contener o haber estado en contacto con ingredientes considerados alérgenos comunes, incluyendo, entre otros:

• Gluten
• Lácteos
• Huevo
• Soya
• Cacahuates
• Nueces de árbol
• Pescados
• Mariscos
• Ajonjolí o sésamo

Aunque seguimos prácticas adecuadas de manipulación e higiene, nuestros alimentos se preparan en una cocina compartida, por lo que no podemos garantizar la ausencia total de contaminación cruzada.

Si padeces alergias alimentarias, intolerancias o restricciones dietéticas, te recomendamos comunicarte con nuestro personal antes de realizar tu pedido para verificar los ingredientes utilizados.

Velasquez Food Truck no se hace responsable por reacciones alérgicas derivadas de información no proporcionada por el cliente o por contaminación cruzada inherente al proceso de preparación.`
        : `The safety and satisfaction of our customers are a priority at Velasquez Food Truck.

Our food may contain or come into contact with common allergens, including but not limited to:

• Gluten
• Dairy
• Eggs
• Soy
• Peanuts
• Tree nuts
• Fish
• Shellfish
• Sesame

Although we follow proper food handling and sanitation practices, our products are prepared in a shared kitchen environment and we cannot guarantee the complete absence of cross-contact.

If you have food allergies, intolerances, or dietary restrictions, we strongly recommend contacting our staff before placing your order to verify ingredient information.

Velasquez Food Truck is not responsible for allergic reactions resulting from undisclosed customer conditions or cross-contact inherent to the food preparation process.`,
    sms:
      lang === "es"
        ? `Al proporcionar tu número telefónico y realizar un pedido en Velasquez Food Truck, aceptas recibir mensajes de texto SMS relacionados exclusivamente con el servicio solicitado.

Estos mensajes pueden incluir, entre otros:

• Confirmación del pedido.
• Actualizaciones sobre el estado del pedido.
• Notificaciones cuando el pedido esté listo para recoger.
• Información necesaria para completar correctamente el servicio solicitado.

Velasquez Food Truck no utiliza estos mensajes para enviar publicidad masiva o promociones sin el consentimiento previo del cliente.

La frecuencia de los mensajes dependerá de la actividad relacionada con el pedido. Pueden aplicarse tarifas estándar de mensajería y datos según tu proveedor de telefonía móvil.

Si en el futuro se habilitan comunicaciones promocionales mediante SMS, el cliente podrá cancelar su recepción siguiendo las instrucciones proporcionadas en dichos mensajes.

Para cualquier duda relacionada con nuestros servicios o comunicaciones, puedes contactarnos directamente a través de nuestros medios oficiales.`
        : `By providing your phone number and placing an order with Velasquez Food Truck, you consent to receive SMS text messages related solely to the requested service.

These messages may include, but are not limited to:

• Order confirmation.
• Order status updates.
• Notifications when your order is ready for pickup.
• Information necessary to complete your requested service.

Velasquez Food Truck does not use these messages for mass marketing or promotional purposes without the customer's prior consent.

Message frequency will vary depending on your order activity. Standard message and data rates may apply according to your mobile carrier.

If promotional SMS communications are introduced in the future, customers will be able to opt out by following the instructions included in those messages.

For questions regarding our services or communications, please contact us through our official channels.`,
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
        : legalModal === "sms"
          ? t.sms
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

        <LoyaltyPromoSection lang={lang} />
        <SurveySection lang={lang} />
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
