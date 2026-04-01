import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ShoppingBag, Star, Truck, Shield, ChevronLeft, ChevronRight, Package, Award, Users, ArrowUpRight, MapPin, Phone, Mail, Leaf, Plus } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import Preloader from '../components/Preloader'
import toast from 'react-hot-toast'

const CountUp = ({ end, duration = 2 }) => {
    const isNumeric = /[0-9]/.test(end)
    const [count, setCount] = useState(isNumeric ? 0 : end)
    const endVal = isNumeric ? parseInt(end.replace(/\D/g, '')) : 0
    const suffix = isNumeric ? end.replace(/[0-9]/g, '') : ''
    
    useEffect(() => {
        if (!isNumeric) {
            setCount(end)
            return
        }
        let start = 0
        if (start === endVal) return
        
        let totalMilisecDur = duration * 1000
        let increments = endVal
        let incrementTime = Math.max(totalMilisecDur / increments, 30) // Minimum 30ms for smooth UI
        let step = Math.max(Math.floor(endVal / (totalMilisecDur / 30)), 1)
        
        let timer = setInterval(() => {
            start += step
            if (start >= endVal) {
                setCount(endVal)
                clearInterval(timer)
            } else {
                setCount(start)
            }
        }, incrementTime)
        
        return () => clearInterval(timer)
    }, [endVal, end, isNumeric, duration])
    
    return <span>{isNumeric ? count + suffix : count}</span>
}

const BRANDS = [
    {
        name: 'Gala',
        tagline: 'Nigeria\'s Favourite Snack',
        desc: 'The iconic sausage roll loved by millions. Made with premium ingredients and baked to golden perfection since 1962.',
        img: '/images/gala.jpg',
        bg: 'from-[#7B1C1C] to-[#C1121F]',
        accent: '#ED0000',
        badge: '60+ Years',
        stats: [['60+', 'Years'], ['4', 'Brands'], ['M+', 'Consumers']]
    },
    {
        name: 'Supreme',
        tagline: 'Creamy, Rich & Delicious',
        desc: 'Premium ice cream crafted with the finest dairy. Available in over 20 exciting flavours for every occasion.',
        img: '/images/supreme_ice_cream.jpg',
        bg: 'from-[#832657] to-[#C1126E]',
        accent: '#ED008C',
        badge: 'New Flavours'
    },
    {
        name: 'Swan',
        tagline: 'Pure Natural Spring Water',
        desc: 'Sourced from natural springs, Swan water is refreshing, pure and trusted by families across Nigeria.',
        img: '/images/swan_water.jpg',
        bg: 'from-[#0f4c75] to-[#1b6ca8]',
        accent: '#1b6ca8',
        badge: 'Pure & Natural'
    },
    {
        name: 'Funtime',
        tagline: 'Snack. Share. Enjoy.',
        desc: 'Crispy and tasty chips perfect for every moment — from parties to solo snacking sessions.',
        img: '/images/funtime_chips.jpg',
        bg: 'from-[#7b5e1c] to-[#c18a21]',
        accent: '#c18a21',
        badge: 'Fan Favourite'
    },
]

const TESTIMONIALS = [
    { name: 'Adaeze O.', role: 'Lagos', text: 'Gala has been part of my family since childhood. The quality never changes — always fresh and delicious!', stars: 5, avatar: 'A' },
    { name: 'Emeka N.', role: 'Abuja', text: 'Swan water is the only brand I trust for my household. Clean, refreshing and always consistent.', stars: 5, avatar: 'E' },
    { name: 'Fatima A.', role: 'Kano', text: 'Supreme ice cream is my kids\' absolute favourite. The mango flavour is incredible — we order it every week!', stars: 5, avatar: 'F' },
    { name: 'Tunde B.', role: 'Ibadan', text: 'Funtime chips are my go-to snack for movie nights. Super crunchy and the flavours are on point.', stars: 5, avatar: 'T' },
]

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] } })
}

const Home = () => {
    const { products, addToCart } = useStore()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [activeBrand, setActiveBrand] = useState(0)
    const [testimonialIdx, setTestimonialIdx] = useState(0)
    const [addedId, setAddedId] = useState(null)
    const heroTimerRef = useRef(null)

    useEffect(() => {
        document.title = 'UAC Foods | Nourishing Nigeria Since 1962'
        const timer = setTimeout(() => setLoading(false), 1200)
        return () => clearTimeout(timer)
    }, [])

    // Auto-cycle hero
    useEffect(() => {
        heroTimerRef.current = setInterval(() => {
            setActiveBrand(b => (b + 1) % BRANDS.length)
        }, 5000)
        return () => clearInterval(heroTimerRef.current)
    }, [])

    const handleBrandClick = (i) => {
        clearInterval(heroTimerRef.current)
        setActiveBrand(i)
        heroTimerRef.current = setInterval(() => setActiveBrand(b => (b + 1) % BRANDS.length), 5000)
    }

    const handleAddToCart = (e, p) => {
        e.preventDefault()
        e.stopPropagation()
        addToCart(p)
        setAddedId(p.id)
        setTimeout(() => setAddedId(null), 1500)
    }

    const brand = BRANDS[activeBrand]
    const featuredProducts = products.slice(0, 6)
    const topPicks = products.slice(0, 4)

    // if (loading) return <Preloader />

    return (
        <div className="bg-white font-['Sen',sans-serif] overflow-x-hidden">

            {/* ══════════════════════════════════════════════════════
                HERO — Animated Brand Showcase with product thumbnails
            ══════════════════════════════════════════════════════ */}
            <section className="relative min-h-screen flex flex-col overflow-hidden pt-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeBrand}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className={`absolute inset-0 bg-gradient-to-br ${brand.bg}`}
                    />
                </AnimatePresence>

                {/* Decorative grain overlay */}
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }} />

                <div className="relative z-10 flex-1 flex flex-col max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-10">

                    {/* Row: Badge + Brand Name */}
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-white/60 text-[11px] font-bold tracking-[4px] uppercase">UAC Foods Limited</span>
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={brand.badge}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-[10px] font-bold"
                            >
                                {brand.badge}
                            </motion.span>
                        </AnimatePresence>
                    </div>

                    {/* Main 3-col hero grid */}
                    <div className="grid grid-cols-12 gap-6 flex-1 items-center">

                        {/* Left: Brand info */}
                        <div className="col-span-12 lg:col-span-4 flex flex-col justify-center gap-6 order-2 lg:order-1">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={brand.name + '-text'}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.5 }}
                                    className="space-y-5"
                                >
                                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[0.9] tracking-tight">
                                        {brand.name}
                                    </h1>
                                    <p className="text-white/80 text-[15px] font-semibold">{brand.tagline}</p>
                                    <p className="text-white/60 text-sm leading-relaxed max-w-xs">{brand.desc}</p>
                                    <div className="flex gap-3 pt-2">
                                        <Link
                                            to="/products"
                                            className="inline-flex items-center gap-2 bg-white text-gray-900 px-7 py-3.5 rounded-full text-[12px] font-bold hover:bg-white/90 transition-all shadow-2xl"
                                        >
                                            Shop now <ArrowRight size={14} />
                                        </Link>
                                        <Link
                                            to="/about"
                                            className="inline-flex items-center gap-2 border border-white/40 text-white px-7 py-3.5 rounded-full text-[12px] font-bold hover:bg-white/10 transition-all"
                                        >
                                            Our story
                                        </Link>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Stats row */}
                            <div className="flex gap-8 pt-4 border-t border-white/20 mt-6">
                                {[['60', 'Years'], ['4', 'Brands'], ['01', 'M+ Consumers']].map(([val, label]) => (
                                    <div key={label}>
                                        <p className="text-2xl font-bold text-white">
                                            <CountUp end={val} />{label === 'M+ Consumers' ? 'M+' : '+'}
                                        </p>
                                        <p className="text-white/50 text-[10px] font-bold tracking-tight">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Centre: Big product hero image */}
                        <div className="col-span-12 lg:col-span-5 flex items-center justify-center order-1 lg:order-2">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={brand.name + '-img'}
                                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                                    className="relative"
                                >
                                    <div className="w-[280px] h-[280px] md:w-[400px] md:h-[400px] lg:w-[480px] lg:h-[480px] rounded-3xl overflow-hidden border border-white/20 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
                                        <img
                                            src={brand.img}
                                            alt={brand.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {/* Floating chip */}
                                    <motion.div
                                        animate={{ y: [-6, 6, -6] }}
                                        transition={{ repeat: Infinity, duration: 3 }}
                                        className="absolute -bottom-5 -left-6 bg-white rounded-2xl px-4 py-3 shadow-2xl hidden md:block"
                                    >
                                        <p className="text-[10px] font-bold text-gray-500">Top selling</p>
                                        <p className="text-[13px] font-bold text-gray-900">{brand.name}</p>
                                    </motion.div>
                                    <motion.div
                                        animate={{ y: [6, -6, 6] }}
                                        transition={{ repeat: Infinity, duration: 3.5 }}
                                        className="absolute -top-4 -right-4 bg-[#ED0000] rounded-2xl px-4 py-3 shadow-2xl hidden md:block"
                                    >
                                        <p className="text-[10px] font-bold text-white/80">Available</p>
                                        <p className="text-[13px] font-bold text-white">Order now</p>
                                    </motion.div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Right: Brand thumb switcher (like the screenshot product list) */}
                        <div className="col-span-12 lg:col-span-3 flex flex-row lg:flex-col gap-3 justify-center lg:justify-end items-center lg:items-end order-3">
                            {BRANDS.map((b, i) => (
                                <button
                                    key={b.name}
                                    onClick={() => handleBrandClick(i)}
                                    className={`relative group overflow-hidden rounded-2xl transition-all duration-300 flex-shrink-0 ${
                                        i === activeBrand
                                            ? 'w-24 h-24 md:w-28 md:h-28 lg:w-full lg:h-32 border-2 border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                                            : 'w-16 h-16 md:w-20 md:h-20 lg:w-3/4 lg:h-24 border border-white/20 opacity-60 hover:opacity-80'
                                    }`}
                                >
                                    <img src={b.img} alt={b.name} className="w-full h-full object-cover" />
                                    {i === activeBrand && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                                            <span className="text-white text-[10px] font-bold">{b.name}</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="flex gap-2 mt-8 pb-2">
                        {BRANDS.map((_, i) => (
                            <button key={i} onClick={() => handleBrandClick(i)} className="flex-1 h-0.5 rounded-full bg-white/20 overflow-hidden">
                                {i === activeBrand && (
                                    <motion.div
                                        className="h-full bg-white"
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 5, ease: 'linear' }}
                                    />
                                )}
                                {i !== activeBrand && <div className="h-full w-0 bg-white" />}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                TRUST STRIP — Why UAC Foods
            ══════════════════════════════════════════════════════ */}
            <section className="py-10 border-b border-gray-100">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { icon: <Award size={22} className="text-[#ED0000]" />, title: 'ISO Certified', desc: 'Quality assured at every step' },
                            { icon: <Truck size={22} className="text-[#ED0000]" />, title: 'Nationwide delivery', desc: 'We deliver across all 36 states' },
                            { icon: <Leaf size={22} className="text-[#ED0000]" />, title: 'Natural ingredients', desc: 'No artificial additives' },
                            { icon: <Users size={22} className="text-[#ED0000]" />, title: '60+ years trusted', desc: 'Loved by millions of Nigerians' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                custom={i * 0.1}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="flex items-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="text-[13px] font-bold text-gray-900">{item.title}</p>
                                    <p className="text-[11px] text-gray-500">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                OUR BRANDS — Card grid inspired by categories section
            ══════════════════════════════════════════════════════ */}
            <section className="py-24 lg:py-32 px-6 lg:px-16">
                <div className="max-w-[1440px] mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
                        <p className="text-[#ED0000] text-[11px] font-bold tracking-[4px] uppercase mb-3">Our Brands</p>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
                                Nourishing Nigeria,<br />one bite at a time
                            </h2>
                            <Link to="/products" className="flex items-center gap-2 text-[12px] font-bold text-gray-600 border-b border-gray-300 pb-1 hover:text-gray-900 transition-colors whitespace-nowrap">
                                See all products <ArrowRight size={14} />
                            </Link>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {BRANDS.map((b, i) => (
                            <motion.div
                                key={b.name}
                                variants={fadeUp}
                                custom={i * 0.1}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
                                <Link to={`/products?brand=${b.name}`} className="group block rounded-3xl overflow-hidden relative min-h-[320px] shadow-sm hover:shadow-2xl transition-shadow duration-500">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${b.bg} opacity-90`} />
                                    <img src={b.img} alt={b.name} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />
                                    <div className="relative z-10 h-full min-h-[320px] flex flex-col justify-between p-8 md:p-10">
                                        <div className="flex items-start justify-between">
                                            <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[10px] font-bold px-3 py-1.5 rounded-full">{b.badge}</span>
                                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white group-hover:text-gray-900 transition-all">
                                                <ArrowUpRight size={16} className="text-white group-hover:text-gray-900 transition-colors" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-4xl font-bold text-white mb-2">{b.name}</h3>
                                            <p className="text-white/70 text-sm">{b.tagline}</p>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                FEATURED PRODUCTS — Most popular food (like screenshot)
            ══════════════════════════════════════════════════════ */}
            <section className="py-24 lg:py-32 bg-[#FDF8F5] px-6 lg:px-16">
                <div className="max-w-[1440px] mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
                        <p className="text-[#ED0000] text-[11px] font-bold tracking-[4px] uppercase mb-3">Shop our range</p>
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
                            Most popular products
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 lg:gap-8">
                        {products.slice(0, 6).map((p, idx) => (
                            <motion.div
                                key={p.id}
                                variants={fadeUp}
                                custom={idx * 0.08}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="group"
                            >
                                <Link to={`/product/${p.id}`}>
                                    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-xl transition-shadow duration-500 relative">
                                        {/* Image */}
                                        <div className="aspect-square bg-white flex items-center justify-center p-8 relative overflow-hidden">
                                            <img
                                                src={p.image}
                                                alt={p.name}
                                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                            />
                                            {/* Quick add */}
                                            <button
                                                onClick={(e) => {
                                                    handleAddToCart(e, p);
                                                    toast.success(`ADDED ${p.name.toUpperCase()} TO BAG`, {
                                                        style: {
                                                            background: 'var(--bg-primary)',
                                                            color: 'var(--text-primary)',
                                                            border: '1px solid var(--divider)',
                                                            fontSize: '10px',
                                                            fontWeight: '900',
                                                            letterSpacing: '0.2em',
                                                            borderRadius: '0px',
                                                            padding: '20px 30px'
                                                        }
                                                    });
                                                }}
                                                className={`absolute bottom-4 right-4 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${addedId === p.id ? 'bg-emerald-500 scale-125' : 'bg-[#ED0000] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0'}`}
                                            >
                                                <Plus size={18} className="text-white" />
                                            </button>
                                        </div>
                                        {/* Info */}
                                        <div className="p-5 border-t border-gray-50">
                                            <p className="text-[10px] text-[#ED0000] font-bold tracking-widest uppercase mb-1">{p.category || 'UAC Foods'}</p>
                                            <h3 className="text-[15px] font-bold text-gray-900 mb-2 leading-snug">{p.name}</h3>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[15px] font-bold text-gray-900">₦{p.price?.toLocaleString()}</span>
                                                <div className="flex items-center gap-0.5">
                                                    {[...Array(5)].map((_, s) => (
                                                        <Star key={s} size={10} className="text-amber-400 fill-amber-400" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex justify-center mt-14">
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-3 bg-gray-900 text-white px-10 py-4 rounded-full text-[12px] font-bold hover:bg-[#ED0000] transition-colors"
                        >
                            View full catalogue <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                BRAND STORY — Our Goals & History (like screenshot)
            ══════════════════════════════════════════════════════ */}
            <section className="py-24 lg:py-32 px-6 lg:px-16">
                <div className="max-w-[1440px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left text */}
                        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-8">
                            <p className="text-[#ED0000] text-[11px] font-bold tracking-[4px] uppercase">Our story</p>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
                                Proudly Nigerian.<br />Trusted since 1962.
                            </h2>
                            <p className="text-gray-600 text-[15px] leading-relaxed">
                                UAC Foods Limited is a subsidiary of UAC of Nigeria Plc, dedicated to producing and marketing high-quality food products. From our iconic Gala sausage rolls to Supreme Ice Cream, Swan water and Funtime chips, we have been part of Nigeria's food culture for over six decades.
                            </p>
                            <p className="text-gray-600 text-[15px] leading-relaxed">
                                We are committed to nourishing Nigerians with products that meet the highest international standards, while staying rooted in our communities.
                            </p>
                            <div className="grid grid-cols-2 gap-6 pt-4">
                                {[
                                    { val: '60+', label: 'Years of excellence' },
                                    { val: '4', label: 'Iconic brands' },
                                    { val: 'ISO', label: 'Certified quality' },
                                    { val: 'M+', label: 'Happy consumers' },
                                ].map(({ val, label }) => (
                                    <div key={label} className="bg-[#FDF8F5] rounded-2xl p-5">
                                        <p className="text-3xl font-bold text-[#ED0000]">
                                            <CountUp end={val} />
                                        </p>
                                        <p className="text-[12px] text-gray-500 font-medium mt-1">{label}</p>
                                    </div>
                                ))}
                            </div>
                            <Link to="/about" className="inline-flex items-center gap-2 text-gray-900 font-bold text-[13px] border-b border-gray-300 pb-1 hover:border-gray-900 transition-colors">
                                Learn more about us <ArrowRight size={14} />
                            </Link>
                        </motion.div>

                        {/* Right: Image collage */}
                        <div className="grid grid-cols-2 gap-4 h-[550px]">
                            <motion.div variants={fadeUp} custom={0.1} initial="hidden" whileInView="visible" viewport={{ once: true }} className="rounded-3xl overflow-hidden">
                                <img src="/images/gala.jpg" alt="Gala" className="w-full h-full object-cover" />
                            </motion.div>
                            <div className="flex flex-col gap-4">
                                <motion.div variants={fadeUp} custom={0.2} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex-1 rounded-3xl overflow-hidden">
                                    <img src="/images/supreme_ice_cream.jpg" alt="Supreme" className="w-full h-full object-cover" />
                                </motion.div>
                                <motion.div variants={fadeUp} custom={0.3} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex-1 rounded-3xl overflow-hidden">
                                    <img src="/images/swan_water.jpg" alt="Swan" className="w-full h-full object-cover" />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                PROMO BANNER — Red CTA banner
            ══════════════════════════════════════════════════════ */}
            <section className="mx-4 lg:mx-8 my-4 rounded-[32px] overflow-hidden bg-[#ED0000] relative">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[420px] relative z-10">
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        className="flex flex-col justify-center px-10 lg:px-20 py-16 gap-6"
                    >
                        <span className="text-white/70 text-[11px] font-bold tracking-[4px] uppercase">Limited offer</span>
                        <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight">
                            Get 20% off<br />your first order
                        </h2>
                        <p className="text-white/80 text-[15px] leading-relaxed max-w-sm">
                            New to UAC Foods? Enjoy an exclusive 20% discount on your first purchase. Use code <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded">UACWELCOME</span> at checkout.
                        </p>
                        <Link to="/products" className="inline-flex items-center gap-3 bg-white text-[#ED0000] px-8 py-4 rounded-full text-[12px] font-bold w-fit hover:bg-gray-100 transition-colors shadow-2xl">
                            Shop now <ArrowRight size={14} />
                        </Link>
                    </motion.div>
                    <div className="relative min-h-[280px] flex items-end justify-center overflow-hidden">
                        <img src="/images/funtime_chips.jpg" alt="Promo" className="w-full h-full object-cover opacity-30 lg:opacity-50" />
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#ED0000] hidden lg:block" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                TESTIMONIALS — Our clients saying
            ══════════════════════════════════════════════════════ */}
            <section className="py-24 lg:py-32 px-6 lg:px-16 bg-[#FDF8F5]">
                <div className="max-w-[1440px] mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
                        <p className="text-[#ED0000] text-[11px] font-bold tracking-[4px] uppercase mb-3">Testimonials</p>
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">What Nigerians say</h2>
                    </motion.div>

                    <div className="overflow-hidden py-10">
                        <motion.div 
                            className="flex gap-6 w-max"
                            animate={{ 
                                x: ["0%", "-50%"]
                            }}
                            transition={{
                                x: {
                                    duration: 35,
                                    repeat: Infinity,
                                    ease: "linear"
                                }
                            }}
                        >
                            {/* Duplicate testimonials for seamless loop */}
                            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                                <div
                                    key={i}
                                    className="w-[300px] md:w-[450px] bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
                                >
                                    <div className="flex gap-1 mb-6 text-amber-400">
                                        {[...Array(t.stars)].map((_, s) => (
                                            <Star key={s} size={18} className="fill-current" />
                                        ))}
                                    </div>
                                    <p className="text-gray-900 text-lg font-medium leading-relaxed mb-10 italic">"{t.text}"</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-[#ED0000] flex items-center justify-center text-white font-black text-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                            {t.avatar}
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-black text-gray-900">{t.name}</p>
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                WHY CHOOSE UAC FOODS — Full width grid cards
            ══════════════════════════════════════════════════════ */}
            <section className="py-24 lg:py-32 px-6 lg:px-16">
                <div className="max-w-[1440px] mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
                        <p className="text-[#ED0000] text-[11px] font-bold tracking-[4px] uppercase mb-3">Why us</p>
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">Why choose UAC Foods</h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Award size={28} />,
                                title: 'Quality you can trust',
                                desc: 'All products manufactured in ISO-certified facilities with rigorous quality checks from raw material to final packaging.'
                            },
                            {
                                icon: <Package size={28} />,
                                title: 'Nationwide availability',
                                desc: 'Our products are available in supermarkets, kiosks and online across all 36 states of Nigeria.'
                            },
                            {
                                icon: <Leaf size={28} />,
                                title: 'Natural ingredients',
                                desc: 'We use only the best quality, locally sourced ingredients — no unnecessary additives, just the goodness of real food.'
                            }
                        ].map((card, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                custom={i * 0.1}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="bg-[#FDF8F5] rounded-3xl p-10 border border-gray-100 hover:bg-[#ED0000] transition-all group duration-500 cursor-pointer"
                            >
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-white shadow-sm group-hover:bg-white/20 transition-colors">
                                    <div className="text-[#ED0000] group-hover:text-white transition-colors">
                                        {card.icon}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-white transition-colors">{card.title}</h3>
                                <p className="text-[14px] leading-relaxed text-gray-500 group-hover:text-white/80 transition-colors">{card.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                CTA — Ready to order
            ══════════════════════════════════════════════════════ */}
            <section className="mx-4 lg:mx-8 mb-8 rounded-[32px] overflow-hidden relative min-h-[500px] flex items-center">
                <img src="/images/gala.jpg" className="absolute inset-0 w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
                <div className="relative z-10 max-w-[1440px] mx-auto w-full px-10 lg:px-20 py-20">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-2xl">
                        <p className="text-[#ED0000] text-[11px] font-bold tracking-[4px] uppercase mb-6">Ready to order?</p>
                        <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight mb-8">
                            Taste the quality that lasts generations
                        </h2>
                        <p className="text-white/70 text-[15px] leading-relaxed mb-10 max-w-lg">
                            Order your favourite UAC Foods products online and have them delivered to your doorstep across Nigeria.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link to="/products" className="inline-flex items-center gap-2 bg-[#ED0000] text-white px-8 py-4 rounded-full text-[12px] font-bold hover:bg-red-700 transition-colors">
                                Start shopping <ArrowRight size={14} />
                            </Link>
                            <Link to="/about" className="inline-flex items-center gap-2 border border-white/40 text-white px-8 py-4 rounded-full text-[12px] font-bold hover:bg-white/10 transition-colors">
                                Learn more
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                NEWSLETTER
            ══════════════════════════════════════════════════════ */}
            <section className="py-24 px-6 lg:px-16 bg-[#FDF8F5] border-t border-gray-100">
                <div className="max-w-[1440px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                            <p className="text-[#ED0000] text-[11px] font-bold tracking-[4px] uppercase mb-4">Newsletter</p>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                                Stay updated with<br />UAC Foods
                            </h2>
                            <p className="text-gray-500 mt-5 text-[14px] leading-relaxed">
                                Get the latest promotions, new product launches and news delivered to your inbox.
                            </p>
                        </motion.div>
                        <motion.div variants={fadeUp} custom={0.1} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                            <div className="flex gap-3">
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="flex-1 bg-white border border-gray-200 rounded-full px-6 py-4 text-[13px] font-medium outline-none focus:border-[#ED0000] transition-colors"
                                />
                                <button className="bg-[#ED0000] text-white px-8 py-4 rounded-full text-[12px] font-bold hover:bg-red-700 transition-colors whitespace-nowrap">
                                    Subscribe
                                </button>
                            </div>
                            <p className="text-gray-400 text-[11px] mt-4">By subscribing you agree to our Privacy Policy. Unsubscribe anytime.</p>
                        </motion.div>
                    </div>
                </div>
            </section>

        </div>
    )
}

export default Home
