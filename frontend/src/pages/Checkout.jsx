import { motion } from 'framer-motion'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { ArrowLeft, CalendarDays, ChevronRight, Clock3, MapPin, PackageCheck, ShieldCheck, Truck, Minus, Plus, Trash2 } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { useStore } from '../context/StoreContext'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { deliveryApi, trackingApi, paymentApi, settingsApi } from '../api/client'
import { getVisitorId, setCheckoutSessionId, getCheckoutSessionId, clearCheckoutSessionId, setPendingCartPurchase } from '../lib/visitor'
import { CHECKOUT_WEEKDAYS, DEFAULT_CHECKOUT_POLICY, formatPolicyTime, getOrderWindowStatus, normalizeCheckoutPolicy } from '../lib/checkoutPolicy'
import { cdnCard } from '../lib/img'
import toast from 'react-hot-toast'
import Preloader from '../components/Preloader'

const CheckoutPolicyNotice = ({ policy, orderWindow }) => {
    const orderingDays = CHECKOUT_WEEKDAYS
        .filter(day => policy.weekdays.includes(day.id))
        .map(day => day.short)
        .join(' · ')
    const fulfillmentOptions = [
        policy.selfPickupEnabled && {
            icon: PackageCheck,
            title: 'Self pickup',
            description: 'Collect at pickup point.'
        },
        policy.dispatchEnabled && {
            icon: MapPin,
            title: 'Dispatch rider',
            description: 'Address and rider phone required.'
        },
        policy.platformDeliveryEnabled && {
            icon: Truck,
            title: 'Platform delivery',
            description: 'Available for SWAN products only.'
        }
    ].filter(Boolean)

    return (
        <aside aria-label="Checkout hours and fulfillment information" className="relative mb-6 overflow-hidden rounded-xl border border-[var(--divider)] bg-[var(--bg-tertiary)] shadow-sm sm:mb-8">
            <div className="absolute inset-y-0 left-0 w-1 bg-[var(--brand-red)]" />
            <div className="grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr]">
                <section className="border-b border-[var(--divider)] p-3 pl-4 sm:p-6 sm:pl-7 md:border-b-0 md:border-r">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-[var(--text-muted)]">
                            <CalendarDays size={13} />
                            <p className="text-[10px] font-black uppercase tracking-widest sm:text-[10px]">Order window · WAT</p>
                        </div>
                        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-wider ${orderWindow.isOpen ? 'bg-emerald-500/10 text-emerald-700' : 'bg-[var(--brand-red)]/10 text-[var(--brand-red)]'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${orderWindow.isOpen ? 'bg-emerald-500' : 'bg-[var(--brand-red)]'}`} />
                            {orderWindow.isOpen ? 'Open now' : 'Closed now'}
                        </span>
                    </div>
                    <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5 text-xl font-black leading-tight text-[var(--text-primary)] sm:mt-4 sm:text-2xl">
                        <span>{formatPolicyTime(policy.opensAt)}</span><span className="text-[var(--text-muted)]">to</span><span>{formatPolicyTime(policy.closesAt)}</span>
                    </p>
                    <p className="mt-1 text-[10px] font-bold text-[var(--text-muted)] sm:text-xs">{orderingDays || 'No ordering days enabled'}</p>
                    <div className="mt-2 flex items-start gap-1.5 border-t border-[var(--divider)] pt-2 text-[10px] leading-snug text-[var(--text-muted)] sm:mt-4 sm:gap-2 sm:pt-3 sm:text-[11px]">
                        <Clock3 size={12} className="mt-0.5 shrink-0 sm:h-[14px] sm:w-[14px]" />
                        <span>We handle orders during these hours and are away on weekends.</span>
                    </div>
                </section>

                <section className="grid grid-cols-1 sm:grid-cols-[0.8fr_1.2fr]">
                    <div className="border-b border-[var(--divider)] p-3 sm:border-b-0 sm:border-r sm:p-5">
                        <div className="flex items-center gap-2 text-[var(--text-muted)]">
                            <PackageCheck size={13} />
                            <p className="text-[10px] font-black uppercase tracking-widest sm:text-[10px]">Pickup readiness</p>
                        </div>
                        <p className="mt-2 text-[11px] leading-snug text-[var(--text-muted)] sm:mt-3 sm:text-[11px]">
                            Ready within <span className="font-black text-[var(--text-primary)]">{policy.pickupWindowMinutes} min</span> after payment.
                        </p>
                    </div>

                    <div className="p-3 sm:p-5">
                        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] sm:mb-3 sm:text-[10px]">Fulfillment options</p>
                        <div className="space-y-2 sm:space-y-2.5">
                            {fulfillmentOptions.length ? fulfillmentOptions.map(({ icon: Icon, title, description }) => (
                                <div key={title} className="flex items-center gap-2 sm:items-start sm:gap-2.5">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[var(--bg-secondary)] text-[var(--brand-red)] sm:mt-0.5 sm:h-6 sm:w-6">
                                        <Icon size={12} />
                                    </span>
                                    <div className="min-w-0 text-[11px] leading-snug sm:text-xs">
                                        <span className="font-bold text-[var(--text-primary)]">{title}</span>
                                        <span className="text-[var(--text-muted)]"> · {description}</span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-[10px] font-bold text-[var(--text-muted)]">No fulfillment options are currently enabled.</p>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </aside>
    )
}

const Checkout = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [loading, setLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('opay')
    const [itemToRemove, setItemToRemove] = useState(null)
    const { products, addOrder, cart, cartTotal, updateCartQuantity, removeFromCart } = useStore()
    const { customer, loading: authLoading } = useCustomerAuth() || {}

    const [buyer, setBuyer] = useState({
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
        setStateName('Lagos')
    }, [customer])

    const [zones, setZones] = useState([])
    const [zonesLoading, setZonesLoading] = useState(true)
    const [zoneName, setZoneName] = useState('')
    const [fulfillmentType, setFulfillmentType] = useState('pickup')
    const [pickupType, setPickupType] = useState('self')
    const [dispatchAddress, setDispatchAddress] = useState('')
    const [dispatchPhone, setDispatchPhone] = useState('')
    const [checkoutPolicy, setCheckoutPolicy] = useState({ ...DEFAULT_CHECKOUT_POLICY })
    const [orderWindow, setOrderWindow] = useState(() => getOrderWindowStatus(new Date(), DEFAULT_CHECKOUT_POLICY))

    const [states, setStates] = useState([])
    const [stateName, setStateName] = useState('Lagos')

    const isSingleItem = !!id
    const singleProduct = isSingleItem ? products.find(p => p.id === id) : null
    const [singleQty, setSingleQty] = useState(location.state?.quantity || 1)

    const checkoutItems = isSingleItem ? (singleProduct ? [{ ...singleProduct, quantity: singleQty }] : []) : cart
    const subtotal = isSingleItem ? (singleProduct?.price || 0) * singleQty : cartTotal

    const allowsDelivery = useMemo(() => {
        if (!checkoutPolicy.platformDeliveryEnabled || checkoutItems.length === 0) return false

        return checkoutItems.every((item) => {
            const haystack = [item?.brand, item?.category, item?.name]
                .filter(Boolean)
                .map((value) => String(value).toLowerCase())
                .join(' ')
            return haystack.includes('swan')
        })
    }, [checkoutItems, checkoutPolicy.platformDeliveryEnabled])

    const hasPickupOption = checkoutPolicy.selfPickupEnabled || checkoutPolicy.dispatchEnabled
    const hasAvailableFulfillment = hasPickupOption || allowsDelivery

    const activeFulfillmentType = allowsDelivery ? fulfillmentType : 'pickup'

    useEffect(() => {
        let cancelled = false
        settingsApi.getSetting('checkout_policy')
            .then(res => {
                if (!cancelled) setCheckoutPolicy(normalizeCheckoutPolicy(JSON.parse(res.data?.data?.value || '{}')))
            })
            .catch(err => {
                if (!cancelled && err.response?.status !== 404) console.error('Could not load checkout policy:', err)
            })
        return () => { cancelled = true }
    }, [])

    useEffect(() => {
        const updateOrderWindow = () => setOrderWindow(getOrderWindowStatus(new Date(), checkoutPolicy))
        updateOrderWindow()
        const timer = setInterval(updateOrderWindow, 30000)
        return () => clearInterval(timer)
    }, [checkoutPolicy])

    useEffect(() => {
        if (!hasPickupOption && allowsDelivery && fulfillmentType !== 'delivery') setFulfillmentType('delivery')
        else if (!allowsDelivery && hasPickupOption && fulfillmentType !== 'pickup') setFulfillmentType('pickup')
        if (pickupType === 'self' && !checkoutPolicy.selfPickupEnabled && checkoutPolicy.dispatchEnabled) setPickupType('dispatch')
        else if (pickupType === 'dispatch' && !checkoutPolicy.dispatchEnabled && checkoutPolicy.selfPickupEnabled) setPickupType('self')
    }, [hasPickupOption, allowsDelivery, fulfillmentType, pickupType, checkoutPolicy.selfPickupEnabled, checkoutPolicy.dispatchEnabled])

    useEffect(() => {
        Promise.allSettled([deliveryApi.getZones(), deliveryApi.getStates()]).then(([zRes, sRes]) => {
            if (zRes.status === 'fulfilled') setZones(zRes.value.data?.data || [])
            if (sRes.status === 'fulfilled') {
                const fetchedStates = sRes.value.data?.data || []
                setStates(
                    Array.isArray(fetchedStates)
                        ? fetchedStates.filter(s => String(s).trim().toLowerCase() === 'lagos')
                        : ['Lagos']
                )
            }
            setZonesLoading(false)
        })
    }, [])

    useEffect(() => {
        if (!allowsDelivery) {
            setFulfillmentType('pickup')
            setStateName('')
            setZoneName('')
            setBuyer(b => ({ ...b, address: '' }))
            return
        }

        if (fulfillmentType === 'pickup') {
            setStateName('')
            setZoneName('')
            setBuyer(b => ({ ...b, address: '' }))
        } else if (fulfillmentType === 'delivery') {
            setStateName('Lagos')
        }
    }, [allowsDelivery, fulfillmentType])

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

    const selectedZone = useMemo(() => zones.find(z => z.name === zoneName), [zones, zoneName])
    const deliveryFee = selectedZone?.fee || 0
    const totalAmount = subtotal + deliveryFee

    if (authLoading || (isSingleItem && !singleProduct)) return <Preloader />

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!orderWindow.isOpen) {
            toast.error('ORDERS ARE CLOSED. PLEASE RETURN MONDAY TO FRIDAY, 8AM TO 5PM WAT.')
            return
        }
        if (!hasAvailableFulfillment) {
            toast.error('NO FULFILLMENT OPTIONS ARE AVAILABLE FOR THIS ORDER')
            return
        }
        if (!customer?.fullName?.trim() || !customer?.email?.trim() || !customer?.phone?.trim()) {
            toast.error('COMPLETE YOUR CONTACT DETAILS IN YOUR PROFILE')
            return
        }
        if (activeFulfillmentType === 'pickup' && pickupType === 'dispatch') {
            if (!dispatchAddress.trim() || !dispatchPhone.trim()) {
                toast.error('ENTER THE DELIVERY ADDRESS AND DISPATCH RIDER CONTACT NUMBER')
                return
            }
            if (!/^\+?[\d\s().-]{7,20}$/.test(dispatchPhone.trim()) || dispatchPhone.replace(/\D/g, '').length < 7) {
                toast.error('ENTER A VALID DISPATCH RIDER CONTACT NUMBER')
                return
            }
        }
        if (activeFulfillmentType === 'delivery') {
            if (!buyer.address?.trim()) {
                toast.error('ENTER DELIVERY LOCATION')
                return
            }
            if (!stateName) {
                toast.error('PICK YOUR STATE')
                return
            }
            if (!zoneName) {
                toast.error('PICK A DELIVERY ZONE')
                return
            }
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
            buyerName: customer.fullName,
            buyerPhone: customer.phone,
            buyerEmail: customer.email,
            buyerAddress: activeFulfillmentType === 'delivery' ? buyer.address : '',
            buyerState: activeFulfillmentType === 'delivery' ? stateName : '',
            deliveryZone: activeFulfillmentType === 'delivery' ? zoneName : '',
            paymentMethod,
            fulfillmentType: activeFulfillmentType,
            pickupType,
            dispatchAddress: activeFulfillmentType === 'pickup' && pickupType === 'dispatch' ? dispatchAddress : '',
            dispatchPhone: activeFulfillmentType === 'pickup' && pickupType === 'dispatch' ? dispatchPhone : '',
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
                buyerName: customer.fullName,
                buyerEmail: customer.email,
                buyerPhone: customer.phone,
                productName: isSingleItem ? checkoutItems[0].name : `Cart (${checkoutItems.length} items)`,
            })
            if (data?.cashierUrl) {
                setPendingCartPurchase(result.data.reference, checkoutItems)
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

    if (!customer) {
        const returnHref = isSingleItem ? `/product/${id}` : '/cart'
        return (
            <div className="checkout-mobile checkout-account-gate pt-24 pb-28 md:pt-32 md:pb-16 bg-[var(--bg-primary)] font-['Sen',sans-serif]">
                <div className="container mx-auto max-w-6xl px-4 sm:px-6">
                    <Link to={returnHref} className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] transition-colors hover:text-[var(--brand-red)]">
                        <ArrowLeft size={15} /> Back to {isSingleItem ? 'product' : 'cart'}
                    </Link>

                    <div className="mb-5 flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] sm:mb-7 sm:text-xs">
                        <span className="rounded-full bg-[var(--brand-red)] px-3 py-1.5 text-white">1. Account</span>
                        <ChevronRight size={14} />
                        <span>2. Payment</span>
                    </div>

                    <CheckoutPolicyNotice policy={checkoutPolicy} orderWindow={orderWindow} />

                    <div className="mx-auto max-w-3xl">
                        <section className="rounded-2xl border border-[var(--divider)] bg-[var(--bg-tertiary)] p-5 shadow-sm sm:p-8">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-red)]/10 text-[var(--brand-red)] sm:h-12 sm:w-12">
                                    <ShieldCheck size={22} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--brand-red)] sm:text-[10px]">Secure checkout</p>
                                    <h1 className="mt-1 text-2xl font-black leading-tight tracking-tight text-[var(--text-primary)] sm:text-3xl">Sign in or create an account</h1>
                                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">
                                        Your account saves your contact details and gives you one place to track and manage your orders. After signing in, you will return here to review your order and complete payment.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 divide-y divide-[var(--divider)] border-t border-[var(--divider)] sm:mt-8">
                                <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-6">
                                    <div>
                                        <h2 className="text-sm font-bold text-[var(--text-primary)]">New to the platform?</h2>
                                        <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">Create your profile to continue and manage future orders.</p>
                                    </div>
                                    <Link to="/account/signup" state={{ after: location.pathname, afterState: location.state }} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--brand-red)] px-5 text-xs font-bold text-white transition-opacity hover:opacity-90">
                                        Create account <ChevronRight size={16} />
                                    </Link>
                                </div>
                                <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-6">
                                    <div>
                                        <h2 className="text-sm font-bold text-[var(--text-primary)]">Already have an account?</h2>
                                        <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">Sign in to use your saved details and continue to payment.</p>
                                    </div>
                                    <Link to="/account/login" state={{ after: location.pathname, afterState: location.state }} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--divider)] bg-[var(--bg-primary)] px-5 text-xs font-bold text-[var(--text-primary)] transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)]">
                                        Sign in <ChevronRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="checkout-mobile pt-40 pb-40 bg-[var(--bg-primary)] transition-colors duration-700 font-['Sen',sans-serif]">
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

                <CheckoutPolicyNotice policy={checkoutPolicy} orderWindow={orderWindow} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
                    
                    {/* Information Form */}
                    <div className="lg:col-span-7">
                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-20">
                            <section>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--brand-red)] mb-12 border-b border-[var(--divider)] pb-4 w-fit">01 Fulfillment Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Fulfillment Type</label>
                                        <div className={`grid gap-4 ${allowsDelivery ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                            {hasPickupOption && <button type="button" onClick={() => setFulfillmentType('pickup')} className={`py-4 px-6 rounded-[32px] border-2 ${activeFulfillmentType === 'pickup' ? 'border-[var(--brand-red)] bg-[var(--brand-red)]/10' : 'border-[var(--divider)] bg-transparent'} font-black uppercase tracking-[0.15em] text-sm transition-all`}>Pickup</button>}
                                            {allowsDelivery && (
                                                <button type="button" onClick={() => setFulfillmentType('delivery')} className={`py-4 px-6 rounded-[32px] border-2 ${activeFulfillmentType === 'delivery' ? 'border-[var(--brand-red)] bg-[var(--brand-red)]/10' : 'border-[var(--divider)] bg-transparent'} font-black uppercase tracking-[0.15em] text-sm transition-all`}>Delivery</button>
                                            )}
                                        </div>
                                        {!allowsDelivery && !hasPickupOption && (
                                            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                                                No fulfillment options are currently available for this order.
                                            </p>
                                        )}
                                        {activeFulfillmentType === 'pickup' && hasPickupOption && (
                                            <div className="mt-6 space-y-4">
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Choose one pickup option below</label>
                                                <div role="group" aria-label="Pickup arrangement" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {checkoutPolicy.selfPickupEnabled && <button type="button" aria-pressed={pickupType === 'self'} onClick={() => setPickupType('self')} className={pickupType === 'self' ? 'min-h-12 rounded-xl border border-[var(--brand-red)] bg-[var(--brand-red)]/10 px-4 text-xs font-bold text-[var(--brand-red)] transition-colors' : 'min-h-12 rounded-xl border border-[var(--divider)] px-4 text-xs font-bold text-[var(--text-primary)] transition-colors'}>
                                                        I will pick it up
                                                    </button>}
                                                    {checkoutPolicy.dispatchEnabled && <button type="button" aria-pressed={pickupType === 'dispatch'} onClick={() => setPickupType('dispatch')} className={pickupType === 'dispatch' ? 'min-h-12 rounded-xl border border-[var(--brand-red)] bg-[var(--brand-red)]/10 px-4 text-xs font-bold text-[var(--brand-red)] transition-colors' : 'min-h-12 rounded-xl border border-[var(--divider)] px-4 text-xs font-bold text-[var(--text-primary)] transition-colors'}>
                                                        I will send a dispatch rider
                                                    </button>}
                                                </div>
                                                {pickupType === 'dispatch' && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                                        <div>
                                                            <label htmlFor="dispatch-address" className="block text-[10px] font-black text-[var(--text-muted)] mb-3">Where should the rider deliver? <span aria-hidden="true" className="text-[var(--brand-red)]">*</span></label>
                                                            <input id="dispatch-address" required value={dispatchAddress} onChange={e => setDispatchAddress(e.target.value)} autoComplete="street-address" className="w-full bg-transparent border-b-2 border-[var(--divider)] py-3 text-base font-bold transition-all focus:border-[var(--brand-red)] text-[var(--text-primary)] outline-none" placeholder="Buyer's delivery address" />
                                                        </div>
                                                        <div>
                                                            <label htmlFor="dispatch-phone" className="block text-[10px] font-black text-[var(--text-muted)] mb-3">Dispatch rider's phone number <span aria-hidden="true" className="text-[var(--brand-red)]">*</span></label>
                                                            <input id="dispatch-phone" required type="tel" inputMode="tel" autoComplete="tel" value={dispatchPhone} onChange={e => setDispatchPhone(e.target.value)} className="w-full bg-transparent border-b-2 border-[var(--divider)] py-3 text-base font-bold transition-all focus:border-[var(--brand-red)] text-[var(--text-primary)] outline-none" placeholder="Rider's phone number" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {activeFulfillmentType === 'delivery' && (
                                        <>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">State</label>
                                                <div className="w-full bg-transparent border-b-2 border-[var(--divider)] py-4 text-xl font-bold uppercase text-[var(--text-primary)] flex items-center h-14">Lagos</div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Delivery Zone <span aria-hidden="true" className="text-[var(--brand-red)]">*</span></label>
                                                <select required value={zoneName} onChange={e => setZoneName(e.target.value)} disabled={zonesLoading} className="w-full bg-transparent border-b-2 border-[var(--divider)] py-4 text-xl font-bold uppercase transition-all focus:border-[var(--brand-red)] text-[var(--text-primary)] outline-none appearance-none cursor-pointer">
                                                    <option value="">{zonesLoading ? 'Loading zones...' : 'Select your zone'}</option>
                                                    {zones.map(z => (
                                                        <option key={z.name} value={z.name}>
                                                            {z.name} — ₦{z.fee.toLocaleString()}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Street Address <span aria-hidden="true" className="text-[var(--brand-red)]">*</span></label>
                                                <input required type="text" value={buyer.address} onChange={e => setBuyer({...buyer, address: e.target.value})} className="w-full bg-transparent border-b-2 border-[var(--divider)] py-4 text-xl font-bold transition-all focus:border-[var(--brand-red)] text-[var(--text-primary)] outline-none" placeholder="Delivery location" />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </section>

                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-40 space-y-12">
                            <div className="checkout-summary bg-[var(--bg-secondary)] rounded-[60px] p-12 border border-[var(--divider)]">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-12">Your Cart</h2>
                                
                                <div className="checkout-summary-items space-y-8 mb-12 max-h-[400px] overflow-y-auto pr-4 scrollbar-hide">
                                    {checkoutItems.map((item, index) => (
                                        <div key={item.id} className="flex gap-6">
                                            <div className="w-24 h-32 rounded-[24px] overflow-hidden bg-[var(--bg-primary)] border border-[var(--divider)] shrink-0">
                                                <img
                                                    src={cdnCard(item.image)}
                                                    alt={item.name}
                                                    className="w-full h-full object-contain p-2 md:p-3"
                                                    loading={index === 0 ? 'eager' : 'lazy'}
                                                    fetchPriority={index === 0 ? 'high' : 'auto'}
                                                    decoding="async"
                                                />
                                            </div>
                                            <div className="flex flex-col justify-between flex-1 py-1">
                                                <div>
                                                    <h4 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] leading-tight">{item.name}</h4>
                                                    <span className="text-sm font-black text-[var(--brand-red)] mt-1 block">₦{(item.price * item.quantity).toLocaleString()}</span>
                                                    <span className="text-[10px] font-bold text-[var(--text-muted)]">₦{item.price.toLocaleString()} each</span>
                                                    {item.piecesPerPack != null && (
                                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mt-2 block">
                                                            {item.piecesPerPack} pieces in a pack
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Qty controls */}
                                                <div className="flex items-center gap-3 mt-2">
                                                    <div className="flex items-center gap-3 border border-[var(--divider)] rounded-full px-3 py-1.5 w-fit">
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
                                                    {!isSingleItem && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setItemToRemove(item)}
                                                            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-500"
                                                            aria-label={`Remove ${item.name} from checkout`}
                                                            title="Remove item"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
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
                                        <span>{activeFulfillmentType === 'delivery' ? `Delivery ${selectedZone ? `· ${selectedZone.name}` : ''}` : 'Self Pickup'}</span>
                                        <span className={activeFulfillmentType === 'delivery' && selectedZone ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>
                                            {activeFulfillmentType === 'delivery'
                                                ? selectedZone ? `₦${deliveryFee.toLocaleString()}` : 'PICK A ZONE'
                                                : '₦0'
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-8 mt-4 border-t-2 border-[var(--divider)]">
                                        <span className="text-xl font-black uppercase tracking-widest text-[var(--text-primary)]">Total</span>
                                        <span className="text-4xl font-black text-[var(--brand-red)]">₦{totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button 
                                    form="checkout-form"
                                    disabled={loading || !orderWindow.isOpen || !hasAvailableFulfillment}
                                    className="hidden md:flex w-full mt-12 bg-black text-white py-8 rounded-[32px] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[var(--brand-red)] transition-all shadow-2xl items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'PROCESSING...' : (
                                        <>
                                            CONFIRM PURCHASE
                                            <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                        </>
                                    )}
                                </button>
                                <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-40 border-t border-[var(--divider)] bg-[var(--bg-primary)]/95 px-4 py-3 backdrop-blur md:hidden">
                                    <div className="mx-auto flex max-w-7xl items-center gap-3">
                                        <div className="min-w-0 shrink-0">
                                            <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Total</span>
                                            <span className="block text-lg font-black text-[var(--brand-red)]">₦{totalAmount.toLocaleString()}</span>
                                        </div>
                                        <button
                                            form="checkout-form"
                                            disabled={loading || !orderWindow.isOpen || !hasAvailableFulfillment || !customer.fullName || !customer.email || !customer.phone}
                                            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-black px-4 text-xs font-black uppercase tracking-wider text-white disabled:opacity-50"
                                        >
                                            {loading ? 'Processing...' : 'Confirm purchase'}
                                            {!loading && <ChevronRight size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 px-12">
                                <ShieldCheck size={32} className="text-[var(--text-muted)]" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] leading-relaxed">Payments are processed by OPay.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {itemToRemove && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
                    <button
                        type="button"
                        aria-label="Cancel item removal"
                        onClick={() => setItemToRemove(null)}
                        className="absolute inset-0 h-full w-full cursor-default"
                    />
                    <section role="alertdialog" aria-modal="true" aria-labelledby="remove-checkout-item-title" className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--divider)] bg-[var(--bg-primary)] p-5 shadow-2xl sm:p-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/30">
                            <Trash2 size={20} />
                        </div>
                        <h2 id="remove-checkout-item-title" className="mt-4 text-lg font-black text-[var(--text-primary)]">Remove this item?</h2>
                        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                            <span className="font-bold text-[var(--text-primary)]">{itemToRemove.name}</span> will be removed from your cart.
                        </p>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => setItemToRemove(null)} className="min-h-11 rounded-xl border border-[var(--divider)] px-4 text-sm font-bold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]">
                                Keep item
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    removeFromCart(itemToRemove.id)
                                    setItemToRemove(null)
                                    if (cart.length === 1) navigate('/cart')
                                }}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white transition-colors hover:bg-red-700"
                            >
                                <Trash2 size={15} /> Remove item
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    )
}

export default Checkout
