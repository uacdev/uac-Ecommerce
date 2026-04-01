import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, SlidersHorizontal, ChevronDown, Check, Building2, UtensilsCrossed, IceCream, Waves, Cookie } from 'lucide-react'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import ProductCard from '../components/ProductCard'
import EmptyState from '../components/EmptyState'
import Preloader from '../components/Preloader'

const Products = () => {
    const { products, categories, loading } = useStore()
    const [searchParams] = useSearchParams()
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('All')
    const [sortBy, setSortBy] = useState('latest')
    const [sortOpen, setSortOpen] = useState(false)
    const sortRef = useRef(null)

    useEffect(() => {
        const brandFilter = searchParams.get('brand') || searchParams.get('category')
        if (brandFilter) {
            setActiveCategory(brandFilter)
        }
        const search = searchParams.get('search')
        if (search) {
            setSearchQuery(search)
        }
    }, [searchParams])

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

    // if (loading) return <Preloader />

    return (
        <div className="min-h-screen pt-44 pb-40 bg-[var(--bg-primary)] transition-colors duration-700 font-['Sen',sans-serif]">
            <div className="container px-6">
                {/* Editorial Header */}
                <div className="text-center mb-32">
                    <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--brand-red)] mb-4 block"
                    >
                        UAC Foods Portfolio
                    </motion.span>
                    <motion.h1 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-6xl md:text-9xl font-black tracking-tighter uppercase leading-none text-[var(--text-primary)] mb-12"
                    >
                        All Categories
                    </motion.h1>
                    
                    {/* Search & Filter Bar */}
                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-1 w-full relative">
                            <input 
                                type="text"
                                placeholder="SEARCH CATALOGUE"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-[var(--divider)] py-6 text-2xl font-black uppercase tracking-tight outline-none focus:border-[var(--brand-red)] transition-all text-[var(--text-primary)] placeholder:text-[var(--divider)]"
                            />
                        </div>
                        <div className="flex gap-4 flex-wrap justify-center">
                            {categories.map(c => (
                                <button 
                                    key={c}
                                    onClick={() => setActiveCategory(c)}
                                    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === c ? 'bg-[var(--brand-red)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-24">
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
                        onAction={() => { setSearchQuery(''); setActiveCategory('All'); }}
                    />
                )}
            </div>
        </div>
    )
}

export default Products
