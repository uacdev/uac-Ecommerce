import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Bell, Zap, ShoppingCart, Users, Star, Settings as SettingsIcon, Menu
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { notificationApi, searchApi, reviewApi, orderApi } from '../api/client'
import { formatDistanceToNow } from 'date-fns'

const VALID_TABS = ['overview', 'orders', 'products', 'categories', 'customers', 'reviews', 'stats', 'web-analytics', 'settings']

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
import WebAnalyticsTab from '../components/admin/tabs/WebAnalyticsTab'
import SettingsTab from '../components/admin/tabs/SettingsTab'
import CustomerStatsPage from '../components/admin/tabs/CustomerStatsPage'
import ProductDetailPage from '../components/admin/tabs/ProductDetailPage'
import CategoryDetailPage from '../components/admin/tabs/CategoryDetailPage'

// Modal Components
import OrderInfoModal from '../components/admin/modals/OrderInfoModal'
import AddProductPage from '../components/admin/tabs/AddProductPage'
import CategoryModal from '../components/admin/modals/CategoryModal'

const AdminDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const tabParam = searchParams.get('tab')
    const activeTab = VALID_TABS.includes(tabParam) ? tabParam : 'overview'
    const setActiveTab = (tab) => {
        const next = new URLSearchParams(searchParams)
        if (tab === 'overview') next.delete('tab')
        else next.set('tab', tab)
        setSearchParams(next, { replace: false })
    }
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
    const [viewProductId, setViewProductId] = useState(null)
    const [viewCategoryId, setViewCategoryId] = useState(null)
    const [showNotifications, setShowNotifications] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const pollingRef = useRef(null)

    const [searchOpen, setSearchOpen] = useState(false)
    const [searchResults, setSearchResults] = useState({ products: [], orders: [], customers: [] })
    const [searchLoading, setSearchLoading] = useState(false)
    // Mobile drawer toggle. On lg+ the sidebar is always visible (static),
    // this state only matters below the lg breakpoint.
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

    const { isDark, toggleTheme } = useTheme()
    const { loading, removeProduct, orders, products, adminProfile, stats, businessSegments } = useStore()
    const [reviewsCount, setReviewsCount] = useState(0)
    const [pendingOrdersCount, setPendingOrdersCount] = useState(null)

    // Real-time sidebar counts
    useEffect(() => {
        let cancelled = false
        // Reviews count
        reviewApi.getAll().then(res => {
            if (!cancelled && res.data?.success) setReviewsCount(res.data.count ?? (res.data.data || []).length)
        }).catch(() => {})
        // Pending orders count — first page only, total pending in pagination meta
        orderApi.getAll({ status: 'pending', limit: 1 }).then(res => {
            if (!cancelled && res.data?.success) setPendingOrdersCount(res.data.pagination?.total ?? 0)
        }).catch(() => {})
        return () => { cancelled = true }
    }, [orders.length])

    const sidebarCounts = {
        orders: pendingOrdersCount ?? stats?.pendingOrders ?? 0,
        products: products.length,
        categories: businessSegments?.length ?? 0,
        customers: stats?.totalCustomers ?? 0,
        reviews: reviewsCount
    }
    const { signOut: logout } = useAuth()

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await notificationApi.getAll({ limit: 25 })
            if (res.data?.success) {
                setNotifications(res.data.data || [])
                setUnreadCount(res.data.unreadCount || 0)
            }
        } catch {
            /* silent — keep last good state */
        }
    }, [])

    useEffect(() => {
        fetchNotifications()
        const startPolling = () => {
            if (pollingRef.current) clearInterval(pollingRef.current)
            pollingRef.current = setInterval(fetchNotifications, 30000)
        }
        const stopPolling = () => {
            if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
        }
        startPolling()

        const onVisibility = () => {
            if (document.hidden) stopPolling()
            else { fetchNotifications(); startPolling() }
        }
        document.addEventListener('visibilitychange', onVisibility)
        return () => {
            stopPolling()
            document.removeEventListener('visibilitychange', onVisibility)
        }
    }, [fetchNotifications])

    const ICON_BY_TYPE = { order: <ShoppingCart size={14} />, review: <Star size={14} />, inventory: <Zap size={14} />, customer: <Users size={14} />, system: <SettingsIcon size={14} /> }
    const VARIANT_BY_TYPE = { order: 'success', review: 'info', inventory: 'alert', customer: 'info', system: 'info' }

    const handleNotifClick = async (n) => {
        if (!n.isRead) {
            setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x))
            setUnreadCount(c => Math.max(0, c - 1))
            try { await notificationApi.markRead(n.id) } catch { /* ignore */ }
        }
    }

    const handleMarkAllRead = async () => {
        if (unreadCount === 0) return
        setNotifications(prev => prev.map(x => ({ ...x, isRead: true })))
        setUnreadCount(0)
        try { await notificationApi.markAllRead() } catch { /* ignore */ }
    }

    // Debounced global search
    useEffect(() => {
        const q = searchTerm.trim()
        if (q.length < 2) {
            setSearchResults({ products: [], orders: [], customers: [] })
            setSearchLoading(false)
            return
        }
        let cancelled = false
        setSearchLoading(true)
        const t = setTimeout(async () => {
            try {
                const res = await searchApi.query(q, 5)
                if (!cancelled && res.data?.success) {
                    setSearchResults({
                        products: res.data.products || [],
                        orders: res.data.orders || [],
                        customers: res.data.customers || []
                    })
                }
            } catch { /* silent */ }
            finally { if (!cancelled) setSearchLoading(false) }
        }, 300)
        return () => { cancelled = true; clearTimeout(t) }
    }, [searchTerm])

    const totalSearchHits = searchResults.products.length + searchResults.orders.length + searchResults.customers.length
    const showSearchPanel = searchOpen && searchTerm.trim().length >= 2

    const goProducts = (p) => {
        setActiveTab('products'); setViewCategoryProducts(null); setViewCustomerStats(null); setViewCategoryId(null)
        setViewProductId(p._id || p.id); setSearchTerm(''); setSearchOpen(false)
    }
    const goOrder = (o) => {
        setActiveTab('orders'); setViewCustomerStats(null); setViewCategoryProducts(null)
        setSelectedOrder(o); setSearchTerm(''); setSearchOpen(false)
    }
    const goCustomer = (c) => {
        setActiveTab('customers'); setViewCategoryProducts(null)
        setViewCustomerStats(c); setSearchTerm(''); setSearchOpen(false)
    }

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
                activeTab={
                    viewProductId ? 'products'
                    : viewCategoryId ? 'categories'
                    : viewCategoryProducts ? 'categories'
                    : viewCustomerStats ? 'customers'
                    : activeTab
                }
                setActiveTab={(tab) => {
                    setActiveTab(tab);
                    setSelectedOrder(null);
                    setViewCategoryProducts(null);
                    setViewCustomerStats(null);
                    setViewProductId(null);
                    setViewCategoryId(null);
                    setShowAddProduct(false);
                    setEditingProduct(null);
                    // Auto-close the mobile drawer when a nav item is picked.
                    setMobileSidebarOpen(false);
                }}
                collapsed={false}
                counts={sidebarCounts}
                isDark={isDark}
                toggleTheme={toggleTheme}
                logout={() => logout()}
                mobileOpen={mobileSidebarOpen}
                onMobileClose={() => setMobileSidebarOpen(false)}
            />

            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <header className="h-20 flex items-center justify-between px-6 lg:px-10 border-b border-[var(--divider)] bg-[var(--bg-tertiary)] shrink-0 gap-6">
                    <div className="flex items-center gap-4 flex-1">
                        {/* Mobile-only hamburger — opens the sidebar drawer below lg. */}
                        <button
                            type="button"
                            onClick={() => setMobileSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                            aria-label="Open navigation"
                        >
                            <Menu size={22} />
                        </button>
                        <div className="relative max-w-md w-full hidden md:block">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                placeholder="Search products, orders, customers…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setSearchOpen(true)}
                                className="w-full bg-[var(--bg-primary)] border border-[var(--divider)] rounded-xl pl-12 pr-4 py-2.5 text-[13px] font-medium outline-none text-[var(--text-primary)] hover:border-[var(--divider)] focus:border-[#ed0000]/50 transition-all shadow-sm"
                            />
                            <AnimatePresence>
                                {showSearchPanel && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setSearchOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 4 }}
                                            className="absolute left-0 right-0 top-full mt-2 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-2xl z-50 overflow-hidden"
                                        >
                                            {searchLoading && totalSearchHits === 0 ? (
                                                <div className="px-5 py-6 text-[12px] font-bold text-[var(--text-muted)] text-center">Searching…</div>
                                            ) : totalSearchHits === 0 ? (
                                                <div className="px-5 py-6 text-[12px] font-bold text-[var(--text-muted)] text-center">No results for "{searchTerm.trim()}"</div>
                                            ) : (
                                                <div className="max-h-[440px] overflow-y-auto no-scrollbar divide-y divide-[var(--divider)]">
                                                    {searchResults.products.length > 0 && (
                                                        <div>
                                                            <div className="px-5 pt-3 pb-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Products</div>
                                                            {searchResults.products.map(p => (
                                                                <button key={p._id || p.id} onClick={() => goProducts(p)} className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-[var(--bg-secondary)] text-left transition-all">
                                                                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-[var(--divider)] shrink-0">
                                                                        {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-[12px] font-bold text-[var(--text-primary)] truncate">{p.name}</p>
                                                                        <p className="text-[10px] text-[var(--text-muted)] font-medium">{p.brand || p.category}</p>
                                                                    </div>
                                                                    <span className="text-[11px] font-bold text-[#ed0000] whitespace-nowrap">₦{(p.price || 0).toLocaleString()}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {searchResults.orders.length > 0 && (
                                                        <div>
                                                            <div className="px-5 pt-3 pb-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Orders</div>
                                                            {searchResults.orders.map(o => (
                                                                <button key={o._id || o.id} onClick={() => goOrder(o)} className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-[var(--bg-secondary)] text-left transition-all">
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-[12px] font-bold text-[var(--text-primary)] truncate">{o.reference}</p>
                                                                        <p className="text-[10px] text-[var(--text-muted)] font-medium truncate">{o.buyerName} · {o.status}</p>
                                                                    </div>
                                                                    <span className="text-[11px] font-bold text-[var(--text-primary)] whitespace-nowrap">₦{(o.amount || 0).toLocaleString()}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {searchResults.customers.length > 0 && (
                                                        <div>
                                                            <div className="px-5 pt-3 pb-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Customers</div>
                                                            {searchResults.customers.map(c => (
                                                                <button key={c.email} onClick={() => goCustomer(c)} className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-[var(--bg-secondary)] text-left transition-all">
                                                                    <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[10px] font-bold text-[var(--text-muted)] border border-[var(--divider)] shrink-0">
                                                                        {c.name?.charAt(0) || '?'}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-[12px] font-bold text-[var(--text-primary)] truncate">{c.name}</p>
                                                                        <p className="text-[10px] text-[var(--text-muted)] font-medium truncate">{c.email}</p>
                                                                    </div>
                                                                    <span className="text-[11px] font-bold text-[var(--text-muted)] whitespace-nowrap">{c.orders} order{c.orders === 1 ? '' : 's'}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2.5 rounded-xl hover:bg-[var(--bg-secondary)] border border-[var(--divider)] transition-all text-[var(--text-primary)] shadow-sm">
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#ed0000] text-white text-[9px] font-bold ring-2 ring-[var(--bg-tertiary)]">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            <AnimatePresence>
                                {showNotifications && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="absolute right-0 top-full mt-3 w-96 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-2xl z-50 overflow-hidden font-['Sen',sans-serif]">
                                            <div className="p-5 border-b border-[var(--divider)] flex justify-between items-center bg-[var(--bg-secondary)]/50">
                                                <h4 className="text-[13px] font-bold tracking-tight">Portal activity</h4>
                                                {unreadCount > 0 ? (
                                                    <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-[#ed0000] hover:underline uppercase tracking-widest">
                                                        Mark all read · {unreadCount}
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">All caught up</span>
                                                )}
                                            </div>
                                            <div className="max-h-[420px] overflow-y-auto no-scrollbar py-2">
                                                {notifications.length === 0 ? (
                                                    <div className="px-5 py-10 text-center">
                                                        <Bell size={20} className="mx-auto mb-3 text-[var(--text-muted)] opacity-50" />
                                                        <p className="text-[12px] font-bold text-[var(--text-muted)]">No activity yet</p>
                                                    </div>
                                                ) : notifications.map(n => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => handleNotifClick(n)}
                                                        className={`relative ${!n.isRead ? 'bg-[#ed0000]/[0.03]' : ''}`}
                                                    >
                                                        {!n.isRead && <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#ed0000]" />}
                                                        <NotificationItem
                                                            icon={ICON_BY_TYPE[n.type] || <Bell size={14} />}
                                                            title={n.title}
                                                            time={formatDistanceToNow(new Date(n.date), { addSuffix: true })}
                                                            desc={n.description}
                                                            type={VARIANT_BY_TYPE[n.type] || 'info'}
                                                        />
                                                    </div>
                                                ))}
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
                    ) : viewProductId ? (
                        <ProductDetailPage
                            productId={viewProductId}
                            onBack={() => setViewProductId(null)}
                            onEdit={(p) => { setEditingProduct(p); setShowAddProduct(true); setViewProductId(null); }}
                            onDelete={(p) => setProductToDelete(p)}
                        />
                    ) : viewCategoryId ? (
                        <CategoryDetailPage
                            categoryId={viewCategoryId}
                            onBack={() => setViewCategoryId(null)}
                            onEdit={(cat) => { setEditingCategory(cat); setShowAddCategory(true); }}
                            onDelete={() => { /* delete category lives in CategoriesTab; admin can also use the modal */ }}
                            onViewProducts={(name) => { setViewCategoryId(null); setViewCategoryProducts(name); setActiveTab('products'); }}
                            onSelectProduct={(pid) => { setViewCategoryId(null); setViewProductId(pid); setActiveTab('products'); }}
                        />
                    ) : (
                        <>
                            {activeTab === 'overview' && !viewCategoryProducts && !viewCustomerStats && <OverviewTab orders={orders} products={products} onAddProduct={() => setShowAddProduct(true)} dateRange={dateRange} setDateRange={setDateRange} onExport={(rows, filename) => exportToCSV(rows, filename)} onSeeAllCustomers={() => setActiveTab('customers')} />}
                            {activeTab === 'orders' && !viewCategoryProducts && !viewCustomerStats && <OrdersTab onSelect={setSelectedOrder} selectedId={selectedOrder?.id} externalSearchTerm={searchTerm} dateRange={dateRange} setDateRange={setDateRange} onExport={(rows) => exportToCSV(rows || orders, 'orders_export')} />}
                            {(activeTab === 'products' || viewCategoryProducts) && !viewCustomerStats && <ProductsTab searchTerm={searchTerm} onAdd={() => setShowAddProduct(true)} onEdit={(p) => { setEditingProduct(p); setShowAddProduct(true); }} onDelete={(p) => setProductToDelete(p)} onSelect={(p) => setViewProductId(p.id)} onExport={() => exportToCSV(products, 'products_export')} dateRange={dateRange} setDateRange={setDateRange} categoryFilter={viewCategoryProducts} onBack={() => setViewCategoryProducts(null)} />}
                            {activeTab === 'categories' && !viewCategoryProducts && !viewCustomerStats && <CategoriesTab onViewCategory={(cat) => setViewCategoryId(cat._id || cat.id)} onViewProductsInCategory={setViewCategoryProducts} onAddCategory={() => setShowAddCategory(true)} onEditCategory={(cat) => { setEditingCategory(cat); setShowAddCategory(true); }} />}
                            {activeTab === 'customers' && !viewCustomerStats && <CustomersTab searchTerm={searchTerm} dateRange={dateRange} setDateRange={setDateRange} onViewStats={setViewCustomerStats} onExport={(rows, filename) => exportToCSV(rows, filename)} />}
                            {activeTab === 'reviews' && <ReviewsTab onExport={(rows, filename) => exportToCSV(rows, filename)} />}
                            {viewCustomerStats && <CustomerStatsPage customer={viewCustomerStats} onBack={() => setViewCustomerStats(null)} />}
                            {activeTab === 'stats' && <ActivityStatsTab orders={orders} products={products} onExport={(rows, filename) => exportToCSV(rows, filename)} />}
                            {activeTab === 'web-analytics' && <WebAnalyticsTab onExport={(rows, filename) => exportToCSV(rows, filename)} />}
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
