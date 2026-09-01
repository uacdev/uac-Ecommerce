import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sun, Moon, ShoppingBag, Search, ChevronRight, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useStore } from '../context/StoreContext'
import { useCustomerAuth } from '../context/CustomerAuthContext'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const { isDark, toggleTheme } = useTheme()
    const store = useStore() || {}
    const { cartCount = 0, favorites = [] } = store
    const navigate = useNavigate()
    const { customer } = useCustomerAuth() || {}
    const accountHref = customer ? '/account' : '/account/login'

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
            setSearchOpen(false)
            setSearchQuery('')
        }
    }

    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-50 bg-[var(--bg-primary)]/80 backdrop-blur-3xl border-b border-[var(--divider)] transition-all duration-500">
                <div className="max-w-[1440px] mx-auto flex justify-between items-center px-6 py-6 lg:px-12">
                    
                    {/* Logo Section */}
                    <div className="flex-1">
                        <Link to="/" className="inline-block group shrink-0">
                            <img src="/images/uac_foods_full.png" alt="UAC Foods" className="h-10 w-auto object-contain transition-transform hover:scale-105" />
                        </Link>
                    </div>

                    {/* Desktop Menu - Centered */}
                    <div className="hidden lg:flex items-center gap-10 flex-initial">
                        <Link to="/" className="text-[13px] font-bold tracking-[0.05em] hover:text-[var(--brand-red)] transition-colors relative group text-[var(--text-primary)]">
                            Home
                            <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-[var(--brand-red)] transition-all group-hover:w-full" />
                        </Link>

                        <Link to="/products" className="text-[13px] font-bold tracking-[0.05em] hover:text-[var(--brand-red)] transition-colors relative group text-[var(--text-primary)]">
                            Products
                            <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-[var(--brand-red)] transition-all group-hover:w-full" />
                        </Link>
                        
                        <Link to="/about" className="text-[13px] font-bold tracking-[0.05em] hover:text-[var(--brand-red)] transition-colors relative group text-[var(--text-primary)]">
                            Story
                            <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-[var(--brand-red)] transition-all group-hover:w-full" />
                        </Link>
                    </div>

                    {/* Desktop Actions - Right Aligned */}
                    <div className="hidden md:flex items-center gap-6 flex-1 justify-end">
                        <button 
                            onClick={() => setSearchOpen(!searchOpen)}
                            className="p-2 text-[var(--text-primary)] hover:text-[var(--brand-red)] transition-colors"
                        >
                            <Search size={18} strokeWidth={3} />
                        </button>

                        <Link to="/cart" className="p-2 relative text-[var(--text-primary)] hover:text-[var(--brand-red)] transition-colors">
                            <ShoppingBag size={18} strokeWidth={3} />
                            {cartCount > 0 && (
                                <motion.span 
                                    key={cartCount}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--brand-red)] text-white text-[8px] font-bold rounded-full flex items-center justify-center"
                                >
                                    {cartCount}
                                </motion.span>
                            )}
                        </Link>

                        <Link to={accountHref} className="p-2 text-[var(--text-primary)] hover:text-[var(--brand-red)] transition-colors relative" title={customer ? `Signed in as ${customer.fullName?.split(' ')[0] || customer.email}` : 'Sign in'}>
                            <User size={18} strokeWidth={3} />
                            {customer && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-primary)]" />}
                        </Link>
                    </div>

                    <div className="md:hidden flex items-center gap-4">
                        <Link to="/cart" className="p-2 relative text-[var(--text-primary)]">
                            <ShoppingBag size={18} strokeWidth={3} />
                            {cartCount > 0 && (
                                <motion.span 
                                    key={cartCount}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--brand-red)] text-white text-[8px] font-bold rounded-full flex items-center justify-center"
                                >
                                    {cartCount}
                                </motion.span>
                            )}
                        </Link>
                        <button 
                            className="p-2 text-[var(--text-primary)]" 
                            onClick={() => setIsOpen(!isOpen)} 
                        >
                            {isOpen ? <X size={20} /> : <Menu size={20} />}
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
                                <img src="/images/uac_foods_full.png" alt="UAC Foods" className="h-10 w-auto" />
                                <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-2 overflow-y-auto flex-1">
                                <Link to="/" onClick={() => setIsOpen(false)} className="text-xl font-bold px-4 py-3 rounded-2xl text-[var(--text-primary)]">Home</Link>
                                <Link to="/products" onClick={() => setIsOpen(false)} className="text-xl font-bold px-4 py-3 rounded-2xl text-[var(--text-primary)]">Products</Link>
                                <Link to="/about" onClick={() => setIsOpen(false)} className="text-xl font-bold px-4 py-3 rounded-2xl text-[var(--text-primary)]">Story</Link>
                                                <Link to={accountHref} onClick={() => setIsOpen(false)} className="text-xl font-bold px-4 py-3 rounded-2xl text-[var(--text-primary)] flex items-center gap-3">
                                    <User size={18} className="text-[var(--brand-red)]" />
                                    {customer ? `Hi, ${customer.fullName?.split(' ')[0] || 'you'}` : 'Sign in / Create account'}
                                </Link>
                                
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
