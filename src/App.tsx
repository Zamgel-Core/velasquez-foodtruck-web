import React from "react";
import { motion, MotionConfig } from "motion/react";
import {
  MapPin,
  Phone,
  MessageCircle,
  Navigation,
  Menu,
  X,
  Flame,
  Star,
  Clock,
  Utensils,
  Leaf,
  Heart,
} from "lucide-react";

type Lang = "es" | "en";

type MenuItem = {
  name: string;
  enName?: string;
  price?: string;
  image: string;
  desc: string;
  enDesc: string;
};

const phone = "346-401-9676";
const whatsapp =
  "https://wa.me/13464019676?text=Hola%20quiero%20hacer%20un%20pedido";
const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=29.6902256,-95.5582646";
const mapEmbed =
  "https://www.google.com/maps?q=29.6902256,-95.5582646&hl=es&z=15&output=embed";

const categories = [
  "Tacos",
  "Tortas",
  "Burritos",
  "Especialidades",
  "Bebidas",
  "Hot Dogs",
  "Extras",
];

const menuItems: Record<string, MenuItem[]> = {
  Tacos: [
    {
      name: "Regular Tacos",
      price: "$2.00",
      image: "/images/Regular_tacos.jpg",
      desc: "Taco individual a tu elección",
      enDesc: "Individual taco of your choice",
    },
    {
      name: "Mini Tacos",
      price: "$5.00",
      image: "/images/Mini_tacos.jpg",
      desc: "Orden de 4 mini tacos",
      enDesc: "Order of 4 mini tacos",
    },
    {
      name: "Special Tacos",
      price: "$8.00",
      image: "/images/Special_tacos.jpg",
      desc: "Orden de 4 tacos de fajita beef",
      enDesc: "Order of 4 fajita beef tacos",
    },
  ],
  Tortas: [
    {
      name: "Torta Mexicana",
      price: "$9.00",
      image: "/images/Torta_mexicana.jpg",
      desc: "Torta mexicana preparada al momento",
      enDesc: "Mexican torta made to order",
    },
  ],
  Burritos: [
    {
      name: "Burrito",
      price: "$11.00",
      image: "/images/Burrito.jpg",
      desc: "Burrito preparado con tu proteína favorita",
      enDesc: "Burrito made with your favorite protein",
    },
    {
      name: "Burrito Special",
      price: "$13.00",
      image: "/images/Burrito_especial.jpg",
      desc: "Burrito especial con sabor auténtico",
      enDesc: "Special burrito with authentic flavor",
    },
  ],
  Especialidades: [
    {
      name: "Quesadilla",
      price: "$10.00",
      image: "/images/Quesadillas.jpg",
      desc: "Quesadilla caliente hecha al momento",
      enDesc: "Hot quesadilla made to order",
    },
    {
      name: "Sope",
      price: "$11.00",
      image: "/images/Sopes.jpg",
      desc: "Sope tradicional mexicano",
      enDesc: "Traditional Mexican sope",
    },
    {
      name: "Gordita",
      price: "$10.00",
      image: "/images/Gorditas.jpg",
      desc: "Gordita preparada con auténtico sabor",
      enDesc: "Gordita prepared with authentic flavor",
    },
  ],
  Bebidas: [
    {
      name: "Horchata",
      image: "/images/horchata.png",
      desc: "Pregunte por disponibilidad",
      enDesc: "Ask for availability",
    },
    {
      name: "Jamaica",
      image: "/images/jamaica.png",
      desc: "Pregunte por disponibilidad",
      enDesc: "Ask for availability",
    },
    {
      name: "Pepino con Limón",
      enName: "Lime Cucumber",
      image: "/images/pepino-limon.png",
      desc: "Pregunte por disponibilidad",
      enDesc: "Ask for availability",
    },
    {
      name: "Jarritos",
      image: "/images/jarritos.png",
      desc: "Pregunte por disponibilidad",
      enDesc: "Ask for availability",
    },
    {
      name: "Coca-Cola Mexicana",
      enName: "Mexican Coke",
      image: "/images/cocacola-mexicana.png",
      desc: "Pregunte por disponibilidad",
      enDesc: "Ask for availability",
    },
    {
      name: "Coca-Cola en lata",
      enName: "Coke",
      image: "/images/cocacola-lata.png",
      desc: "Pregunte por disponibilidad",
      enDesc: "Ask for availability",
    },
  ],
  "Hot Dogs": [
    {
      name: "Street Hot Dog",
      price: "$12.00",
      image: "/images/Street_hot_dog.jpg",
      desc: "Hot dog estilo callejero",
      enDesc: "Street-style hot dog",
    },
  ],
  Extras: [
    {
      name: "Salchipapas",
      price: "$7.00",
      image: "/images/Salchipapas.jpg",
      desc: "Papas con salchicha estilo snack",
      enDesc: "Fries with sausage snack style",
    },
  ],
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState("Tacos");
  const [legalModal, setLegalModal] = React.useState<
    null | "terms" | "privacy" | "food"
  >(null);

  const [lang, setLang] = React.useState<Lang>(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "es" || saved === "en") return saved;
    if (typeof navigator !== "undefined" && navigator.language.startsWith("en"))
      return "en";
    return "es";
  });

  React.useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  const t = {
    navHome: lang === "es" ? "Inicio" : "Home",
    navMenu: lang === "es" ? "Menú" : "Menu",
    navLocation: lang === "es" ? "Ubicación" : "Location",
    navContact: lang === "es" ? "Contacto" : "Contact",
    orderNow: lang === "es" ? "Ordenar Ahora" : "Order Now",
    call: lang === "es" ? "Llamar" : "Call",
    viewLocation: lang === "es" ? "Ver Ubicación" : "View Location",
    openNow:
      lang === "es" ? "Abierto Ahora en Houston" : "Open Now in Houston",
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
    contactTitle:
      lang === "es" ? "¿Listo para ordenar?" : "Ready to order?",
    contactText:
      lang === "es"
        ? "Llámanos o mándanos mensaje por WhatsApp para hacer tu pedido."
        : "Call us or message us on WhatsApp to place your order.",
    terms: lang === "es" ? "Términos y condiciones" : "Terms & Conditions",
    privacy: lang === "es" ? "Política de privacidad" : "Privacy Policy",
    food: lang === "es" ? "Aviso de alimentos" : "Food Disclaimer",
  };

  const showProteins = ["Tortas", "Burritos", "Especialidades"].includes(
    activeCategory
  );

  const scrollTo = (id: string) => {
    setIsMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
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

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#050505] text-white">
        <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <button onClick={() => scrollTo("home")} className="flex items-center gap-3">
              <img
                src="/images/velasquez-logo.png"
                alt="Velasquez Food Truck"
                className="h-12 w-12 rounded-full object-contain"
              />
              <div className="text-left">
                <p className="text-sm font-black tracking-wide sm:text-base">
                  Velasquez
                </p>
                <p className="text-xs text-orange-400">Food Truck</p>
              </div>
            </button>

            <div className="hidden items-center gap-7 md:flex">
              <button onClick={() => scrollTo("home")} className="hover:text-orange-400">
                {t.navHome}
              </button>
              <button onClick={() => scrollTo("menu")} className="hover:text-orange-400">
                {t.navMenu}
              </button>
              <button onClick={() => scrollTo("location")} className="hover:text-orange-400">
                {t.navLocation}
              </button>
              <button onClick={() => scrollTo("contact")} className="hover:text-orange-400">
                {t.navContact}
              </button>
              <button
                onClick={() => setLang(lang === "es" ? "en" : "es")}
                className="rounded-full border border-orange-500/40 px-3 py-1 text-sm font-bold text-orange-300"
              >
                {lang === "es" ? "EN" : "ES"}
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-xl border border-white/10 p-2 md:hidden"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="border-t border-white/10 bg-black/95 px-5 py-5 md:hidden">
              <div className="flex flex-col gap-4">
                <button onClick={() => scrollTo("home")}>{t.navHome}</button>
                <button onClick={() => scrollTo("menu")}>{t.navMenu}</button>
                <button onClick={() => scrollTo("location")}>{t.navLocation}</button>
                <button onClick={() => scrollTo("contact")}>{t.navContact}</button>
                <button
                  onClick={() => setLang(lang === "es" ? "en" : "es")}
                  className="rounded-full bg-orange-600 px-4 py-2 font-bold"
                >
                  {lang === "es" ? "English" : "Español"}
                </button>
              </div>
            </div>
          )}
        </nav>

        <section
  id="home"
  className="relative flex min-h-[100svh] items-center overflow-hidden bg-black pt-24"
>
          <div
  className="absolute inset-0 bg-cover bg-[65%_center] sm:bg-center md:bg-[center_right]"
  style={{ backgroundImage: "url('/images/food-truck-hero.png')" }}
/>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6"
          >
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-300">
                <Flame size={18} />
                {t.openNow}
              </div>

              <h1 className="max-w-[95vw] text-4xl font-black leading-none tracking-tight min-[380px]:text-5xl sm:text-7xl lg:text-8xl">
                {t.hero1}
                <br />
                <span className="text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.8)]">
                  {t.hero2}
                </span>
                <br />
                {t.hero3}
              </h1>

              <p className="mt-6 max-w-xl text-base text-white/75 sm:text-xl">
                {t.heroText}
              </p>

              <div className="mt-8 flex w-full max-w-[95vw] flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={mapsUrl}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-600 px-6 py-4 font-black shadow-[0_0_25px_rgba(234,88,12,0.45)] transition hover:scale-105"
                >
                  <Navigation size={20} />
                  {t.viewLocation}
                </a>
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-4 font-black transition hover:scale-105 hover:bg-white/15"
                >
                  <Phone size={20} />
                  {t.call}
                </a>
                <a
                  href={whatsapp}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-4 font-black transition hover:scale-105"
                >
                  <MessageCircle size={20} />
                  WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="border-y border-white/10 bg-zinc-950 px-4 py-8">
          <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [Clock, lang === "es" ? "Hecho al Momento" : "Made to Order"],
              [Flame, lang === "es" ? "Auténtico Sabor" : "Authentic Flavor"],
              [Leaf, lang === "es" ? "Ingredientes Frescos" : "Fresh Ingredients"],
              [Heart, lang === "es" ? "Hecho con Pasión" : "Made with Passion"],
            ].map(([Icon, label]: any) => (
              <div
                key={label}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-center"
              >
                <Icon className="mx-auto mb-3 text-orange-500" />
                <p className="font-black">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="menu" className="relative px-4 py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(234,88,12,0.18),transparent_35%)]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="text-4xl font-black uppercase sm:text-6xl">
                {t.menuTitle.split(" ")[0]}{" "}
                <span className="text-orange-500">{t.menuTitle.split(" ")[1]}</span>
              </h2>
              <p className="mt-4 text-white/60">{t.menuSubtitle}</p>

<a
  href={whatsapp}
  target="_blank"
  rel="noopener noreferrer"
  className="mx-auto mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-4 font-black text-white shadow-[0_0_25px_rgba(22,163,74,0.45)] transition hover:scale-105"
>
  <MessageCircle size={20} />
  {lang === "es" ? "Ordena rápido por WhatsApp" : "Order instantly via WhatsApp"}
</a>
            </div>

            <h3 className="mt-14 text-center text-2xl font-black uppercase">
              {t.popular}
            </h3>

            <div className="mx-auto mt-8 grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {menuItems[activeCategory].map((item) => (
                <motion.div
                  key={item.name}
                  whileHover={{ y: -6 }}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-orange-500/60 hover:shadow-[0_0_28px_rgba(234,88,12,0.2)]"
                >
                  <div className="h-44 overflow-hidden rounded-2xl bg-zinc-900 sm:h-48">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-4 p-2 pt-4">
                    <div>
                      <h4 className="text-lg font-black">
                        {lang === "en" && item.enName ? item.enName : item.name}
                      </h4>
                      <p className="mt-2 text-sm text-white/60">
                        {lang === "es" ? item.desc : item.enDesc}
                      </p>
                    </div>
                    {item.price && (
                      <p className="shrink-0 font-black text-orange-500">
                        {item.price}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="scrollbar-hide mx-auto mt-10 flex w-full max-w-full gap-3 overflow-x-auto px-4 pb-2 sm:max-w-4xl sm:justify-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-5 py-3 text-xs font-black uppercase tracking-wider transition ${
                    activeCategory === cat
                      ? "border-orange-500 bg-orange-600 text-white shadow-[0_0_22px_rgba(234,88,12,0.5)]"
                      : "border-white/10 bg-white/[0.04] text-white/70 hover:border-orange-500/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="mt-3 text-center text-xs text-white/40 sm:hidden">
  {lang === "es" ? "Desliza para ver más →" : "Swipe to see more →"}
</div>

            {showProteins && (
              <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center">
                <h4 className="font-black">{t.proteins}</h4>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {[
                    lang === "es" ? "Pollo" : "Chicken",
                    lang === "es" ? "Fajita de res" : "Beef fajita",
                    "Pastor",
                    "Chorizo",
                    "Barbacoa +$2",
                    "Campechano +$2.50",
                  ].map((p) => (
                    <span
                      key={p}
                      className="rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 text-xs font-black text-orange-300"
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm text-white/55">{t.ask}</p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-zinc-950 px-4 py-20">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-black sm:text-5xl">{t.reviews}</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {[
                lang === "es"
                  ? "Personal muy amable, comida rica lo recomiendo al 100%"
                  : "Very friendly staff, delicious food I recommend it 100%",
                lang === "es"
                  ? "Pedí una quesadilla de fajita, estaba muy buena"
                  : "I ordered a fajita quesadilla, it was very good",
              ].map((review) => (
                <div
                  key={review}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left"
                >
                  <div className="mb-4 flex text-orange-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={18} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-white/80">“{review}”</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="location" className="px-4 py-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-4xl font-black sm:text-5xl">{t.locationTitle}</h2>
              <p className="mt-4 text-white/65">Houston, Texas</p>

              <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-black">
                  <Clock className="text-orange-500" /> Hours
                </h3>
                <div className="space-y-2 text-white/70">
                  {(lang === "es"
                    ? [
                        "Domingo: Cerrado",
                        "Lunes: 11:00 a.m. – 10:00 p.m.",
                        "Martes: 11:00 a.m. – 10:00 p.m.",
                        "Miércoles: 11:00 a.m. – 10:00 p.m.",
                        "Jueves: 11:00 a.m. – 10:00 p.m.",
                        "Viernes: 11:00 a.m. – 11:00 p.m.",
                        "Sábado: 11:00 a.m. – 11:00 p.m.",
                      ]
                    : [
                        "Sunday: Closed",
                        "Monday: 11:00 AM – 10:00 PM",
                        "Tuesday: 11:00 AM – 10:00 PM",
                        "Wednesday: 11:00 AM – 10:00 PM",
                        "Thursday: 11:00 AM – 10:00 PM",
                        "Friday: 11:00 AM – 11:00 PM",
                        "Saturday: 11:00 AM – 11:00 PM",
                      ]
                  ).map((h) => (
                    <p key={h}>{h}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">
              <iframe
                src={mapEmbed}
                className="h-[420px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

        <section id="contact" className="px-4 py-20">
          <div className="mx-auto max-w-4xl rounded-[2rem] border border-orange-500/30 bg-gradient-to-br from-orange-600/20 to-red-900/20 p-8 text-center sm:p-12">
            <Utensils className="mx-auto mb-5 text-orange-400" size={42} />
            <h2 className="text-4xl font-black">{t.contactTitle}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/70">{t.contactText}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href={`tel:${phone}`}
                className="rounded-full bg-white px-6 py-4 font-black text-black transition hover:scale-105"
              >
                {phone}
              </a>
              <a
                href={whatsapp}
                target="_blank"
                className="rounded-full bg-green-600 px-6 py-4 font-black transition hover:scale-105"
              >
                {t.orderNow}
              </a>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-white/55">
          <p>© 2026 Velasquez Food Truck. All rights reserved.</p>
          <p className="mt-1">Powered by Zamgel Core</p>
          <div className="mt-5 flex flex-wrap justify-center gap-4">
            <button onClick={() => setLegalModal("terms")}>{t.terms}</button>
            <button onClick={() => setLegalModal("privacy")}>{t.privacy}</button>
            <button onClick={() => setLegalModal("food")}>{t.food}</button>
          </div>
        </footer>

        <a
          href={whatsapp}
          target="_blank"
          className="fixed bottom-5 right-5 z-50 rounded-full bg-green-600 p-4 text-white shadow-[0_0_25px_rgba(22,163,74,0.65)] transition hover:scale-110"
        >
          <MessageCircle />
        </a>

        {legalModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-4">
            <div className="max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-6">
              <h3 className="text-xl font-black">
                {legalModal === "terms"
                  ? t.terms
                  : legalModal === "privacy"
                  ? t.privacy
                  : t.food}
              </h3>
              <p className="mt-4 text-white/70">{legalText[legalModal]}</p>
              <button
                onClick={() => setLegalModal(null)}
                className="mt-6 w-full rounded-full bg-orange-600 px-5 py-3 font-black"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </main>
    </MotionConfig>
  );
}