import { motion, AnimatePresence } from 'framer-motion'
import { Instagram, MessageCircle, Menu, X, Sun, Moon, ShoppingBag, Search, ChevronRight, ChevronDown, ShoppingBasket, Heart, Building2, UtensilsCrossed, Waves, IceCream, Cookie } from 'lucide-react'
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
    const { isDark, toggleTheme } = useTheme()
    const store = useStore() || {}
    const { cartCount = 0, favorites = [] } = store
    const navigate = useNavigate()

    const brandCategories = [
        { name: 'Gala', icon: UtensilsCrossed, desc: 'The King of Snacks since 1962', filter: 'Gala' },
        { name: 'Supreme', icon: IceCream, desc: 'Rich and Creamy Indulgence', filter: 'Supreme' },
        { name: 'Swan', icon: Waves, desc: 'Natural Spring Water', filter: 'Swan' },
        { name: 'Funtime', icon: Cookie, desc: 'Tasty Coconut Chips & More', filter: 'Funtime' }
    ]

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

    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-50 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--divider)]">
                <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4 lg:px-8">
                    
                    {/* Logo Section */}
                    <Link to="/" className="flex items-center gap-2 group shrink-0">
                        <img 
                            src="/images/uac_logo.png" 
                            alt="UAC Foods" 
                            className="h-12 md:h-14 lg:h-16 w-auto group-hover:scale-105 transition-transform duration-500 object-contain" 
                        />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-10">
                        {/* Categories Dropdown */}
                        <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
                            <button
                                className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] hover:text-[var(--brand-red)] transition-colors"
                                style={{ color: catOpen ? 'var(--brand-red)' : 'var(--text-primary)' }}
                            >
                                <ShoppingBasket size={15} />
                                Iconic Brands
                                <motion.span animate={{ rotate: catOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                    <ChevronDown size={14} />
                                </motion.span>
                            </button>

                            <AnimatePresence>
                                {catOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-80 rounded-3xl shadow-2xl border overflow-hidden p-3"
                                        style={{ background: 'var(--bg-primary)', borderColor: 'var(--divider)' }}
                                    >
                                        <div className="grid gap-2">
                                            {brandCategories.map((cat) => (
                                                <button
                                                    key={cat.name}
                                                    onClick={() => handleCategoryClick(cat.filter)}
                                                    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-[var(--brand-red)]/5 transition-colors group text-left"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center group-hover:bg-[var(--brand-red)] transition-colors shrink-0">
                                                        <cat.icon size={18} className="text-[var(--brand-red)] group-hover:text-white transition-colors" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)]">{cat.name}</p>
                                                        <p className="text-[10px] font-medium text-[var(--text-muted)]">{cat.desc}</p>
                                                    </div>
                                                    <ChevronRight size={14} className="ml-auto text-[var(--brand-red)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <Link to="/shop" className="text-[11px] font-black uppercase tracking-[0.2em] hover:text-[var(--brand-red)] transition-colors relative group text-[var(--text-primary)]">
                            Our Portfolio
                            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[var(--brand-red)] transition-all group-hover:w-full" />
                        </Link>
                        
                        <Link to="/about" className="text-[11px] font-black uppercase tracking-[0.2em] hover:text-[var(--brand-red)] transition-colors relative group text-[var(--text-primary)]">
                            About UAC
                            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[var(--brand-red)] transition-all group-hover:w-full" />
                        </Link>

                        <Link to="/track-order" className="text-[11px] font-black uppercase tracking-[0.2em] hover:text-[var(--brand-red)] transition-colors text-[var(--text-primary)]">Track Delivery</Link>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-5">
                        {/* Search Trigger */}
                        <button 
                            onClick={() => setSearchOpen(!searchOpen)}
                            className="p-2.5 rounded-xl hover:bg-[var(--brand-red)]/10 transition-colors text-[var(--text-primary)]"
                        >
                            <Search size={20} strokeWidth={2.5} />
                        </button>

                        {/* Cart/Bag */}
                        <Link to="/checkout" className="p-2.5 rounded-xl hover:bg-[var(--brand-red)]/10 transition-colors relative text-[var(--text-primary)]">
                            <ShoppingBag size={22} strokeWidth={2.5} />
                            {cartCount > 0 && (
                                <motion.span 
                                    key={cartCount}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--brand-red)] text-white text-[9px] font-black rounded-full flex items-center justify-center"
                                >
                                    {cartCount}
                                </motion.span>
                            )}
                        </Link>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl border border-[var(--divider)] hover:bg-[var(--bg-secondary)] transition-colors"
                        >
                            <AnimatePresence mode="wait">
                                {isDark ? (
                                    <motion.div key="sun" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }}>
                                        <Sun size={18} className="text-yellow-400" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="moon" initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -90 }}>
                                        <Moon size={18} className="text-black" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>

                        <Link to="/shop" className="btn-primary py-3 px-6 text-[10px] uppercase tracking-widest font-black rounded-xl">
                            Direct Shop
                        </Link>
                    </div>

                    {/* Mobile Icons */}
                    <div className="md:hidden flex items-center gap-2">
                        <Link to="/checkout" className="p-2.5 rounded-xl relative text-[var(--text-primary)]">
                            <ShoppingBag size={20} strokeWidth={2.5} />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--brand-red)] text-white text-[8px] font-black rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <button 
                            className="p-2.5 rounded-xl text-[var(--text-primary)]" 
                            onClick={() => setIsOpen(!isOpen)} 
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>
            
            {/* Search Overlay/Bar */}
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
                            className="fixed top-24 left-6 right-6 z-[70]"
                        >
                            <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative">
                                <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="Search iconic brands..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-16 md:h-18 px-8 rounded-2xl bg-[var(--bg-primary)] border-2 border-[var(--brand-red)]/30 focus:border-[var(--brand-red)] outline-none text-lg font-bold shadow-2xl transition-all"
                                    style={{ color: 'var(--text-primary)' }}
                                />
                                <button className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--brand-red)]">
                                    <ChevronRight size={24} />
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
                            className="fixed top-0 right-0 h-full w-[85%] max-w-sm z-50 p-8 flex flex-col shadow-2xl bg-[var(--bg-primary)]"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <img src="/images/uac_logo.png" alt="UAC Foods" className="h-10 w-auto" />
                                <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-2 overflow-y-auto flex-1">
                                <Link to="/shop" onClick={() => setIsOpen(false)} className="text-xl font-black px-4 py-3 rounded-2xl text-[var(--text-primary)]">Our Portfolio</Link>
                                <Link to="/about" onClick={() => setIsOpen(false)} className="text-xl font-black px-4 py-3 rounded-2xl text-[var(--text-primary)]">About Us</Link>
                                <Link to="/track-order" onClick={() => setIsOpen(false)} className="text-xl font-black px-4 py-3 rounded-2xl text-[var(--text-primary)]">Track Delivery</Link>
                                
                                <div className="mt-4 pt-4 border-t border-[var(--divider)]">
                                    <p className="px-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Brands</p>
                                    <div className="grid gap-2">
                                        {brandCategories.map((cat) => (
                                            <button
                                                key={cat.name}
                                                onClick={() => handleCategoryClick(cat.filter)}
                                                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[var(--brand-red)]/5 text-left"
                                            >
                                                <cat.icon size={18} className="text-[var(--brand-red)]" />
                                                <span className="text-sm font-bold text-[var(--text-primary)]">{cat.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto space-y-6">
                                <button
                                    onClick={toggleTheme}
                                    className="w-full flex justify-between items-center p-4 rounded-2xl bg-[var(--bg-secondary)]"
                                >
                                    <span className="font-bold text-sm text-[var(--text-primary)]">Theme Mode</span>
                                    {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-black" />}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

export default Navbar
