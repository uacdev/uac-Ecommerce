import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { CreditCard, User, ShieldCheck, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../context/StoreContext'

const Checkout = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('paystack') // 'paystack' or 'bank'
    const { products, addOrder } = useStore()

    const [buyer, setBuyer] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
    })

    const product = products.find(p => p.id === id)

    if (!product) return (
        <div className="pt-48 text-center container">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Product not found</h2>
            <button onClick={() => navigate('/')} className="text-[#F18B24] hover:underline">Return Home</button>
        </div>
    )

    if (product.status === 'sold') return (
        <div className="pt-48 text-center container">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>This item has been sold</h2>
            <button onClick={() => navigate('/')} className="text-[#F18B24] hover:underline">Browse other items</button>
        </div>
    )

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const result = await addOrder({
                productId: product.id,
                productName: product.name,
                productImage: product.image,
                sellerName: product.sellerName,
                amount: product.price,
                buyerName: buyer.name,
                buyerPhone: buyer.phone,
                buyerEmail: buyer.email,
                buyerAddress: buyer.address,
                paymentMethod: paymentMethod,
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
        background: 'var(--input-bg)',
        border: '1px solid var(--input-border)',
        color: 'var(--text-primary)',
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="pt-48 pb-20 container max-w-4xl"
        >
            <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-8 transition-colors"
                style={{ color: 'var(--text-muted)', hover: { color: 'var(--text-primary)' } }}
            >
                <ArrowLeft size={16} /> Back to Gallery
            </button>

            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 font-heading" style={{ color: 'var(--text-primary)' }}>Secure Checkout</h1>
                <p style={{ color: 'var(--text-muted)' }}>Guest Checkout — No account required.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                {/* Form Section */}
                <div className="lg:col-span-3">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="glass p-8 space-y-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-6" style={{ color: 'var(--text-primary)' }}>
                                <User size={20} className="text-[#F18B24]" />
                                Buyer Information
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Full Name *</label>
                                    <input
                                        required
                                        type="text"
                                        value={buyer.name}
                                        onChange={e => updateBuyer('name', e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full rounded-xl px-4 py-3 outline-none focus:border-[#F18B24] transition-colors"
                                        style={inputStyle}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Phone Number *</label>
                                        <input
                                            required
                                            type="tel"
                                            value={buyer.phone}
                                            onChange={e => updateBuyer('phone', e.target.value)}
                                            placeholder="+234..."
                                            className="w-full rounded-xl px-4 py-3 outline-none focus:border-[#F18B24] transition-colors"
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Email (Optional)</label>
                                        <input
                                            type="email"
                                            value={buyer.email}
                                            onChange={e => updateBuyer('email', e.target.value)}
                                            placeholder="john@example.com"
                                            className="w-full rounded-xl px-4 py-3 outline-none focus:border-[#F18B24] transition-colors"
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Delivery Area / Address *</label>
                                    <textarea
                                        required
                                        rows="3"
                                        value={buyer.address}
                                        onChange={e => updateBuyer('address', e.target.value)}
                                        placeholder="Enter your specific area or full delivery address"
                                        className="w-full rounded-xl px-4 py-3 outline-none focus:border-[#F18B24] transition-colors resize-none"
                                        style={inputStyle}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="glass p-8">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-6" style={{ color: 'var(--text-primary)' }}>
                                <CreditCard size={20} className="text-[#F18B24]" />
                                Payment Method
                            </h2>

                            <div className="space-y-4">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('paystack')}
                                    className="w-full p-4 rounded-xl flex justify-between items-center transition-all"
                                    style={{
                                        border: paymentMethod === 'paystack' ? '1px solid #F18B24' : '1px solid var(--divider)',
                                        background: paymentMethod === 'paystack' ? 'var(--badge-bg)' : 'transparent'
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border-4 ${paymentMethod === 'paystack' ? 'border-[#F18B24]' : 'border-gray-500'}`} />
                                        <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Paystack (Card/Transfer)</span>
                                    </div>
                                    <img src="https://checkout.paystack.com/static/media/paystack-logo.212f45cc.svg" alt="Paystack" className="h-4" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('bank')}
                                    className="w-full p-4 rounded-xl flex justify-between items-center transition-all text-left"
                                    style={{
                                        border: paymentMethod === 'bank' ? '1px solid #F18B24' : '1px solid var(--divider)',
                                        background: paymentMethod === 'bank' ? 'var(--badge-bg)' : 'transparent'
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border-4 ${paymentMethod === 'bank' ? 'border-[#F18B24]' : 'border-gray-500'}`} />
                                        <div>
                                            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Direct Bank Transfer</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Manual Confirmation</p>
                                        </div>
                                    </div>
                                </button>

                                {paymentMethod === 'bank' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="p-6 rounded-xl bg-black/5 dark:bg-white/5 border border-dashed border-[#F18B24]/30"
                                    >
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-[#F18B24]">Platform Bank Details</p>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-500">Bank Name</p>
                                                <p className="text-sm font-black">Guaranty Trust Bank (GTB)</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-500">Account Name</p>
                                                <p className="text-sm font-black">SELLOUT & RELOCATE TECH</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-500">Account Number</p>
                                                <p className="text-xl font-black text-[#F18B24]">0123456789</p>
                                            </div>
                                            <div className="mt-4 p-3 rounded-lg bg-[#F18B24]/10">
                                                <p className="text-[10px] font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                                                    IMPORTANT: Use your Order ID as transaction narration.
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="btn-primary w-full py-5 text-xl relative overflow-hidden"
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </div>
                            ) : `Pay Now — ₦${product.price.toLocaleString()}`}
                        </button>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass p-8 sticky top-32">
                        <h2 className="text-xl font-bold mb-6 italic" style={{ color: 'var(--text-primary)' }}>Order Summary</h2>

                        <div className="flex gap-4 mb-6">
                            <img src={product.image} className="w-20 h-20 object-cover rounded-lg shrink-0" style={{ background: 'var(--bg-tertiary)' }} />
                            <div>
                                <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{product.name}</h4>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Qty: 1</p>
                                <p className="text-[#F18B24] font-bold">₦{product.price.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 mb-8" style={{ borderTop: '1px solid var(--divider)' }}>
                            <div className="flex justify-between text-sm">
                                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>₦{product.price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
                                <span className="font-medium italic text-xs" style={{ color: 'var(--text-muted)' }}>Quoted after checkout</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold pt-4" style={{ borderTop: '1px solid var(--divider)' }}>
                                <span style={{ color: 'var(--text-primary)' }}>Total</span>
                                <span className="text-[#F18B24]">₦{product.price.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                            <p className="flex items-center gap-1 mb-1"><ShieldCheck size={10} /> Secure Encryption</p>
                            <p>By clicking Pay Now, you agree to the inspection policy and delivery coordination terms.</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default Checkout
