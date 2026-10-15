import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sun, Moon, ShoppingBag, Search, ChevronRight, User, Heart, House, ShoppingCart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useStore } from '../context/StoreContext'
import { useCustomerAuth } from '../context/CustomerAuthContext'

const getMobilePageTitle = (pathname, search, products, customer) => {
    if (pathname === '/') return ''
    if (pathname.startsWith('/product/')) {
        const productId = pathname.split('/')[2]
        return products.find(product => String(product.id) === productId)?.name || 'Product'
    }
    if (pathname === '/checkout' || pathname.startsWith('/checkout/')) return customer ? 'Checkout' : 'Sign in to checkout'
    if (pathname === '/products' || pathname === '/shop') {
        return new URLSearchParams(search).has('search') ? 'Search results' : 'Products'
    }

    const titles = {
        '/cart': 'Your cart',
        '/favorites': 'Favorites',
        '/success': 'Order confirmed',
        '/order-failed': 'Payment issue',
        '/delivery-selection': 'Choose delivery method',
        '/deliver-selection': 'Choose delivery method',
        '/success-delivery': 'Delivery confirmed',
        '/track-order': 'Track your order',
        '/about': 'Our story',
        '/privacy-policy': 'Privacy policy',
        '/data-protection': 'Data protection',
        '/terms': 'Terms and conditions',
        '/account/login': 'Sign in',
        '/account/signup': 'Create account',
        '/account/reset-password': 'Reset password',
        '/account': 'My account'
    }

    return titles[pathname] || ''
}

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const { isDark, toggleTheme } = useTheme()
    const store = useStore() || {}
    const { cartCount = 0, favorites = [], products = [] } = store
    const navigate = useNavigate()
    const location = useLocation()
    const { customer } = useCustomerAuth() || {}
    const accountHref = customer ? '/account' : '/account/login'
    const pathname = location.pathname
    const mobilePageTitle = getMobilePageTitle(pathname, location.search, products, customer)
    const mobileLinks = [
        { to: '/', label: 'Home', icon: House, active: pathname === '/' },
        { to: '/products', label: 'Shop', icon: ShoppingBag, active: pathname === '/products' || pathname === '/shop' || pathname.startsWith('/product/') },
        { to: '/favorites', label: 'Saved', icon: Heart, count: favorites.length, active: pathname.startsWith('/favorites') },
        { to: '/cart', label: 'Cart', icon: ShoppingCart, count: cartCount, active: pathname.startsWith('/cart') || pathname.startsWith('/checkout') },
        { to: accountHref, label: 'Account', icon: User, active: pathname.startsWith('/account') }
    ]

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
                <div className="max-w-[1440px] mx-auto flex justify-between items-center px-4 py-3 md:px-6 md:py-6 lg:px-12">
                    
                    {/* Logo Section */}
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                        <Link to="/" className="inline-block group shrink-0">
                            <img src="/images/uac_foods_full.png" alt="UAC Foods" className="h-7 w-auto object-contain transition-transform hover:scale-105 md:h-10" />
                        </Link>
                        {mobilePageTitle && (
                            <h1 className="min-w-0 truncate text-[13px] font-bold leading-tight text-[var(--text-primary)] md:hidden">
                                {mobilePageTitle}
                            </h1>
                        )}
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

                    <div className="md:hidden flex items-center gap-2">
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

            <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--divider)] bg-[var(--bg-primary)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
                <div className="mx-auto grid h-14 max-w-lg grid-cols-5">
                    {mobileLinks.map(({ to, label, icon: Icon, count, active }) => (
                        <Link
                            key={label}
                            to={to}
                            aria-current={active ? 'page' : undefined}
                            className={`relative flex min-w-0 flex-col items-center justify-center gap-1 transition-colors ${active ? 'text-[var(--brand-red)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                        >
                            <span className="relative">
                                <Icon size={19} strokeWidth={active ? 2.5 : 2} />
                                {count > 0 && (
                                    <span className="absolute -right-2 -top-1 min-w-4 h-4 rounded-full bg-[var(--brand-red)] px-1 text-[8px] font-bold leading-4 text-white text-center">
                                        {count > 99 ? '99+' : count}
                                    </span>
                                )}
                            </span>
                            <span className="max-w-full truncate px-1 text-[9px] font-bold leading-none">{label}</span>
                        </Link>
                    ))}
                </div>
            </nav>
        </>
    )
}

export default Navbar
