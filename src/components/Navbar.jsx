import { motion, AnimatePresence } from 'framer-motion'
import { Instagram, MessageCircle, Menu, X, Sun, Moon, ShoppingBag, Search, ChevronRight, ChevronDown, LayoutGrid, Sofa, Zap, Sparkles, Cpu, ShoppingBasket, Heart, ArrowRight } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useStore } from '../context/StoreContext'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [catOpen, setCatOpen] = useState(false)
    const [mobileCatOpen, setMobileCatOpen] = useState(false)
    const [flipped, setFlipped] = useState(false)
    const { isDark, toggleTheme } = useTheme()
    const { cartCount, favorites, categories: storeCategories } = useStore()
    const navigate = useNavigate()

    const categories = useMemo(() => {
        return storeCategories.map(cat => ({
            name: cat === 'All' ? 'Shop All' : cat,
            icon: cat === 'Furniture' ? Sofa : cat === 'Appliances' ? Zap : cat === 'Gadgets' ? Cpu : cat === 'Decor' ? Sparkles : LayoutGrid,
            desc: `Browse ${cat.toLowerCase()} collection`,
            filter: cat
        }))
    }, [storeCategories])

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery)}#all-products`)
            setSearchOpen(false)
            setSearchQuery('')
        }
    }

    const handleCategoryClick = (filter) => {
        navigate(`/shop?category=${encodeURIComponent(filter)}`)
        setCatOpen(false)
        setIsOpen(false)
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setFlipped(prev => !prev);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-50 md:px-6 md:py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center glass px-4 py-3 md:px-8 md:py-4 transition-all duration-500 rounded-none md:rounded-[32px] border-none shadow-2xl" style={{ backgroundColor: 'var(--nav-bg)' }}>
                    
                    {/* Logo Section */}
                    <Link to="/" className="flex items-center gap-2 group shrink-0">
                        <img 
                            src="/images/logo_nobg.png" 
                            alt="Logo" 
                            className="h-24 md:h-32 lg:h-36 w-auto group-hover:scale-110 transition-transform duration-500 object-contain" 
                            style={{ 
                                filter: isDark 
                                    ? 'brightness(0) invert(1) drop-shadow(0 2px 12px rgba(241,139,36,0.85))' 
                                    : 'drop-shadow(0 2px 12px rgba(241,139,36,0.55)) drop-shadow(0 1px 4px rgba(0,0,0,0.18))' 
                            }}
                        />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-10">
                        {/* Categories Dropdown */}
                        <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
                            <button
                                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] hover:text-[#F18B24] transition-colors"
                                style={{ color: catOpen ? '#F18B24' : 'var(--text-primary)' }}
                            >
                                <ShoppingBasket size={14} />
                                Categories
                                <motion.span animate={{ rotate: catOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                    <ChevronDown size={13} />
                                </motion.span>
                            </button>

                            <AnimatePresence>
                                {catOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                        transition={{ duration: 0.18 }}
                                        className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-72 rounded-3xl shadow-2xl border overflow-hidden"
                                        style={{ background: 'var(--bg-primary)', borderColor: 'var(--divider)' }}
                                    >
                                        <div className="p-2">
                                            {categories.map((cat) => {
                                                const Icon = cat.icon
                                                return (
                                                    <button
                                                        key={cat.name}
                                                        onClick={() => handleCategoryClick(cat.filter)}
                                                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-[#F18B2410] transition-colors group text-left"
                                                    >
                                                        <div className="w-9 h-9 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center group-hover:bg-[#F18B24] transition-colors shrink-0">
                                                            <Icon size={16} className="text-[#F18B24] group-hover:text-white transition-colors" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
                                                            <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{cat.desc}</p>
                                                        </div>
                                                        <ChevronRight size={14} className="ml-auto text-[#F18B24] opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <Link to="/shop" className="text-[10px] font-black uppercase tracking-[0.25em] hover:text-[#F18B24] transition-colors relative group" style={{ color: 'var(--text-primary)' }}>
                            Shop All
                            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#F18B24] transition-all group-hover:w-full" />
                        </Link>
                        <Link to="/track-order" className="text-[10px] font-black uppercase tracking-[0.25em] hover:text-[#F18B24] transition-colors" style={{ color: 'var(--text-primary)' }}>Track Order</Link>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-3 lg:gap-5">
                        {/* Search Trigger */}
                        <button 
                            onClick={() => setSearchOpen(!searchOpen)}
                            className="p-3 rounded-2xl hover:bg-[#F18B2410] transition-colors cursor-pointer"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            <Search size={22} strokeWidth={2.5} />
                        </button>

                        {/* Favorites Icon */}
                        <Link to="/favorites" className="p-3 rounded-2xl hover:bg-red-50 transition-colors relative group">
                            <Heart size={22} strokeWidth={2.5} style={{ color: 'var(--text-primary)' }} className="group-hover:text-red-500 transition-colors" />
                            {favorites.length > 0 && (
                                <motion.span
                                    key={favorites.length}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[var(--nav-bg)]"
                                >
                                    {favorites.length}
                                </motion.span>
                            )}
                        </Link>

                        {/* Cart Icon */}
                        <Link to="/checkout" className="p-3 rounded-2xl hover:bg-[#F18B2410] transition-colors relative group">
                            <ShoppingBag size={22} strokeWidth={2.5} style={{ color: 'var(--text-primary)' }} />
                            {cartCount > 0 && (
                                <motion.span 
                                    key={cartCount}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute -top-1 -right-1 w-6 h-6 bg-[#F18B24] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[var(--nav-bg)] shadow-lg shadow-[#F18B2430]"
                                >
                                    {cartCount}
                                </motion.span>
                            )}
                        </Link>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-3 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95"
                            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                        >
                            <AnimatePresence mode="wait">
                                {isDark ? (
                                    <motion.div key="sun" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }}>
                                        <Sun size={20} className="text-yellow-400" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="moon" initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -90 }}>
                                        <Moon size={20} className="text-black" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>

                        <Link to="/shop" className="btn-primary py-3.5 px-8 text-[10px] uppercase tracking-widest font-black rounded-2xl shadow-lg shadow-[#F18B2420]">
                            Shop Store
                        </Link>
                    </div>

                    {/* Mobile Icons (Visible on small screens) */}
                    <div className="md:hidden flex items-center gap-1">
                        <button 
                            onClick={() => setSearchOpen(!searchOpen)}
                            className="p-2.5 rounded-xl cursor-pointer"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            <Search size={20} strokeWidth={2.5} />
                        </button>

                        <Link to="/favorites" className="p-2.5 rounded-xl relative">
                            <Heart size={20} strokeWidth={2.5} style={{ color: 'var(--text-primary)' }} />
                            {favorites.length > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                                    {favorites.length}
                                </span>
                            )}
                        </Link>
                        
                        <Link to="/checkout" className="p-2.5 rounded-xl relative">
                            <ShoppingBag size={20} strokeWidth={2.5} style={{ color: 'var(--text-primary)' }} />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-[#F18B24] text-white text-[8px] font-black rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <button 
                            className="p-2.5 rounded-xl" 
                            onClick={() => setIsOpen(!isOpen)} 
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>
            
            {/* Search Overlay/Bar - Global capture */}
            <AnimatePresence>
                {searchOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSearchOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed top-32 left-6 right-6 z-[70]"
                        >
                            <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative cursor-default" onClick={(e) => e.stopPropagation()}>
                                <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="Search products, brands, categories..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-16 md:h-20 px-8 rounded-3xl glass border-2 border-[#F18B24]/30 focus:border-[#F18B24] outline-none text-lg font-bold shadow-2xl transition-all"
                                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                />
                                <button className="absolute right-6 top-1/2 -translate-y-1/2 text-[#F18B24]">
                                    <ChevronRight size={32} />
                                </button>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Mobile/Hamburger Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-[85%] max-w-sm z-50 p-8 flex flex-col shadow-2xl"
                            style={{ background: 'var(--bg-primary)' }}
                        >
                            <div className="flex justify-between items-center mb-12">
                                <img src="/images/logo_nobg.png" alt="Logo" className="h-12 w-auto" />
                                <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl bg-[var(--bg-secondary)]" style={{ color: 'var(--text-primary)' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <Link
                                to="/shop"
                                onClick={() => setIsOpen(false)}
                                className="btn-primary w-full py-4 text-center font-black uppercase tracking-widest text-xs mb-6 block"
                            >
                                Start Shopping
                            </Link>

                            <div className="flex flex-col gap-2 mb-8 overflow-y-auto flex-1">
                                <motion.a
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.05 }}
                                    href="#all-products"
                                    onClick={() => setIsOpen(false)}
                                    className="text-xl font-black flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-[#F18B2408] transition-colors group"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    New Arrivals
                                    <ChevronRight size={18} className="text-[#F18B24] opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.a>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <button
                                        onClick={() => setMobileCatOpen(v => !v)}
                                        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-colors"
                                        style={{
                                            background: mobileCatOpen ? '#F18B2410' : 'transparent',
                                            color: mobileCatOpen ? '#F18B24' : 'var(--text-primary)'
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <ShoppingBasket size={20} />
                                            <span className="text-xl font-black">Categories</span>
                                        </div>
                                        <motion.span animate={{ rotate: mobileCatOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                                            <ChevronRight size={20} className={mobileCatOpen ? 'text-[#F18B24]' : ''} />
                                        </motion.span>
                                    </button>

                                    <AnimatePresence>
                                        {mobileCatOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pt-2 pb-2 pl-4 flex flex-col gap-1">
                                                    {categories.map((cat, i) => {
                                                        const Icon = cat.icon
                                                        return (
                                                            <motion.button
                                                                key={cat.name}
                                                                initial={{ opacity: 0, x: 10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: i * 0.05 }}
                                                                onClick={() => { handleCategoryClick(cat.filter); setMobileCatOpen(false) }}
                                                                className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-[#F18B2410] transition-colors group text-left w-full"
                                                            >
                                                                <div className="w-9 h-9 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center group-hover:bg-[#F18B24] transition-colors shrink-0">
                                                                    <Icon size={16} className="text-[#F18B24] group-hover:text-white transition-colors" />
                                                                </div>
                                                                <div className="text-left">
                                                                    <p className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
                                                                    <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{cat.desc}</p>
                                                                </div>
                                                            </motion.button>
                                                        )
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.12 }}
                                >
                                    <Link
                                        to="/favorites"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-red-50 transition-colors group w-full"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Heart size={20} className="text-red-500" />
                                            <span className="text-xl font-black">Favourites</span>
                                        </div>
                                        {favorites.length > 0 && (
                                            <span className="w-7 h-7 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center">{favorites.length}</span>
                                        )}
                                    </Link>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <Link
                                        to="/track-order"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-[#F18B2408] transition-colors group w-full"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        <span className="text-xl font-black">Track Order</span>
                                        <ChevronRight size={18} className="text-[#F18B24] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </motion.div>
                            </div>

                            <div className="mt-auto space-y-6">
                                <div className="flex justify-between items-center p-4 rounded-2xl bg-[var(--bg-secondary)]">
                                    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Theme Mode</span>
                                    <button
                                        onClick={toggleTheme}
                                        className="p-2.5 rounded-xl border"
                                        style={{ background: 'var(--nav-bg)', borderColor: 'var(--divider)' }}
                                    >
                                        {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-black" />}
                                    </button>
                                </div>
                                <div className="flex gap-4">
                                    <a href="https://www.instagram.com/selloutandrelocate.ng?igsh=djByMTlvb21sMmVn" target="_blank" rel="noopener noreferrer">
                                        <Instagram size={28} className="text-[#E4405F] cursor-pointer hover:opacity-80 transition-opacity" />
                                    </a>
                                    <MessageCircle size={28} className="text-[#25D366]" />
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

export default Navbar
