import { motion } from 'framer-motion'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Trash2, Plus, Minus, ChevronRight, ShieldCheck, Truck } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../context/StoreContext'
import toast from 'react-hot-toast'
import Preloader from '../components/Preloader'

const Checkout = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('monnify')
    const { products, addOrder, cart, removeFromCart, updateCartQuantity, cartTotal } = useStore()

    const [buyer, setBuyer] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
    })

    const isSingleItem = !!id
    const singleProduct = isSingleItem ? products.find(p => p.id === id) : null
    const checkoutItems = isSingleItem ? (singleProduct ? [{ ...singleProduct, quantity: 1 }] : []) : cart
    const totalAmount = isSingleItem ? (singleProduct?.price || 0) : cartTotal

    if (isSingleItem && !singleProduct) return <Preloader />

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        
        // Simulate Monnify Integration / Processing
        setTimeout(async () => {
            const result = await addOrder({
                productId: isSingleItem ? checkoutItems[0].id : 'multi',
                productName: isSingleItem ? checkoutItems[0].name : 'Cart Items',
                amount: totalAmount,
                buyerName: buyer.name,
                buyerPhone: buyer.phone,
                buyerEmail: buyer.email,
                buyerAddress: buyer.address,
                items: checkoutItems
            })

            if (result) {
                navigate('/success', { state: { orderId: result.id } })
            } else {
                toast.error('ORDER FAILED')
                setLoading(false)
            }
        }, 2000)
    }

    return (
        <div className="pt-40 pb-40 bg-[var(--bg-primary)] transition-colors duration-700 font-['Sen',sans-serif]">
            <div className="container px-6 max-w-7xl">
                
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-24 border-b border-[var(--divider)] pb-12">
                    <div>
                        <motion.span 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--brand-red)] mb-4 block"
                        >
                            Final Step
                        </motion.span>
                        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-[var(--text-primary)] leading-none">Checkout</h1>
                    </div>
                    <Link to="/shop" className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] hover:text-[var(--brand-red)] transition-all flex items-center gap-2 mb-2">
                        <ArrowLeft size={16} /> Continue Shopping
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
                    
                    {/* Information Form */}
                    <div className="lg:col-span-7">
                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-20">
                            
                            <section>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--brand-red)] mb-12 border-b border-[var(--divider)] pb-4 w-fit">01 Delivery Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Full Name</label>
                                        <input required type="text" value={buyer.name} onChange={e => setBuyer({...buyer, name: e.target.value})} className="w-full bg-transparent border-b-2 border-[var(--divider)] py-4 text-xl font-bold uppercase transition-all focus:border-[var(--brand-red)] text-[var(--text-primary)] outline-none" placeholder="YOUR NAME" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Phone</label>
                                        <input required type="tel" value={buyer.phone} onChange={e => setBuyer({...buyer, phone: e.target.value})} className="w-full bg-transparent border-b-2 border-[var(--divider)] py-4 text-xl font-bold transition-all focus:border-[var(--brand-red)] text-[var(--text-primary)] outline-none" placeholder="+234" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Email</label>
                                        <input required type="email" value={buyer.email} onChange={e => setBuyer({...buyer, email: e.target.value})} className="w-full bg-transparent border-b-2 border-[var(--divider)] py-4 text-xl font-bold transition-all focus:border-[var(--brand-red)] text-[var(--text-primary)] outline-none" placeholder="EMAIL@EXAMPLE.COM" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Street Address</label>
                                        <input required type="text" value={buyer.address} onChange={e => setBuyer({...buyer, address: e.target.value})} className="w-full bg-transparent border-b-2 border-[var(--divider)] py-4 text-xl font-bold transition-all focus:border-[var(--brand-red)] text-[var(--text-primary)] outline-none uppercase" placeholder="DELIVERY LOCATION" />
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--brand-red)] mb-12 border-b border-[var(--divider)] pb-4 w-fit">02 Payment Gateway</h2>
                                <div className="space-y-4">
                                    {['monnify', 'bank'].map(method => (
                                        <button 
                                            key={method}
                                            type="button"
                                            onClick={() => setPaymentMethod(method)}
                                            className={`w-full flex justify-between items-center p-8 rounded-[32px] border-2 transition-all ${paymentMethod === method ? 'border-[var(--brand-red)] bg-[var(--brand-red)]/5' : 'border-[var(--divider)] hover:border-[var(--text-muted)]'}`}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === method ? 'border-[var(--brand-red)] bg-[var(--brand-red)]' : 'border-[var(--divider)]'}`} />
                                                <span className="text-xl font-black uppercase tracking-tighter text-[var(--text-primary)]">{method === 'monnify' ? 'Credit Card / Transfer' : 'Direct Bank Deposit'}</span>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">{method === 'monnify' ? 'FAST' : 'WAIT'}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-40 space-y-12">
                            <div className="bg-[var(--bg-secondary)] rounded-[60px] p-12 border border-[var(--divider)]">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-12">Your Bag</h2>
                                
                                <div className="space-y-8 mb-12 max-h-[400px] overflow-y-auto pr-4 scrollbar-hide">
                                    {checkoutItems.map(item => (
                                        <div key={item.id} className="flex gap-6 group">
                                            <div className="w-24 h-32 rounded-[24px] overflow-hidden bg-[var(--bg-primary)] border border-[var(--divider)] shrink-0">
                                                <img src={item.image} className="w-full h-full object-cover grayscale" />
                                            </div>
                                            <div className="flex flex-col justify-center flex-1">
                                                <h4 className="text-sm font-black uppercase tracking-wider mb-2 text-[var(--text-primary)]">{item.name}</h4>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-[var(--text-muted)]">QTY: {item.quantity}</span>
                                                    <span className="text-sm font-black text-[var(--brand-red)]">₦{(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 pt-12 border-t border-[var(--divider)]">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                        <span>Subtotal</span>
                                        <span className="text-[var(--text-primary)]">₦{totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                        <span>Shipping</span>
                                        <span className="text-emerald-500">FREE FOR NOW</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-8 mt-4 border-t-2 border-[var(--divider)]">
                                        <span className="text-xl font-black uppercase tracking-widest text-[var(--text-primary)]">Total</span>
                                        <span className="text-4xl font-black text-[var(--brand-red)]">₦{totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button 
                                    form="checkout-form"
                                    disabled={loading}
                                    className="w-full mt-12 bg-black text-white py-8 rounded-[32px] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[var(--brand-red)] transition-all shadow-2xl flex items-center justify-center gap-4 group"
                                >
                                    {loading ? 'PROCESSING...' : (
                                        <>
                                            CONFIRM PURCHASE
                                            <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center gap-6 px-12">
                                <ShieldCheck size={32} className="text-[var(--text-muted)]" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] leading-relaxed">Secured via UAC Escrow Strategy. 256-bit Encryption Active.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout
