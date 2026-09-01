import { useEffect, useMemo, useState } from 'react'
import { Search, Download, ChevronLeft, ChevronRight, BellRing, Trash2 } from 'lucide-react'

const STATUS_COLOR = {
    pending: 'bg-amber-50 text-amber-600 border-amber-200',
    paid: 'bg-blue-50 text-blue-600 border-blue-200',
    confirmed: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    shipped: 'bg-violet-50 text-violet-600 border-violet-200',
    delivered: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200'
}
import { format } from 'date-fns'
import { CustomDatePicker } from '../ui/shared_ui'
import { orderApi } from '../../../api/client'
import { useStore } from '../../../context/StoreContext'

const STATUSES = ['all', 'pending', 'paid', 'confirmed', 'shipped', 'delivered']
const PAGE_SIZE = 25

const useDebounced = (value, delay = 300) => {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(t)
    }, [value, delay])
    return debounced
}

const OrdersTab = ({ onSelect, selectedId, externalSearchTerm, dateRange, setDateRange, onExport }) => {
    const { orders: storeOrders, ordersTick } = useStore()
    const [statusFilter, setStatusFilter] = useState('all')
    const [localSearch, setLocalSearch] = useState('')
    const [page, setPage] = useState(1)
    const [orders, setOrders] = useState([])
    const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [remindingId, setRemindingId] = useState(null)
    const [feedback, setFeedback] = useState('')
    const [deletingId, setDeletingId] = useState(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [orderToDelete, setOrderToDelete] = useState(null)

    const search = useDebounced((externalSearchTerm || localSearch).trim(), 350)

    // Reset to page 1 when filters change
    useEffect(() => { setPage(1) }, [statusFilter, search])

    // Fetch orders for the current page/filters
    useEffect(() => {
        let cancelled = false
        setLoading(true)
        orderApi.getAll({ page, limit: PAGE_SIZE, status: statusFilter, q: search })
            .then(res => {
                if (cancelled) return
                if (res.data?.success) {
                    setOrders(res.data.data || [])
                    setPagination(res.data.pagination || { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 })
                }
            })
            .catch(err => { if (!cancelled) setError(err.response?.data?.message || err.message || 'Failed to load orders') })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, statusFilter, search, storeOrders.length, ordersTick])
    //                                                  ^ refetch on any order mutation, not just length changes

    const showingFrom = (pagination.page - 1) * pagination.limit + 1
    const showingTo = Math.min(pagination.page * pagination.limit, pagination.total)

    const exportRows = useMemo(() => orders, [orders])

    const handlePickupReminder = async (order, e) => {
        e.stopPropagation()
        setError('')
        setFeedback('')

        const normalizedStatus = String(order.status || '').toLowerCase()
        if (normalizedStatus !== 'paid' && normalizedStatus !== 'confirmed') {
            setFeedback('Reminder is only available for paid or confirmed orders')
            return
        }
        if (String(order.fulfillmentType || '').toLowerCase() !== 'pickup') {
            setFeedback('Reminder is currently available for pickup orders only')
            return
        }

        setRemindingId(order.id || order._id)
        try {
            const res = await orderApi.remindPickup(order.id || order._id)
            if (res.data?.success) {
                setFeedback(res.data?.message || 'Reminder sent')
            } else {
                setError(res.data?.message || 'Could not send reminder')
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Could not send reminder')
        } finally {
            setRemindingId(null)
        }
    }

    const handleDeleteOrder = async (order, e) => {
        e.stopPropagation()
        setOrderToDelete(order)
        setShowDeleteConfirm(true)
    }

    const confirmDeleteOrder = async () => {
        if (!orderToDelete) return
        
        setError('')
        setFeedback('')
        setShowDeleteConfirm(false)
        setDeletingId(orderToDelete.id || orderToDelete._id)
        try {
            const res = await orderApi.delete(orderToDelete.id || orderToDelete._id)
            if (res.data?.success) {
                setFeedback('Order deleted successfully')
                // Silently refetch the page after deletion
                const refetchRes = await orderApi.getAll({ page, limit: PAGE_SIZE, status: statusFilter, q: search })
                if (refetchRes.data?.success) {
                    setOrders(refetchRes.data.data || [])
                    setPagination(refetchRes.data.pagination || { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 })
                }
            } else {
                setError(res.data?.message || 'Could not delete order')
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Could not delete order')
        } finally {
            setDeletingId(null)
            setOrderToDelete(null)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-[var(--text-primary)]">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Platform orders</h2>
                    <p className="text-[13px] text-[var(--text-muted)] mt-1 font-medium">
                        {pagination.total > 0
                            ? `${pagination.total} order${pagination.total === 1 ? '' : 's'} matching your filters.`
                            : 'History and status tracking for all digital transactions.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onExport(exportRows)}
                        className="px-4 py-2.5 rounded-xl border border-[var(--divider)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-all bg-[var(--bg-tertiary)] shadow-sm flex items-center gap-2 text-[12px] font-bold"
                        title="Export current page as CSV"
                    >
                        <Download size={16} /> Export
                    </button>
                    <CustomDatePicker dateRange={dateRange} setDateRange={setDateRange} />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative max-w-sm w-full">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search ID, name, email or phone…"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-xl pl-12 pr-4 py-3 text-[13px] font-bold outline-none text-[var(--text-primary)] focus:border-[#ed0000] shadow-sm transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {STATUSES.map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${statusFilter === s ? 'bg-black text-white px-7' : 'bg-[var(--bg-tertiary)] border border-[var(--divider)] text-[var(--text-muted)] px-5'}`}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-[#ed0000] text-[12px] font-bold">{error}</div>
            )}
            {feedback && (
                <div className="px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[12px] font-bold">{feedback}</div>
            )}

            <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--bg-secondary)] border-b border-[var(--divider)]">
                            <tr>
                                <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">Reference</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">Customer</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">Amount</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">Date</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">Reminder</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] text-right">Status</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] text-right">Delete</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--divider)]">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i}>
                                        <td className="px-6 py-5"><div className="h-3 w-28 bg-[var(--bg-secondary)] rounded animate-pulse" /></td>
                                        <td className="px-6 py-5"><div className="h-3 w-32 bg-[var(--bg-secondary)] rounded animate-pulse" /></td>
                                        <td className="px-6 py-5"><div className="h-3 w-20 bg-[var(--bg-secondary)] rounded animate-pulse" /></td>
                                        <td className="px-6 py-5"><div className="h-3 w-24 bg-[var(--bg-secondary)] rounded animate-pulse" /></td>
                                        <td className="px-6 py-5"><div className="h-3 w-16 bg-[var(--bg-secondary)] rounded animate-pulse" /></td>
                                        <td className="px-6 py-5"><div className="h-5 w-20 bg-[var(--bg-secondary)] rounded-full animate-pulse ml-auto" /></td>
                                        <td className="px-6 py-5"><div className="h-5 w-8 bg-[var(--bg-secondary)] rounded animate-pulse ml-auto" /></td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-10 text-center text-[13px] text-[var(--text-muted)]">No orders match these filters.</td></tr>
                            ) : orders.map(o => (
                                <tr
                                    key={o.id || o._id}
                                    onClick={() => onSelect(o)}
                                    className={`group hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors ${selectedId === (o.id || o._id) ? 'bg-[#ed0000]/5' : ''}`}
                                >
                                    <td className="px-6 py-5 text-[12px] font-bold text-[var(--text-primary)] tracking-tight">{o.reference || `#${(o.id || o._id || '').slice(-8)}`}</td>
                                    <td className="px-6 py-5 text-[13px] font-bold text-[var(--text-primary)]">{o.buyerName}</td>
                                    <td className="px-6 py-5 text-[13px] font-bold text-[#ed0000]">₦{(o.amount || 0).toLocaleString()}</td>
                                    <td className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">{format(new Date(o.date), 'MMM dd, yyyy')}</td>
                                    <td className="px-6 py-5">
                                        {['paid', 'confirmed'].includes(String(o.status || '').toLowerCase()) ? (
                                            <button
                                                onClick={(e) => handlePickupReminder(o, e)}
                                                disabled={remindingId === (o.id || o._id)}
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--divider)] bg-[var(--bg-secondary)] text-[11px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all disabled:opacity-50"
                                            >
                                                <BellRing size={13} />
                                                {remindingId === (o.id || o._id) ? 'Sending…' : 'Reminder'}
                                            </button>
                                        ) : (
                                            <span className="text-[11px] text-[var(--text-muted)]">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_COLOR[o.status] || STATUS_COLOR.pending}`}>
                                            {(o.status || 'pending').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button
                                            onClick={(e) => handleDeleteOrder(o, e)}
                                            disabled={deletingId === (o.id || o._id)}
                                            className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors disabled:opacity-50 rounded-lg hover:bg-red-50/20"
                                            title="Delete order"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && pagination.total > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--divider)] text-[12px] font-medium text-[var(--text-muted)]">
                        <span>Showing <span className="font-bold text-[var(--text-primary)]">{showingFrom}–{showingTo}</span> of <span className="font-bold text-[var(--text-primary)]">{pagination.total}</span></span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={pagination.page <= 1}
                                className="p-2 rounded-lg border border-[var(--divider)] hover:bg-[var(--bg-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-3 font-bold text-[var(--text-primary)]">{pagination.page} / {pagination.totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={pagination.page >= pagination.totalPages}
                                className="p-2 rounded-lg border border-[var(--divider)] hover:bg-[var(--bg-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && orderToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-300">
                    <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">Delete Order</h3>
                            <p className="text-[13px] text-[var(--text-muted)] mb-8">
                                Are you sure you want to delete order <span className="font-bold text-[var(--text-primary)]">{orderToDelete.reference || `#${(orderToDelete.id || orderToDelete._id || '').slice(-8)}`}</span>?
                            </p>
                            <p className="text-[12px] text-red-500 mb-8">This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false)
                                        setOrderToDelete(null)
                                    }}
                                    className="flex-1 px-4 py-3 rounded-lg border border-[var(--divider)] bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold text-[12px] hover:bg-[var(--bg-tertiary)] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteOrder}
                                    disabled={deletingId === (orderToDelete.id || orderToDelete._id)}
                                    className="flex-1 px-4 py-3 rounded-lg bg-red-500 text-white font-bold text-[12px] hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deletingId === (orderToDelete.id || orderToDelete._id) ? 'Deleting…' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrdersTab
