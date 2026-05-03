import React from 'react';
import { motion, MotionConfig } from 'motion/react';
import { MapPin, Phone, MessageCircle, Navigation, Menu, X, Flame, Star, Clock, Utensils, Leaf, Heart } from 'lucide-react';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [lang, setLang] = React.useState<'es' | 'en'>(() => {
    const saved = localStorage.getItem('lang');
    if (saved === 'es' || saved === 'en') return saved;
    if (typeof navigator !== 'undefined' && navigator.language.startsWith('en')) return 'en';
    return 'es';
  });

  React.useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);
  const [activeCategory, setActiveCategory] = React.useState('Tacos');
  const [isTermsOpen, setIsTermsOpen] = React.useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = React.useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = React.useState(false);

  const t = {
    menu: lang === 'es' ? 'Menú' : 'Menu',
    location: lang === 'es' ? 'Ubicación' : 'Location',
    contact: lang === 'es' ? 'Contacto' : 'Contact',
    orderNow: lang === 'es' ? 'Ordenar Ahora' : 'Order Now',
    openNow: lang === 'es' ? 'Abierto Ahora en Houston' : 'Open Now in Houston',
    hero1: lang === 'es' ? 'LOS MEJORES' : 'THE BEST',
    hero2: lang === 'es' ? 'TACOS EN HOUSTON' : 'TACOS IN HOUSTON',
    heroDesc: lang === 'es' 
      ? 'Auténtico sabor mexicano, preparados al momento con ingredientes frescos.' 
      : 'Authentic Mexican flavor, made to order with fresh ingredients.',
    viewLocation: lang === 'es' ? 'Ver Ubicación' : 'View Location',
    call: lang === 'es' ? 'Llamar' : 'Call',
    our: lang === 'es' ? 'Nuestro' : 'Our',
    menuTitle: lang === 'es' ? 'Menú' : 'Menu',
    menuSubtitle: lang === 'es' ? 'Hecho al momento, con el auténtico sabor mexicano' : 'Made to order, with authentic Mexican flavor',
    proteins: lang === 'es' ? 'Proteínas disponibles' : 'Available proteins',
    freshOrder: lang === 'es' ? 'Orden fresca al momento' : 'Made fresh to order',
    whatPeopleSay1: lang === 'es' ? 'Lo que dice la' : 'What',
    whatPeopleSay2: lang === 'es' ? 'Raza' : 'People Say',
    whereToFindUs1: lang === 'es' ? 'Dónde' : 'Where to',
    whereToFindUs2: lang === 'es' ? 'Encontrarnos' : 'Find Us',
    locationDesc: lang === 'es' 
      ? 'Ubicación actual puede variar, te recomendamos revisar el mapa antes de visitarnos o llamarnos directamente.'
      : 'Actual location may vary, we recommend checking the map before visiting or calling us directly.',
    approxRef: 'Houston, Texas',
    scheduleTitle: lang === 'es' ? 'Horarios' : 'Hours',
    schedule: lang === 'es' ? [
      { day: 'Domingo', hours: 'Cerrado' },
      { day: 'Lunes', hours: '11:00 a.m. – 10:00 p.m.' },
      { day: 'Martes', hours: '11:00 a.m. – 10:00 p.m.' },
      { day: 'Miércoles', hours: '11:00 a.m. – 10:00 p.m.' },
      { day: 'Jueves', hours: '11:00 a.m. – 10:00 p.m.' },
      { day: 'Viernes', hours: '11:00 a.m. – 11:00 p.m.' },
      { day: 'Sábado', hours: '11:00 a.m. – 11:00 p.m.' }
    ] : [
      { day: 'Sunday', hours: 'Closed' },
      { day: 'Monday', hours: '11:00 AM – 10:00 PM' },
      { day: 'Tuesday', hours: '11:00 AM – 10:00 PM' },
      { day: 'Wednesday', hours: '11:00 AM – 10:00 PM' },
      { day: 'Thursday', hours: '11:00 AM – 10:00 PM' },
      { day: 'Friday', hours: '11:00 AM – 11:00 PM' },
      { day: 'Saturday', hours: '11:00 AM – 11:00 PM' }
    ],
    howToGet: lang === 'es' ? 'Cómo llegar' : 'How to get there',
    placeOrder1: lang === 'es' ? 'Haz tu' : 'Place your',
    placeOrder2: lang === 'es' ? 'Pedido' : 'Order',
    callUs: lang === 'es' 
      ? 'Llámanos o envíanos un WhatsApp para preparar tu orden antes de que llegues.' 
      : 'Call us or send a WhatsApp to prepare your order before you arrive.',
    callNow: lang === 'es' ? 'Llamar Ahora' : 'Call Now',
    orderWhatsapp: lang === 'es' ? 'Ordenar por WhatsApp' : 'Order on WhatsApp',
    orderFastBtn: lang === 'es' ? 'Ordena rápido por WhatsApp' : 'Order fast on WhatsApp',
  };

  const renderProteins = () => (
    <div className="flex flex-col items-center space-y-3">
      <div className="text-xl text-white font-bold tracking-wide">
        {t.proteins}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {(lang === 'es' ? ['Pollo', 'Fajita de res', 'Pastor', 'Chorizo'] : ['Chicken', 'Beef fajita', 'Pastor', 'Chorizo']).map((p) => (
          <span key={p} className="px-3 py-1 bg-neon-orange/20 text-neon-orange border border-neon-orange/30 rounded-full text-sm font-semibold uppercase tracking-wider shadow-[0_0_10px_rgba(255,95,31,0.2)]">
            {p}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm font-medium">
        <div className="flex items-center space-x-1">
          <span className="text-gray-400 uppercase tracking-widest text-xs">Extras:</span>
        </div>
        <div className="flex space-x-3">
          <span className="text-white bg-white/10 px-3 py-1 rounded-md border border-white/20">Barbacoa <span className="text-neon-red font-bold">+$2</span></span>
          <span className="text-white bg-white/10 px-3 py-1 rounded-md border border-white/20">Campechano <span className="text-neon-red font-bold">+$2.50</span></span>
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-2 opacity-80">
        {lang === 'es' ? 'Pregunte por disponibilidad' : 'Ask for availability'}
      </div>
    </div>
  );

  const menuItems = [
    {
      id: 'Tacos',
      category: 'TACOS',
      isHero: true,
      description: renderProteins(),
      items: [
        { name: 'Regular Tacos', price: '$2.00', image: '/images/Regular_tacos.jpg', desc: lang === 'es' ? 'Taco individual a tu elección' : 'Individual taco of your choice' },
        { name: 'Mini Tacos', price: '$5.00', image: '/images/Mini_tacos.jpg', desc: lang === 'es' ? 'Orden de 4 mini tacos' : 'Order of 4 mini tacos' },
        { name: 'Special Tacos', price: '$8.00', image: '/images/Special_tacos.jpg', desc: lang === 'es' ? 'Orden de 4 tacos de fajita beef' : 'Order of 4 fajita beef tacos' },
      ]
    },
    {
      id: 'Tortas',
      category: 'TORTAS',
      description: renderProteins(),
      items: [
        { name: 'Torta Mexicana', price: '$9.00', image: '/images/Torta_mexicana.jpg' }
      ]
    },
    {
      id: 'Burritos',
      category: 'BURRITOS',
      description: renderProteins(),
      items: [
        { name: 'Burrito', price: '$11.00', image: '/images/Burrito.jpg' },
        { name: 'Burrito Special', price: '$13.00', image: '/images/Burrito_especial.jpg' }
      ]
    },
    {
      id: 'Especialidades',
      category: lang === 'es' ? 'ESPECIALIDADES' : 'SPECIALTIES',
      description: renderProteins(),
      items: [
        { name: 'Quesadilla', price: '$10.00', image: '/images/Quesadillas.jpg' },
        { name: 'Sope', price: '$11.00', image: '/images/Sopes.jpg' },
        { name: 'Gordita', price: '$10.00', image: '/images/Gorditas.jpg' },
      ]
    },
    {
      id: 'Bebidas',
      category: lang === 'es' ? 'BEBIDAS' : 'DRINKS',
      items: [
        { name: 'Horchata', price: '', image: '/images/horchata.png', desc: lang === 'es' ? 'Pregunte por disponibilidad' : 'Ask for availability' },
        { name: 'Jamaica', price: '', image: '/images/jamaica.png', desc: lang === 'es' ? 'Pregunte por disponibilidad' : 'Ask for availability' },
        { name: 'Pepino con Limón', price: '', image: '/images/pepino-limon.png', desc: lang === 'es' ? 'Pregunte por disponibilidad' : 'Ask for availability' },
        { name: 'Jarritos', price: '', image: '/images/jarritos.png', desc: lang === 'es' ? 'Pregunte por disponibilidad' : 'Ask for availability' },
        { name: lang === 'es' ? 'Coca-Cola Mexicana' : 'Mexican Coke', price: '', image: '/images/cocacola-mexicana.png', desc: lang === 'es' ? 'Pregunte por disponibilidad' : 'Ask for availability' },
        { name: lang === 'es' ? 'Coca-Cola en lata' : 'Coke', price: '', image: '/images/cocacola-lata.png', desc: lang === 'es' ? 'Pregunte por disponibilidad' : 'Ask for availability' }
      ]
    },
    {
      id: 'HotDogs',
      category: 'HOT DOGS',
      items: [
        { name: 'Street Hot Dog', price: '$12.00', image: '/images/Street_hot_dog.jpg' }
      ]
    },
    {
      id: 'Extras',
      category: 'EXTRAS',
      items: [
        { name: 'Salchipapas', price: '$7.00', image: '/images/Salchipapas.jpg' }
      ]
    }
  ];

  const mapUrl = "https://www.google.com/maps?q=29.6902256,-95.5582646&hl=es&z=15&output=embed";

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-dark-bg text-gray-200 font-sans selection:bg-neon-orange selection:text-white">
        
        {/* Navbar */}
      <nav className="absolute w-full z-50 top-0 left-0 pt-6 pb-6 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 flex flex-wrap md:flex-nowrap justify-between items-start pointer-events-auto">
          <div className="z-50 shrink-0 relative mt-2 md:-mt-4">
            <img src="/images/velasquez-logo.png" alt="Velasquez Food Truck" className="h-28 md:h-48 w-auto drop-shadow-[0_0_25px_rgba(255,95,31,0.6)] transform origin-top-left" />
          </div>
          
          <div className="hidden md:flex space-x-10 mt-4 bg-black/40 px-8 py-3 rounded-full backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
            <a href="#" className="text-sm font-bold uppercase tracking-widest text-[#FF4500] transition-colors">{lang === 'es' ? 'Inicio' : 'Home'}</a>
            <a href="#menu" className="text-sm font-bold uppercase tracking-widest text-white hover:text-neon-orange transition-colors">{t.menu}</a>
            <a href="#location" className="text-sm font-bold uppercase tracking-widest text-white hover:text-neon-orange transition-colors">{t.location}</a>
            <a href="#contact" className="text-sm font-bold uppercase tracking-widest text-white hover:text-neon-orange transition-colors">{t.contact}</a>
          </div>

          <div className="hidden md:flex items-center space-x-4 mt-4">
            <div className="flex bg-black/40 rounded-full p-1 border border-white/10 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
              <button 
                onClick={() => setLang('es')} 
                className={`px-3 py-1 text-[10px] sm:text-xs font-bold rounded-full transition-all duration-300 ${lang === 'es' ? 'bg-neon-orange text-white shadow-[0_0_15px_rgba(255,95,31,0.4)]' : 'text-gray-400 hover:text-white'}`}
              >
                ES
              </button>
              <button 
                onClick={() => setLang('en')} 
                className={`px-3 py-1 text-[10px] sm:text-xs font-bold rounded-full transition-all duration-300 ${lang === 'en' ? 'bg-neon-orange text-white shadow-[0_0_15px_rgba(255,95,31,0.4)]' : 'text-gray-400 hover:text-white'}`}
              >
                EN
              </button>
            </div>
            <a href="tel:+13464019676" className="flex items-center space-x-2 bg-[#FF4500] text-white px-5 py-2.5 rounded-full hover:bg-[#FF3000] hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,69,0,0.4)] hover:shadow-[0_0_30px_rgba(255,69,0,0.6)]">
              <Phone size={16} />
              <span className="font-display font-bold tracking-widest text-sm">346-401-9676</span>
            </a>
          </div>

          <div className="md:hidden flex flex-col items-end space-y-4 absolute top-6 right-4 z-50">
            <a href="tel:+13464019676" className="flex items-center space-x-2 bg-[#FF4500] text-white px-4 py-2 rounded-full shadow-[0_0_15px_rgba(255,69,0,0.5)]">
              <Phone size={14} />
              <span className="font-display font-bold tracking-widest text-xs">346-401-9676</span>
            </a>
            <div className="flex items-center space-x-4">
              <div className="flex bg-black/80 rounded-full p-1 border border-white/20 backdrop-blur-md">
                <button 
                  onClick={() => setLang('es')} 
                  className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${lang === 'es' ? 'bg-neon-orange text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                >
                  ES
                </button>
                <button 
                  onClick={() => setLang('en')} 
                  className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${lang === 'en' ? 'bg-neon-orange text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                >
                  EN
                </button>
              </div>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white hover:text-neon-orange bg-black/80 p-2 rounded-full border border-white/20 backdrop-blur-md">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-dark-bg border-b border-white/10 px-4 pt-24 pb-6 space-y-4 shadow-2xl absolute w-full top-0 left-0 z-40"
          >
            <a href="#" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-white hover:text-neon-orange">{lang === 'es' ? 'Inicio' : 'Home'}</a>
            <a href="#menu" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-white hover:text-neon-orange">{t.menu}</a>
            <a href="#location" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-white hover:text-neon-orange">{t.location}</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-white hover:text-neon-orange">{t.contact}</a>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 overflow-hidden min-h-[100vh] flex items-center">
        {/* Background images with overlay */}
        <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
          <div className="absolute right-0 top-0 w-full lg:w-[80%] h-full">
            {/* Text readability gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-10 w-full lg:hidden"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent z-10 hidden lg:block"></div>
            {/* Soft outer glow overlay to blend the edge */}
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 hidden lg:block"></div>
            
            <div className="absolute inset-0 bg-black/10 z-10"></div>
            {/* Vertical gradient to blend with the next section */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10"></div>
            <img 
              src="/images/food-truck-hero.png" 
              alt="Velasquez Food Truck at night" 
              className="w-full h-full object-cover object-center filter contrast-[1.1] brightness-[1.15]"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 relative z-20 w-full">
          <div className="flex justify-start items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-[650px] text-left"
            >
              <h1 className="font-display flex flex-col uppercase leading-[0.85] mb-8 drop-shadow-2xl">
                <span className="text-white text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight pl-2">LOS MEJORES</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#FF5F1F] to-[#CC2014] text-8xl sm:text-9xl lg:text-[160px] lg:leading-[0.8] font-black tracking-tighter drop-shadow-[0_4px_10px_rgba(255,69,0,0.8)]" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.1)' }}>
                  TACOS
                </span>
                <span className="text-white text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight pl-2">EN HOUSTON</span>
              </h1>
              
              <p className="text-xl sm:text-[22px] text-white mb-10 max-w-[500px] font-medium drop-shadow-xl leading-relaxed pl-2 bg-black/30 lg:bg-transparent p-4 lg:p-0 rounded-xl">
                {lang === 'es' ? 'Auténtico sabor mexicano, preparados al momento con ingredientes frescos.' : 'Authentic Mexican flavor, made to order with fresh ingredients.'}
              </p>

              <div className="flex flex-wrap gap-4 pl-2">
                <a href="#location" className="flex items-center justify-center space-x-2 bg-neon-orange text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#FF3000] hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,95,31,0.4)] hover:shadow-[0_0_30px_rgba(255,95,31,0.6)]">
                  <MapPin size={18} />
                  <span>{t.viewLocation}</span>
                </a>
                <a href="tel:+13464019676" className="flex items-center justify-center space-x-2 bg-black/40 backdrop-blur-md border border-white/20 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-white/10 hover:border-white/40 hover:scale-105 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  <Phone size={18} />
                  <span>{t.call}</span>
                </a>
                <a href="https://wa.me/13464019676?text=Hola%20quiero%20hacer%20un%20pedido" target="_blank" rel="noreferrer" className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-[#25D366] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#1EBE5D] hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:shadow-[0_0_35px_rgba(37,211,102,0.7)] group">
                  <MessageCircle size={18} className="group-hover:animate-pulse" />
                  <span>{t.orderNow}</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-12 bg-gradient-to-b from-dark-bg to-dark-bg/95 relative z-20">
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-orange/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center p-4 hover:-translate-y-1 transition-transform"
            >
              <div className="w-12 h-12 bg-white/5 rounded-full flex justify-center items-center mb-4 border border-white/10 text-neon-orange shadow-[0_0_15px_rgba(255,95,31,0.15)]">
                <Clock size={24} />
              </div>
              <h4 className="font-bold text-white uppercase tracking-wider text-sm mb-1">{lang === 'es' ? 'Hecho al Momento' : 'Made to Order'}</h4>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center p-4 hover:-translate-y-1 transition-transform"
            >
              <div className="w-12 h-12 bg-white/5 rounded-full flex justify-center items-center mb-4 border border-white/10 text-neon-red shadow-[0_0_15px_rgba(255,16,31,0.15)]">
                <Utensils size={24} />
              </div>
              <h4 className="font-bold text-white uppercase tracking-wider text-sm mb-1">{lang === 'es' ? 'Auténtico Sabor' : 'Authentic Flavor'}</h4>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center p-4 hover:-translate-y-1 transition-transform"
            >
              <div className="w-12 h-12 bg-white/5 rounded-full flex justify-center items-center mb-4 border border-white/10 text-[#25D366] shadow-[0_0_15px_rgba(37,211,102,0.15)]">
                <Leaf size={24} />
              </div>
              <h4 className="font-bold text-white uppercase tracking-wider text-sm mb-1">{lang === 'es' ? 'Ingredientes Frescos' : 'Fresh Ingredients'}</h4>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center p-4 hover:-translate-y-1 transition-transform"
            >
              <div className="w-12 h-12 bg-white/5 rounded-full flex justify-center items-center mb-4 border border-white/10 text-neon-orange shadow-[0_0_15px_rgba(255,95,31,0.15)]">
                <Heart size={24} />
              </div>
              <h4 className="font-bold text-white uppercase tracking-wider text-sm mb-1">{lang === 'es' ? 'Hecho con Pasión' : 'Made with Passion'}</h4>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-24 relative motion-reduce:transition-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-red/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-1/2 h-[500px] bg-neon-red/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-[500px] bg-neon-orange/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-16 text-center">
            <h2 className="font-display text-5xl sm:text-7xl font-bold uppercase text-white mb-4 drop-shadow-[0_0_15px_rgba(255,16,31,0.5)]">{t.our} <span className="text-neon-orange">{t.menuTitle}</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t.menuSubtitle}</p>
          </div>

          <div className="mb-16">
            <h3 className="text-center font-display text-3xl sm:text-4xl font-bold uppercase text-white mb-8 drop-shadow-[0_0_10px_rgba(255,95,31,0.5)]">
              {lang === 'es' ? 'Especialidades Populares' : 'Popular Specialties'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
              {[
                { name: 'Regular Tacos', price: '$2.00', image: '/images/Regular_tacos.jpg', desc: lang === 'es' ? 'Taco individual a tu elección' : 'Individual taco of your choice' },
                { name: 'Mini Tacos', price: '$5.00', image: '/images/Mini_tacos.jpg', desc: lang === 'es' ? 'Orden de 4 mini tacos' : 'Order of 4 mini tacos' },
                { name: 'Special Tacos', price: '$8.00', image: '/images/Special_tacos.jpg', desc: lang === 'es' ? 'Orden de 4 tacos de fajita beef' : 'Order of 4 fajita beef tacos' },
                { name: 'Burrito Special', price: '$13.00', image: '/images/Burrito_especial.jpg' },
                { name: 'Street Hot Dog', price: '$12.00', image: '/images/Street_hot_dog.jpg' },
                { name: 'Salchipapas', price: '$7.00', image: '/images/Salchipapas.jpg' }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                  className="group flex flex-col h-full p-5 rounded-3xl bg-gradient-to-b from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5 border border-white/10 hover:border-neon-orange/80 transition-all duration-400 ease-out hover:-translate-y-1.5 cursor-pointer shadow-lg hover:shadow-[0_10px_30px_rgba(255,95,31,0.3)]"
                >
                  <div className="relative w-full aspect-[4/3] mb-5 rounded-2xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.6)] flex-shrink-0 group-hover:shadow-[0_12px_25px_rgba(255,95,31,0.2)] transition-shadow duration-500">
                    <div className="absolute inset-0 bg-[#0a0a0a]/30 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out contrast-[1.05] saturate-[1.05]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-grow flex flex-col w-full">
                     <div className="flex justify-between items-start mb-3 w-full">
                       <h4 className="text-2xl font-bold text-white group-hover:text-neon-orange transition-colors pr-4 leading-tight duration-300">{item.name}</h4>
                       <div className="font-display font-bold whitespace-nowrap text-2xl text-neon-orange drop-shadow-md">{item.price}</div>
                     </div>
                    {item.desc && (
                       <p className="text-gray-400 text-sm mt-auto font-medium">{item.desc}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mb-12 flex overflow-x-auto justify-start md:justify-center gap-3 sm:gap-4 pb-4 px-2 snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style dangerouslySetInnerHTML={{__html: `div::-webkit-scrollbar { display: none; }`}} />
            {menuItems.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`whitespace-nowrap flex-shrink-0 snap-center px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold uppercase tracking-widest text-xs sm:text-sm transition-all duration-300 ${
                  activeCategory === category.id 
                    ? 'bg-neon-orange text-white shadow-[0_0_20px_rgba(255,95,31,0.5)] scale-105' 
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white hover:scale-105'
                }`}
              >
                {category.category}
              </button>
            ))}
          </div>

          <div className="min-h-[500px]">
            {menuItems.map((category) => (
              activeCategory === category.id && (
                <motion.div 
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  {category.description && (
                    <div className="flex flex-col items-center mb-12">
                      <div className="text-center text-gray-300 max-w-xl mx-auto font-medium bg-white/5 py-6 px-8 rounded-3xl border border-white/10 w-full shadow-lg">
                        {category.description}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
                    {category.items.map((item, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                        className="group flex flex-col h-full p-5 rounded-3xl bg-gradient-to-b from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5 border border-white/10 hover:border-neon-orange/80 transition-all duration-400 ease-out hover:-translate-y-1.5 cursor-pointer shadow-lg hover:shadow-[0_10px_30px_rgba(255,95,31,0.3)]"
                      >
                        <div className="relative w-full aspect-[4/3] mb-5 rounded-2xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.6)] flex-shrink-0 group-hover:shadow-[0_12px_25px_rgba(255,95,31,0.2)] transition-shadow duration-500">
                          <div className="absolute inset-0 bg-[#0a0a0a]/30 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out contrast-[1.05] saturate-[1.05]"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-grow flex flex-col w-full">
                           <div className="flex justify-between items-start mb-3 w-full">
                             <h4 className="text-2xl font-bold text-white group-hover:text-neon-orange transition-colors pr-4 leading-tight duration-300">{item.name}</h4>
                             <div className="font-display font-bold whitespace-nowrap text-2xl text-neon-orange drop-shadow-md">{item.price}</div>
                           </div>
                          {item.desc && (
                             <p className="text-gray-400 text-sm mt-auto font-medium">{item.desc}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 relative bg-black">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-orange/20 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg to-black opacity-80 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase text-white mb-4">{t.whatPeopleSay1} <span className="text-neon-red">{t.whatPeopleSay2}</span></h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 p-8 rounded-3xl relative backdrop-blur-sm shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            >
              <div className="flex text-neon-orange mb-4 space-x-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
              </div>
              <p className="text-xl text-gray-300 italic mb-6">"{lang === 'es' ? 'Personal muy amable, comida rica lo recomiendo al 100%' : 'Very friendly staff, delicious food I recommend it 100%'}"</p>
              <div className="font-bold text-white uppercase tracking-wider text-sm">- {lang === 'es' ? 'Cliente Feliz' : 'Happy Customer'}</div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 p-8 rounded-3xl relative backdrop-blur-sm shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            >
              <div className="flex text-neon-orange mb-4 space-x-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
              </div>
              <p className="text-xl text-gray-300 italic mb-6">"{lang === 'es' ? 'Pedí una quesadilla de fajita, estaba muy buena' : 'I ordered a fajita quesadilla, it was very good'}"</p>
              <div className="font-bold text-white uppercase tracking-wider text-sm">- {lang === 'es' ? 'Cliente Satisfecho' : 'Satisfied Customer'}</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-24 bg-black/50 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-orange/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase text-white mb-6">
                {t.whereToFindUs1} <span className="text-neon-red">{t.whereToFindUs2}</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 border-l-4 border-neon-orange pl-4">
                {t.locationDesc}
              </p>
              
              <div className="bg-dark-bg/80 border border-neon-orange/20 p-6 rounded-2xl mb-8 shadow-[0_0_30px_rgba(255,95,31,0.1)]">
                <div className="flex items-start space-x-4 mb-4">
                  <MapPin className="text-neon-orange flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-white text-lg">Velasquez Food Truck</h4>
                    <p className="text-gray-400">{t.approxRef}</p>
                  </div>
                </div>
                <div className="bg-white/5 h-px w-full my-4"></div>
                <div className="flex items-start space-x-4">
                  <Flame className="text-neon-red flex-shrink-0 mt-1" />
                  <div className="w-full">
                    <h4 className="font-bold text-white text-lg mb-2">{t.scheduleTitle}</h4>
                    <div className="space-y-1">
                      {t.schedule.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-400">{item.day}</span>
                          <span className="text-white">{item.hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

               <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center space-x-2 bg-white/5 border border-white/20 text-white px-6 py-3 rounded-full hover:bg-white/10 transition-colors">
                  <Navigation size={18} className="text-neon-orange" />
                  <span className="font-bold uppercase tracking-wider text-sm">{t.howToGet}</span>
              </a>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(255,16,31,0.15)] group"
            >
              <div className="absolute inset-0 bg-neon-orange/20 mix-blend-overlay z-10 pointer-events-none group-hover:opacity-0 transition-opacity duration-700"></div>
              <iframe 
                src={mapUrl}
                width="100%" 
                height="100%" 
                style={{border:0}} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="filter grayscale-[0.8] contrast-[1.2] invert-[0.9] hue-rotate-[180deg] group-hover:filter-none transition-all duration-700 absolute inset-0 z-0"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-orange/20 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-orange/5 blur-[150px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
           >
            <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase text-white mb-6">
              {t.placeOrder1} <span className="text-neon-orange">{t.placeOrder2}</span>
            </h2>
            <p className="text-xl text-gray-400 mb-12">{t.callUs}</p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <a href="tel:+13464019676" className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-neon-red/10 border border-neon-red/30 text-white px-10 py-5 rounded-2xl hover:bg-neon-red hover:text-white transition-all shadow-[0_0_15px_rgba(255,16,31,0.1)] hover:shadow-[0_0_25px_rgba(255,16,31,0.5)] group/btn">
                <Phone className="text-neon-red group-hover/btn:text-white transition-colors" size={24} />
                <div className="text-left">
                  <div className="text-xs uppercase tracking-widest opacity-80">{t.callNow}</div>
                  <div className="font-display font-bold text-xl">(346) 401-9676</div>
                </div>
              </a>

              <a href="https://wa.me/13464019676?text=Hola%20quiero%20hacer%20un%20pedido" target="_blank" rel="noreferrer" className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-[#25D366]/10 border border-[#25D366]/50 text-white px-10 py-5 rounded-full hover:bg-[#25D366] hover:text-white transition-all shadow-[0_0_15px_rgba(37,211,102,0.2)] hover:shadow-[0_0_30px_rgba(37,211,102,0.6)] group/btn">
                <svg viewBox="0 0 24 24" fill="currentColor" className="text-[#25D366] group-hover/btn:text-white transition-colors w-7 h-7" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs uppercase tracking-widest opacity-80">WhatsApp</div>
                  <div className="font-display font-bold text-xl">{t.orderWhatsapp}</div>
                </div>
              </a>
            </div>
           </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black mt-auto">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex items-center space-x-2">
              <img src="/images/velasquez-logo.png" alt="Velasquez Food Truck" className="h-16 w-auto drop-shadow-[0_0_15px_rgba(255,95,31,0.4)]" />
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 md:space-x-8 text-sm font-semibold uppercase tracking-widest text-gray-500">
              <button onClick={() => setIsTermsOpen(true)} className="hover:text-neon-orange transition-colors">{lang === 'es' ? 'Términos y condiciones' : 'Terms & Conditions'}</button>
              <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-neon-orange transition-colors">{lang === 'es' ? 'Política de privacidad' : 'Privacy Policy'}</button>
              <button onClick={() => setIsDisclaimerOpen(true)} className="hover:text-neon-orange transition-colors">{lang === 'es' ? 'Aviso de alimentos' : 'Food Disclaimer'}</button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/5">
            <div className="text-gray-600 text-xs sm:text-sm">
              © 2026 Velasquez Food Truck. All rights reserved.
            </div>
            <div className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#FF4500]">
              Powered by Zamgel Core
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <a 
          href="https://wa.me/13464019676?text=Hola%20quiero%20hacer%20un%20pedido" 
          target="_blank" 
          rel="noreferrer"
          className="relative flex items-center justify-center w-16 h-16 bg-[#25D366] text-white rounded-full shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:shadow-[0_0_30px_rgba(37,211,102,0.6)] transition-all transform hover:scale-110"
        >
          <div className="absolute inset-0 rounded-full border-4 border-[#25D366] opacity-30 animate-ping"></div>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 relative z-10" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
        <div className="absolute bottom-full right-0 mb-4 whitespace-nowrap bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform translate-y-2 group-hover:translate-y-0 shadow-lg border border-white/10">
          {t.orderFastBtn}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-black border-r border-b border-white/10 transform rotate-45"></div>
        </div>
      </div>

      {/* Modals */}
      {isTermsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8 lg:p-10 max-w-lg w-full relative shadow-2xl">
            <button onClick={() => setIsTermsOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors"><X size={20} /></button>
            <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-3"><Flame className="text-neon-orange" size={24} /> {lang === 'es' ? 'Términos y condiciones' : 'Terms & Conditions'}</h3>
            <p className="text-gray-300 leading-relaxed text-sm lg:text-base">
              {lang === 'es' ? 'Los precios, disponibilidad de productos, horarios y ubicación pueden cambiar sin previo aviso.' : 'Prices, product availability, hours, and location may change without notice.'}
            </p>
          </div>
        </div>
      )}
      
      {isPrivacyOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8 lg:p-10 max-w-lg w-full relative shadow-2xl">
            <button onClick={() => setIsPrivacyOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors"><X size={20} /></button>
            <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-3"><Flame className="text-neon-orange" size={24} /> {lang === 'es' ? 'Política de privacidad' : 'Privacy Policy'}</h3>
            <p className="text-gray-300 leading-relaxed text-sm lg:text-base">
              {lang === 'es' ? 'La información del cliente solo se utiliza para responder pedidos, llamadas o mensajes relacionados con el negocio.' : 'Customer information is only used to respond to orders, calls, or business-related messages.'}
            </p>
          </div>
        </div>
      )}

      {isDisclaimerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8 lg:p-10 max-w-lg w-full relative shadow-2xl">
            <button onClick={() => setIsDisclaimerOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors"><X size={20} /></button>
            <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-3"><Flame className="text-neon-orange" size={24} /> {lang === 'es' ? 'Aviso de alimentos' : 'Food Disclaimer'}</h3>
            <p className="text-gray-300 leading-relaxed text-sm lg:text-base">
              {lang === 'es' ? 'Los alimentos pueden contener alérgenos. Si tienes alergias, pregunta antes de ordenar.' : 'Food may contain allergens. If you have allergies, please ask before ordering.'}
            </p>
          </div>
        </div>
      )}

      </div>
    </MotionConfig>
  );
}

