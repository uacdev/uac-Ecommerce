import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ShoppingBag, ShieldCheck, Zap, Truck, Filter, Star, ArrowUpRight, ChevronRight, Instagram, Mail, Sparkles, Building2, Award, History, UtensilsCrossed, Waves, IceCream, Cookie } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Preloader from '../components/Preloader'

const DUMMY_PRODUCTS = [
    {
        id: 'gala-1',
        name: 'Gala Classic Sausage Roll',
        category: 'Gala',
        price: 350,
        image: '/images/gala.jpg',
        desc: 'The original Nigerian snack since 1962.'
    },
    {
        id: 'supreme-1',
        name: 'Supreme Vanilla & Strawberry',
        category: 'Supreme',
        price: 3500,
        image: '/images/supreme_ice_cream.jpg',
        desc: 'Rich, creamy, and irresistibly smooth.'
    },
    {
        id: 'swan-1',
        name: 'Swan Natural Spring Water',
        category: 'Swan',
        price: 2400,
        image: '/images/swan_water.jpg',
        desc: 'Pure hydration from the Kerang hills.'
    },
    {
        id: 'funtime-1',
        name: 'Funtime Coconut Chips',
        category: 'Funtime',
        price: 1500,
        image: '/images/funtime_chips.jpg',
        desc: 'Crunchy and delicious coconut chips.'
    }
]

const HERO_IMAGES = [
    '/images/gala.jpg',
    '/images/supreme_ice_cream.jpg',
    '/images/swan_water.jpg',
    '/images/funtime_chips.jpg'
]

const Home = () => {
    const [activeCategory, setActiveCategory] = useState("All")
    const [currentHeroIdx, setCurrentHeroIdx] = useState(0)
    const [loading, setLoading] = useState(true)
    const location = useLocation()
    const { isDark } = useTheme()
    const heroRef = useRef(null)

    const categories = ["All", "Gala", "Supreme", "Swan", "Funtime"]

    useEffect(() => {
        document.title = 'UAC Foods Limited | Tasty · Nourishing · Trusted'
        const timer = setTimeout(() => setLoading(false), 1500)
        
        const heroInterval = setInterval(() => {
            setCurrentHeroIdx(prev => (prev + 1) % HERO_IMAGES.length)
        }, 5000)

        return () => {
            clearTimeout(timer)
            clearInterval(heroInterval)
        }
    }, [])

    const filteredProducts = DUMMY_PRODUCTS.filter(p => {
        if (activeCategory === "All") return true
        return p.category === activeCategory
    })

    if (loading) return <Preloader />

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-x-hidden bg-[var(--bg-primary)]"
        >
            {/* ═══════════════════════════════════════════ */}
            {/* CROSS-FADING HERO SECTION */}
            {/* ═══════════════════════════════════════════ */}
            <section ref={heroRef} className="relative min-h-screen flex items-center pt-24 md:pt-32 pb-24 md:pb-32 overflow-hidden">
                {/* Background Images with Fade Animation */}
                <div className="absolute inset-0 z-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentHeroIdx}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="absolute inset-0"
                        >
                            <img 
                                src={HERO_IMAGES[currentHeroIdx]} 
                                alt="UAC Hero" 
                                className="w-full h-full object-cover"
                            />
                            {/* Modern Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] via-[var(--bg-primary)]/80 to-transparent lg:w-3/5" />
                            <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
                        </motion.div>
                    </AnimatePresence>
                </div>
                
                <div className="container relative z-10 px-6">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full mb-8 bg-[var(--brand-red)]/10 border border-[var(--brand-red)]/20 shadow-sm"
                        >
                            <Building2 size={16} className="text-[var(--brand-red)]" />
                            <span className="text-[11px] font-black tracking-[0.2em] uppercase text-[var(--brand-red)]">LEADER IN NIGERIAN FMCG · SINCE 1962</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tighter mb-8 text-[var(--text-primary)]"
                        >
                            Tasty. <br />
                            Nourishing. <br />
                            <span className="text-[var(--brand-red)]">Trusted by Millions.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-lg md:text-2xl max-w-xl mb-12 leading-relaxed text-[var(--text-muted)] font-medium"
                        >
                            Commitment to high quality, innovation and nutrition. Nigeria’s most preferred food brands, delivered to you.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="flex flex-col sm:flex-row gap-5 mb-20"
                        >
                            <Link to="/shop" className="btn-primary py-5 px-12 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 group rounded-2xl shadow-2xl shadow-[var(--brand-red)]/30 scale-105 active:scale-95 transition-all">
                                Explore Brands
                                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                            </Link>
                            <Link to="/about" className="btn-outline py-5 px-12 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 rounded-2xl border-2 hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all">
                                About the Legacy
                            </Link>
                        </motion.div>
                    </div>
                </div>

            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* BRAND MARQUEE */}
            {/* ═══════════════════════════════════════════ */}
            <section className="bg-[var(--brand-red)] py-10 overflow-hidden relative skew-y-1">
                <motion.div
                    animate={{ x: [0, -1920] }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="flex items-center gap-16 whitespace-nowrap"
                >
                    {[...Array(15)].map((_, i) => (
                        <div key={i} className="flex items-center gap-16">
                            <span className="text-white text-3xl md:text-4xl font-black tracking-tighter uppercase italic opacity-90">GALA</span>
                            <div className="w-3 h-3 rounded-full bg-white/40" />
                            <span className="text-white text-3xl md:text-4xl font-black tracking-tighter uppercase italic opacity-90">SUPREME</span>
                            <div className="w-3 h-3 rounded-full bg-white/40" />
                            <span className="text-white text-3xl md:text-4xl font-black tracking-tighter uppercase italic opacity-90">SWAN</span>
                            <div className="w-3 h-3 rounded-full bg-white/40" />
                            <span className="text-white text-3xl md:text-4xl font-black tracking-tighter uppercase italic opacity-90">FUNTIME</span>
                            <div className="w-3 h-3 rounded-full bg-white/40" />
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* ICONIC BRANDS SECTION (DUMMY DATA) */}
            {/* ═══════════════════════════════════════════ */}
            <section id="all-products" className="py-24 md:py-40 bg-[var(--bg-primary)]">
                <div className="container px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20">
                        <div>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="text-[12px] font-black uppercase tracking-[0.5em] text-[var(--brand-red)] mb-6 ml-1"
                            >
                                Shop the Portfolio
                            </motion.p>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="text-4xl md:text-6xl font-black tracking-tighter text-[var(--text-primary)]"
                            >
                                Our Iconic Brands
                            </motion.h2>
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide w-full md:w-auto">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-10 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all shrink-0 whitespace-nowrap shadow-xl ${
                                        activeCategory === cat
                                            ? 'bg-[var(--brand-red)] text-white shadow-[var(--brand-red)]/30'
                                            : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--divider)]'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.5 }}
                                    className="group relative"
                                >
                                    <div className="aspect-[4/5] rounded-[40px] overflow-hidden bg-[var(--bg-secondary)] relative shadow-2xl transition-all duration-700 group-hover:-translate-y-4">
                                        <img 
                                            src={product.image} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                            alt={product.name} 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        
                                        <div className="absolute top-6 right-6">
                                            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform delay-100">
                                                <ShoppingBag size={20} />
                                            </div>
                                        </div>

                                        <div className="absolute bottom-10 left-10 right-10 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                                            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">{product.category}</p>
                                            <h4 className="text-white text-2xl font-black leading-tight mb-4">{product.name}</h4>
                                            <Link to={`/product/${product.id}`} className="inline-flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-widest border-b-2 border-[var(--brand-red)] pb-1 hover:text-[var(--brand-red)] transition-colors">
                                                View Product <ArrowUpRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="mt-8 text-center">
                                        <h3 className="text-xl font-black text-[var(--text-primary)]">{product.name}</h3>
                                        <p className="text-[var(--brand-red)] font-black text-lg mt-1">₦{product.price.toLocaleString()}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                    
                    <div className="mt-24 text-center">
                        <Link to="/shop" className="inline-flex items-center gap-6 px-14 py-6 bg-[var(--brand-red)] text-white rounded-[24px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[var(--brand-red)]/40 group">
                            Explore Full Catalog
                            <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* OUR HERITAGE SECTION */}
            {/* ═══════════════════════════════════════════ */}
            <section id="our-heritage" className="py-32 md:py-48 bg-[var(--bg-secondary)] relative overflow-hidden">
                <div className="container relative z-10 px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="text-[12px] font-black uppercase tracking-[0.5em] text-[var(--brand-red)] mb-6"
                            >
                                Over 5 Decades of Excellence
                            </motion.p>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="text-4xl md:text-6xl font-black tracking-tighter mb-10 leading-[0.95] text-[var(--text-primary)]"
                            >
                                A Heritage of <br />
                                <span className="italic">Quality and Innovation</span>
                            </motion.h2>
                            
                            <div className="space-y-12 mt-16">
                                <HeritageCard 
                                    icon={<History size={28} />}
                                    title="Historic Legacy"
                                    text="Established in 1962, UAC Foods has been at the forefront of the Nigerian convenience foods market, setting standards in taste and hygiene."
                                />
                                <HeritageCard 
                                    icon={<ShieldCheck size={28} />}
                                    title="ISO Certified Quality"
                                    text="Our ISO 9001:2015 certification reflects our unwavering commitment to international quality management and food safety."
                                />
                                <HeritageCard 
                                    icon={<Building2 size={28} />}
                                    title="Local Empowerment"
                                    text="We source locally and employ thousands, contributing significantly to the Nigerian economic landscape through sustainable growth."
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <div className="grid grid-cols-2 gap-8 relative z-10">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="aspect-[3/4] rounded-[48px] overflow-hidden shadow-2xl translate-y-16 bg-[var(--bg-secondary)]"
                                >
                                    <img src="/images/gala.jpg" alt="UAC Legacy" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: -30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="aspect-[3/4] rounded-[48px] overflow-hidden shadow-2xl bg-[var(--bg-secondary)]"
                                >
                                    <img src="/images/supreme_ice_cream.jpg" alt="UAC Legacy" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                                </motion.div>
                            </div>
                            {/* Decorative Elements */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[var(--brand-red)]/5 rounded-full blur-[120px] -z-10" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* CORPORATE STATUS */}
            {/* ═══════════════════════════════════════════ */}
            <section className="py-24 bg-[var(--bg-primary)]">
                <div className="container px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        <StatItem label="Established" value="1962" />
                        <StatItem label="Employees" value="2000+" />
                        <StatItem label="Market Reach" value="80%" />
                        <StatItem label="Brand Count" value="12+" />
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* OFFICIAL NEWSLETTER */}
            {/* ═══════════════════════════════════════════ */}
            <section className="py-24 md:py-40">
                <div className="container px-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative overflow-hidden rounded-[64px] px-8 py-24 md:px-24 md:py-32 bg-[var(--brand-red)] text-white shadow-2xl"
                    >
                        {/* Faded Gala Background Image */}
                        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none">
                            <img src="/images/gala.jpg" alt="" className="w-full h-full object-cover grayscale" />
                        </div>
                        
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-1/4 pointer-events-none" />
                        
                        <div className="relative z-10 max-w-4xl mx-auto text-center">
                            <motion.h2 
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="text-4xl md:text-7xl font-black mb-10 leading-[0.9] tracking-tighter"
                            >
                                Join the <br /> UAC Circle.
                            </motion.h2>
                            <p className="text-white/80 text-lg md:text-2xl mb-16 max-w-2xl mx-auto font-medium">
                                Subscribe for corporate updates, product innovations, and exclusive insights from the heart of UAC Foods.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-5 max-w-3xl mx-auto">
                                <input
                                    type="email"
                                    placeholder="Enter corporate email..."
                                    className="flex-1 px-10 py-6 rounded-3xl bg-white text-black text-lg outline-none focus:ring-4 focus:ring-white/30 transition-all font-bold"
                                />
                                <button className="px-14 py-6 bg-black text-white font-black uppercase tracking-widest rounded-3xl hover:scale-105 active:scale-95 transition-transform shadow-2xl">
                                    Subscribe
                                </button>
                            </div>
                            
                            <p className="mt-12 text-white/50 text-[11px] font-black uppercase tracking-[0.3em]">
                                Verified Corporate Communications · Privacy Encrypted
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>
        </motion.div>
    )
}

const HeritageCard = ({ icon, title, text }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex gap-8 group"
    >
        <div className="w-20 h-20 rounded-[28px] bg-[var(--bg-primary)] shadow-xl flex items-center justify-center text-[var(--brand-red)] shrink-0 group-hover:bg-[var(--brand-red)] group-hover:text-white transition-all duration-500">
            {icon}
        </div>
        <div>
            <h4 className="text-2xl font-black mb-3 text-[var(--text-primary)]">{title}</h4>
            <p className="text-base text-[var(--text-muted)] font-medium leading-relaxed">{text}</p>
        </div>
    </motion.div>
)

const StatItem = ({ label, value }) => (
    <div className="text-center">
        <p className="text-5xl md:text-6xl font-black text-[var(--brand-red)] mb-2 tracking-tighter">{value}</p>
        <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">{label}</p>
    </div>
)

export default Home
