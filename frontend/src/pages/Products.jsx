import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, SlidersHorizontal, ChevronDown, Check, Building2, UtensilsCrossed, IceCream, Waves, Cookie } from 'lucide-react'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useStore } from '../context/StoreContext'
import ProductCard from '../components/ProductCard'
import EmptyState from '../components/EmptyState'
import Preloader from '../components/Preloader'

const Products = () => {
    const { products, categories, loading } = useStore()
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('All')
    const [sortBy, setSortBy] = useState('latest')
    const [sortOpen, setSortOpen] = useState(false)
    const sortRef = useRef(null)

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesCategory = activeCategory === 'All' || p.category === activeCategory
            const matchesSearch = !searchQuery || 
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            return matchesCategory && matchesSearch
        }).sort((a, b) => {
            if (sortBy === 'price-low') return a.price - b.price
            if (sortBy === 'price-high') return b.price - a.price
            return 0
        })
    }, [products, activeCategory, searchQuery, sortBy])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortRef.current && !sortRef.current.contains(event.target)) {
                setSortOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    if (loading) return <Preloader />

    return (
        <div className="min-h-screen pt-44 pb-20 px-4 md:px-8 bg-[var(--bg-primary)]">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
                    <div>
                        <div className="flex items-center gap-3 mb-4 text-[var(--brand-red)]">
                            <Building2 size={20} />
                            <span className="text-xs font-black uppercase tracking-[0.3em]">UAC Official Store</span>
                        </div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-[var(--text-primary)]"
                        >
                            Our Portfolio
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-[var(--text-muted)] font-medium max-w-xl text-lg"
                        >
                            Browse our full range of iconic food and beverage brands. Quality and trust in every bite.
                        </motion.p>
                    </div>
                </div>

                {/* Filters & Tools */}
                <div className="sticky top-28 z-20 glass p-5 rounded-[32px] mb-16 border border-[var(--divider)] shadow-2xl flex flex-col md:flex-row gap-5 items-center justify-between">
                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
                        <input 
                            type="text"
                            placeholder="Find your favorite snack..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-16 pl-16 pr-6 rounded-2xl bg-[var(--bg-secondary)] border-2 border-transparent focus:border-[var(--brand-red)] outline-none text-base font-bold transition-all text-[var(--text-primary)]"
                        />
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none" ref={sortRef}>
                            <button 
                                onClick={() => setSortOpen(!sortOpen)}
                                className="w-full md:w-56 h-16 px-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--divider)] flex items-center justify-between text-[11px] font-black uppercase tracking-[0.1em] hover:border-[var(--brand-red)] transition-all text-[var(--text-primary)]"
                            >
                                <div className="flex items-center gap-3">
                                    <SlidersHorizontal size={14} className="text-[var(--brand-red)]" />
                                    <span>Sort Options</span>
                                </div>
                                <ChevronDown size={14} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {sortOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full mt-3 right-0 w-64 bg-[var(--bg-primary)] border border-[var(--divider)] rounded-3xl shadow-2xl p-3 z-50 overflow-hidden"
                                    >
                                        {[
                                            { id: 'latest', label: 'Latest Releases' },
                                            { id: 'price-low', label: 'Price: Low to High' },
                                            { id: 'price-high', label: 'Price: High to Low' }
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => { setSortBy(opt.id); setSortOpen(false); }}
                                                className="w-full flex items-center justify-between px-5 py-4 rounded-xl hover:bg-[var(--brand-red)]/5 text-[11px] font-black uppercase tracking-widest transition-colors"
                                                style={{ color: sortBy === opt.id ? 'var(--brand-red)' : 'var(--text-primary)' }}
                                            >
                                                {opt.label}
                                                {sortBy === opt.id && <Check size={14} />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-4 overflow-x-auto pb-8 mb-16 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-10 py-5 rounded-[20px] text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border-2 ${
                                activeCategory === cat 
                                ? 'bg-[var(--brand-red)] border-[var(--brand-red)] text-white shadow-2xl shadow-[var(--brand-red)]/40' 
                                : 'bg-[var(--bg-secondary)] border-[var(--divider)] text-[var(--text-muted)] hover:border-[var(--brand-red)]/30'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {filteredProducts.length > 0 ? (
                    <motion.div 
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-16"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <EmptyState
                        icon={Search}
                        title="No snacks found"
                        description="Try searching for another favorite UAC brand like Gala or Supreme."
                        actionLabel="Clear Filters"
                        onAction={() => { setSearchQuery(''); setActiveCategory('All'); }}
                    />
                )}
            </div>
        </div>
    )
}

export default Products
