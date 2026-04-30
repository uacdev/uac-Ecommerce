import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { LogOut, Package, ShoppingBag, CheckCircle2, Clock, Mail, Phone, MapPin, Settings } from 'lucide-react'
import { format } from 'date-fns'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { customerApi } from '../api/client'
import EditProfilePanel from '../components/EditProfilePanel'

const STATUS_COLOR = {
    pending: 'bg-amber-50 text-amber-600 border-amber-200',
    paid: 'bg-blue-50 text-blue-600 border-blue-200',
    confirmed: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    shipped: 'bg-violet-50 text-violet-600 border-violet-200',
    delivered: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200'
}

const fmt = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`

const Account = () => {
    const { customer, loading, signOut } = useCustomerAuth()
    const navigate = useNavigate()
    const [data, setData] = useState({ summary: null, orders: [] })
    const [ordersLoading, setOrdersLoading] = useState(true)
    const [error, setError] = useState('')
    const [editOpen, setEditOpen] = useState(false)

    useEffect(() => {
        if (!customer) return
        let cancelled = false
        setOrdersLoading(true)
        customerApi.myOrders()
            .then(res => { if (!cancelled && res.data?.success) setData({ summary: res.data.summary, orders: res.data.orders }) })
            .catch(err => { if (!cancelled) setError(err.response?.data?.message || 'Could not load your orders') })
            .finally(() => { if (!cancelled) setOrdersLoading(false) })
        return () => { cancelled = true }
    }, [customer])

    if (loading) return <div className="pt-48 pb-32 container max-w-3xl text-center text-[var(--text-muted)]">Loading…</div>
    if (!customer) return <Navigate to="/account/login" replace />

    const handleSignOut = () => { signOut(); navigate('/') }
    const summary = data.summary || { totalOrders: 0, ongoingOrders: 0, completedOrders: 0, totalSpend: 0 }

    return (
        <div className="pt-40 pb-24 container max-w-5xl font-['Sen',sans-serif]">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 pb-8 border-b border-[var(--divider)]">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ed0000]">My Account</span>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-3 text-[var(--text-primary)]">Hi, {customer.fullName?.split(' ')[0] || 'there'}</h1>
                    </div>
                    <div className="flex items-center gap-3 self-start md:self-auto">
                        <button onClick={() => setEditOpen(true)} className="inline-flex items-center gap-2 text-[12px] font-bold text-[var(--text-primary)] border border-[var(--divider)] hover:border-[#ed0000] hover:text-[#ed0000] px-4 py-2 rounded-xl transition-all">
                            <Settings size={14} /> Edit profile
                        </button>
                        <button onClick={handleSignOut} className="inline-flex items-center gap-2 text-[12px] font-bold text-[var(--text-muted)] hover:text-[#ed0000]">
                            <LogOut size={14} /> Sign out
                        </button>
                    </div>
                </div>

                {/* Profile card */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-2xl p-6 mb-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[13px]">
                        <div className="flex items-center gap-3">
                            <Mail size={14} className="text-[var(--text-muted)]" />
                            <span className="font-bold text-[var(--text-primary)] truncate">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone size={14} className="text-[var(--text-muted)]" />
                            <span className="font-medium text-[var(--text-muted)]">{customer.phone || 'No phone added'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPin size={14} className="text-[var(--text-muted)]" />
                            <span className="font-medium text-[var(--text-muted)] truncate">{customer.defaultAddress || 'No saved address'}</span>
                        </div>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <Stat icon={<ShoppingBag size={18} />} label="Total orders" value={summary.totalOrders} />
                    <Stat icon={<Clock size={18} />} label="Ongoing" value={summary.ongoingOrders} highlight={summary.ongoingOrders > 0} />
                    <Stat icon={<CheckCircle2 size={18} />} label="Completed" value={summary.completedOrders} />
                    <Stat icon={<Package size={18} />} label="Total spent" value={fmt(summary.totalSpend)} />
                </div>

                {/* Orders */}
                <div className="mb-6 flex items-end justify-between">
                    <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Your orders</h2>
                    <Link to="/shop" className="text-[12px] font-bold text-[#ed0000] hover:underline">Continue shopping →</Link>
                </div>

                {error && <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-[#ed0000] text-[13px] font-bold mb-4">{error}</div>}

                {ordersLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-2xl animate-pulse" />)}
                    </div>
                ) : data.orders.length === 0 ? (
                    <div className="bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-2xl p-12 text-center">
                        <Package size={32} className="mx-auto mb-4 text-[var(--text-muted)] opacity-50" />
                        <p className="text-[14px] font-bold text-[var(--text-primary)]">No orders yet</p>
                        <p className="text-[12px] text-[var(--text-muted)] mt-1 mb-6">When you place your first order it'll show up here.</p>
                        <Link to="/shop" className="inline-block px-6 py-3 rounded-xl bg-[#ed0000] text-white font-bold text-[12px] hover:bg-[#c80000]">Browse products</Link>
                    </div>
                ) : (
                    <div className="bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--divider)]">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Reference</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Items</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] text-right">Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--divider)]">
                                {data.orders.map(o => (
                                    <tr key={o.id || o._id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                                        <td className="px-6 py-4 text-[12px] font-bold text-[var(--text-primary)]">{o.reference}</td>
                                        <td className="px-6 py-4 text-[12px] font-medium text-[var(--text-muted)]">{(o.items || []).reduce((n, it) => n + (it.quantity || 1), 0)} units</td>
                                        <td className="px-6 py-4 text-[12px] font-medium text-[var(--text-muted)]">{format(new Date(o.date), 'MMM dd, yyyy')}</td>
                                        <td className="px-6 py-4 text-[13px] font-bold text-right text-[var(--text-primary)]">{fmt(o.amount)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_COLOR[o.status] || STATUS_COLOR.pending}`}>
                                                {(o.status || 'pending').toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            <EditProfilePanel open={editOpen} onClose={() => setEditOpen(false)} />
        </div>
    )
}

const Stat = ({ icon, label, value, highlight }) => (
    <div className={`p-5 rounded-2xl border ${highlight ? 'bg-[#ed0000]/5 border-[#ed0000]/20' : 'bg-[var(--bg-secondary)] border-[var(--divider)]'}`}>
        <div className={`mb-3 ${highlight ? 'text-[#ed0000]' : 'text-[var(--text-muted)]'}`}>{icon}</div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
        <p className="text-2xl font-bold tracking-tight mt-1 text-[var(--text-primary)]">{value}</p>
    </div>
)

export default Account
