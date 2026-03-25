import { motion, AnimatePresence } from 'framer-motion'
import { Search, Package, MapPin, Calendar, Clock, ArrowRight, ShieldCheck, Mail, Hash, ChevronLeft, Truck } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../context/StoreContext'
import { Link, useNavigate } from 'react-router-dom'

const TrackOrder = () => {
    const navigate = useNavigate()
    const [orderId, setOrderId] = useState('')
    const [email, setEmail] = useState('')
    const [foundOrder, setFoundOrder] = useState(null)
    const [searching, setSearching] = useState(false)
    const [error, setError] = useState('')
    const { orders } = useStore()

    const handleTrack = (e) => {
        e.preventDefault()
        setSearching(true)
        setError('')
        setFoundOrder(null)

        setTimeout(() => {
            const order = orders.find(o => 
                o.id.toLowerCase() === orderId.toLowerCase().trim() && 
                o.buyerEmail.toLowerCase() === email.toLowerCase().trim()
            )

            if (order) {
                setFoundOrder(order)
            } else {
                setError('Order not found. Please double-check your ID and Email.')
            }
            setSearching(false)
        }, 1200)
    }

    const steps = [
        { id: 'pending', label: 'Processing', desc: 'Awaiting payment verification' },
        { id: 'paid', label: 'Payment Received', desc: 'Order confirmed' },
        { id: 'shipped', label: 'In Transit', desc: 'Out for delivery' },
        { id: 'delivered', label: 'Arrived', desc: 'Item reached destination' },
        { id: 'completed', label: 'Settled', desc: 'Order completed' }
    ]

    const getStatusIndex = (status) => {
        const index = steps.findIndex(s => s.id === status)
        return index === -1 ? 0 : index
    }

    return (
        <div className="pt-48 pb-20 container max-w-4xl min-h-screen">
            <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] mb-12 transition-colors hover:text-[var(--brand-red)]"
                style={{ color: 'var(--text-muted)' }}
            >
                <ChevronLeft size={16} /> Back to Shop
            </button>

            <div className="text-center mb-16">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 rounded-3xl bg-[var(--brand-red)]/10 flex items-center justify-center mx-auto mb-6 border border-[var(--brand-red)]/20"
                >
                    <Package className="text-[var(--brand-red)]" size={32} />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-black font-heading mb-4 tracking-tighter" style={{ color: 'var(--text-primary)' }}>Track Your Order</h1>
                <p className="max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>Enter your order details to see real-time updates from UAC Portal Logistics.</p>
            </div>

            {!foundOrder ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-10 md:p-12 max-w-xl mx-auto"
                >
                    <form onSubmit={handleTrack} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Order ID</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                                <input 
                                    required
                                    type="text" 
                                    placeholder="UAC-2026-XXXX" 
                                    value={orderId}
                                    onChange={e => setOrderId(e.target.value)}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:border-[var(--brand-red)] transition-all"
                                    style={{ color: 'var(--text-primary)' }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                                <input 
                                    required
                                    type="email" 
                                    placeholder="your@email.com" 
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:border-[var(--brand-red)] transition-all"
                                    style={{ color: 'var(--text-primary)' }}
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

                        <button 
                            disabled={searching}
                            className="w-full btn-primary py-5 rounded-xl shadow-xl shadow-[var(--brand-red)]/10 flex items-center justify-center gap-3 active:scale-95 transition-transform"
                        >
                            {searching ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <>Locate Shipments <ArrowRight size={18}/></>
                            )}
                        </button>
                    </form>
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                    {/* Order Status Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass p-6 border-l-4 border-l-[var(--brand-red)]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Item Purchase</p>
                            <p className="text-sm font-black truncate" style={{ color: 'var(--text-primary)' }}>{foundOrder.productName}</p>
                        </div>
                        <div className="glass p-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Total Amount</p>
                            <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>₦{foundOrder.amount.toLocaleString()}</p>
                        </div>
                        <div className="glass p-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Order Date</p>
                            <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{new Date(foundOrder.date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                    </div>

                    {/* Detailed Logistics Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass p-8 md:p-10 transition-all hover:border-[var(--brand-red)]">
                            <h3 className="text-lg font-black mb-10 flex items-center gap-3">
                                <Clock className="text-[var(--brand-red)]" />
                                Logistics Timeline
                            </h3>
                            
                            <div className="relative">
                                {/* Connector Line */}
                                <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-[var(--divider)] -translate-x-1/2" />
                                <div className="absolute left-[11px] top-0 w-[2px] bg-[var(--brand-red)] transition-all duration-1000 -translate-x-1/2" style={{ height: `${(getStatusIndex(foundOrder.status) / (steps.length - 1)) * 100}%` }} />

                                <div className="space-y-12">
                                    {steps.map((step, idx) => {
                                        const isActive = getStatusIndex(foundOrder.status) >= idx
                                        const isLastActive = getStatusIndex(foundOrder.status) === idx

                                        return (
                                            <div key={idx} className="relative flex items-center">
                                                {/* dot */}
                                                <div className={`absolute left-0 w-6 h-6 rounded-full border-4 -translate-x-[7px] z-10 transition-colors duration-500 ${isActive ? 'bg-[var(--brand-red)] border-[var(--brand-red)]/30' : 'bg-[var(--bg-secondary)] border-[var(--divider)]'}`}>
                                                    {isLastActive && <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-full h-full rounded-full bg-[var(--brand-red)]/40" />}
                                                </div>

                                                <div className="pl-12">
                                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-[var(--brand-red)]' : 'text-[var(--text-muted)]'}`}>
                                                        {step.label}
                                                    </p>
                                                    <p className="text-xs font-bold mt-1" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="glass p-8 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <Truck size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Delivery Method</p>
                                        <p className="text-sm font-black uppercase">{foundOrder.deliveryMethod === 'assisted' ? 'UAC Direct Logistics' : 'Self-Arranged Pick-up'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Logistics Partner</p>
                                        <p className="text-sm font-black">{foundOrder.logisticsPartner || 'UAC Foods Logistics'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--brand-red)]/10 flex items-center justify-center text-[var(--brand-red)]">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Destination</p>
                                        <p className="text-sm font-black truncate">{foundOrder.shippingAddress || 'Verified Distribution Center'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="glass p-8 border-t-4 border-t-emerald-500">
                                <div className="flex justify-between items-center mb-6">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Payment Breakdown</p>
                                    <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase">Verified</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Product Price</span>
                                        <span className="text-xs font-black">₦{foundOrder.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Logistics Fee</span>
                                        <span className="text-xs font-black">₦{(foundOrder.deliveryFee || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="pt-4 border-t flex justify-between" style={{ borderColor: 'var(--divider)' }}>
                                        <span className="text-sm font-black">Total Paid</span>
                                        <span className="text-sm font-black text-[var(--brand-red)]">₦{(foundOrder.amount + (foundOrder.deliveryFee || 0)).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-center gap-6 pt-10 border-t" style={{ borderColor: 'var(--divider)' }}>
                        <button 
                            onClick={() => setFoundOrder(null)} 
                            className="bg-[var(--bg-primary)] border border-[var(--divider)] px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-secondary)] transition-colors"
                        >
                            Track Another Order
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

export default TrackOrder;
