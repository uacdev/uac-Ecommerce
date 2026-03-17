import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { CreditCard, User, ShieldCheck, ArrowLeft, ShoppingBag, Trash2, Plus, Minus, ChevronRight, Truck } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../context/StoreContext'
import EmptyState from '../components/EmptyState'

const Checkout = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('paystack') // 'paystack' or 'bank'
    const { products, addOrder, cart, removeFromCart, updateCartQuantity, cartTotal } = useStore()

    const [buyer, setBuyer] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
    })

    // Determine if we are checking out a single item or the whole cart
    const isSingleItem = !!id
    const singleProduct = isSingleItem ? products.find(p => p.id === id) : null
    const checkoutItems = isSingleItem ? (singleProduct ? [{ ...singleProduct, quantity: 1 }] : []) : cart
    const totalAmount = isSingleItem ? (singleProduct?.price || 0) : cartTotal

    if (isSingleItem && !singleProduct) return (
        <div className="pt-48 text-center container">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Product not found</h2>
            <button onClick={() => navigate('/')} className="text-[var(--brand-red)] hover:underline">Return Home</button>
        </div>
    )

    if (!isSingleItem && cart.length === 0) return (
        <div className="pt-48 pb-20 flex items-center justify-center min-h-[70vh]">
            <EmptyState
                icon={ShoppingBag}
                title="Your cart is empty"
                description="Add some amazing items to your cart before checking out. Your treasure is just a click away."
                actionLabel="Back to Shop"
                onAction={() => navigate('/shop')}
            />
        </div>
    )

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            // For simplicity, we track the order with the first item's details if multi-item
            // or we could expand addOrder to handle arrays. Keeping it simple for now:
            const mainItem = checkoutItems[0]
            const result = await addOrder({
                productId: isSingleItem ? mainItem.id : 'multi-cart',
                productName: isSingleItem ? mainItem.name : `${checkoutItems.length} Items in Cart`,
                productImage: mainItem.images?.[0] || mainItem.image,
                sellerName: mainItem.sellerName,
                amount: totalAmount,
                buyerName: buyer.name,
                buyerPhone: buyer.phone,
                buyerEmail: buyer.email,
                buyerAddress: buyer.address,
                paymentMethod: paymentMethod,
                items: checkoutItems.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price }))
            })

            if (result && result.id) {
                navigate('/success', { state: { orderId: result.id, paymentMethod } })
            } else {
                alert('Order creation failed. Please try again.')
                setLoading(false)
            }
        } catch (error) {
            console.error('Checkout error:', error)
            alert('An error occurred. Please try again later.')
            setLoading(false)
        }
    }

    const updateBuyer = (field, value) => setBuyer(prev => ({ ...prev, [field]: value }))

    const inputStyle = {
        background: 'var(--bg-secondary)',
        border: '1px solid var(--divider)',
        color: 'var(--text-primary)',
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="pt-48 pb-20 container max-w-6xl"
        >
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-12 transition-colors hover:text-[var(--brand-red)]"
                style={{ color: 'var(--text-muted)' }}
            >
                <ArrowLeft size={16} /> Continue Shopping
            </button>

            <div className="mb-16">
                <h1 className="text-5xl md:text-6xl font-black mb-4 font-heading tracking-tight" style={{ color: 'var(--text-primary)' }}>Checkout</h1>
                <p className="font-medium text-lg" style={{ color: 'var(--text-muted)' }}>Review your items and complete your secure purchase.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Form Section */}
                <div className="lg:col-span-7 space-y-8">
                    <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
                        {/* Buyer Info */}
                        <div className="p-8 md:p-10 rounded-[32px] border bg-[var(--bg-secondary)]" style={{ borderColor: 'var(--divider)' }}>
                            <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3 mb-8" style={{ color: 'var(--text-primary)' }}>
                                <User size={20} className="text-[var(--brand-red)]" />
                                Shipping Info
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Full Name *</label>
                                    <input
                                        required
                                        type="text"
                                        value={buyer.name}
                                        onChange={e => updateBuyer('name', e.target.value)}
                                        placeholder="Enter your full name"
                                        className="w-full rounded-2xl px-6 py-4 outline-none focus:border-[var(--brand-red)] border transition-all font-bold"
                                        style={inputStyle}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Phone Number *</label>
                                        <input
                                            required
                                            type="tel"
                                            value={buyer.phone}
                                            onChange={e => updateBuyer('phone', e.target.value)}
                                            placeholder="+234..."
                                            className="w-full rounded-2xl px-6 py-4 outline-none focus:border-[var(--brand-red)] border transition-all font-bold"
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Email Address *</label>
                                        <input
                                            required
                                            type="email"
                                            value={buyer.email}
                                            onChange={e => updateBuyer('email', e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full rounded-2xl px-6 py-4 outline-none focus:border-[var(--brand-red)] border transition-all font-bold"
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Delivery Address *</label>
                                    <textarea
                                        required
                                        rows="3"
                                        value={buyer.address}
                                        onChange={e => updateBuyer('address', e.target.value)}
                                        placeholder="Flat number, building name, street, area..."
                                        className="w-full rounded-2xl px-6 py-4 outline-none focus:border-[var(--brand-red)] border transition-all font-bold resize-none"
                                        style={inputStyle}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="p-8 md:p-10 rounded-[32px] border bg-[var(--bg-secondary)]" style={{ borderColor: 'var(--divider)' }}>
                            <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3 mb-8" style={{ color: 'var(--text-primary)' }}>
                                <CreditCard size={20} className="text-[var(--brand-red)]" />
                                Payment Method
                            </h2>

                            <div className="space-y-4">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('paystack')}
                                    className="w-full p-6 rounded-2xl flex justify-between items-center transition-all border-2"
                                    style={{
                                        borderColor: paymentMethod === 'paystack' ? 'var(--brand-red)' : 'transparent',
                                        background: paymentMethod === 'paystack' ? 'var(--badge-bg)' : 'var(--bg-primary)'
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-5 h-5 rounded-full border-4 ${paymentMethod === 'paystack' ? 'border-[var(--brand-red)]' : 'border-[var(--divider)]'}`} />
                                        <div className="text-left">
                                            <p className="font-black text-sm uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Paystack</p>
                                            <p className="text-[10px] font-bold text-[var(--text-muted)]">Card, Transfer, USSD, Bank</p>
                                        </div>
                                    </div>
                                    <img src="https://checkout.paystack.com/static/media/paystack-logo.212f45cc.svg" alt="Paystack" className="h-4 opacity-50" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('bank')}
                                    className="w-full p-6 rounded-2xl flex justify-between items-center transition-all border-2"
                                    style={{
                                        borderColor: paymentMethod === 'bank' ? 'var(--brand-red)' : 'transparent',
                                        background: paymentMethod === 'bank' ? 'var(--badge-bg)' : 'var(--bg-primary)'
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-5 h-5 rounded-full border-4 ${paymentMethod === 'bank' ? 'border-[var(--brand-red)]' : 'border-[var(--divider)]'}`} />
                                        <div className="text-left">
                                            <p className="font-black text-sm uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Direct Bank Transfer</p>
                                            <p className="text-[10px] font-bold text-red-400">Manual Confirmation Required</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Summary Section */}
                <div className="lg:col-span-5">
                    <div className="sticky top-40 space-y-6">
                        <div className="glass p-8 md:p-10 rounded-[40px] border-none shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-red)]/5 rounded-bl-full -z-10" />
                            
                            <h2 className="text-xl font-black uppercase tracking-widest mb-8" style={{ color: 'var(--text-primary)' }}>Order Summary</h2>
                            
                            <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                {checkoutItems.map((item) => (
                                    <div key={item.id} className="flex gap-5 group">
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden glass shrink-0 relative">
                                            <img src={item.images?.[0] || item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                            {!isSingleItem && (
                                                <button 
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="absolute -top-1 -left-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex flex-col flex-1 justify-center">
                                            <h4 className="font-black text-sm line-clamp-1 uppercase tracking-wider mb-1" style={{ color: 'var(--text-primary)' }}>{item.name}</h4>
                                            <div className="flex items-center justify-between mt-2">
                                                {!isSingleItem ? (
                                                    <div className="flex items-center gap-3 bg-[var(--bg-secondary)] px-2 py-1 rounded-lg border border-[var(--divider)]">
                                                        <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="text-[var(--text-muted)] hover:text-[var(--brand-red)]"><Minus size={14}/></button>
                                                        <span className="text-xs font-black">{item.quantity}</span>
                                                        <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="text-[var(--text-muted)] hover:text-[var(--brand-red)]"><Plus size={14}/></button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-bold text-[var(--text-muted)]">Qty: 1</span>
                                                )}
                                                <p className="font-black text-[var(--brand-red)]">₦{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-6 border-t border-[var(--divider)]">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                                    <span style={{ color: 'var(--text-primary)' }}>₦{totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                                    <span className="text-emerald-500 font-black uppercase tracking-widest text-[10px]">Calculated Later</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-[var(--divider)]">
                                    <span className="text-lg font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Total</span>
                                    <span className="text-3xl font-black text-[var(--brand-red)]">₦{totalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                form="checkout-form"
                                disabled={loading}
                                className="w-full btn-primary py-5 mt-10 text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-[var(--brand-red)]/30 flex items-center justify-center gap-3 group"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </div>
                                ) : (
                                    <>
                                        Confirm & Pay Now
                                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <div className="mt-8 flex items-center gap-3 p-4 rounded-2xl bg-[var(--brand-red)]/5 border border-[var(--brand-red)]/10">
                                <ShieldCheck size={20} className="text-[var(--brand-red)] shrink-0" />
                                <p className="text-[10px] font-bold leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                                    Your transaction is protected by UAC Foods' secure escrow system.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl border border-[var(--divider)] flex items-center gap-4 bg-[var(--bg-secondary)]">
                            <Truck size={24} className="text-[var(--text-muted)]" />
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Fast Delivery</p>
                                <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Typically arrives in 24-48 hours after validation.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default Checkout
