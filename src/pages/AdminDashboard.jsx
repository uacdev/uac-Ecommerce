import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard, Package, ShoppingCart, BarChart3, Settings, LogOut,
    Plus, Search, Clock, CheckCircle2, Truck, X, Edit3, Trash2, Sun, Moon,
    User, Phone, MapPin, Mail, ChevronDown, ChevronUp, Eye, Bell, MoreHorizontal,
    CreditCard, Users, ArrowUpRight, TrendingUp, Filter, Download, MessageSquare,
    ChevronRight, ArrowLeft, MoreVertical, Shield, Menu
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { useTheme } from '../context/ThemeContext'
import { CATEGORIES } from '../data/products'

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showAddProduct, setShowAddProduct] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [showNotifications, setShowNotifications] = useState(false)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const { isDark, toggleTheme } = useTheme()
    const { loading } = useStore()

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-primary)] z-[99999]">
                <div className="flex flex-col items-center gap-6">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-12 h-12 border-4 border-[#F18B24] border-t-transparent rounded-full"
                    />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Synchronizing SR-Cloud</p>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 flex overflow-hidden z-[9999] transition-all duration-500" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
            {/* ════ MOBILE SIDEBAR BACKDROP ════ */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* ════ LEFT SIDEBAR (ProfitPulse/Mate Style) ════ */}
            <aside 
                className={`fixed lg:static inset-y-0 left-0 w-64 flex flex-col shrink-0 transition-transform duration-300 z-[101] lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} 
                style={{ background: isDark ? '#000000' : '#0F1115', borderRight: '1px solid var(--divider)' }}
            >
                {/* Brand */}
                <div className="p-8 flex items-center justify-between lg:justify-start gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#F18B24] flex items-center justify-center">
                            <Shield className="text-white" size={18} />
                        </div>
                        <span className="text-white font-black text-sm tracking-tighter uppercase">SELLOUT</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/40 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                    <SidebarGroup label="Navigation">
                        <SidebarLink icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setSelectedOrder(null); setIsSidebarOpen(false); }} />
                        <SidebarLink icon={<ShoppingCart size={18} />} label="Orders" active={activeTab === 'orders'} onClick={() => { setActiveTab('orders'); setSelectedOrder(null); setIsSidebarOpen(false); }} />
                        <SidebarLink icon={<Package size={18} />} label="Products" active={activeTab === 'products'} onClick={() => { setActiveTab('products'); setSelectedOrder(null); setIsSidebarOpen(false); }} />
                        <SidebarLink icon={<Users size={18} />} label="Customers" active={activeTab === 'customers'} onClick={() => { setActiveTab('customers'); setSelectedOrder(null); setIsSidebarOpen(false); }} />
                    </SidebarGroup>

                    <SidebarGroup label="Finance">
                        <SidebarLink icon={<BarChart3 size={18} />} label="Payments" active={activeTab === 'ledger'} onClick={() => { setActiveTab('ledger'); setSelectedOrder(null); setIsSidebarOpen(false); }} />
                        <SidebarLink icon={<TrendingUp size={18} />} label="Reports" active={activeTab === 'stats'} onClick={() => { setActiveTab('stats'); setSelectedOrder(null); setIsSidebarOpen(false); }} />
                    </SidebarGroup>

                    <SidebarGroup label="App">
                        <SidebarLink icon={<Settings size={18} />} label="Settings" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setSelectedOrder(null); setIsSidebarOpen(false); }} />
                    </SidebarGroup>
                </nav>

                <div className="p-6 border-t border-white/5 space-y-4">
                    <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-3 py-2 text-white/40 hover:text-white transition-colors text-xs font-bold">
                        {isDark ? <Sun size={16} /> : <Moon size={16} />}
                        {isDark ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button 
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-white/40 hover:text-red-500 transition-colors text-xs font-bold"
                    >
                        <LogOut size={16} /> Log out
                    </button>
                </div>
            </aside>

            {/* ════ MAIN CONTENT ════ */}
            <main className="flex-1 flex flex-col min-w-0 transition-colors duration-500" style={{ background: 'var(--bg-secondary)' }}>
                {/* Topbar */}
                <header className="h-20 flex items-center justify-between px-6 lg:px-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--divider)]" style={{ color: 'var(--text-primary)' }}>
                            <Menu size={20} />
                        </button>
                        <h1 className="text-xl lg:text-3xl font-black font-heading tracking-tight capitalize">{activeTab}</h1>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-6">
                        <div className="relative group hidden xl:block">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[#F18B24] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search... (⌘+K)"
                                className="w-48 bg-[var(--bg-primary)] border border-[var(--divider)] shadow-sm rounded-xl pl-12 pr-4 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-[#F18B2420] focus:border-[#F18B24] transition-all"
                                style={{ color: 'var(--text-primary)' }}
                            />
                        </div>

                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="w-10 h-10 rounded-xl flex items-center justify-center relative transition-colors bg-[var(--bg-primary)] border border-[var(--divider)] hover:border-[#F18B2420]"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-[#F18B24] rounded-full border-2 border-[var(--bg-primary)]" />
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-4 w-80 glass z-20 overflow-hidden"
                                        >
                                            <div className="p-4 border-b border-[var(--divider)] flex justify-between items-center bg-[var(--bg-primary)]">
                                                <p className="text-xs font-black uppercase tracking-widest">Notifications</p>
                                                <button className="text-[10px] text-[#F18B24] font-bold">Mark all read</button>
                                            </div>
                                            <div className="max-h-[350px] overflow-y-auto">
                                                <NotificationItem 
                                                    title="New Order Received" 
                                                    desc="Order #SR-2026-8921 just came in." 
                                                    time="2 mins ago" 
                                                    icon={<ShoppingCart size={14}/>} 
                                                    color="bg-blue-500"
                                                />
                                                <NotificationItem 
                                                    title="Payout Successful" 
                                                    desc="₦120,500 has been sent to James." 
                                                    time="1 hour ago" 
                                                    icon={<CreditCard size={14}/>} 
                                                    color="bg-green-500"
                                                />
                                                <NotificationItem 
                                                    title="Product Flagged" 
                                                    desc="Minimalist Lamp reported for wrong category." 
                                                    time="3 hours ago" 
                                                    icon={<Package size={14}/>} 
                                                    color="bg-red-500"
                                                />
                                            </div>
                                            <button className="w-full py-3 text-[10px] font-black uppercase tracking-widest border-t border-[var(--divider)] hover:bg-[var(--bg-secondary)] transition-colors">
                                                View All Activity
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex items-center gap-4 pl-6" style={{ borderLeft: '1px solid var(--divider)' }}>
                            <div className="text-right">
                                <p className="text-xs font-black">Kristina Evans</p>
                                <p className="text-[10px] font-bold text-[var(--text-muted)]">admin@sellout.ng</p>
                            </div>
                            <img src="https://i.pravatar.cc/100?u=admin" className="w-10 h-10 rounded-full border-2" style={{ borderColor: 'var(--bg-primary)', boxShadow: 'var(--card-shadow)' }} alt="" />
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && <OverviewTab key="overview" />}
                            {activeTab === 'orders' && <OrdersTab key="orders" onSelect={setSelectedOrder} selectedId={selectedOrder?.id} />}
                            {activeTab === 'products' && <ProductsTab key="products" onEdit={setEditingProduct} onAdd={() => setShowAddProduct(true)} />}
                            {activeTab === 'ledger' && <LedgerTab key="ledger" />}
                            {activeTab === 'customers' && <CustomersTab key="customers" />}
                            {activeTab === 'stats' && <StatsTab key="stats" />}
                            {activeTab === 'settings' && <SettingsTab key="settings" />}
                        </AnimatePresence>
                    </div>

                    <AnimatePresence>
                        {selectedOrder && (
                            <OrderDetailPanel
                                order={selectedOrder}
                                onClose={() => setSelectedOrder(null)}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <AnimatePresence>
                {(showAddProduct || editingProduct) && (
                    <ProductModal
                        product={editingProduct}
                        onClose={() => { setShowAddProduct(false); setEditingProduct(null); }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showLogoutConfirm && (
                    <LogoutModal onConfirm={() => { window.location.href = '/'; }} onCancel={() => setShowLogoutConfirm(false)} />
                )}
            </AnimatePresence>
        </div>
    )
}

const SidebarGroup = ({ label, children }) => (
    <div className="pb-4">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-3">{label}</p>
        <div className="space-y-1">{children}</div>
    </div>
)

const SidebarLink = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                ? 'bg-white text-black shadow-lg shadow-black/10'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
    >
        {icon}
        <span className="text-xs font-bold">{label}</span>
    </button>
)

const OverviewTab = () => {
    const { stats, orders } = useStore()

    const deliveredCount = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length
    const transitCount = orders.filter(o => o.status === 'shipped').length
    const pendingCount = orders.filter(o => o.status === 'paid' || o.status === 'confirmed').length
    const total = orders.length || 1

    const assistedDeliveryTotal = orders
        .filter(o => o.deliveryMethod === 'assisted')
        .reduce((sum, o) => sum + (o.amount || 0), 0)
    
    const selfPickupTotal = orders
        .filter(o => o.deliveryMethod === 'self')
        .reduce((sum, o) => sum + (o.amount || 0), 0)

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard title="Total Volume" value={`₦${stats.totalRevenue.toLocaleString()}`} trend="+12.5%" isPositive />
                <StatCard title="SR Commission" value={`₦${stats.platformIncome.toLocaleString()}`} trend="+8.4%" isPositive isOrange />
                <StatCard title="Store Listings" value={stats.totalProducts} trend="+3 New" />
                <StatCard title="Completion" value={`${Math.round((deliveredCount / total) * 100)}%`} trend="+0.5%" isPositive />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 rounded-[24px] p-8 transition-colors duration-500" style={{ background: 'var(--bg-primary)', border: '1px solid var(--divider)', boxShadow: 'var(--card-shadow)' }}>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black">Escrow Performance</h3>
                            <p className="text-xs font-bold text-[var(--text-muted)]">Manual verification and logistics tracking.</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="relative w-56 h-56 shrink-0">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="opacity-10" />
                                <circle 
                                    cx="50" cy="50" r="45" fill="none" stroke="#F18B24" strokeWidth="8" 
                                    strokeDasharray={`${(assistedDeliveryTotal / (stats.totalRevenue || 1)) * 283} 283`} 
                                    strokeLinecap="round" 
                                />
                                <circle 
                                    cx="50" cy="50" r="45" fill="none" stroke="#10B981" strokeWidth="8" 
                                    strokeDasharray={`${(selfPickupTotal / (stats.totalRevenue || 1)) * 283} 283`} 
                                    strokeDashoffset={`-${(assistedDeliveryTotal / (stats.totalRevenue || 1)) * 283}`} 
                                    strokeLinecap="round" 
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                                <p className="text-xl font-black">₦{Math.round(stats.totalRevenue / 1000)}k</p>
                                <p className="text-[10px] font-bold text-[var(--text-muted)]">Total GMV</p>
                            </div>
                        </div>

                        <div className="flex-1 w-full space-y-6">
                            <ProgressRow label="Assisted Delivery" value={`₦${assistedDeliveryTotal.toLocaleString()}`} percentage={Math.round((assistedDeliveryTotal / (stats.totalRevenue || 1)) * 100)} color="#F18B24" />
                            <ProgressRow label="Self-Arranged" value={`₦${selfPickupTotal.toLocaleString()}`} percentage={Math.round((selfPickupTotal / (stats.totalRevenue || 1)) * 100)} color="#10B981" />
                            <ProgressRow label="Escrow Margin" value={`₦${stats.platformIncome.toLocaleString()}`} percentage={Math.round((stats.platformIncome / (stats.totalRevenue || 1)) * 100)} color="#3B82F6" />
                        </div>
                    </div>
                </div>

                <div className="rounded-[24px] p-8 transition-colors duration-500" style={{ background: 'var(--bg-primary)', border: '1px solid var(--divider)', boxShadow: 'var(--card-shadow)' }}>
                    <h3 className="text-xl font-black mb-8">Pipeline Tracking</h3>
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="text-xs font-bold">Fulfilled</span>
                            </div>
                            <span className="text-xs font-black">{deliveredCount}/{orders.length}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(deliveredCount / total) * 100}%` } } className="h-full bg-green-500" />
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-[#F18B24]" />
                                <span className="text-xs font-bold">In Transit</span>
                            </div>
                            <span className="text-xs font-black">{transitCount}/{orders.length}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(transitCount / total) * 100}%` }} className="h-full bg-[#F18B24]" />
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-blue-400" />
                                <span className="text-xs font-bold">Awaiting Transit</span>
                            </div>
                            <span className="text-xs font-black">{pendingCount}/{orders.length}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(pendingCount / total) * 100}%` }} className="h-full bg-blue-400" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

const StatCard = ({ title, value, trend, isPositive, isOrange }) => (
    <div className="rounded-[24px] p-6 shadow-sm transition-colors duration-500" style={{ background: 'var(--bg-primary)', border: '1px solid var(--divider)' }}>
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">{title}</p>
        <p className={`text-2xl font-black font-heading ${isOrange ? 'text-[#F18B24]' : ''}`}>{value}</p>
        <div className={`mt-2 flex items-center gap-1 text-[10px] font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            <TrendingUp size={12} className={!isPositive ? 'rotate-180' : ''} />
            {trend}
        </div>
    </div>
)

const ProgressRow = ({ label, value, percentage, color }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-end">
            <div>
                <p className="text-xs font-black mb-1">{label}</p>
                <p className="text-xs font-bold text-[var(--text-muted)]">{value}</p>
            </div>
            <p className="text-xs font-black" style={{ color }}>{percentage}%</p>
        </div>
        <div className="h-2 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1 }} className="h-full rounded-full" style={{ background: color }} />
        </div>
    </div>
)

const OrdersTab = ({ onSelect, selectedId }) => {
    const { orders } = useStore()

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-[24px] shadow-sm overflow-hidden transition-colors duration-500" style={{ background: 'var(--bg-primary)', border: '1px solid var(--divider)' }}>
            <div className="p-8 border-b flex items-center justify-between" style={{ borderColor: 'var(--divider)' }}>
                <div className="flex gap-4">
                    <button className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest" style={{ background: '#F18B2410', color: '#F18B24' }}>Active Orders</button>
                    <button className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors" style={{ color: 'var(--text-muted)' }}>Archived</button>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 text-xs font-bold transition-colors" style={{ color: 'var(--text-muted)' }}>
                        <Filter size={16} /> Filter
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                    <tr>
                        <th className="px-10 py-5">Order</th>
                        <th className="px-10 py-5">Customer</th>
                        <th className="px-10 py-5">Status</th>
                        <th className="px-10 py-5">Total</th>
                        <th className="px-10 py-5 text-right">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--divider)' }}>
                    {orders.map(order => (
                        <motion.tr
                            key={order.id}
                            onClick={() => onSelect(order)}
                            className={`group cursor-pointer transition-colors ${selectedId === order.id ? 'bg-[#F18B2408]' : ''}`}
                            style={{ background: selectedId === order.id ? '#F18B2408' : 'transparent' }}
                        >
                            <td className="px-10 py-6">
                                <span className="text-xs font-black">#{order.id.slice(-6)}</span>
                            </td>
                            <td className="px-10 py-6">
                                <div className="flex items-center gap-3">
                                    <img src={`https://i.pravatar.cc/100?u=${order.buyerName}`} className="w-9 h-9 rounded-full bg-gray-200" alt="" />
                                    <span className="text-xs font-black truncate max-w-[120px]">{order.buyerName}</span>
                                </div>
                            </td>
                            <td className="px-10 py-6">
                                <StatusPill status={order.status} />
                            </td>
                            <td className="px-10 py-6">
                                <span className="text-xs font-black">₦{order.amount.toLocaleString()}</span>
                            </td>
                            <td className="px-10 py-6 text-right">
                                <div className="flex items-center justify-end gap-4">
                                    <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>{new Date(order.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                    <MoreHorizontal size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-muted)' }} />
                                </div>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
            </div>
        </motion.div>
    )
}

const StatusPill = ({ status }) => {
    const styles = {
        pending: 'bg-gray-400/10 text-gray-500',
        paid: 'bg-yellow-400/10 text-yellow-600',
        confirmed: 'bg-blue-400/10 text-blue-600',
        shipped: 'bg-indigo-400/10 text-indigo-600',
        delivered: 'bg-emerald-400/10 text-emerald-600',
        completed: 'bg-green-400/10 text-green-600',
        refunded: 'bg-red-400/10 text-red-600',
    }

    const labels = {
        pending: 'Pending Payment',
        paid: 'Awaiting Confirmation',
        confirmed: 'Payment Confirmed',
        shipped: 'In Transit',
        delivered: 'Delivered',
        completed: 'Completed (Settled)',
        refunded: 'Refunded',
    }

    return (
        <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${styles[status]}`}>
            {labels[status] || status}
        </span>
    )
}

const OrderDetailPanel = ({ order, onClose }) => {
    const { updateOrderStatus } = useStore()

    const handleUpdateStatus = (newStatus) => {
        updateOrderStatus(order.id, newStatus)
    }

    return (
        <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            className="fixed lg:static inset-y-0 right-0 w-full lg:w-[450px] shadow-2xl z-[102] lg:z-50 overflow-hidden flex flex-col transition-colors duration-500"
            style={{ background: 'var(--bg-primary)', borderLeft: '1px solid var(--divider)' }}
        >
            <div className="p-8 border-b flex items-center justify-between" style={{ borderColor: 'var(--divider)' }}>
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-black">Order ID</h3>
                    <span className="text-xs font-mono bg-[var(--bg-secondary)] px-2 py-1 rounded border border-[var(--divider)]">{order.id}</span>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}>
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-10 space-y-12 custom-scrollbar">
                <div className="text-center">
                    <img src={`https://i.pravatar.cc/300?u=${order.buyerName}`} className="w-24 h-24 rounded-full mx-auto mb-6 shadow-xl bg-gray-100" style={{ boxShadow: 'var(--card-shadow)' }} />
                    <h4 className="text-2xl font-black mb-1">{order.buyerName}</h4>
                    <p className="text-xs font-bold mb-8" style={{ color: 'var(--text-muted)' }}>{order.buyerEmail || 'Guest Customer'}</p>

                    <div className="flex justify-center gap-3">
                        <SocialAction icon={<Mail size={18} />} />
                        <SocialAction icon={<Phone size={18} />} />
                        <SocialAction icon={<MessageSquare size={18} />} />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Transaction Items</h5>
                        <StatusPill status={order.status} />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-6 p-4 rounded-2xl border border-transparent transition-all group" style={{ background: 'var(--bg-secondary)' }}>
                            <img src={order.productImage} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black truncate">{order.productName}</p>
                                <p className="text-[10px] font-bold mt-1 uppercase tracking-widest text-[#F18B24]">₦{order.amount.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <LogisticsCard 
                        label="Payment Source" 
                        value={order.paymentMethod === 'bank' ? 'Direct Bank Transfer' : 'Paystack Online'} 
                        icon={<CreditCard size={14} />} 
                        color="text-[#F18B24]" 
                    />
                    <LogisticsCard 
                        label="Delivery Route" 
                        value={order.deliveryMethod === 'self' ? 'Self-Arranged' : 'SR-Assisted'} 
                        icon={<Truck size={14} />} 
                        color="text-indigo-500" 
                    />
                </div>

                <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--divider)' }}>
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin size={14} className="text-red-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Destination</p>
                    </div>
                    <p className="text-xs font-bold leading-relaxed">{order.buyerAddress || 'Address not registered for this order.'}</p>
                    <p className="text-[10px] font-bold mt-2" style={{ color: 'var(--text-muted)' }}>{order.buyerPhone}</p>
                </div>
            </div>

            <div className="p-8 border-t space-y-4" style={{ borderColor: 'var(--divider)' }}>
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Order Total</span>
                    <span className="text-2xl font-black text-[#F18B24]">₦{order.amount.toLocaleString()}</span>
                </div>

                {/* Workflow Action Buttons — Aligned with PRD */}
                {order.status === 'pending' && (
                    <ActionBtn label="Confirm Payment Selection" full onClick={() => handleUpdateStatus('paid')} />
                )}
                {order.status === 'paid' && (
                    <ActionBtn label="Verify & Confirm Funds" full color="bg-blue-600" onClick={() => handleUpdateStatus('confirmed')} />
                )}
                {order.status === 'confirmed' && (
                    <ActionBtn label="Ready for Transit" full color="bg-indigo-600" onClick={() => handleUpdateStatus('shipped')} />
                )}
                {order.status === 'shipped' && (
                    <ActionBtn label="Mark as Delivered" full color="bg-emerald-600" onClick={() => handleUpdateStatus('delivered')} />
                )}
                {order.status === 'delivered' && (
                    <ActionBtn label="Settle Seller (Finalize)" full color="bg-green-600" onClick={() => handleUpdateStatus('completed')} />
                )}
                {order.status === 'completed' && (
                    <div className="w-full py-4 rounded-xl text-center text-xs font-black uppercase tracking-widest bg-green-500/10 text-green-600 border border-green-500/20">
                        ✓ Transaction Completed & Settled
                    </div>
                )}

                <div className="flex gap-4">
                    <SecondaryBtn label="Print Invoice" full />
                    {order.status !== 'completed' && order.status !== 'refunded' && (
                        <button 
                            onClick={() => handleUpdateStatus('refunded')} 
                            className="w-full py-4 rounded-xl bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10"
                        >
                            Issue Refund
                        </button>
                    )}
                </div>
            </div>
        </motion.aside>
    )
}

const SocialAction = ({ icon }) => (
    <button className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm border border-transparent hover:border-[#F18B2420]" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
        {icon}
    </button>
)

const LogisticsCard = ({ label, value, icon, color }) => (
    <div className="p-4 rounded-2xl space-y-2" style={{ background: 'var(--bg-secondary)' }}>
        <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${color}`}>
            {icon} {label}
        </div>
        <p className="text-xs font-black truncate">{value}</p>
    </div>
)

const ActionBtn = ({ label, full, color = 'bg-black dark:bg-[#F18B24]', onClick }) => (
    <button
        onClick={onClick}
        className={`${full ? 'w-full' : ''} py-4 rounded-xl ${color} text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-transform active:scale-95`}
    >
        {label}
    </button>
)

const SecondaryBtn = ({ label, full }) => (
    <button className={`${full ? 'w-full' : ''} py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors`} style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
        {label}
    </button>
)

const ProductsTab = ({ onEdit, onAdd }) => {
    const { products, removeProduct } = useStore()

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black">All Products</h2>
                    <p className="text-xs font-bold text-[var(--text-muted)]">Manage your active storefront inventory.</p>
                </div>
                <button onClick={onAdd} className="px-6 py-3 rounded-xl bg-[#F18B24] text-white text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:scale-105 transition-transform active:scale-95">
                    <Plus size={16} /> New Product
                </button>
            </div>

            <div className="rounded-[24px] shadow-sm overflow-hidden transition-colors duration-500 overflow-x-auto" style={{ background: 'var(--bg-primary)', border: '1px solid var(--divider)' }}>
                <table className="w-full text-left min-w-[800px]">
                    <thead className="text-[10px] font-black uppercase tracking-[0.2em] border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--divider)' }}>
                        <tr>
                            <th className="px-10 py-5">Product Details</th>
                            <th className="px-10 py-5">Category</th>
                            <th className="px-10 py-5">Price</th>
                            <th className="px-10 py-5">Status</th>
                            <th className="px-10 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--divider)' }}>
                        {products.map(product => (
                            <tr key={product.id} className="group transition-colors hover:bg-[var(--bg-secondary)]">
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-6">
                                        <img src={product.image} className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-sm" alt="" />
                                        <div>
                                            <p className="text-sm font-black">{product.name}</p>
                                            <p className="text-[10px] font-bold mt-1 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{product.location}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-6">
                                    <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{product.category}</span>
                                </td>
                                <td className="px-10 py-6">
                                    <span className="text-xs font-black">₦{product.price.toLocaleString()}</span>
                                </td>
                                <td className="px-10 py-6">
                                    <ProductPill status={product.status === 'sold' ? 'Sold Out' : 'Active'} />
                                </td>
                                <td className="px-10 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onEdit(product)} className="p-2.5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}><Edit3 size={16} /></button>
                                        <button onClick={() => removeProduct(product.id)} className="p-2.5 rounded-lg text-red-500 transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    )
}

const ProductPill = ({ status }) => {
    const isSuccess = status === 'Active'
    return (
        <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit" style={{ background: isSuccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: isSuccess ? '#10B981' : '#EF4444' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: isSuccess ? '#10B981' : '#EF4444' }} />
            {status}
        </span>
    )
}

const LedgerTab = () => {
    const { orders, stats } = useStore()
    const confirmedOrders = orders.filter(o => ['paid', 'payment_confirmed', 'awaiting_delivery', 'in_transit', 'delivered', 'completed'].includes(o.status))

    const totalVolume = confirmedOrders.reduce((sum, o) => sum + o.amount, 0)
    const platformIncome = confirmedOrders.reduce((sum, o) => {
        const fee = o.commission || Math.round(o.amount * 0.1)
        return sum + fee
    }, 0)
    const sellerPayouts = totalVolume - platformIncome

    const exportToCSV = () => {
        const headers = ['Order ID', 'Date', 'Product', 'Seller Name', 'Buyer', 'Total Amount', 'SR Commission', 'Seller Payout', 'Status']
        const csvData = confirmedOrders.map(o => {
            const fee = o.commission || Math.round(o.amount * 0.1)
            return [
                o.id,
                new Date(o.date).toLocaleDateString(),
                o.productName,
                o.sellerName || 'Platform',
                o.buyerName,
                o.amount,
                fee,
                o.amount - fee,
                o.status
            ]
        })

        const csvContent = [headers, ...csvData].map(e => e.join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `SR_Ledger_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Financial Ledger</h2>
                    <p className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>TRANSACTION ARCHIVE & PROFIT TRACKING</p>
                </div>
                <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-6 py-3 bg-[#F18B24] rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:scale-105 transition-transform shadow-lg shadow-orange-500/20"
                >
                    <Download size={14} /> Export CSV Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl border transition-colors duration-500" style={{ background: 'var(--bg-primary)', borderColor: 'var(--divider)' }}>
                    <p className="text-[10px] font-black uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Total Volume (GMV)</p>
                    <p className="text-2xl font-black">₦{totalVolume.toLocaleString()}</p>
                </div>
                <div className="p-6 rounded-3xl border transition-colors duration-500" style={{ background: 'var(--bg-primary)', borderColor: 'var(--divider)' }}>
                    <p className="text-[10px] font-black uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Platform Earnings</p>
                    <p className="text-2xl font-black text-emerald-500">₦{platformIncome.toLocaleString()}</p>
                </div>
                <div className="p-6 rounded-3xl border transition-colors duration-500" style={{ background: 'var(--bg-primary)', borderColor: 'var(--divider)' }}>
                    <p className="text-[10px] font-black uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Seller Payouts</p>
                    <p className="text-2xl font-black text-indigo-500">₦{sellerPayouts.toLocaleString()}</p>
                </div>
            </div>

            <div className="rounded-3xl border overflow-hidden overflow-x-auto" style={{ borderColor: 'var(--divider)', background: 'var(--bg-primary)' }}>
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                        <tr className="border-b" style={{ borderColor: 'var(--divider)', background: 'var(--bg-secondary)' }}>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Ref ID</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Date</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Transaction (Seller)</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Volume</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Commission</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Payout</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ divideColor: 'var(--divider)' }}>
                        {confirmedOrders.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-20 text-center text-sm font-bold" style={{ color: 'var(--text-muted)' }}>No transactions recorded in this period.</td>
                            </tr>
                        ) : (
                            confirmedOrders.map((order) => {
                                const fee = order.commission || Math.round(order.amount * 0.1)
                                const sellerPayout = order.amount - fee
                                return (
                                    <tr key={order.id} className="hover:bg-[var(--bg-secondary)] transition-colors group">
                                        <td className="px-6 py-4 font-mono text-[10px]">{order.id.slice(0, 8)}</td>
                                        <td className="px-6 py-4 text-[11px] font-bold">{new Date(order.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-black">{order.productName}</div>
                                            <div className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>{order.sellerName || 'S&R Seller'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-[11px] font-black">₦{order.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-[11px] font-black text-emerald-500">₦{fee.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-[11px] font-black text-indigo-500">₦{sellerPayout.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <StatusPill status={order.status} />
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-8 rounded-3xl border border-dashed text-center space-y-3" style={{ borderColor: 'var(--divider)' }}>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F18B24]">Platform Disclosure</p>
                <p className="text-xs font-bold leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                    All transactions recorded here represent verified buyer payments. Commissions are calculated based on the platform surcharge. 
                    Sellers should be settled once delivery is confirmed by the operations team.
                </p>
            </div>
        </motion.div>
    )
}

const NotificationItem = ({ title, desc, time, icon, color }) => (
    <div className="p-4 flex gap-4 hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer border-b border-[var(--divider)]">
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center shrink-0 text-white`}>
            {icon}
        </div>
        <div>
            <p className="text-[11px] font-black">{title}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{desc}</p>
            <p className="text-[9px] text-[#F18B24] font-bold mt-2 uppercase tracking-widest">{time}</p>
        </div>
    </div>
)

const LogoutModal = ({ onConfirm, onCancel }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[20000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="p-8 rounded-[32px] w-full max-w-sm text-center space-y-6" style={{ background: 'var(--bg-primary)' }}>
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto">
                <LogOut className="text-red-500" size={24} />
            </div>
            <div>
                <h3 className="text-xl font-black mb-2">Terminate Session?</h3>
                <p className="text-xs font-bold text-[var(--text-muted)] leading-relaxed">You will be logged out of the SR-Cloud administrator panel.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <button onClick={onCancel} className="py-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[var(--bg-secondary)]" style={{ color: 'var(--text-muted)' }}>Stay logged in</button>
                <button onClick={onConfirm} className="py-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-500 text-white shadow-lg shadow-red-500/20">Sign out</button>
            </div>
        </motion.div>
    </motion.div>
)

const CustomersTab = () => {
    const { orders } = useStore()
    const customers = useMemo(() => {
        const unique = {}
        orders.forEach(o => {
            if (!unique[o.buyerEmail]) {
                unique[o.buyerEmail] = {
                    name: o.buyerName,
                    email: o.buyerEmail,
                    phone: o.buyerPhone,
                    orders: 0,
                    spend: 0
                }
            }
            unique[o.buyerEmail].orders += 1
            unique[o.buyerEmail].spend += o.amount
        })
        return Object.values(unique)
    }, [orders])

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            <div>
                <h2 className="text-2xl font-black">Community Directory</h2>
                <p className="text-xs font-bold text-[var(--text-muted)]">Verified buyers across the SR ecosystem.</p>
            </div>

            <div className="rounded-[24px] shadow-sm overflow-hidden overflow-x-auto" style={{ background: 'var(--bg-primary)', border: '1px solid var(--divider)' }}>
                <table className="w-full text-left min-w-[700px]">
                    <thead className="text-[10px] font-black uppercase tracking-[0.2em] border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--divider)' }}>
                        <tr>
                            <th className="px-10 py-5">Customer</th>
                            <th className="px-10 py-5">Contact Details</th>
                            <th className="px-10 py-5">History</th>
                            <th className="px-10 py-5 text-right">Total Life Value</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--divider)' }}>
                        {customers.map((c, i) => (
                            <tr key={i} className="group hover:bg-[var(--bg-secondary)]">
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#F18B24]/10 text-[#F18B24] flex items-center justify-center text-xs font-black">
                                            {c.name.charAt(0)}
                                        </div>
                                        <span className="text-xs font-black">{c.name}</span>
                                    </div>
                                </td>
                                <td className="px-10 py-6">
                                    <p className="text-xs font-bold">{c.email}</p>
                                    <p className="text-[10px] text-[var(--text-muted)] mt-1">{c.phone}</p>
                                </td>
                                <td className="px-10 py-6">
                                    <span className="text-[10px] font-black uppercase bg-[#F18B24]/10 text-[#F18B24] px-3 py-1 rounded-full">{c.orders} Orders</span>
                                </td>
                                <td className="px-10 py-6 text-right">
                                    <span className="text-xs font-black">₦{c.spend.toLocaleString()}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    )
}

const StatsTab = () => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            <div>
                <h2 className="text-2xl font-black">Analytical Reports</h2>
                <p className="text-xs font-bold text-[var(--text-muted)]">Performance metrics and growth visualizations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-3xl border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--divider)' }}>
                    <p className="text-xs font-black uppercase tracking-widest mb-10">Monthly Revenue Growth</p>
                    <div className="aspect-video flex items-end gap-2 px-2">
                        {[40, 60, 45, 90, 65, 80, 100].map((h, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ height: 0 }} 
                                animate={{ height: `${h}%` }} 
                                transition={{ delay: i * 0.1 }}
                                className="flex-1 bg-[#F18B24] rounded-t-lg opacity-80 hover:opacity-100" 
                            />
                        ))}
                    </div>
                </div>
                <div className="p-8 rounded-3xl border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--divider)' }}>
                    <p className="text-xs font-black uppercase tracking-widest mb-10">Sales by Category</p>
                    <div className="space-y-6">
                        <ProgressRow label="Furniture" percentage={65} color="#F18B24" value="₦4.2M" />
                        <ProgressRow label="Appliances" percentage={20} color="#3B82F6" value="₦1.1M" />
                        <ProgressRow label="Gadgets" percentage={15} color="#10B981" value="₦0.8M" />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

const SettingsTab = () => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 max-w-2xl">
            <div>
                <h2 className="text-2xl font-black">Platform Settings</h2>
                <p className="text-xs font-bold text-[var(--text-muted)]">Configuration for your marketplace infrastructure.</p>
            </div>

            <div className="space-y-8">
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F18B24]">Store Identity</h3>
                    <div className="grid gap-4">
                        <div className="p-6 rounded-2xl bg-[var(--bg-primary)] border" style={{ borderColor: 'var(--divider)' }}>
                            <label className="block text-[10px] font-black uppercase mb-2">Store Name</label>
                            <input readOnly value="Sellout & Relocate" className="w-full bg-transparent outline-none text-xs font-bold" />
                        </div>
                        <div className="p-6 rounded-2xl bg-[var(--bg-primary)] border" style={{ borderColor: 'var(--divider)' }}>
                            <label className="block text-[10px] font-black uppercase mb-2">Support Email</label>
                            <input readOnly value="hello@sellout.ng" className="w-full bg-transparent outline-none text-xs font-bold" />
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F18B24]">Commission Strategy</h3>
                    <div className="p-6 rounded-2xl bg-[var(--bg-primary)] border flex justify-between items-center" style={{ borderColor: 'var(--divider)' }}>
                        <div>
                            <p className="text-xs font-black">Fixed Platform Fee</p>
                            <p className="text-[10px] text-[var(--text-muted)] mt-1">Unified commission for all relocation sales.</p>
                        </div>
                        <span className="text-xl font-black">10%</span>
                    </div>
                </section>
            </div>
        </motion.div>
    )
}

const ProductModal = ({ product = null, onClose }) => {
    const { addProduct, updateProduct } = useStore()
    const isEdit = !!product

    const [form, setForm] = useState({
        name: product?.name || '',
        price: product?.price || '',
        sellerPrice: product?.sellerPrice || '',
        sellerName: product?.sellerName || '',
        description: product?.description || '',
        location: product?.location || '',
        category: product?.category || 'Furniture',
        image: product?.image || '',
        images: product?.images || ['', '', '']
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        const primaryImage = form.images[0] || form.image
        if (isEdit) {
            updateProduct(product.id, { ...form, image: primaryImage, price: parseInt(form.price) })
        } else {
            addProduct({ ...form, image: primaryImage, price: parseInt(form.price) })
        }
        onClose()
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="p-6 lg:p-12 rounded-[32px] w-full max-w-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar transition-colors duration-500" style={{ background: 'var(--bg-primary)' }} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-6 right-6 lg:top-8 lg:right-8 transition-colors" style={{ color: 'var(--text-muted)' }}>
                    <X size={24} />
                </button>

                <h2 className="text-2xl lg:text-3xl font-black mb-6 lg:mb-10">{isEdit ? 'Edit Listing' : 'New Listing'}</h2>

                <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Detailed Name</label>
                            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl px-4 lg:px-6 py-3 lg:py-4 outline-none text-sm font-bold transition-colors" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--divider)', color: 'var(--text-primary)' }} placeholder="e.g. Vintage Leather Sofa (Brown)" />
                        </div>

                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Seller Name / Ref</label>
                                <input required value={form.sellerName} onChange={e => setForm({ ...form, sellerName: e.target.value })} className="w-full rounded-xl px-6 py-4 outline-none text-xs font-bold transition-colors" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--divider)', color: 'var(--text-primary)' }} placeholder="e.g. Mrs. Adebayo" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Seller Payout Price (₦)</label>
                                <input required type="number" value={form.sellerPrice} onChange={e => setForm({ ...form, sellerPrice: e.target.value })} className="w-full rounded-xl px-6 py-4 outline-none text-xs font-bold transition-colors" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--divider)', color: 'var(--text-primary)' }} placeholder="e.g. 80000" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Listing Price (₦)</label>
                            <input required type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full rounded-xl px-6 py-4 outline-none text-sm font-black transition-colors" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--divider)', color: 'var(--text-primary)' }} placeholder="450000" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Category</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl px-6 py-4 outline-none text-sm font-bold appearance-none transition-colors" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--divider)', color: 'var(--text-primary)' }}>
                                {CATEGORIES.filter(c => c !== 'All').map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2 space-y-3 lg:space-y-4">
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Product Images (Min 3 recommended)</label>
                            {[0, 1, 2].map(i => (
                                <input
                                    key={i}
                                    value={form.images[i]}
                                    onChange={e => {
                                        const newImages = [...form.images]
                                        newImages[i] = e.target.value
                                        setForm({ ...form, images: newImages })
                                    }}
                                    className="w-full rounded-xl px-4 lg:px-6 py-3 lg:py-4 outline-none text-[10px] font-mono transition-colors"
                                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--divider)', color: 'var(--text-primary)' }}
                                    placeholder={`Image URL ${i + 1} ${i === 0 ? '(Primary)' : ''}`}
                                />
                            ))}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Location</label>
                            <input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full rounded-xl px-4 lg:px-6 py-3 lg:py-4 outline-none text-sm font-bold transition-colors" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--divider)', color: 'var(--text-primary)' }} placeholder="e.g. Lekki Phase 1, Lagos" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Description</label>
                            <textarea rows="4" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl px-4 lg:px-6 py-3 lg:py-4 outline-none text-sm font-bold resize-none transition-colors" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--divider)', color: 'var(--text-primary)' }} placeholder="Add some details about condition, age, etc..." />
                        </div>
                    </div>

                    <button type="submit" className="w-full py-4 lg:py-5 rounded-xl bg-black dark:bg-[#F18B24] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-transform active:scale-95">
                        {isEdit ? 'Update Listing' : 'Publish Listing'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    )
}

export default AdminDashboard
