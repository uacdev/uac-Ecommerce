import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    LayoutDashboard, ShoppingCart, Package, Users, BarChart3, 
    Settings, LogOut, Sun, Moon, Star, Layers, 
    ChevronLeft, ChevronRight, AlertCircle, Sparkles
} from 'lucide-react'

const AdminSidebar = ({ activeTab, setActiveTab, toggleTheme, isDark, logout, collapsed, setCollapsed }) => {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    
    const menuItems = [
        { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'orders', label: 'Orders', icon: <ShoppingCart size={20} />, count: 24 },
        { id: 'products', label: 'Products', icon: <Package size={20} /> },
        { id: 'categories', label: 'Categories', icon: <Layers size={20} /> },
        { id: 'customers', label: 'Customers', icon: <Users size={20} />, count: 32 },
        { id: 'reviews', label: 'Reviews', icon: <Star size={20} />, count: 14 },
        { id: 'stats', label: 'Activity stats', icon: <BarChart3 size={20} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
    ]

    return (
        <>
            <motion.aside
                animate={{ width: collapsed ? 100 : 280 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="fixed lg:static h-screen z-[1000] flex flex-col shrink-0 overflow-hidden bg-[var(--bg-secondary)] border-r border-[var(--divider)] shadow-sm font-['Sen',sans-serif]"
            >
                {/* BRAND LOGO & TOGGLE */}
                <div className={`shrink-0 flex items-center h-32 ${collapsed ? 'justify-center' : 'px-8 justify-between'}`}>
                    <div className="flex items-center gap-3">
                        <img src="/images/uac_foods_full.png" className="h-16 w-auto object-contain transition-transform hover:scale-105" alt="UAC" />
                    </div>
                </div>

                {/* NAV LINKS */}
                <nav className="flex-1 px-4 space-y-8 overflow-y-auto no-scrollbar py-6">
                    {menuItems.map((item) => (
                        <NavLink 
                            key={item.id}
                            icon={item.icon} 
                            label={item.label} 
                            active={activeTab === item.id} 
                            onClick={() => setActiveTab(item.id)} 
                            collapsed={collapsed}
                            count={item.count}
                        />
                    ))}
                </nav>

                {/* BOTTOM ACTIONS */}
                <div className={`p-4 border-t border-[var(--divider)] space-y-4 pb-10`}>
                    <button
                        onClick={toggleTheme}
                        className={`flex items-center gap-4 px-5 py-4 rounded-xl text-[var(--text-muted)] hover:text-[#ed0000] transition-all ${collapsed ? 'justify-center w-full' : 'w-full'}`}
                    >
                        {isDark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} />}
                        {!collapsed && <span className="text-[13px] font-medium">Toggle theme</span>}
                    </button>
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className={`flex items-center gap-4 px-5 py-4 rounded-xl text-[#ed0000]/70 hover:text-[#ed0000] transition-all ${collapsed ? 'justify-center w-full' : 'w-full'}`}
                    >
                        <LogOut size={20} />
                        {!collapsed && <span className="text-[13px] font-medium">Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* LOGOUT CONFIRMATION MODAL */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center p-6 backdrop-blur-sm bg-black/40 font-['Sen',sans-serif]">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[var(--bg-tertiary)] rounded-2xl p-8 max-w-sm w-full shadow-2xl relative border border-[var(--divider)]">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-14 h-14 bg-red-50 text-[#ed0000] rounded-full flex items-center justify-center mb-4">
                                    <AlertCircle size={28} />
                                </div>
                                <h3 className="text-lg font-medium text-[var(--text-primary)]">End session</h3>
                                <p className="text-[13px] text-[var(--text-muted)] font-medium mt-2">Are you sure you want to sign out?</p>
                                <div className="grid grid-cols-2 gap-3 w-full mt-8">
                                    <button onClick={() => setShowLogoutConfirm(false)} className="py-3 rounded-xl border border-[var(--divider)] text-[var(--text-secondary)] font-medium text-[13px] hover:bg-slate-50 transition-all">Cancel</button>
                                    <button onClick={logout} className="py-3 rounded-xl bg-[#ed0000] text-white font-medium text-[13px] shadow-lg shadow-red-200 hover:bg-red-700 transition-all">Logout</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

const NavLink = ({ icon, label, active, onClick, collapsed, count }) => (
    <button
        onClick={onClick}
        className={`w-full relative flex items-center group transition-all duration-200 ${
            collapsed ? 'justify-center h-12 w-12 mx-auto' : 'gap-5 px-6 py-2'
        } ${active
            ? 'text-[#ed0000]'
            : 'text-[var(--text-muted)] hover:text-[#ed0000]'
        }`}
    >
        {active && !collapsed && (
            <motion.div layoutId="activeNav" className="absolute left-0 top-0 bottom-0 w-1 bg-[#ed0000] rounded-r-full" />
        )}
        <div className={`shrink-0 transition-transform ${active ? 'scale-100' : 'group-hover:scale-105'}`}>
            {icon}
        </div>
        {!collapsed && (
            <div className="flex-1 flex items-center justify-between overflow-hidden">
                <span className={`text-[13px] tracking-tight whitespace-nowrap ${active ? 'font-bold' : 'font-medium opacity-100'}`}>
                    {label}
                </span>
                {count && (
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${active ? 'bg-[#ed0000] text-white' : 'bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--divider)]'}`}>
                        {count}
                    </span>
                )}
            </div>
        )}
        
        {collapsed && (
            <div className="absolute left-full ml-4 px-3 py-2 bg-black text-white text-[10px] font-medium rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-[2000] shadow-xl">
                {label}
            </div>
        )}
    </button>
)

export default AdminSidebar
