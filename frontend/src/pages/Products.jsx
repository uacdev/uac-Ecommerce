import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, SlidersHorizontal, ChevronDown, Check, Building2, UtensilsCrossed, IceCream, Waves, Cookie } from 'lucide-react'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import ProductCard from '../components/ProductCard'
import EmptyState from '../components/EmptyState'
import Preloader from '../components/Preloader'

const Products = () => {
    const { products, categories } = useStore()
    const [searchParams] = useSearchParams()
    const [searchQuery, setSearchQuery] = useState('')
    // Filter chips now use the categories from the database (via StoreContext).
    // 'All' sees everything.
    const [activeBrand, setActiveBrand] = useState('All')
    const [sortBy, setSortBy] = useState('latest')
    const [sortOpen, setSortOpen] = useState(false)
    const sortRef = useRef(null)

    useEffect(() => {
        const brandFilter = searchParams.get('brand') || searchParams.get('category')
        if (brandFilter) {
            setActiveBrand(brandFilter)
        }
        const search = searchParams.get('search')
        if (search) {
            setSearchQuery(search)
        }
    }, [searchParams])

    const filteredProducts = useMemo(() => {
        const norm = (s) => (s || '').trim().toLowerCase()
        const target = norm(activeBrand)
        return products.filter(p => {
            const matchesBrand = activeBrand === 'All' || norm(p.brand) === target || norm(p.category) === target
            const matchesSearch = !searchQuery ||
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            return matchesBrand && matchesSearch
        }).sort((a, b) => {
            if (sortBy === 'price-low') return a.price - b.price
            if (sortBy === 'price-high') return b.price - a.price
            return 0
        })
    }, [products, activeBrand, searchQuery, sortBy])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortRef.current && !sortRef.current.contains(event.target)) {
                setSortOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // if (loading) return <Preloader />

    return (
        <div className="min-h-screen pt-28 md:pt-44 pb-24 md:pb-40 bg-[var(--bg-primary)] transition-colors duration-700 font-['Sen',sans-serif]">
            <div className="container px-4 md:px-6">
                {/* Editorial Header */}
                <div className="text-center mb-12 md:mb-24">
                    <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] text-[var(--brand-red)] mb-4 block"
                    >
                        UAC Foods Portfolio
                    </motion.span>
                    <motion.h1 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-4xl sm:text-6xl md:text-9xl font-black tracking-tighter uppercase leading-none text-[var(--text-primary)] mb-8 md:mb-12"
                    >
                        All Categories
                    </motion.h1>
                    
                    {/* Search & Filter Bar */}
                    <div className="max-w-4xl mx-auto flex flex-col gap-6 items-center">
                        {/* Premium Search Container */}
                        <div className="w-full relative">
                            <input 
                                type="text"
                                placeholder="Search catalog..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-full py-4 px-6 pl-12 text-sm font-semibold tracking-tight outline-none focus:border-[var(--brand-red)] focus:ring-1 focus:ring-[var(--brand-red)] transition-all text-[var(--text-primary)] placeholder:text-[var(--text-muted)] shadow-inner"
                            />
                            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        </div>

                        {/* Swipeable Category Row */}
                        <div className="w-full md:w-auto flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide flex-nowrap px-4 -mx-6 md:mx-0 md:px-0 md:pb-0 md:flex-wrap md:justify-center">
                            {categories.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setActiveBrand(c)}
                                    className={`px-5 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeBrand === c ? 'bg-[var(--brand-red)] text-white shadow-md' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--divider)] hover:text-[var(--text-primary)]'}`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid */}
                {filteredProducts.length > 0 ? (
                    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${activeBrand === 'All' ? 'lg:grid-cols-8' : 'lg:grid-cols-6'} gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-16`}>
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={Search}
                        title="NO RESULTS FOUND"
                        description="Try refining your search or category selection."
                        actionLabel="RESET FILTERS"
                        onAction={() => { setSearchQuery(''); setActiveBrand('All'); }}
                    />
                )}
            </div>
        </div>
    )
}

export default Products
