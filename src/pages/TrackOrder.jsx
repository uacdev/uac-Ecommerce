import { motion, AnimatePresence } from 'framer-motion'
import { Search, Package, MapPin, Calendar, Clock, ArrowRight, ShieldCheck, Mail, Hash, ArrowLeft } from 'lucide-react'
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
        { id: 'paid', label: 'Payment Received', desc: 'Securely held in escrow' },
        { id: 'shipped', label: 'In Transit', desc: 'Out for delivery' },
        { id: 'delivered', label: 'Arrived', desc: 'Item reached destination' },
        { id: 'completed', label: 'Settled', desc: 'Funds released to seller' }
    ]

    const getStatusIndex = (status) => {
        const index = steps.findIndex(s => s.id === status)
        return index === -1 ? 0 : index
    }

    return (
        <div className="pt-40 pb-20 container max-w-4xl min-h-screen">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-12 transition-colors"
                style={{ color: 'var(--text-muted)' }}
            >
                <ArrowLeft size={16} /> Back
            </button>

            <div className="text-center mb-16">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 rounded-3xl bg-[#F18B2410] flex items-center justify-center mx-auto mb-6 border border-[#F18B2420]"
                >
                    <Package className="text-[#F18B24]" size={32} />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-black font-heading mb-4 tracking-tighter" style={{ color: 'var(--text-primary)' }}>Track Your Order</h1>
                <p className="max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>Enter your order details to see real-time updates from SR-Cloud Logistics.</p>
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
                                    placeholder="SR-2026-XXXX" 
                                    value={orderId}
                                    onChange={e => setOrderId(e.target.value)}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:border-[#F18B24] transition-all"
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
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:border-[#F18B24] transition-all"
                                    style={{ color: 'var(--text-primary)' }}
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

                        <button 
                            disabled={searching}
                            className="w-full btn-primary py-5 rounded-xl shadow-xl shadow-orange-500/10 flex items-center justify-center gap-3 active:scale-95 transition-transform"
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
                        <div className="glass p-6 border-l-4 border-l-[#F18B24]">
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

                    {/* Timeline */}
                    <div className="glass p-8 md:p-12 overflow-hidden">
                        <h3 className="text-lg font-black mb-12 flex items-center gap-3">
                            <Clock className="text-[#F18B24]" />
                            Logistics Timeline
                        </h3>
                        
                        <div className="relative">
                            {/* Connector Line */}
                            <div className="absolute left-[11px] md:left-1/2 top-0 bottom-0 w-[2px] bg-[var(--divider)] -translate-x-1/2" />
                            <div className="absolute left-[11px] md:left-1/2 top-0 w-[2px] bg-[#F18B24] transition-all duration-1000 -translate-x-1/2" style={{ height: `${(getStatusIndex(foundOrder.status) / (steps.length - 1)) * 100}%` }} />

                            <div className="space-y-12">
                                {steps.map((step, idx) => {
                                    const isActive = getStatusIndex(foundOrder.status) >= idx
                                    const isLastActive = getStatusIndex(foundOrder.status) === idx

                                    return (
                                        <div key={idx} className={`relative flex items-center md:justify-center ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                            {/* dot */}
                                            <div className={`absolute left-0 md:left-1/2 w-6 h-6 rounded-full border-4 -translate-x-[7px] md:-translate-x-3 z-10 transition-colors duration-500 ${isActive ? 'bg-[#F18B24] border-[#F18B2430]' : 'bg-[var(--bg-secondary)] border-[var(--divider)]'}`}>
                                                {isLastActive && <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-full h-full rounded-full bg-[#F18B2440]" />}
                                            </div>

                                            {/* content */}
                                            <div className={`pl-12 md:pl-0 md:w-1/2 ${idx % 2 === 0 ? 'md:pr-20 md:text-right' : 'md:pl-20 md:text-left'}`}>
                                                <p className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-[#F18B24]' : 'text-[var(--text-muted)]'}`}>
                                                    {step.label}
                                                </p>
                                                <p className="text-[11px] font-bold mt-1" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                                            </div>
                                            <div className="hidden md:block w-1/2" />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button 
                            onClick={() => setFoundOrder(null)} 
                            className="bg-[var(--bg-primary)] border border-[var(--divider)] px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-secondary)] transition-colors"
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
