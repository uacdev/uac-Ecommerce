import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ShoppingBag, ShieldCheck, Zap, Truck, Filter, Star, ArrowUpRight, ChevronRight, Instagram, Mail, Sparkles } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CATEGORIES } from '../data/products'
import { useStore } from '../context/StoreContext'
import { useTheme } from '../context/ThemeContext'
import ProductCard from '../components/ProductCard'
import Preloader from '../components/Preloader'

const Home = () => {
    const [activeCategory, setActiveCategory] = useState("All")
    const [flipped, setFlipped] = useState(false)
    const { products, categories, loading } = useStore()
    const location = useLocation()

    if (loading) return <Preloader />

    useEffect(() => {
        const interval = setInterval(() => setFlipped(prev => !prev), 3000)
        return () => clearInterval(interval)
    }, [])

    const { isDark } = useTheme()
    const heroRef = useRef(null)
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 150])

    useEffect(() => {
        document.title = 'Sellout | Premium Transaction Gateway'
        const metaDescription = document.querySelector('meta[name="description"]')
        if (metaDescription) {
            metaDescription.setAttribute('content', 'The premium transaction gateway for buying and selling vetted furniture, appliances and gadgets securely with human confirmation.')
        }
    }, [])

    const queryParams = new URLSearchParams(location.search)
    const searchQuery = queryParams.get('search')?.toLowerCase() || ''

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
            }
        }
    }

    const filteredProducts = products.filter(p => {
        const matchesCategory = activeCategory === "All" || p.category === activeCategory
        const matchesSearch = !searchQuery || 
            p.name.toLowerCase().includes(searchQuery) || 
            p.description.toLowerCase().includes(searchQuery) ||
            p.category.toLowerCase().includes(searchQuery)
        return matchesCategory && matchesSearch && (p.status === 'available' || p.status === 'out_of_stock')
    })

    // Featured products (first 4)
    const featuredProducts = products.slice(0, 4)

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-x-hidden"
        >
            {/* ═══════════════════════════════════════════ */}
            {/* HERO SECTION */}
            {/* ═══════════════════════════════════════════ */}
            <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden pt-32 md:pt-40">
                <div className="absolute top-20 right-[-5%] w-[600px] h-[600px] rounded-full" style={{ background: isDark ? '#F18B2412' : '#F18B2408', filter: 'blur(150px)' }} />
                <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] rounded-full" style={{ background: isDark ? '#F18B240A' : '#F18B2406', filter: 'blur(120px)' }} />

                <div className="container relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center min-h-[80vh]">
                        <motion.div style={{ y: heroY }}>
                            <motion.div
                                initial={{ opacity: 0, x: -40 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                                style={{ background: 'var(--badge-bg)', border: '1px solid rgba(241,139,36,0.2)' }}
                            >
                                <Zap size={14} className="text-[#F18B24]" />
                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--text-secondary)' }}>Secure · Inspected · Delivered</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                                className="text-[2.8rem] sm:text-[3.8rem] md:text-[4.8rem] lg:text-[6rem] font-black leading-[0.85] tracking-[-0.04em] mb-8"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                <div className="h-[1.1em] overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={flipped ? 'buy' : 'sell'}
                                            initial={{ y: "-100%", opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: "100%", opacity: 0 }}
                                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                            className="block"
                                        >
                                            {flipped ? 'BUY' : 'SELL'}
                                        </motion.span>
                                    </AnimatePresence>
                                </div>
                                <span className="italic font-heading" style={{ color: '#F18B24' }}>PREMIUM</span>
                                <br />
                                ITEMS
                                <br />
                                SECURELY.
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="text-base md:text-lg max-w-md mb-10 leading-relaxed"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Premium furniture, appliances & gadgets from vetted sellers.
                                Every item inspected. Every payment protected. Fast & reliably delivered.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <Link to="/shop" className="btn-primary py-4 px-10 text-base group">
                                    Shop Now
                                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                </Link>
                                <a href="#how-it-works" className="btn-outline py-4 px-10 text-base">
                                    How it works
                                </a>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="hidden lg:block relative"
                        >
                            <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden border border-[var(--divider)] shadow-2xl">
                                <img 
                                    src="/images/hero_aesthetic.png" 
                                    alt="Aesthetic Interior" 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                            
                            <motion.div 
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-6 -right-6 glass p-6 rounded-2xl shadow-xl"
                            >
                                <Sparkles className="text-[#F18B24] mb-2" size={20} />
                                <p className="text-[10px] font-black uppercase tracking-widest">Premium Collection</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="overflow-hidden py-6" style={{ background: '#F18B24' }}>
                <motion.div
                    animate={{ x: [0, -1920] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="flex items-center gap-8 whitespace-nowrap"
                >
                    {[...Array(12)].map((_, i) => (
                        <span key={i} className="flex items-center gap-8">
                            <span className="text-white font-black text-lg tracking-widest uppercase">SELL YOUR ITEMS</span>
                            <Star size={16} className="text-white/60" />
                            <span className="text-white font-black text-lg tracking-widest uppercase">BUY WITH TRUST</span>
                            <Star size={16} className="text-white/60" />
                            <span className="text-white font-black text-lg tracking-widest uppercase">SECURE ESCROW</span>
                            <Star size={16} className="text-white/60" />
                            <span className="text-white font-black text-lg tracking-widest uppercase">VERIFIED LISTINGS</span>
                            <Star size={16} className="text-white/60" />
                        </span>
                    ))}
                </motion.div>
            </section>

            <section id="all-products" className="py-20 md:py-28" style={{ background: 'var(--bg-primary)' }}>
                <div className="container">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-14">
                        <div>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3"
                                style={{ color: '#F18B24' }}
                            >
                                Latest Drops
                            </motion.p>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-4xl md:text-5xl font-black tracking-tight font-heading"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                New Arrivals
                            </motion.h2>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide max-w-full">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all shrink-0 ${activeCategory === cat
                                            ? 'bg-[#F18B24] text-white'
                                            : ''
                                        }`}
                                    style={activeCategory !== cat ? {
                                        color: 'var(--text-muted)',
                                        border: '1px solid var(--divider)',
                                    } : {}}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Horizontal Scroll Products — like VESON's row */}
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide"
                    >
                        <motion.div layout className="flex gap-6" style={{ minWidth: 'max-content' }}>
                            <AnimatePresence mode="popLayout">
                                {filteredProducts.map(product => (
                                    <motion.div
                                        key={product.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="w-[280px] shrink-0"
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>

                    <div className="text-center mt-12">
                        <a href="#all-products" className="inline-flex items-center gap-2 text-sm font-bold px-8 py-3 rounded-full transition-all hover:gap-4" style={{ border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}>
                            See More <ChevronRight size={16} />
                        </a>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* SPLIT FEATURE SECTION — Sneaker store "WHERE STYLE MEETS COMFORT" */}
            {/* ═══════════════════════════════════════════ */}
            <section className="relative overflow-hidden" style={{ background: isDark ? '#0A0A0A' : '#111' }}>
                <div className="container py-20 md:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left: Large Text */}
                        <div>
                            <motion.h2
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight text-white mb-8"
                            >
                                WHERE
                                <br />
                                <span className="italic" style={{ color: '#F18B24' }}>TRUST</span>
                                <br />
                                MEETS
                                <br />
                                COMMERCE
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="text-lg text-white/50 max-w-md mb-10 leading-relaxed"
                            >
                                Every transaction on Sellout & Relocate is protected.
                                We hold your payment securely until you've confirmed delivery.
                                No more "I've been scammed" stories.
                            </motion.p>

                            <div className="flex flex-col gap-6">
                                <FeaturePill number="01" title="Browse & Select" text="Find high-quality pre-owned items from verified sellers" />
                                <FeaturePill number="02" title="Pay Securely" text="We hold your funds until delivery is confirmed" />
                                <FeaturePill number="03" title="Receive Safely" text="Choose assisted delivery or arrange your own pickup" />
                            </div>
                        </div>

                        {/* Right: Featured Image */}
                        <motion.div
                            initial={{ opacity: 0, x: 60 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="aspect-[4/5] rounded-3xl overflow-hidden relative">
                                <img
                                    src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800"
                                    alt="Premium Interior"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-8 left-8 right-8">
                                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Featured</p>
                                    <p className="text-white text-2xl font-bold font-heading">Premium Home Essentials</p>
                                    <p className="text-[#F18B24] font-bold mt-1">Starting from ₦85,000</p>
                                </div>
                            </div>

                            {/* Floating stat card */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="absolute -bottom-6 -left-6 px-6 py-4 rounded-2xl backdrop-blur-xl"
                                style={{ background: 'rgba(241,139,36,0.9)' }}
                            >
                                <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Verified Sellers</p>
                                <p className="text-white text-3xl font-black font-heading">150+</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* ALL PRODUCTS GRID — Clean grid like VESON "Best Seller" */}
            {/* ═══════════════════════════════════════════ */}
            <section id="all-products" className="py-20 md:py-28" style={{ background: 'var(--bg-primary)' }}>
                <div className="container" id="products">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-14">
                        <div>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3"
                                style={{ color: '#F18B24' }}
                            >
                                All Items
                            </motion.p>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-4xl md:text-5xl font-black tracking-tight font-heading"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Browse Everything
                            </motion.h2>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                            <Filter size={18} />
                            <span>Showing {filteredProducts.length} items</span>
                        </div>
                    </div>

                    <motion.div
                        layout
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* HOW IT WORKS — Trust section */}
            {/* ═══════════════════════════════════════════ */}
            <section id="how-it-works" className="py-20 md:py-28 relative overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                <div className="absolute top-0 left-0 w-full h-[1px]" style={{ background: 'linear-gradient(to right, transparent, var(--divider), transparent)' }} />
                <div className="container">
                    <div className="text-center mb-16">
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3"
                            style={{ color: '#F18B24' }}
                        >
                            How It Works
                        </motion.p>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-black tracking-tight font-heading"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Simple. Secure. Sorted.
                        </motion.h2>
                    </div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        <motion.div variants={itemVariants}>
                            <TrustCard
                                step="01"
                                icon={<ShoppingBag className="text-[#F18B24]" size={28} />}
                                title="Discover"
                                description="Browse curated, pre-verified items from verified sellers. Every listing is quality-checked."
                            />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <TrustCard
                                step="02"
                                icon={<ShieldCheck className="text-[#F18B24]" size={28} />}
                                title="Pay Securely"
                                description="Your payment is held safely in escrow. No funds are released until you confirm receipt and satisfaction."
                            />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <TrustCard
                                step="03"
                                icon={<Truck className="text-[#F18B24]" size={28} />}
                                title="Inspected Delivery"
                                description="Human-assisted validation for every item. Choose assisted delivery or self-arranged pickup with total peace of mind."
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* SECOND MARQUEE — Dark */}
            {/* ═══════════════════════════════════════════ */}
            <section className="overflow-hidden py-6" style={{ background: isDark ? '#111' : '#1a1a1a' }}>
                <motion.div
                    animate={{ x: [-1920, 0] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="flex items-center gap-8 whitespace-nowrap"
                >
                    {[...Array(12)].map((_, i) => (
                        <span key={i} className="flex items-center gap-8">
                            <span className="text-white/20 font-black text-lg tracking-widest uppercase">UNIQUE FINDS</span>
                            <Star size={16} className="text-[#F18B24]/30" />
                            <span className="text-white/20 font-black text-lg tracking-widest uppercase">CURATED QUALITY</span>
                            <Star size={16} className="text-[#F18B24]/30" />
                            <span className="text-white/20 font-black text-lg tracking-widest uppercase">TRUSTED PLATFORM</span>
                            <Star size={16} className="text-[#F18B24]/30" />
                        </span>
                    ))}
                </motion.div>
            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* CTA / NEWSLETTER — VESON dark CTA banner */}
            {/* ═══════════════════════════════════════════ */}
            <section className="py-20 md:py-28" style={{ background: 'var(--bg-primary)' }}>
                <div className="container">
                    <div className="relative overflow-hidden rounded-3xl px-8 py-16 md:px-16 md:py-24" style={{ background: isDark ? '#111' : '#0f0f0f' }}>
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full" style={{ background: '#F18B2415', filter: 'blur(120px)' }} />
                        <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] rounded-full" style={{ background: '#F18B2410', filter: 'blur(100px)' }} />

                        <div className="relative z-10 max-w-2xl mx-auto text-center">
                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 text-[#F18B24]"
                            >
                                Get Ahead
                            </motion.p>
                            <motion.h2
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight"
                            >
                                BE THE FIRST TO SHOP
                                <br />
                                <span style={{ color: '#F18B24' }}>NEW LISTINGS</span>
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="text-white/40 mb-10"
                            >
                                Get early access to new items and exclusive deals. Don't miss out on premium finds from verified sellers.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
                            >
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[#F18B24] transition-colors text-sm"
                                />
                                <button className="btn-primary py-4 px-8 shrink-0">
                                    Subscribe to Newsletter <ArrowUpRight size={16} />
                                </button>
                            </motion.div>

                            <div className="flex items-center justify-center gap-6 mt-8">
                                <a href="https://www.instagram.com/selloutandrelocate.ng?igsh=djByMTlvb21sMmVn" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/40 hover:text-[#F18B24] transition-colors text-xs font-bold uppercase tracking-widest">
                                    <Instagram size={14} /> Instagram
                                </a>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <a href="mailto:support@selloutrelocate.ng" className="flex items-center gap-2 text-white/40 hover:text-[#F18B24] transition-colors text-xs font-bold uppercase tracking-widest">
                                    <Mail size={14} /> Email Us
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </motion.div>
    )
}

/* ─── Feature Pill (for the split section) ─── */
const FeaturePill = ({ number, title, text }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex items-start gap-5 group"
    >
        <span className="text-[#F18B24] text-xs font-black font-mono pt-1 shrink-0 opacity-40">{number}</span>
        <div className="pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 className="text-white font-bold text-lg mb-1 group-hover:text-[#F18B24] transition-colors">{title}</h4>
            <p className="text-white/40 text-sm leading-relaxed">{text}</p>
        </div>
    </motion.div>
)

/* ─── Trust Card (How it Works) ─── */
const TrustCard = ({ step, icon, title, description }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -10 }}
        className="glass p-10 relative group"
    >
        <span className="absolute top-6 right-6 text-[40px] font-black font-heading opacity-5" style={{ color: 'var(--text-primary)' }}>{step}</span>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'var(--badge-bg)' }}>
            {icon}
        </div>
        <h3 className="text-2xl font-bold mb-4 font-heading group-hover:text-[#F18B24] transition-colors" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        <p className="leading-relaxed text-sm" style={{ color: 'var(--text-muted)' }}>{description}</p>
    </motion.div>
)

export default Home
