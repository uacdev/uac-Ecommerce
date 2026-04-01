import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Search, Bell, Zap, ShoppingCart, Users, LogOut
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

// UI Components
import Preloader from '../components/Preloader'
import AdminSidebar from '../components/admin/AdminSidebar'
import { NotificationItem } from '../components/admin/ui/shared_ui'

// Tab Components
import OverviewTab from '../components/admin/tabs/OverviewTab'
import OrdersTab from '../components/admin/tabs/OrdersTab'
import ProductsTab from '../components/admin/tabs/ProductsTab'
import CategoriesTab from '../components/admin/tabs/CategoriesTab'
import CustomersTab from '../components/admin/tabs/CustomersTab'
import ReviewsTab from '../components/admin/tabs/ReviewsTab'
import ActivityStatsTab from '../components/admin/tabs/ActivityStatsTab'
import SettingsTab from '../components/admin/tabs/SettingsTab'
import CustomerStatsPage from '../components/admin/tabs/CustomerStatsPage'

// Modal Components
import OrderInfoModal from '../components/admin/modals/OrderInfoModal'
import AddProductPage from '../components/admin/tabs/AddProductPage'
import CategoryModal from '../components/admin/modals/CategoryModal'

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
    const { loading, updateProduct, removeProduct, orders, products, adminProfile } = useStore()
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
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-[#ed0000] font-bold text-xs shadow-sm ring-2 ring-transparent group-hover:ring-[#ed0000]/20 overflow-hidden">
                                {adminProfile?.photo ? <img src={adminProfile.photo} className="w-full h-full object-cover" alt="" /> : (adminProfile?.fullName?.charAt(0) || 'S')}
                            </div>
                            <div className="text-right hidden sm:block">
                                <p className="text-[13px] font-bold leading-none tracking-tight">{adminProfile?.fullName || 'Sarah Johnson'}</p>
                                <p className="text-[11px] text-[var(--text-muted)] font-medium mt-1 uppercase tracking-tight">System admin</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-10 space-y-10">
                    {showAddProduct ? (
                        <AddProductPage product={editingProduct} onClose={() => { setShowAddProduct(false); setEditingProduct(null); }} />
                    ) : (
                        <>
                            {activeTab === 'overview' && !viewCategoryProducts && !viewCustomerStats && <OverviewTab orders={orders} products={products} onAddProduct={() => setShowAddProduct(true)} dateRange={dateRange} setDateRange={setDateRange} />}
                            {activeTab === 'orders' && !viewCategoryProducts && !viewCustomerStats && <OrdersTab onSelect={setSelectedOrder} selectedId={selectedOrder?.id} externalSearchTerm={searchTerm} dateRange={dateRange} setDateRange={setDateRange} onExport={() => exportToCSV(orders, 'orders_export')} />}
                            {(activeTab === 'products' || viewCategoryProducts) && !viewCustomerStats && <ProductsTab searchTerm={searchTerm} onAdd={() => setShowAddProduct(true)} onEdit={(p) => { setEditingProduct(p); setShowAddProduct(true); }} onDelete={(p) => setProductToDelete(p)} onToggleStock={(p) => updateProduct(p.id, { status: p.status === 'out_of_stock' ? 'available' : 'out_of_stock' })} onExport={() => exportToCSV(products, 'products_export')} dateRange={dateRange} setDateRange={setDateRange} categoryFilter={viewCategoryProducts} onBack={() => setViewCategoryProducts(null)} />}
                            {activeTab === 'categories' && !viewCategoryProducts && !viewCustomerStats && <CategoriesTab onViewCategory={setViewCategoryProducts} onAddCategory={() => setShowAddCategory(true)} onEditCategory={(cat) => { setEditingCategory(cat); setShowAddCategory(true); }} />}
                            {activeTab === 'customers' && !viewCustomerStats && <CustomersTab searchTerm={searchTerm} dateRange={dateRange} setDateRange={setDateRange} onViewStats={setViewCustomerStats} />}
                            {activeTab === 'reviews' && <ReviewsTab />}
                            {viewCustomerStats && <CustomerStatsPage customer={viewCustomerStats} onBack={() => setViewCustomerStats(null)} />}
                            {activeTab === 'stats' && <ActivityStatsTab orders={orders} products={products} />}
                            {activeTab === 'settings' && <SettingsTab />}
                        </>
                    )}
                </div>
            </main>

            <AnimatePresence>
                {selectedOrder && <OrderInfoModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
                {showAddCategory && <CategoryModal category={editingCategory} onClose={() => { setShowAddCategory(false); setEditingCategory(null); }} />}
                {productToDelete && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setProductToDelete(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[var(--bg-tertiary)] p-6 rounded-2xl shadow-xl z-10 max-w-sm w-full font-['Sen',sans-serif]">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Delete product?</h3>
                            <p className="text-[13px] text-[var(--text-muted)] font-medium mb-6">Are you sure you want to delete {productToDelete.name}? This action cannot be undone and will remove it from the catalogue.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setProductToDelete(null)} className="flex-1 py-3 border border-[var(--divider)] rounded-xl text-[13px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all">Cancel</button>
                                <button onClick={() => { removeProduct(productToDelete.id); setProductToDelete(null); }} className="flex-1 py-3 bg-[#ed0000] text-white rounded-xl text-[13px] font-bold hover:bg-[#c90000] transition-all focus:ring-4 ring-red-500/20">Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default AdminDashboard
