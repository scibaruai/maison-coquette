import React, { useState, useEffect, useRef } from 'react';
import PerfumeScene from './components/PerfumeScene';
import { Sparkles, ArrowRight, Truck, Clock, MousePointer, ShoppingCart, Phone, Heart, Zap } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Product interface
interface Product {
    id: number;
    title: string;
    brand: string;
    desc: string;
    price: string;
    image: string;
    tag?: string;
}

const productData: Product[] = [
    {
        id: 1,
        title: "Suero Revitalizante de Vitamina C",
        brand: "Ame Cosmetics",
        desc: "Suero antioxidante concentrado para iluminar la piel y combatir líneas de expresión de forma natural.",
        price: "$38.900 COP",
        image: "https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?q=80&w=600&auto=format&fit=crop",
        tag: "Best Seller"
    },
    {
        id: 2,
        title: "Paleta de Sombras Ultra Nude",
        brand: "Trendy",
        desc: "18 tonos ultrapigmentados mate and satinados ideales para cualquier tipo de maquillaje social o casual.",
        price: "$45.000 COP",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 3,
        title: "Aceite Iluminador de Escualano",
        brand: "Montoc",
        desc: "Fórmula sedosa y ligera para una hidratación profunda y un brillo natural radiante y duradero.",
        price: "$32.900 COP",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop",
        tag: "Nuevo"
    },
    {
        id: 4,
        title: "Set de Brochas Pro Gold Luxe",
        brand: "Montoc",
        desc: "10 brochas de fibras sintéticas ultra suaves con mango ergonómico y estuche de viaje de lujo.",
        price: "$55.000 COP",
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop"
    }
];

const App: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrollFraction, setScrollFraction] = useState(0);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    
    // Refs for GSAP
    const mainRef = useRef<HTMLDivElement>(null);

    // Track scroll positioning
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const fraction = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
            setScrollFraction(fraction);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Track mouse coordinates for 3D model & custom cursor
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMouse({
                x: (e.clientX / window.innerWidth) - 0.5,
                y: (e.clientY / window.innerHeight) - 0.5
            });

            // GSAP cursor tracking
            const dot = document.querySelector('.custom-cursor-dot');
            const ring = document.querySelector('.custom-cursor-ring');
            if (dot && ring) {
                gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.05, overwrite: "auto" });
                gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.25, overwrite: "auto" });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Cursor hover expansion classes
    useEffect(() => {
        const dot = document.querySelector('.custom-cursor-dot');
        const ring = document.querySelector('.custom-cursor-ring');
        
        const handleMouseEnter = () => {
            dot?.classList.add('cursor-hover');
            ring?.classList.add('cursor-hover');
        };
        const handleMouseLeave = () => {
            dot?.classList.remove('cursor-hover');
            ring?.classList.remove('cursor-hover');
        };

        const attachCursorHovers = () => {
            const hoverables = document.querySelectorAll(
                'a, button, .category-card, .product-card, .polaroid-wrapper, .feature-item'
            );
            hoverables.forEach(target => {
                target.addEventListener('mouseenter', handleMouseEnter);
                target.addEventListener('mouseleave', handleMouseLeave);
            });
        };

        const timer = setTimeout(attachCursorHovers, 600);
        return () => clearTimeout(timer);
    }, [scrollFraction]); // Re-attach when layout shifts

    // GSAP ScrollTrigger Background Transition & 3D Card Tilt setup
    useEffect(() => {
        if (!mainRef.current) return;

        const ctx = gsap.context(() => {
            // Transition background to dark espresso-burgundy when scrolling into categories/products (explicit fromTo to avoid transparent background capture)
            gsap.fromTo(document.body, 
                { backgroundColor: '#FFF5F5', color: '#2B1B1E' },
                {
                    backgroundColor: '#2E1C1F', // Deep espresso plum
                    color: '#FDF5E6', // Cream text
                    scrollTrigger: {
                        trigger: '#categorias',
                        start: 'top 60%',
                        end: 'bottom 10%',
                        toggleActions: 'play reverse play reverse'
                    }
                }
            );

            // 3D Tilt Card animation for category, product, and service cards
            const cards = document.querySelectorAll('.category-card, .product-card, .polaroid-wrapper, .service-card');
            cards.forEach(card => {
                const onMouseMove = (e: Event) => {
                    const me = e as MouseEvent;
                    const rect = card.getBoundingClientRect();
                    const x = me.clientX - rect.left;
                    const y = me.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const rotateX = ((centerY - y) / centerY) * 12;
                    const rotateY = ((x - centerX) / centerX) * 12;

                    gsap.to(card, {
                        rotateX: rotateX,
                        rotateY: rotateY,
                        y: -8,
                        scale: 1.02,
                        transformPerspective: 1000,
                        duration: 0.3,
                        overwrite: "auto",
                        ease: "power1.out"
                    });
                };

                const onMouseLeave = () => {
                    gsap.to(card, {
                        rotateX: 0,
                        rotateY: 0,
                        y: 0,
                        scale: 1,
                        duration: 0.5,
                        overwrite: "auto",
                        ease: "power3.out"
                    });
                };

                card.addEventListener('mousemove', onMouseMove);
                card.addEventListener('mouseleave', onMouseLeave);
            });

            // Elements reveal animations (fromTo used to avoid double mount initial opacity capture issues)
            gsap.fromTo(".hero-text-side", 
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 1.2, ease: "power4.out" }
            );

            gsap.fromTo(".category-card", 
                { opacity: 0, y: 60 },
                {
                    scrollTrigger: {
                        trigger: ".categories-section",
                        start: "top 80%",
                        toggleActions: "play none none none"
                    },
                    opacity: 1,
                    y: 0,
                    stagger: 0.2,
                    duration: 1.0,
                    ease: "power3.out"
                }
            );

            gsap.fromTo(".product-card", 
                { opacity: 0, y: 40 },
                {
                    scrollTrigger: {
                        trigger: ".products-section",
                        start: "top 80%",
                        toggleActions: "play none none none"
                    },
                    opacity: 1,
                    y: 0,
                    stagger: 0.15,
                    duration: 1.0,
                    ease: "power3.out"
                }
            );

            gsap.fromTo(".service-card", 
                { opacity: 0, y: 40 },
                {
                    scrollTrigger: {
                        trigger: ".services-section",
                        start: "top 80%",
                        toggleActions: "play none none none"
                    },
                    opacity: 1,
                    y: 0,
                    stagger: 0.15,
                    duration: 1.0,
                    ease: "power3.out"
                }
            );

            gsap.fromTo(".polaroid-wrapper", 
                { opacity: 0, scale: 0.9, rotation: 8 },
                {
                    scrollTrigger: {
                        trigger: ".experience-section",
                        start: "top 75%",
                        toggleActions: "play none none none"
                    },
                    opacity: 1,
                    scale: 1,
                    rotation: -3,
                    duration: 1.2,
                    ease: "back.out(1.5)"
                }
            );
        }, mainRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={mainRef} className="app-wrapper">
            {/* Custom pointer cursor (fine pointers only) */}
            <div className="custom-cursor-dot" />
            <div className="custom-cursor-ring" />

            {/* Navigation Bar */}
            <nav id="main-nav">
                <div className="nav-container">
                    <div className="nav-logo" id="brand-logo">
                        <a href="#inicio" className="nav-logo-link">
                            <img src="/Logo.png" alt="Maison Coquette Logo" className="nav-logo-img" />
                        </a>
                    </div>
                    <ul className="nav-links">
                        <li><a href="#inicio">Inicio</a></li>
                        <li><a href="#marcas">Marcas</a></li>
                        <li><a href="#categorias">Categorías</a></li>
                        <li><a href="#productos">Productos</a></li>
                        <li><a href="#servicios">Servicios</a></li>
                        <li><a href="#experiencia">Experiencia</a></li>
                        <li><a href="#contacto">Contacto</a></li>
                    </ul>
                    <a href="https://wa.me/573115025269" className="nav-cta-btn" id="nav-whatsapp-btn" target="_blank" rel="noreferrer">
                        <Phone size={16} /> Pedir Domicilio
                    </a>
                    <button 
                        className="mobile-nav-toggle" 
                        id="mobile-menu-toggle" 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Abrir menú"
                    >
                        <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`} />
                    </button>
                </div>

                {/* Mobile Dropdown Menu */}
                {mobileMenuOpen && (
                    <div className="mobile-menu" id="mobile-menu-dropdown">
                        <a href="#inicio" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Inicio</a>
                        <a href="#marcas" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Marcas</a>
                        <a href="#categorias" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Categorías</a>
                        <a href="#productos" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Productos</a>
                        <a href="#servicios" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Servicios</a>
                        <a href="#experiencia" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Experiencia</a>
                        <a href="#contacto" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Contacto</a>
                        <a 
                            href="https://wa.me/573115025269" 
                            className="mobile-cta-btn" 
                            target="_blank" 
                            rel="noreferrer"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <Phone size={16} style={{ marginRight: '8px' }} /> Pedir Domicilio
                        </a>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <header id="inicio" className="hero-section">
                <div className="hero-content-container">
                    <div className="hero-text-side">
                        <div className="tagline-badge">🎀 Espacio de Maquillaje & Skincare</div>
                        <h1 id="hero-main-title">Tu rutina,<br /><span className="italic-serif text-accent">tu ritual de belleza</span></h1>
                        <p className="hero-description">
                            Encuentra más de 70 marcas exclusivas nacionales e importadas en un solo lugar. Creamos el espacio perfecto para consentirte y resaltar tu brillo natural en Palmira.
                        </p>
                        <div className="hero-actions">
                            <a href="#categorias" className="btn-primary" id="explore-btn">
                                Explorar Productos <ArrowRight size={18} />
                            </a>
                            <a href="https://wa.me/573115025269" className="btn-secondary-gold" target="_blank" rel="noreferrer">
                                Asesoría Personalizada
                            </a>
                        </div>
                        <div className="hero-features">
                            <div className="feature-item">
                                <Sparkles className="icon-gold" size={18} />
                                <span>70+ Marcas</span>
                            </div>
                            <div className="feature-item">
                                <Truck className="icon-gold" size={18} />
                                <span>Envíos Palmira & Cali</span>
                            </div>
                            <div className="feature-item">
                                <Clock className="icon-gold" size={18} />
                                <span>Jornada Continua</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="hero-3d-side" id="hero-3d-wrapper">
                        {/* Three.js Canvas Container */}
                        <PerfumeScene scrollFraction={scrollFraction} mouse={mouse} />
                        <div className="scroll-indicator-text">
                            <MousePointer className="scroll-icon-anim" size={14} /> Scroll para interactuar
                        </div>
                    </div>
                </div>
            </header>

            {/* Infinite Brands Slider */}
            <section id="marcas" className="brands-section">
                <div className="section-header-centered">
                    <h2 className="section-title">Marcas Premium Disponibles</h2>
                    <p className="section-subtitle">Las mejores marcas nacionales e importadas seleccionadas para ti</p>
                </div>
                <div className="slider-wrapper">
                    <div className="infinite-slider" id="brands-track">
                        <div className="slide-item"><span>Diva Lash</span></div>
                        <div className="slide-item"><span>Diva Brow</span></div>
                        <div className="slide-item"><span>Ame Cosmetics</span></div>
                        <div className="slide-item"><span>Ruby Rose</span></div>
                        <div className="slide-item"><span>Trendy</span></div>
                        <div className="slide-item"><span>Montoc</span></div>
                        <div className="slide-item"><span>Beauty Glazed</span></div>
                        <div className="slide-item"><span>Dolce Bella</span></div>
                        {/* Duplicate for loop */}
                        <div className="slide-item"><span>Diva Lash</span></div>
                        <div className="slide-item"><span>Diva Brow</span></div>
                        <div className="slide-item"><span>Ame Cosmetics</span></div>
                        <div className="slide-item"><span>Ruby Rose</span></div>
                        <div className="slide-item"><span>Trendy</span></div>
                        <div className="slide-item"><span>Montoc</span></div>
                        <div className="slide-item"><span>Beauty Glazed</span></div>
                        <div className="slide-item"><span>Dolce Bella</span></div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section id="categorias" className="categories-section">
                <div className="section-header-centered">
                    <h2 className="section-title">Nuestras Líneas de Cuidado</h2>
                    <p className="section-subtitle">Productos diseñados para potenciar tu amor propio y bienestar</p>
                </div>
                <div className="categories-grid">
                    {/* Category 1 */}
                    <div className="category-card" id="cat-makeup">
                        <div className="card-bg-overlay">
                            <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop" alt="Maquillaje Social" />
                        </div>
                        <div className="card-content">
                            <span className="card-badge">Estilo</span>
                            <h3>Maquillaje Social</h3>
                            <p>Bases de seda, correctores difuminadores, paletas ultrapigmentadas y brillos de alta gama.</p>
                            <a href="https://wa.me/573115025269" className="card-link" target="_blank" rel="noreferrer">
                                Ver catálogo <i className="fas fa-chevron-right" />
                            </a>
                        </div>
                    </div>
                    {/* Category 2 */}
                    <div className="category-card" id="cat-skincare">
                        <div className="card-bg-overlay">
                            <img src="https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop" alt="Skincare y Cuidado Facial" />
                        </div>
                        <div className="card-content">
                            <span className="card-badge">Salud</span>
                            <h3>Skincare y Cuidado Facial</h3>
                            <p>Espumas limpiadoras suaves, sueros antioxidantes, bloqueadores solares mate e hidratación profunda.</p>
                            <a href="https://wa.me/573115025269" className="card-link" target="_blank" rel="noreferrer">
                                Ver catálogo <i className="fas fa-chevron-right" />
                            </a>
                        </div>
                    </div>
                    {/* Category 3 */}
                    <div className="category-card" id="cat-accessories">
                        <div className="card-bg-overlay">
                            <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop" alt="Herramientas Profesionales" />
                        </div>
                        <div className="card-content">
                            <span className="card-badge">Accesorios</span>
                            <h3>Herramientas Profesionales</h3>
                            <p>Brochas de fibra ultra suave, esponjas hipoalergénicas y rizadores estéticos dorados.</p>
                            <a href="https://wa.me/573115025269" className="card-link" target="_blank" rel="noreferrer">
                                Ver catálogo <i className="fas fa-chevron-right" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section id="productos" className="products-section">
                <div className="section-header-centered">
                    <h2 className="section-title">Productos Destacados</h2>
                    <p className="section-subtitle">Lo más selecto en maquillaje y cuidado facial de Palmira</p>
                </div>
                <div className="products-grid">
                    {productData.map((item) => (
                        <div className="product-card" key={item.id}>
                            <div className="product-image">
                                <img src={item.image || "https://images.unsplash.com/photo-1608248597481-496100c8c836?q=80&w=600&auto=format&fit=crop"} alt={item.title} />
                                {item.tag && <span className="product-tag-new">{item.tag}</span>}
                            </div>
                            <div className="product-info">
                                <div>
                                    <p className="product-brand-tag">{item.brand}</p>
                                    <h3>{item.title}</h3>
                                    <p className="product-desc">{item.desc}</p>
                                </div>
                                <div className="product-meta">
                                    <span className="product-price">{item.price}</span>
                                    <a href="https://wa.me/573115025269" className="product-btn" target="_blank" rel="noreferrer">
                                        Pedir <ShoppingCart size={14} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Exclusive Services Section */}
            <section id="servicios" className="services-section">
                <div className="section-header-centered">
                    <h2 className="section-title">Servicios & Experiencias Coquette</h2>
                    <p className="section-subtitle">Rituales de belleza exclusivos diseñados para consentirte y potenciar tu estilo</p>
                </div>
                <div className="services-grid">
                    {/* Service 1 */}
                    <div className="service-card">
                        <div className="service-icon-wrapper">
                            <Sparkles className="service-icon" size={32} />
                        </div>
                        <h3>Automaquillaje Personalizado</h3>
                        <p>Aprende técnicas profesionales adaptadas a la morfología de tu rostro en sesiones personalizadas uno a uno.</p>
                        <span className="service-price">Desde $80.000 COP</span>
                        <a href="https://wa.me/573115025269" className="service-link" target="_blank" rel="noreferrer">
                            Reservar Turno <ArrowRight size={14} />
                        </a>
                    </div>
                    {/* Service 2 */}
                    <div className="service-card">
                        <div className="service-icon-wrapper">
                            <Heart className="service-icon" size={32} />
                        </div>
                        <h3>Ritual Skincare Premium</h3>
                        <p>Análisis de tu tipo de piel, hidratación profunda y recomendación experta de tu rutina ideal.</p>
                        <span className="service-price">Desde $60.000 COP</span>
                        <a href="https://wa.me/573115025269" className="service-link" target="_blank" rel="noreferrer">
                            Reservar Turno <ArrowRight size={14} />
                        </a>
                    </div>
                    {/* Service 3 */}
                    <div className="service-card">
                        <div className="service-icon-wrapper">
                            <Zap className="service-icon" size={32} />
                        </div>
                        <h3>Maquillaje Social & Eventos</h3>
                        <p>Luce espectacular en tus eventos especiales, bodas o fiestas con maquillaje de alta duración y acabado perfecto.</p>
                        <span className="service-price">Desde $120.000 COP</span>
                        <a href="https://wa.me/573115025269" className="service-link" target="_blank" rel="noreferrer">
                            Reservar Turno <ArrowRight size={14} />
                        </a>
                    </div>
                </div>
            </section>

            {/* Experience / Showroom Section */}
            <section id="experiencia" className="experience-section">
                <div className="experience-container">
                    <div className="experience-image-side">
                        <div className="polaroid-wrapper">
                            <div className="polaroid-photo">
                                <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop" alt="Maison Coquette Showroom Palmira" id="showroom-img" />
                            </div>
                            <div className="polaroid-caption">Calle 47 # 19-32 Altamira, Palmira 🎀</div>
                        </div>
                    </div>
                    <div className="experience-text-side">
                        <h2 className="section-title">Disfruta la Experiencia Física</h2>
                        <p className="experience-description">
                            Hemos diseñado un espacio único pensado exclusivamente para ti. En nuestra tienda física en el barrio Altamira de Palmira, encontrarás asesoría experta y personalizada para crear tu rutina de maquillaje y skincare perfecta.
                        </p>
                        <div className="experience-details">
                            <div className="detail-box">
                                <h4><Clock className="detail-icon" size={16} /> Horario de Atención</h4>
                                <p><strong>Lunes a Sábado:</strong> 10:00 AM - 7:00 PM <span className="badge-pink">Jornada Continua</span></p>
                                <p><strong>Domingos y Festivos:</strong> 10:00 AM - 2:00 PM</p>
                            </div>
                            <div className="detail-box">
                                <h4><Truck className="detail-icon" size={16} /> Servicio de Envíos</h4>
                                <p>¿No puedes venir a visitarnos? No te preocupes. Escríbenos a WhatsApp y gestionamos tu envío rápido a todo Palmira y Cali.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact & Map Section */}
            <footer id="contacto" className="contact-section">
                <div className="contact-grid">
                    <div className="contact-info-block">
                        <h2 className="serif-title font-large">Maison <span className="italic-serif text-accent">Coquette</span></h2>
                        <p className="contact-bio">Tu espacio de maquillaje, skincare y cuidado personal. Más de 70 marcas exclusivas en un solo lugar.</p>
                        
                        <ul className="contact-list">
                            <li>
                                <i className="fas fa-map-marker-alt list-icon-gold" />
                                <span>Calle 47 # 19-32, Barrio Altamira, Palmira, Valle.</span>
                            </li>
                            <li>
                                <Phone className="list-icon-gold" size={16} style={{ marginRight: '8px' }} />
                                <span>+57 311 502 5269</span>
                            </li>
                            <li>
                                <i className="fab fa-instagram list-icon-gold" style={{ fontSize: '16px', marginRight: '8px', marginTop: '4px' }} />
                                <span>@maisoncoquette.co</span>
                            </li>
                        </ul>

                        <div className="social-icons">
                            <a href="https://www.instagram.com/maisoncoquette.co/" target="_blank" rel="noreferrer" aria-label="Instagram">
                                <i className="fab fa-instagram" style={{ fontSize: '18px' }} />
                            </a>
                            <a href="https://wa.me/573115025269" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                                <i className="fab fa-whatsapp" style={{ fontSize: '18px' }} />
                            </a>
                        </div>
                    </div>
                    
                    <div className="contact-map-block">
                        <div className="map-container-real">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3982.6802613947475!2d-76.2995383!3d3.5458739999999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3a7566270b200b%3A0xe5c338982a7f0525!2sCl.%2047%20%2319-32%2C%20Palmira%2C%20Valle%20del%20Cauca!5e0!3m2!1ses!2sco!4v1719000000000!5m2!1ses!2sco" 
                                width="100%" 
                                height="400" 
                                style={{ border: 0 }} 
                                allowFullScreen 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Maison Coquette Map Location"
                            />
                        </div>
                    </div>
                </div>
                <div className="footer-copyright">
                    <p>&copy; 2026 Maison Coquette. Diseñado con el sello de excelencia de <span className="scibaru-credit">Scibaru AI</span>.</p>
                </div>
            </footer>
        </div>
    );
};

export default App;
