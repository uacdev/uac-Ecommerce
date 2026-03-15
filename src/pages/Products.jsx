import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, SlidersHorizontal, Grid, List, ChevronDown, Check } from 'lucide-react'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useStore } from '../context/StoreContext'
import ProductCard from '../components/ProductCard'
import EmptyState from '../components/EmptyState'
import Preloader from '../components/Preloader'

const Products = () => {
    const { products, categories, loading } = useStore()
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('All')
    const [sortBy, setSortBy] = useState('latest') // latest, price-low, price-high
    const [sortOpen, setSortOpen] = useState(false)
    const sortRef = useRef(null)
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesCategory = activeCategory === 'All' || p.category === activeCategory
            const matchesSearch = !searchQuery || 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                p.description.toLowerCase().includes(searchQuery.toLowerCase())
            return matchesCategory && matchesSearch && (p.status === 'available' || p.status === 'out_of_stock')
        }).sort((a, b) => {
            if (sortBy === 'price-low') return a.price - b.price
            if (sortBy === 'price-high') return b.price - a.price
            return new Date(b.created_at || 0) - new Date(a.created_at || 0)
        })
    }, [products, activeCategory, searchQuery, sortBy])

    // Close sort dropdown on click outside
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
        <div className="min-h-screen pt-44 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">Shop All</h1>
                        <p className="text-[var(--text-muted)] font-medium max-w-md">Discover curated, high-quality items from verified sellers. Every transaction is protected.</p>
                    </div>
                </div>


                {/* Filters & Tools */}
                <div className="sticky top-24 z-20 glass p-4 rounded-3xl mb-12 border border-[var(--divider)] shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                        <input 
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 pl-14 pr-6 rounded-2xl bg-[var(--bg-secondary)] border border-transparent focus:border-[#F18B24] outline-none text-sm font-bold transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none" ref={sortRef}>
                            <button 
                                onClick={() => setSortOpen(!sortOpen)}
                                className="w-full md:w-48 h-14 px-6 rounded-2xl bg-[var(--bg-secondary)] border border-transparent flex items-center justify-between text-xs font-black uppercase tracking-widest hover:border-[#F18B2450] transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal size={14} />
                                    <span>Sort By</span>
                                </div>
                                <ChevronDown size={14} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {sortOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full mt-2 right-0 w-56 bg-[var(--bg-primary)] border border-[var(--divider)] rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
                                    >
                                        {[
                                            { id: 'latest', label: 'Latest Arrivals' },
                                            { id: 'price-low', label: 'Price: Low to High' },
                                            { id: 'price-high', label: 'Price: High to Low' }
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => { setSortBy(opt.id); setSortOpen(false); }}
                                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#F18B2410] text-[10px] font-black uppercase tracking-widest transition-colors"
                                                style={{ color: sortBy === opt.id ? '#F18B24' : 'var(--text-primary)' }}
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

                {/* Categories Grid */}
                <div className="flex gap-3 overflow-x-auto pb-6 mb-12 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border ${
                                activeCategory === cat 
                                ? 'bg-[#F18B24] border-[#F18B24] text-white shadow-lg shadow-[#F18B2430]' 
                                : 'bg-[var(--bg-secondary)] border-[var(--divider)] text-[var(--text-muted)] hover:border-[#F18B2450]'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Results Count */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-[1px] flex-1 bg-[var(--divider)]" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                        Showing {filteredProducts.length} Results
                    </p>
                    <div className="h-[1px] flex-1 bg-[var(--divider)]" />
                </div>

                {/* Grid */}
                {filteredProducts.length > 0 ? (
                    <motion.div 
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <EmptyState
                        icon={Search}
                        title="No results found"
                        description="We couldn't find anything matching your search. Try different keywords or browse our categories."
                        actionLabel="Clear All Filters"
                        onAction={() => { setSearchQuery(''); setActiveCategory('All'); }}
                    />
                )}
            </div>
        </div>
    )
}

export default Products
