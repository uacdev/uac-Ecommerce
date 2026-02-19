import { motion, AnimatePresence } from 'framer-motion'
import { Instagram, MessageCircle, Menu, X, Sun, Moon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const { isDark, toggleTheme } = useTheme()

    return (
        <nav className="fixed top-0 left-0 w-full z-50 md:px-6 md:py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center glass px-6 py-3 md:px-8 md:py-4 transition-all duration-500 rounded-none md:rounded-[24px]" style={{ backgroundColor: 'var(--nav-bg)' }}>
                <Link to="/" className="flex items-center gap-2 group">
                    <img src="/images/logo_nobg.png" alt="Logo" className="h-12 md:h-20 w-auto group-hover:scale-105 transition-transform" />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-10">
                    <Link to="/" className="text-xs font-bold uppercase tracking-[0.2em] hover:text-[#F18B24] transition-colors" style={{ color: 'var(--text-primary)' }}>Home</Link>
                    <Link to="/track-order" className="text-xs font-bold uppercase tracking-[0.2em] hover:text-[#F18B24] transition-colors" style={{ color: 'var(--text-primary)' }}>Track Order</Link>
                    <a href="#all-products" className="text-xs font-bold uppercase tracking-[0.2em] hover:text-[#F18B24] transition-colors" style={{ color: 'var(--text-primary)' }}>Collection</a>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-3 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95"
                        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
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

                    <a href="#all-products" className="btn-primary py-3 px-8 text-xs uppercase tracking-widest font-black rounded-2xl block text-center">
                        Shop Now
                    </a>
                </div>

                {/* Mobile Toggle */}
                <div className="md:hidden flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl transition-all"
                        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                    >
                        {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-black" />}
                    </button>
                    <button className="p-2" onClick={() => setIsOpen(!isOpen)} style={{ color: 'var(--text-primary)' }}>
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute top-24 left-6 right-6 p-10 flex flex-col gap-8 md:hidden shadow-2xl border"
                        style={{ background: 'var(--bg-primary)', borderColor: 'var(--divider)', borderRadius: '32px', zIndex: 100 }}
                    >
                        <Link to="/" onClick={() => setIsOpen(false)} className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Home</Link>
                        <Link to="/track-order" onClick={() => setIsOpen(false)} className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Track Order</Link>
                        <a href="#all-products" onClick={() => setIsOpen(false)} className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Collection</a>
                        <div className="flex gap-4 pt-4" style={{ borderTop: '1px solid var(--divider)' }}>
                            <Instagram size={24} style={{ color: 'var(--text-muted)' }} />
                            <MessageCircle size={24} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <a href="#all-products" onClick={() => setIsOpen(false)} className="btn-primary w-full text-center">Shop Now</a>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

export default Navbar
