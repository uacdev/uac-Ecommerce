import { motion } from 'framer-motion'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, ShieldCheck, Minus, Plus } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { useStore } from '../context/StoreContext'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { deliveryApi, trackingApi, paymentApi } from '../api/client'
import { getVisitorId, setCheckoutSessionId, getCheckoutSessionId, clearCheckoutSessionId } from '../lib/visitor'
import toast from 'react-hot-toast'
import Preloader from '../components/Preloader'

const Checkout = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [loading, setLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('opay')
    const { products, addOrder, cart, cartTotal, updateCartQuantity } = useStore()
    const { customer } = useCustomerAuth() || {}

    const [buyer, setBuyer] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
    })

    // Pre-fill from the signed-in customer (only fills empty fields so user edits survive)
    useEffect(() => {
        if (!customer) return
        setBuyer(b => ({
            name: b.name || customer.fullName || '',
            email: b.email || customer.email || '',
            phone: b.phone || customer.phone || '',
            address: b.address || customer.defaultAddress || ''
        }))
        if (customer.defaultState) setStateName(s => s || customer.defaultState)
    }, [customer])

    const [zones, setZones] = useState([])
    const [zonesLoading, setZonesLoading] = useState(true)
    const [zoneName, setZoneName] = useState('')

    const [states, setStates] = useState([])
    const [stateName, setStateName] = useState('')

    useEffect(() => {
        Promise.allSettled([deliveryApi.getZones(), deliveryApi.getStates()]).then(([zRes, sRes]) => {
            if (zRes.status === 'fulfilled') setZones(zRes.value.data?.data || [])
            if (sRes.status === 'fulfilled') setStates(sRes.value.data?.data || [])
            setZonesLoading(false)
        })
    }, [])

    // Open a checkout session as soon as the buyer lands here. Reuse an existing
    // unconverted session id if present so a refresh doesn't inflate abandonment.
    useEffect(() => {
        const existing = getCheckoutSessionId()
        if (existing) return
        trackingApi.startCheckout(getVisitorId(), customer?.email || '')
            .then(res => {
                if (res?.data?.sessionId) setCheckoutSessionId(res.data.sessionId)
            })
            .catch(() => { /* analytics best-effort */ })
    }, [customer])

    const isSingleItem = !!id
    const singleProduct = isSingleItem ? products.find(p => p.id === id) : null
    const [singleQty, setSingleQty] = useState(location.state?.quantity || 1)

    const checkoutItems = isSingleItem ? (singleProduct ? [{ ...singleProduct, quantity: singleQty }] : []) : cart
    const subtotal = isSingleItem ? (singleProduct?.price || 0) * singleQty : cartTotal

    const selectedZone = useMemo(() => zones.find(z => z.name === zoneName), [zones, zoneName])
    const deliveryFee = selectedZone?.fee || 0
    const totalAmount = subtotal + deliveryFee

    if (isSingleItem && !singleProduct) return <Preloader />

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!stateName) {
            toast.error('PICK YOUR STATE')
            return
        }
        if (!zoneName) {
            toast.error('PICK A DELIVERY ZONE')
            return
        }
        setLoading(true)

        const result = await addOrder({
            items: checkoutItems.map(it => ({
                productId: it.id,
                name: it.name,
                image: it.image,
                price: it.price,
                quantity: it.quantity || 1
            })),
            buyerName: buyer.name,
            buyerPhone: buyer.phone,
            buyerEmail: buyer.email,
            buyerAddress: buyer.address,
            buyerState: stateName,
            deliveryZone: zoneName,
            paymentMethod,
            fulfillmentType: 'delivery',
            checkoutSessionId: getCheckoutSessionId() || undefined
        })

        if (!result?.success) {
            toast.error(result?.message || 'ORDER FAILED')
            setLoading(false)
            return
        }

        clearCheckoutSessionId()

        // OPay — call backend to get cashier URL then redirect
        try {
            const { data } = await paymentApi.initiate({
                reference: result.data.reference,
                amount: result.data.amount,
                buyerName: buyer.name,
                buyerEmail: buyer.email,
                buyerPhone: buyer.phone,
                productName: isSingleItem ? checkoutItems[0].name : `Cart (${checkoutItems.length} items)`,
            })
            if (data?.cashierUrl) {
                window.location.href = data.cashierUrl
            } else {
                throw new Error('No cashier URL returned')
            }
        } catch (err) {
            console.error('OPay initiation error:', err)
            toast.error('Payment gateway error. Please try again.')
            setLoading(false)
        }
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
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">State</label>
                                        <select required value={stateName} onChange={e => setStateName(e.target.value)} className="w-full bg-transparent border-b-2 border-[var(--divider)] py-4 text-xl font-bold uppercase transition-all focus:border-[var(--brand-red)] text-[var(--text-primary)] outline-none appearance-none cursor-pointer">
                                            <option value="">SELECT STATE</option>
                                            {states.map(s => (
                                                <option key={s} value={s}>{s.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Delivery Zone</label>
                                        <select required value={zoneName} onChange={e => setZoneName(e.target.value)} disabled={zonesLoading} className="w-full bg-transparent border-b-2 border-[var(--divider)] py-4 text-xl font-bold uppercase transition-all focus:border-[var(--brand-red)] text-[var(--text-primary)] outline-none appearance-none cursor-pointer">
                                            <option value="">{zonesLoading ? 'LOADING ZONES…' : 'SELECT YOUR ZONE'}</option>
                                            {zones.map(z => (
                                                <option key={z.name} value={z.name}>
                                                    {z.name.toUpperCase()} — ₦{z.fee.toLocaleString()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </section>

                                <section>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--brand-red)] mb-12 border-b border-[var(--divider)] pb-4 w-fit">02 Payment Gateway</h2>
                                <div className="space-y-4">
                                    <div className="w-full flex justify-between items-center p-8 rounded-[32px] border-2 border-[var(--brand-red)] bg-[var(--brand-red)]/5">
                                        <div className="flex items-center gap-6">
                                            <div className="w-4 h-4 rounded-full border-2 border-[var(--brand-red)] bg-[var(--brand-red)]" />
                                            <span className="text-xl font-black uppercase tracking-tighter text-[var(--text-primary)]">Pay with OPay</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">INSTANT</span>
                                    </div>
                                </div>
                            </section>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-40 space-y-12">
                            <div className="bg-[var(--bg-secondary)] rounded-[60px] p-12 border border-[var(--divider)]">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-12">Your Cart</h2>
                                
                                <div className="space-y-8 mb-12 max-h-[400px] overflow-y-auto pr-4 scrollbar-hide">
                                    {checkoutItems.map(item => (
                                        <div key={item.id} className="flex gap-6">
                                            <div className="w-24 h-32 rounded-[24px] overflow-hidden bg-[var(--bg-primary)] border border-[var(--divider)] shrink-0">
                                                <img src={item.image} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col justify-between flex-1 py-1">
                                                <div>
                                                    <h4 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] leading-tight">{item.name}</h4>
                                                    <span className="text-sm font-black text-[var(--brand-red)] mt-1 block">₦{(item.price * item.quantity).toLocaleString()}</span>
                                                    <span className="text-[10px] font-bold text-[var(--text-muted)]">₦{item.price.toLocaleString()} each</span>
                                                </div>
                                                {/* Qty controls */}
                                                <div className="flex items-center gap-3 border border-[var(--divider)] rounded-full px-3 py-1.5 w-fit mt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => isSingleItem
                                                            ? setSingleQty(q => Math.max(1, q - 1))
                                                            : updateCartQuantity(item.id, item.quantity - 1)
                                                        }
                                                        disabled={item.quantity <= 1}
                                                        className="text-[var(--text-primary)] hover:text-[var(--brand-red)] transition-colors disabled:opacity-30"
                                                    >
                                                        <Minus size={12} strokeWidth={3} />
                                                    </button>
                                                    <span className="text-xs font-black w-5 text-center text-[var(--text-primary)]">{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => isSingleItem
                                                            ? setSingleQty(q => Math.min(item.stockCount ?? 999, q + 1))
                                                            : updateCartQuantity(item.id, item.quantity + 1)
                                                        }
                                                        disabled={item.quantity >= (item.stockCount ?? 999)}
                                                        className="text-[var(--text-primary)] hover:text-[var(--brand-red)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <Plus size={12} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 pt-12 border-t border-[var(--divider)]">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                        <span>Subtotal</span>
                                        <span className="text-[var(--text-primary)]">₦{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                        <span>Delivery {selectedZone ? `· ${selectedZone.name}` : ''}</span>
                                        <span className={selectedZone ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>
                                            {selectedZone ? `₦${deliveryFee.toLocaleString()}` : 'PICK A ZONE'}
                                        </span>
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
