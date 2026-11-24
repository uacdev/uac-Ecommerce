import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingBag, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import ProductCard from './ProductCard'

const SORTS = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: low to high' },
    { value: 'price-high', label: 'Price: high to low' },
    { value: 'name', label: 'Name: A–Z' }
]

const norm = (s) => (s || '').trim().toLowerCase()

// Homepage shop: every listed product with category filter, search and sort,
// so customers can add to cart and check out without leaving the homepage.
const ShopSection = () => {
    const { products, categories, loading, cart, cartTotal } = useStore()
    const [activeCategory, setActiveCategory] = useState('All')
    const [query, setQuery] = useState('')
    const [sortBy, setSortBy] = useState('featured')
    const [inStockOnly, setInStockOnly] = useState(false)
    const rowRef = useRef(null)
    const [canLeft, setCanLeft] = useState(false)
    const [canRight, setCanRight] = useState(false)

    const isInStock = (p) => p.status !== 'out_of_stock' && Number(p.stockCount ?? 0) > 0

    // Only show category chips that actually have products.
    const categoryChips = useMemo(() => {
        const counts = new Map()
        for (const p of products) {
            for (const key of new Set([norm(p.category), norm(p.brand)])) {
                if (key) counts.set(key, (counts.get(key) || 0) + 1)
            }
        }
        return categories
            .map(c => ({ name: c, count: c === 'All' ? products.length : counts.get(norm(c)) || 0 }))
            .filter(c => c.name === 'All' || c.count > 0)
    }, [products, categories])

    const filtered = useMemo(() => {
        const target = norm(activeCategory)
        const q = norm(query)
        const list = products.filter(p => {
            if (activeCategory !== 'All' && norm(p.category) !== target && norm(p.brand) !== target) return false
            if (q && !norm(p.name).includes(q) && !norm(p.brand).includes(q) && !norm(p.category).includes(q)) return false
            if (inStockOnly && !isInStock(p)) return false
            return true
        })
        if (sortBy === 'price-low') return [...list].sort((a, b) => a.price - b.price)
        if (sortBy === 'price-high') return [...list].sort((a, b) => b.price - a.price)
        if (sortBy === 'name') return [...list].sort((a, b) => a.name.localeCompare(b.name))
        // Featured: in-stock items first, keep catalogue order otherwise.
        return [...list].sort((a, b) => Number(isInStock(b)) - Number(isInStock(a)))
    }, [products, activeCategory, query, sortBy, inStockOnly])

    const hasFilters = activeCategory !== 'All' || query || inStockOnly || sortBy !== 'featured'
    const itemCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)

    const resetFilters = () => {
        setActiveCategory('All')
        setQuery('')
        setInStockOnly(false)
        setSortBy('featured')
    }

    const pickCategory = (name) => {
        setActiveCategory(name)
    }

    // Track whether the carousel can scroll further either way (for the arrows).
    const updateArrows = () => {
        const el = rowRef.current
        if (!el) return
        setCanLeft(el.scrollLeft > 4)
        setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
    }

    // New filter → back to the start of the row.
    useEffect(() => {
        if (rowRef.current) rowRef.current.scrollLeft = 0
        updateArrows()
    }, [filtered])

    useEffect(() => {
        window.addEventListener('resize', updateArrows)
        return () => window.removeEventListener('resize', updateArrows)
    }, [])

    const scrollRow = (dir) => {
        const el = rowRef.current
        if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
    }

    return (
        <section id="shop" className="py-20 lg:py-28 px-4 md:px-6 lg:px-16 bg-[#FDF8F5] scroll-mt-24">
            <div className="max-w-[1440px] mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                    <div>
                        <p className="text-[#ED0000] text-[11px] font-bold tracking-[4px] uppercase mb-3">Shop</p>
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
                            Shop all products
                        </h2>
                        <p className="text-gray-500 text-[14px] mt-3">
                            Pick your favourites, add them to your cart and check out in minutes.
                        </p>
                    </div>
                    <Link to="/products" className="flex items-center gap-2 text-[12px] font-bold text-gray-600 border-b border-gray-300 pb-1 hover:text-gray-900 transition-colors whitespace-nowrap self-start md:self-auto">
                        Open full shop <ArrowRight size={14} />
                    </Link>
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search products…"
                                className="w-full bg-white border border-gray-200 rounded-full py-3 pl-11 pr-10 text-[13px] font-medium outline-none focus:border-[#ED0000] transition-colors"
                            />
                            {query && (
                                <button onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                aria-label="Sort products"
                                className="flex-1 sm:flex-none bg-white border border-gray-200 rounded-full py-3 px-5 text-[12px] font-bold text-gray-700 outline-none focus:border-[#ED0000] cursor-pointer"
                            >
                                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                            <label className="flex items-center gap-2 bg-white border border-gray-200 rounded-full py-3 px-5 text-[12px] font-bold text-gray-700 cursor-pointer select-none whitespace-nowrap">
                                <input
                                    type="checkbox"
                                    checked={inStockOnly}
                                    onChange={(e) => setInStockOnly(e.target.checked)}
                                    className="accent-[#ED0000]"
                                />
                                In stock
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
                        {categoryChips.map(c => (
                            <button
                                key={c.name}
                                onClick={() => pickCategory(c.name)}
                                className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-bold transition-all ${
                                    activeCategory === c.name
                                        ? 'bg-[#ED0000] text-white shadow-md'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:text-gray-900 hover:border-gray-300'
                                }`}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between text-[12px] text-gray-500">
                        <span>{loading && products.length === 0 ? 'Loading products…' : (canRight || canLeft ? 'Scroll for more →' : '')}</span>
                        {hasFilters && (
                            <button onClick={resetFilters} className="font-bold text-gray-700 hover:text-[#ED0000]">Clear filters</button>
                        )}
                    </div>
                </div>

                {/* Carousel — one row, scroll sideways for more */}
                {loading && products.length === 0 ? (
                    <div className="flex gap-3 md:gap-6 overflow-hidden">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="shrink-0 w-[46%] sm:w-[31%] lg:w-[23%] xl:w-[15.5%] aspect-[3/4] rounded-2xl md:rounded-[30px] bg-white/70 animate-pulse" />
                        ))}
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="relative group/row">
                        <div
                            ref={rowRef}
                            onScroll={updateArrows}
                            className="flex gap-3 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide pb-2 -mx-4 px-4 scroll-px-4 md:mx-0 md:px-0 md:scroll-px-0"
                        >
                            {filtered.map(p => (
                                <div key={p.id} className="snap-start shrink-0 w-[46%] sm:w-[31%] lg:w-[23%] xl:w-[15.5%]">
                                    <ProductCard product={p} />
                                </div>
                            ))}
                        </div>
                        {canLeft && (
                            <button
                                onClick={() => scrollRow(-1)}
                                aria-label="Scroll left"
                                className="hidden md:flex absolute -left-5 top-[38%] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-gray-200 shadow-lg items-center justify-center text-gray-800 hover:bg-[#ED0000] hover:text-white hover:border-[#ED0000] transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        {canRight && (
                            <button
                                onClick={() => scrollRow(1)}
                                aria-label="Scroll right"
                                className="hidden md:flex absolute -right-5 top-[38%] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-gray-200 shadow-lg items-center justify-center text-gray-800 hover:bg-[#ED0000] hover:text-white hover:border-[#ED0000] transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                        <p className="text-gray-900 font-bold mb-2">No products match your filters</p>
                        <button onClick={resetFilters} className="text-[12px] font-bold text-[#ED0000]">Clear filters</button>
                    </div>
                )}
            </div>

            {/* Floating cart bar — appears once something is in the cart */}
            <AnimatePresence>
                {itemCount > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        // Desktop/tablet only: on mobile the bottom tab bar already has Cart.
                        className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md"
                    >
                        <div className="flex items-center justify-between gap-3 bg-gray-900 text-white rounded-full pl-5 pr-2 py-2 shadow-2xl">
                            <div className="flex items-center gap-3 min-w-0">
                                <ShoppingBag size={18} className="shrink-0" />
                                <span className="text-[12px] font-bold truncate">
                                    {itemCount} item{itemCount === 1 ? '' : 's'} · ₦{cartTotal.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <Link to="/cart" className="px-4 py-2.5 rounded-full text-[11px] font-bold hover:bg-white/10 transition-colors">
                                    View cart
                                </Link>
                                <Link to="/checkout" className="px-4 py-2.5 rounded-full bg-[#ED0000] text-[11px] font-bold hover:bg-red-700 transition-colors flex items-center gap-1">
                                    Checkout <ArrowRight size={12} />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}

export default ShopSection
