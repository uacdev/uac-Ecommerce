import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard, Package, ShoppingCart, BarChart3, Settings, LogOut,
    Plus, Search, Clock, CheckCircle2, Truck, X, Edit3, Trash2, Sun, Moon,
    User, Phone, MapPin, Mail, ChevronDown, ChevronUp, Eye, Bell, MoreHorizontal,
    CreditCard, Users, ArrowUpRight, TrendingUp, Filter, Download, MessageSquare,
    ChevronRight, ArrowLeft, MoreVertical, Menu, Upload, Image as ImageIcon, Camera,
    Calendar, Star, Tag, Megaphone, Layers, Sparkles, FilterX, Shield, Lock, Trash,
    ArrowUpDown, ListFilter, LayoutGrid, FileText, CheckCircle, AlertCircle, Info, Zap
} from 'lucide-react'
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useStore } from '../context/StoreContext'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES as MOCK_CATEGORIES } from '../data/products'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { format } from 'date-fns'
import Preloader from '../components/Preloader'
import AdminSidebar from '../components/admin/AdminSidebar'
import KpiCard from '../components/admin/KpiCard'

const BRAND_RED = "#ed0000"

const analyticsData = {
    Daily: [
        { name: 'Mon', value: 1200 }, { name: 'Tue', value: 1900 }, { name: 'Wed', value: 1500 },
        { name: 'Thu', value: 2100 }, { name: 'Fri', value: 2400 }, { name: 'Sat', value: 1800 },
        { name: 'Sun', value: 1300 },
    ],
    Weekly: [
        { name: 'W1', value: 8000 }, { name: 'W2', value: 9500 }, { name: 'W3', value: 7200 }, { name: 'W4', value: 11000 },
    ],
    Monthly: [
        { name: 'Jan', value: 4000 }, { name: 'Feb', value: 3000 }, { name: 'Mar', value: 5000 },
        { name: 'Apr', value: 2780 }, { name: 'May', value: 1890 }, { name: 'Jun', value: 2390 },
        { name: 'Jul', value: 3490 }, { name: 'Aug', value: 4000 }, { name: 'Sep', value: 5500 },
        { name: 'Oct', value: 6000 }, { name: 'Nov', value: 4800 }, { name: 'Dec', value: 5900 },
    ]
}

const reviewsData = [
    { id: 1, name: 'Alice Johnson', rating: 5, comment: 'Gala Sausage roll was perfectly fresh!', product: 'Gala Original', date: '2026-03-24' },
    { id: 2, name: 'Robert Smith', rating: 4, comment: 'Quick delivery but the packaging could be better.', product: 'Supreme Fish', date: '2026-03-23' },
    { id: 3, name: 'Sarah Wilson', rating: 5, comment: 'Best e-commerce experience so far.', product: 'Swan Water', date: '2026-03-22' }
]

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showAddProduct, setShowAddProduct] = useState(false)
    const [showAddCategory, setShowAddCategory] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [editingCategory, setEditingCategory] = useState(null)
    const [productToDelete, setProductToDelete] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [dateRange, setDateRange] = useState({ start: '', end: '' })
    const [viewCategoryProducts, setViewCategoryProducts] = useState(null)
    const [viewCustomerStats, setViewCustomerStats] = useState(null)
    const [showNotifications, setShowNotifications] = useState(false)
    
    const { isDark, toggleTheme } = useTheme()
    const { loading, updateProduct, orders, products } = useStore()
    const { signOut: logout } = useAuth()

    const exportToCSV = (data, filename) => {
        if (!data || !data.length) return;
        const headers = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object').join(',');
        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + data.map(obj => Object.keys(obj).filter(k => typeof obj[k] !== 'object').map(k => `"${obj[k]}"`).join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}.csv`);
        link.click();
    }

    if (loading) return <Preloader />

    return (
        <div className="fixed inset-0 flex overflow-hidden z-[9999] transition-colors duration-300 font-['Sen',sans-serif] text-[var(--text-primary)] bg-[var(--bg-primary)]">
            <AdminSidebar
                activeTab={viewCategoryProducts ? 'categories' : (viewCustomerStats ? 'customers' : activeTab)}
                setActiveTab={(tab) => { setActiveTab(tab); setSelectedOrder(null); setViewCategoryProducts(null); setViewCustomerStats(null); }}
                collapsed={false}
                isDark={isDark}
                toggleTheme={toggleTheme}
                logout={() => logout()}
            />

            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <header className="h-20 flex items-center justify-between px-6 lg:px-10 border-b border-[var(--divider)] bg-[var(--bg-tertiary)] shrink-0 gap-6">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative max-w-xs w-full hidden md:block">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[#ed0000]" />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[var(--bg-primary)] border border-[var(--divider)] rounded-xl pl-12 pr-4 py-2.5 text-[13px] font-medium outline-none text-[var(--text-primary)] hover:border-[var(--divider)] focus:border-[#ed0000]/50 transition-all shadow-sm"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2.5 rounded-xl hover:bg-[var(--bg-secondary)] border border-[var(--divider)] transition-all text-[var(--text-primary)] shadow-sm">
                                <Bell size={18} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-[#ed0000] rounded-full ring-2 ring-[var(--bg-tertiary)]" />
                            </button>
                            <AnimatePresence>
                                {showNotifications && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="absolute right-0 top-full mt-3 w-80 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-2xl z-50 overflow-hidden font-['Sen',sans-serif]">
                                            <div className="p-5 border-b border-[var(--divider)] flex justify-between items-center bg-[var(--bg-secondary)]/50">
                                                <h4 className="text-[13px] font-bold tracking-tight">Portal activity</h4>
                                                <span className="text-[10px] font-bold text-[#ed0000] bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full uppercase tracking-widest">3 New</span>
                                            </div>
                                            <div className="max-h-[380px] overflow-y-auto no-scrollbar py-2">
                                                <NotificationItem icon={<Zap size={14} />} title="Inventory alert" time="2 mins ago" desc="Stock for Gala Sausage Roll is critical." type="alert" />
                                                <NotificationItem icon={<ShoppingCart size={14} />} title="New order received" time="15 mins ago" desc="Order #F8829 from Sarah Johnson." type="success" />
                                                <NotificationItem icon={<Users size={14} />} title="Account registration" time="1 hour ago" desc="New vendor joined the platform." type="info" />
                                            </div>
                                            <div className="p-4 bg-[var(--bg-secondary)]/30 text-center border-t border-[var(--divider)]">
                                                <button className="text-[11px] font-bold text-[#ed0000] uppercase tracking-widest hover:underline">View all system reports</button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                        <div onClick={() => setActiveTab('settings')} className="flex items-center gap-3 pl-4 border-l border-[var(--divider)] text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-secondary)] transition-all p-1.5 rounded-xl group">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-[#ed0000] font-bold text-xs shadow-sm ring-2 ring-transparent group-hover:ring-[#ed0000]/20">SJ</div>
                            <div className="text-right hidden sm:block">
                                <p className="text-[13px] font-bold leading-none tracking-tight">Sarah Johnson</p>
                                <p className="text-[11px] text-[var(--text-muted)] font-medium mt-1 uppercase tracking-tight">System admin</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-10 space-y-10">
                    {activeTab === 'overview' && !viewCategoryProducts && !viewCustomerStats && <OverviewTab orders={orders} products={products} onAddProduct={() => setShowAddProduct(true)} dateRange={dateRange} setDateRange={setDateRange} />}
                    {activeTab === 'orders' && !viewCategoryProducts && !viewCustomerStats && <OrdersTab onSelect={setSelectedOrder} selectedId={selectedOrder?.id} externalSearchTerm={searchTerm} dateRange={dateRange} setDateRange={setDateRange} onExport={() => exportToCSV(orders, 'orders_export')} />}
                    {(activeTab === 'products' || viewCategoryProducts) && !viewCustomerStats && <ProductsTab searchTerm={searchTerm} onAdd={() => setShowAddProduct(true)} onEdit={(p) => { setEditingProduct(p); setShowAddProduct(true); }} onDelete={(p) => setProductToDelete(p)} onToggleStock={(p) => updateProduct(p.id, { status: p.status === 'out_of_stock' ? 'available' : 'out_of_stock' })} onExport={() => exportToCSV(products, 'products_export')} dateRange={dateRange} setDateRange={setDateRange} categoryFilter={viewCategoryProducts} onBack={() => setViewCategoryProducts(null)} />}
                    {activeTab === 'categories' && !viewCategoryProducts && !viewCustomerStats && <CategoriesTab onViewCategory={setViewCategoryProducts} onAddCategory={() => setShowAddCategory(true)} onEditCategory={(cat) => { setEditingCategory(cat); setShowAddCategory(true); }} />}
                    {activeTab === 'customers' && !viewCustomerStats && <CustomersTab searchTerm={searchTerm} dateRange={dateRange} setDateRange={setDateRange} onViewStats={setViewCustomerStats} />}
                    {activeTab === 'reviews' && <ReviewsTab />}
                    {viewCustomerStats && <CustomerStatsPage customer={viewCustomerStats} onBack={() => setViewCustomerStats(null)} />}
                    {activeTab === 'stats' && <ActivityStatsTab orders={orders} products={products} />}
                    {activeTab === 'settings' && <SettingsTab />}
                </div>
            </main>

            <AnimatePresence>
                {selectedOrder && <OrderInfoModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
                {showAddProduct && <ProductModal product={editingProduct} onClose={() => { setShowAddProduct(false); setEditingProduct(null); }} />}
                {showAddCategory && <CategoryModal category={editingCategory} onClose={() => { setShowAddCategory(false); setEditingCategory(null); }} />}
            </AnimatePresence>
        </div>
    )
}

const NotificationItem = ({ icon, title, time, desc, type }) => {
    let color = "text-amber-500 bg-amber-50 dark:bg-amber-950/20";
    if (type === 'success') color = "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20";
    if (type === 'info') color = "text-blue-500 bg-blue-50 dark:bg-blue-950/20";
    if (type === 'alert') color = "text-[#ed0000] bg-red-50 dark:bg-red-950/20";

    return (
        <div className="flex gap-4 p-4 hover:bg-[var(--bg-secondary)]/50 transition-all cursor-pointer border-b border-[var(--divider)] last:border-0 group">
            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${color} shadow-sm group-hover:scale-105 transition-transform`}>{icon}</div>
            <div className="flex-1">
                <div className="flex justify-between items-start mb-0.5">
                    <h5 className="text-[12px] font-bold text-[var(--text-primary)] leading-tight">{title}</h5>
                    <span className="text-[9px] font-medium text-[var(--text-muted)] uppercase tracking-tight">{time}</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}

const OverviewTab = ({ orders, products, onAddProduct, dateRange, setDateRange }) => {
    const revenue = orders.reduce((s, o) => s + (o.amount || 0), 0)
    const [timeframe, setTimeframe] = useState('Monthly')
    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div><h1 className="text-2xl font-bold tracking-tight">Dashboard overview</h1><p className="text-[14px] text-[var(--text-muted)] mt-1 font-medium">Welcome back! Here is what is happening today.</p></div>
                <div className="flex items-center gap-4"><CustomDatePicker dateRange={dateRange} setDateRange={setDateRange} /><button onClick={onAddProduct} className="bg-black text-white px-6 py-3 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm hover:bg-zinc-800"><Plus size={18} /><span>New product</span></button></div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-10">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <KpiCard title="Total sales" value={`₦${revenue.toLocaleString()}`} trend="+12.5%" isPositive />
                        <KpiCard title="Orders placed" value={orders.length} trend="+8.2%" isPositive />
                        <KpiCard title="Average order value" value={`₦${(revenue / (orders.length || 1)).toLocaleString()}`} trend="+3.1%" isPositive />
                        <KpiCard title="Returning rate" value="68%" trend="+2.4%" isPositive /><KpiCard title="Abandonment rate" value="23.8%" trend="-1.8%" isPositive={false} /><KpiCard title="Daily visitors" value="12,450" trend="+15.3%" isPositive />
                    </div>
                   <SalesChart timeframe={timeframe} setTimeframe={setTimeframe} />
                </div>
                <div className="space-y-8">
                    <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm p-6"><h3 className="text-lg font-bold mb-6">Best selling products</h3><div className="space-y-4">{products.slice(0, 5).map(p => (<div key={p.id} className="flex items-center justify-between p-2 hover:bg-[var(--bg-secondary)]/50 rounded-xl transition-all cursor-pointer"><div className="flex items-center gap-3"><img src={p.image} className="w-10 h-10 rounded-xl object-cover" alt="" /><div><p className="text-[12px] font-bold tracking-tight">{p.name}</p><p className="text-[10px] text-[var(--text-muted)] font-bold">₦{p.price.toLocaleString()}</p></div></div><span className="text-[10px] font-bold text-emerald-600 px-2 py-0.5 rounded-full">+{Math.floor(Math.random() * 50) + 10} sold</span></div>))}</div></div>
                    <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm p-6"><h3 className="text-lg font-bold mb-6">Customer insights</h3><div className="space-y-5"><InsightRow label="New users" value="15" icon={<Users size={14} />} color="bg-red-50 text-[#ed0000]" /><InsightRow label="Active users" value="2,847" icon={<Users size={14} />} color="bg-[var(--bg-secondary)] text-[var(--text-muted)]" /><InsightRow label="Retention" value="68%" icon={<TrendingUp size={14} />} color="bg-emerald-50 text-emerald-600" /></div><div className="mt-8 pt-8 border-t border-[var(--divider)]"><div className="flex justify-between items-center mb-4"><h4 className="text-[12px] font-bold tracking-tight">Top contributors</h4><button className="text-[10px] font-bold text-[#ed0000] uppercase tracking-widest hover:underline">See all</button></div><div className="space-y-3"><CustomerRow name="Alice Johnson" img="https://ui-avatars.com/api/?name=Alice&background=ed0000&color=fff" spend="₦24,500" /><CustomerRow name="Robert Smith" img="https://ui-avatars.com/api/?name=Robert&background=000&color=fff" spend="₦18,200" /></div></div></div>
                </div>
            </div>
        </div>
    )
}

const SalesChart = ({ timeframe, setTimeframe }) => (
    <div className="bg-[var(--bg-tertiary)] p-6 rounded-2xl border border-[var(--divider)] shadow-sm">
        <div className="flex items-center justify-between mb-8"><h3 className="text-lg font-bold">Sales analytics</h3><div className="flex bg-[var(--bg-secondary)] rounded-xl p-1">{['Daily', 'Weekly', 'Monthly'].map(t => (<button key={t} onClick={() => setTimeframe(t)} className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${timeframe === t ? 'bg-[var(--bg-tertiary)] shadow-sm' : 'text-[var(--text-muted)]'}`}>{t}</button>))}</div></div>
        <div className="h-[320px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={analyticsData[timeframe]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}><defs><linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={BRAND_RED} stopOpacity={0.8}/><stop offset="95%" stopColor={BRAND_RED} stopOpacity={0.1}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--divider)" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--text-muted)' }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--text-muted)' }} /><Tooltip cursor={{ fill: 'rgba(237,0,0,0.05)' }} contentStyle={{ borderRadius: '16px', border: 'none', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} /><Bar dataKey="value" fill="url(#barGrad)" radius={[6, 6, 0, 0]} barSize={timeframe === 'Daily' ? 40 : 60} /></BarChart></ResponsiveContainer></div>
    </div>
)

const OrdersTab = ({ onSelect, selectedId, externalSearchTerm, dateRange, setDateRange, onExport }) => {
    const { orders } = useStore(); const [statusFilter, setStatusFilter] = useState('all'); const [localSearch, setLocalSearch] = useState('')
    const filtered = useMemo(() => orders.filter(o => {
        const search = (externalSearchTerm || localSearch).toLowerCase(); const matches = o.id.toLowerCase().includes(search) || o.buyerName.toLowerCase().includes(search)
        const matchesStatus = statusFilter === 'all' || o.status === statusFilter
        return matches && matchesStatus
    }), [orders, externalSearchTerm, localSearch, statusFilter])
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6"><div><h2 className="text-2xl font-bold tracking-tight">Platform orders</h2><p className="text-[13px] text-[var(--text-muted)] mt-1 font-medium">History and status tracking for all digital transactions.</p></div><div className="flex items-center gap-3"><button onClick={onExport} className="p-2.5 rounded-xl border border-[var(--divider)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-all bg-[var(--bg-tertiary)] shadow-sm"><Download size={18} /></button><CustomDatePicker dateRange={dateRange} setDateRange={setDateRange} /></div></div>
            <div className="flex flex-col md:flex-row gap-4"><div className="relative max-w-sm w-full"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" /><input type="text" placeholder="Search ID or name..." value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} className="w-full bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-xl pl-12 pr-4 py-3 text-[13px] font-bold outline-none text-[var(--text-primary)] focus:border-[#ed0000] shadow-sm transition-all" /></div><div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">{['all', 'pending', 'paid', 'confirmed', 'shipped', 'delivered'].map(s => (<button key={s} onClick={() => setStatusFilter(s)} className={`px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${statusFilter === s ? 'bg-black text-white' : 'bg-[var(--bg-tertiary)] border border-[var(--divider)] text-[var(--text-muted)]'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>))}</div></div>
            <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-[var(--bg-secondary)] border-b border-[var(--divider)]"><tr><th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Order ID</th><th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Customer</th><th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Amount</th><th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-right">Date</th></tr></thead><tbody className="divide-y divide-[var(--divider)]">{filtered.map(o => (<tr key={o.id} onClick={() => onSelect(o)} className={`group hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors ${selectedId === o.id ? 'bg-[#ed0000]/5' : ''}`}><td className="px-6 py-5 text-[12px] font-bold text-[var(--text-primary)]">#{o.id.slice(-8)}</td><td className="px-6 py-5 text-[13px] font-bold text-[var(--text-primary)]">{o.buyerName}</td><td className="px-6 py-5 text-[13px] font-bold text-[#ed0000]">₦{o.amount.toLocaleString()}</td><td className="px-6 py-5 text-[11px] font-bold text-right text-[var(--text-muted)]">{format(new Date(o.date), 'MMM dd, yyyy')}</td></tr>))}</tbody></table></div></div>
        </div>
    )
}

const ProductModal = ({ product, onClose }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center p-6 backdrop-blur-md bg-black/40 font-['Sen',sans-serif]">
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[var(--bg-tertiary)] rounded-3xl p-10 max-w-lg w-full shadow-2xl relative border border-[var(--divider)]">
            <button onClick={onClose} className="absolute right-8 top-8 text-[var(--text-muted)] hover:text-[#ed0000] transition-all"><X size={24} /></button>
            <h3 className="text-2xl font-bold mb-10 tracking-tight text-[var(--text-primary)]">{product ? 'Modify product entry' : 'New digital entry'}</h3>
            <div className="space-y-6">
                <SettingInput label="Product name" value={product?.name || ''} />
                <div className="grid grid-cols-2 gap-6"><SettingInput label="Category" value={product?.category || ''} /><SettingInput label="Retail price (₦)" value={product?.price || ''} /></div>
                <div className="space-y-2"><label className="text-[11px] font-bold text-[var(--text-muted)] tracking-tight">Description</label><textarea placeholder="Tell us about the entry..." className="w-full bg-[var(--bg-secondary)] border border-transparent rounded-2xl px-6 py-4 text-[13px] font-bold min-h-[140px] outline-none shadow-sm focus:border-[#ed0000]/30 transition-all text-[var(--text-primary)]" /></div>
                <button className="w-full bg-[#ed0000] text-white py-4.5 rounded-2xl font-bold text-[14px] shadow-2xl shadow-red-200 hover:bg-red-700 transition-all">{product ? 'Update digital entry' : 'Publish entry'}</button>
            </div>
        </motion.div>
    </motion.div>
)

const CustomersTab = ({ searchTerm, dateRange, setDateRange, onViewStats }) => {
    const customers = [
        { id: 1, name: 'Sarafina Nduka', email: 'sarafinanduka@gmail.com', phone: '09032626232', orders: 2, joinDate: '2026-03-18' },
        { id: 2, name: 'Alice Johnson', email: 'alice.j@uacfoods.com', phone: '08012345678', orders: 12, joinDate: '2026-03-10' },
        { id: 3, name: 'Robert Smith', email: 'rsmith@uacfoods.com', phone: '07098765432', orders: 8, joinDate: '2026-03-05' }
    ]
    const filtered = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6"><div><h2 className="text-2xl font-bold tracking-tight">Customer base</h2><p className="text-[13px] text-[var(--text-muted)] mt-1 font-medium">Directory of registered shoppers and history.</p></div><div className="flex items-center gap-3"><button className="p-2.5 rounded-xl border border-[var(--divider)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-all bg-[var(--bg-tertiary)] shadow-sm"><Download size={18} /></button><CustomDatePicker dateRange={dateRange} setDateRange={setDateRange} /></div></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className="p-6 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm"><p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Total shoppers</p><h4 className="text-2xl font-bold tracking-tight">2,482</h4></div>
                 <div className="p-6 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm"><p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Active now</p><h4 className="text-2xl font-bold tracking-tight text-emerald-500">148</h4></div>
                 <div className="p-6 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm"><p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">New this week</p><h4 className="text-2xl font-bold tracking-tight text-[#ed0000]">32</h4></div>
            </div>
            <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm overflow-hidden"><table className="w-full text-left"><thead className="bg-[var(--bg-secondary)] border-b border-[var(--divider)]"><tr><th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Email reference</th><th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-right">Sessions</th></tr></thead><tbody className="divide-y divide-[var(--divider)]">{filtered.map((c) => (<tr key={c.id} onClick={() => onViewStats(c)} className="group hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"><td className="px-6 py-5"><p className="text-[14px] font-bold text-[var(--text-primary)]">{c.name}</p><p className="text-[11px] text-[var(--text-muted)] font-bold mt-1 uppercase tracking-tight">{c.email}</p></td><td className="px-6 py-5 text-right"><span className="text-[12px] font-bold text-[#ed0000] bg-red-50 dark:bg-red-950/20 px-3 py-1 rounded-full">{c.orders} Orders</span></td></tr>))}</tbody></table></div>
        </div>
    )
}

const ReviewsTab = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center"><div><h2 className="text-2xl font-bold tracking-tight">Customer reviews</h2><p className="text-[13px] text-[var(--text-muted)] mt-1 font-medium">Feedback and ratings on business segments.</p></div></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviewsData.map(r => (
                <div key={r.id} className="p-6 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-amber-500">
                             {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} />)}
                        </div>
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{format(new Date(r.date), 'MMM dd')}</span>
                    </div>
                    <p className="text-[14px] font-bold text-[var(--text-primary)] leading-tight mb-2">"{r.comment}"</p>
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--divider)] mt-4">
                        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[10px] font-bold text-[var(--text-muted)]">{r.name.charAt(0)}</div><span className="text-[12px] font-bold text-[var(--text-primary)]">{r.name}</span></div>
                        <span className="text-[10px] font-bold text-[#ed0000] bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full uppercase tracking-widest">{r.product}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
)

const CategoryModal = ({ category, onClose }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center p-6 backdrop-blur-md bg-black/40 font-['Sen',sans-serif]">
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[var(--bg-tertiary)] rounded-3xl p-10 max-w-sm w-full shadow-2xl relative border border-[var(--divider)]">
            <button onClick={onClose} className="absolute right-8 top-8 text-[var(--text-muted)]"><X size={24} /></button>
            <h3 className="text-2xl font-bold mb-10 tracking-tight text-[var(--text-primary)]">{category ? 'Modify segment' : 'New classification'}</h3>
            <div className="space-y-6"><SettingInput label="Segment name" value={category?.name || ''} /><SettingInput label="Abstract" value="" placeholder="Brief category summary..." /><button className="w-full bg-black text-white py-4.5 rounded-2xl font-bold text-[14px] shadow-2xl hover:bg-zinc-800 transition-all">Submit classification</button></div>
        </motion.div>
    </motion.div>
)

const StatusPill = ({ status }) => {
    let style = "bg-amber-50 text-amber-600 dark:bg-amber-950/20 border-amber-100";
    if (status === 'paid' || status === 'confirmed' || status === 'delivered') style = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 border-emerald-100";
    if (status === 'cancelled' || status === 'failed') style = "bg-red-50 text-[#ed0000] dark:bg-red-950/20 border-red-100";
    return <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border ${style}`}>{status}</span>
}

const SettingInput = ({ label, value, type = 'text', placeholder = '...' }) => (
    <div className="space-y-2">
        <label className="text-[11px] font-bold text-[var(--text-muted)] tracking-tight leading-none ml-1">{label}</label>
        <input type={type} defaultValue={value} placeholder={placeholder} className="w-full bg-[var(--bg-secondary)] border border-transparent rounded-xl px-6 py-4.5 text-[14px] font-bold outline-none focus:border-[#ed0000]/30 shadow-sm transition-all text-[var(--text-primary)]" />
    </div>
)

const InsightRow = ({ label, value, icon, color }) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} shadow-sm group-hover:scale-105 transition-transform`}>{icon}</div><span className="text-[13px] font-bold text-[var(--text-muted)]">{label}</span></div>
        <span className="text-[15px] font-bold tracking-tight text-[var(--text-primary)]">{value}</span>
    </div>
)

const CustomerRow = ({ name, img, spend }) => (
    <div className="flex items-center justify-between group cursor-pointer hover:bg-[var(--bg-secondary)]/50 p-2 rounded-xl transition-all">
        <div className="flex items-center gap-3"><img src={img} className="w-10 h-10 rounded-full border border-[var(--divider)] shadow-sm" alt="" /><p className="text-[12px] font-bold text-[var(--text-primary)] leading-none tracking-tight">{name}</p></div>
        <span className="text-[13px] font-bold text-emerald-600 tracking-tighter">{spend}</span>
    </div>
)

const CustomDatePicker = ({ dateRange, setDateRange }) => (
    <div className="flex items-center gap-3 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-xl px-4 py-2 shadow-sm">
        <Calendar size={16} className="text-[var(--text-muted)]" />
        <DatePicker selected={dateRange.start} onChange={(date) => setDateRange({ ...dateRange, start: date })} placeholderText="Start" className="w-16 bg-transparent outline-none text-[11px] font-bold text-[var(--text-primary)]" />
        <span className="text-[var(--divider)]">/</span>
        <DatePicker selected={dateRange.end} onChange={(date) => setDateRange({ ...dateRange, end: date })} placeholderText="End" className="w-16 bg-transparent outline-none text-[11px] font-bold text-[var(--text-primary)]" />
    </div>
)

const OrderInfoModal = ({ order, onClose }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center p-6 backdrop-blur-md bg-black/40 font-['Sen',sans-serif]">
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[var(--bg-tertiary)] rounded-3xl p-12 max-w-2xl w-full shadow-2xl relative border border-[var(--divider)]">
            <button onClick={onClose} className="absolute right-10 top-10 text-[var(--text-muted)] hover:text-[#ed0000] p-1.5 rounded-full transition-all hover:bg-[var(--bg-secondary)]"><X size={28} /></button>
            <h3 className="text-3xl font-bold mb-12 text-[var(--text-primary)] tracking-tight">Order breakdown</h3>
            <div className="grid grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div><p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Payer Identity</p><p className="font-bold text-xl text-[var(--text-primary)] tracking-tight">{order.buyerName}</p></div>
                    <div><p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Contact Reference</p><p className="font-bold text-lg text-[var(--text-muted)] tracking-tight">{order.buyerPhone}</p></div>
                    <div><p className="text-[11px] font-bold tracking-widest text-[var(--text-muted)] mb-2">Delivery target</p><p className="font-bold text-[var(--text-muted)] text-[14px] leading-relaxed">{order.buyerAddress}</p></div>
                </div>
                <div className="space-y-8 text-right flex flex-col items-end">
                    <div className="p-10 bg-red-50 dark:bg-red-950/20 text-[#ed0000] rounded-3xl border border-red-100 dark:border-red-900/30 shadow-2xl shadow-red-100 dark:shadow-none w-full text-center">
                         <p className="text-[11px] font-bold uppercase text-[#ed0000]/60 mb-3 tracking-widest leading-none">Net Total Amount</p>
                         <h4 className="text-5xl font-bold tracking-tighter">₦{order.amount.toLocaleString()}</h4>
                    </div>
                    <div className="pt-4"><StatusPill status={order.status} /></div>
                </div>
            </div>
        </motion.div>
    </motion.div>
)

const CategoriesTab = ({ onViewCategory, onAddCategory, onEditCategory }) => {
    const [catSearch, setCatSearch] = useState(''); const [openMenuId, setOpenMenuId] = useState(null)
    const cats = [{ name: 'Gala', count: 12, sales: '₦2.4M', color: 'bg-red-50 text-[#ed0000]' }, { name: 'Supreme', count: 8, sales: '₦1.8M', color: 'bg-blue-50 text-blue-600' }, { name: 'Swan', count: 5, sales: '₦980k', color: 'bg-emerald-50 text-emerald-600' }, { name: 'Funtime', count: 14, sales: '₦1.2M', color: 'bg-yellow-50 text-yellow-600' }]
    const filtered = cats.filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()))
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center"><div><h2 className="text-2xl font-bold tracking-tight">Product Categories</h2><p className="text-[13px] text-[var(--text-muted)] mt-1 font-medium">Consolidated list of all business segments.</p></div><button onClick={onAddCategory} className="bg-black text-white px-7 py-3.5 rounded-2xl text-[12px] font-bold flex items-center gap-2 shadow-2xl">New Category</button></div>
            <div className="relative max-w-sm"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" /><input type="text" placeholder="Search category series..." value={catSearch} onChange={(e) => setCatSearch(e.target.value)} className="w-full bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-xl pl-12 pr-4 py-3 text-[13px] font-bold outline-none text-[var(--text-primary)] shadow-sm focus:border-[#ed0000]/50 transition-all" /></div>
            <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm overflow-hidden"><table className="w-full text-left"><thead className="bg-[var(--bg-secondary)] border-b border-[var(--divider)]"><tr><th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Name</th><th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-right">Details</th></tr></thead><tbody className="divide-y divide-[var(--divider)]">{filtered.map((cat) => (<tr key={cat.name} onClick={() => onViewCategory(cat.name)} className="group hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors"><td className="px-6 py-5"><div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${cat.color} shadow-sm group-hover:scale-110 transition-all`}>{cat.name.charAt(0)}</div><span className="text-[14px] font-bold text-[var(--text-primary)]">{cat.name} Series</span></div></td><td className="px-6 py-5 text-right font-bold text-emerald-600">{cat.sales}</td></tr>))}</tbody></table></div>
        </div>
    )
}

const ProductsTab = ({ searchTerm, onAdd, onEdit, onDelete, categoryFilter, onBack, onExport }) => {
    const { products } = useStore(); const [openMenuId, setOpenMenuId] = useState(null); const [localSearch, setLocalSearch] = useState('')
    const filtered = useMemo(() => products.filter(p => {
        const s = (searchTerm || localSearch).toLowerCase(); const m = p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s)
        return m && (!categoryFilter || p.category === categoryFilter)
    }), [products, searchTerm, localSearch, categoryFilter])
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6"><div className="flex items-center gap-4">{categoryFilter && (<button onClick={onBack} className="p-2.5 rounded-xl border border-[var(--divider)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]"><ArrowLeft size={18} /></button>)}<div><h2 className="text-2xl font-bold tracking-tight">{categoryFilter ? `Inventory in ${categoryFilter}` : 'Store Inventory'}</h2><p className="text-[13px] text-[var(--text-muted)] mt-1 font-medium">Detailed list of all digital and physical product entries.</p></div></div><div className="flex items-center gap-3"><div className="relative max-w-xs hidden sm:block"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" /><input type="text" placeholder="Find products..." value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} className="bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-xl pl-12 pr-4 py-3 text-[13px] font-bold outline-none text-[var(--text-primary)] focus:border-[#ed0000]/50 shadow-sm transition-all" /></div><button onClick={onExport} className="p-3 rounded-xl border border-[var(--divider)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm"><Download size={18} /></button><button onClick={onAdd} className="bg-black text-white px-7 py-3.5 rounded-2xl text-[13px] font-bold flex items-center gap-2 shadow-2xl"><Plus size={18} /><span>Add product</span></button></div></div>
            <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-[var(--bg-secondary)] border-b border-[var(--divider)]"><tr><th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Entry Info</th><th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</th></tr></thead><tbody className="divide-y divide-[var(--divider)]">{filtered.map(p => (<tr key={p.id} className="group hover:bg-[var(--bg-secondary)] transition-colors"><td className="px-6 py-5"><div className="flex items-center gap-5"><img src={p.image} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" /><div><p className="text-[14px] font-bold text-[var(--text-primary)] leading-tight">{p.name}</p><p className="text-[11px] text-[var(--text-muted)] font-bold mt-1 uppercase tracking-tighter">{p.category}</p></div></div></td><td className="px-6 py-5 text-right font-bold text-[14px] text-[var(--text-primary)]">₦{p.price.toLocaleString()}</td></tr>))}</tbody></table></div></div>
        </div>
    )
}

const SettingsTab = () => {
    const [subTab, setSubTab] = useState('profile')
    return (
        <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl">
            <div><h2 className="text-2xl font-bold tracking-tight">Account Settings</h2><p className="text-[14px] text-[var(--text-muted)] mt-1 font-medium">General profile management and system security configurations.</p></div>
            <div className="flex border-b border-[var(--divider)] gap-10">{['profile', 'security'].map(s => (<button key={s} onClick={() => setSubTab(s)} className={`pb-5 text-[13px] font-bold transition-all relative capitalize tracking-tight ${subTab === s ? 'text-[#ed0000]' : 'text-[var(--text-muted)]'}`}>{s} details{subTab === s && <motion.div layoutId="setTab" className="absolute bottom-0 left-0 w-full h-1 bg-[#ed0000] rounded-full" />}</button>))}</div>
            <div className="bg-[var(--bg-tertiary)] p-12 rounded-3xl border border-[var(--divider)] shadow-sm">
                {subTab === 'profile' ? (<div className="space-y-10"><div className="flex items-center gap-8"><div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-[#ed0000] font-bold text-2xl shadow-xl ring-4 ring-white dark:ring-[#222]">SJ</div><button className="text-[12px] font-bold text-[#ed0000] border border-red-100 dark:border-red-900/40 px-6 py-3 rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">Update Photo</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-10"><SettingInput label="Full Name" value="Sarah Johnson" /><SettingInput label="Email address" value="s.johnson@uacfoods.com" /></div></div>) : (<div className="space-y-8"><SettingInput label="Current Password" type="password" value="" /><div className="grid grid-cols-1 md:grid-cols-2 gap-10"><SettingInput label="New Password" type="password" value="" /><SettingInput label="Confirm Password" type="password" value="" /></div></div>)}
                <div className="mt-14 pt-8 border-t border-[var(--divider)] flex justify-end"><button className="px-12 py-4 bg-black text-white rounded-2xl font-bold text-[13px] shadow-2xl hover:bg-zinc-800 transition-all active:scale-[0.98]">Commit changes</button></div>
            </div>
        </div>
    )
}

const CustomerStatsPage = ({ customer, onBack }) => {
    const [subTab, setSubTab] = useState('All Orders')
    return (
        <div className="animate-in fade-in slide-in-from-right duration-500 bg-[var(--bg-primary)] h-full space-y-8">
            <div className="flex items-center gap-4 py-2">
                <button onClick={onBack} className="p-2 transition-colors text-[var(--text-primary)] hover:text-[#ed0000]">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Customer Orders</h2>
            </div>
            <div className="bg-[var(--bg-tertiary)] rounded-xl border border-[var(--divider)] p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-lg overflow-hidden shrink-0">
                        <User size={28} />
                    </div>
                    <div>
                        <h3 className="text-[16px] font-bold text-[var(--text-primary)] leading-tight">{customer.name}</h3>
                        <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">GUEST</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-wrap items-center justify-end gap-x-8 gap-y-3 text-[12px] font-bold text-[var(--text-muted)]">
                    <div className="flex items-center gap-2"><span>Completed Orders</span> <span className="text-[var(--text-primary)]">0</span></div>
                    <div className="flex items-center gap-2"><span>Ongoing Orders</span> <span className="text-[var(--text-primary)]">2</span></div>
                    <div className="flex items-center gap-2 border-l border-[var(--divider)] pl-8 h-6"><Calendar size={14} /> <span>18 March, 2026</span></div>
                    <div className="flex items-center gap-2 border-l border-[var(--divider)] pl-8 h-6"><Mail size={14} /> <span>{customer.email}</span></div>
                    <div className="flex items-center gap-2 border-l border-[var(--divider)] pl-8 h-6"><Phone size={14} /> <span>{customer.phone || '09032626232'}</span></div>
                </div>
            </div>
            <div className="border-b border-[var(--divider)] flex gap-12 mt-4">
                {['All Orders', 'Ongoing Orders', 'Completed Orders'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setSubTab(tab)}
                        className={`pb-4 text-[13px] font-bold transition-all relative ${subTab === tab ? 'text-[#ed0000] border-b-2 border-[#ed0000]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="flex items-center justify-end gap-5 py-4">
                <button className="flex items-center gap-2 text-[12px] font-bold text-[var(--text-muted)] hover:text-[#ed0000] transition-colors">
                    <Filter size={14} />
                    <span>Filters</span>
                </button>
                <div className="flex items-center gap-3 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-lg px-4 py-2 shadow-sm text-[12px] font-bold">
                    <span>Today</span>
                    <ChevronDown size={14} />
                </div>
                <div className="flex items-center gap-3 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-lg px-4 py-2 shadow-sm text-[12px] font-bold">
                    <Calendar size={14} />
                    <span>25 Mar, 2026 - 25 Mar, 2026</span>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center py-32 opacity-50">
                <p className="text-[14px] font-bold text-[var(--text-muted)] tracking-tight">No orders found.</p>
            </div>
        </div>
    )
}

const ActivityStatsTab = ({ orders, products }) => {
    const [timeframe, setTimeframe] = useState('Monthly')
    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            <div><h2 className="text-2xl font-bold tracking-tight">Activity statistics</h2><p className="text-[13px] text-[var(--text-muted)] mt-1 font-medium">Key performance indicators and operational metrics.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><KpiCard title="Registered users" value="4,820" trend="+12%" isPositive /><KpiCard title="Gross Sales" value="₦5.2M" trend="+8%" isPositive /><KpiCard title="Session sales" value="₦42k" trend="+3%" isPositive /><KpiCard title="Portal visits" value="130" trend="+0%" isPositive /></div>
            <div className="max-w-4xl">
                 <SalesChart timeframe={timeframe} setTimeframe={setTimeframe} />
            </div>
        </div>
    )
}

export default AdminDashboard
