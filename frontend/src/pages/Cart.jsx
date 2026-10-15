import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, ChevronRight } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { cdnCard } from '../lib/img'

const Cart = () => {
    const navigate = useNavigate()
    const { cart, cartTotal, updateCartQuantity, removeFromCart, clearCart } = useStore()
    const [confirmClear, setConfirmClear] = useState(false)

    if (cart.length === 0) {
        return (
            <div className="pt-28 pb-24 md:pt-40 md:pb-40 min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center font-['Sen',sans-serif]">
                <ShoppingBag size={64} className="text-[var(--text-muted)] mb-8" strokeWidth={1} />
                <h2 className="text-4xl font-black uppercase tracking-tighter text-[var(--text-primary)] mb-4">Your cart is empty</h2>
                <p className="text-[var(--text-muted)] text-sm font-bold mb-12">Add some products first</p>
                <Link
                    to="/products"
                    className="bg-black text-white px-12 py-6 rounded-[24px] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[var(--brand-red)] transition-all"
                >
                    Continue Shopping
                </Link>
            </div>
        )
    }

    return (
        <div className="pt-24 pb-[10rem] md:pt-40 md:pb-40 bg-[var(--bg-primary)] transition-colors duration-700 font-['Sen',sans-serif]">
            <div className="container px-6 max-w-6xl mx-auto">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-8 mb-8 md:mb-24 border-b border-[var(--divider)] pb-6 md:pb-12">
                    <div>
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-[var(--brand-red)] mb-2 md:mb-4 block"
                        >
                            {cart.length} {cart.length === 1 ? 'item' : 'items'}
                        </motion.span>
                        <h1 className="text-4xl sm:text-5xl md:text-8xl font-black uppercase tracking-tighter text-[var(--text-primary)] leading-none">Your Cart</h1>
                    </div>
                    <Link
                        to="/products"
                        className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.3em] text-[var(--text-muted)] hover:text-[var(--brand-red)] transition-all flex items-center gap-2 mb-1 md:mb-2"
                    >
                        <ArrowLeft size={16} /> Continue Shopping
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

                    {/* Cart Items */}
                    <div className="lg:col-span-7 space-y-3 md:space-y-6">
                        <AnimatePresence initial={false}>
                            {cart.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                                    className="flex gap-3 sm:gap-5 md:gap-6 p-3 sm:p-4 md:p-6 rounded-2xl md:rounded-[32px] border border-[var(--divider)] bg-[var(--bg-secondary)]"
                                >
                                    {/* Image */}
                                    <div className="w-20 h-24 sm:w-24 sm:h-28 md:w-28 md:h-36 rounded-xl md:rounded-[20px] overflow-hidden bg-[var(--bg-primary)] border border-[var(--divider)] shrink-0">
                                        <img
                                            src={cdnCard(item.image)}
                                            alt={item.name}
                                            className="w-full h-full object-contain p-1.5 md:p-3"
                                            loading={index === 0 ? 'eager' : 'lazy'}
                                            fetchPriority={index === 0 ? 'high' : 'auto'}
                                            decoding="async"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5 md:py-1">
                                        <div>
                                            {item.category && (
                                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--brand-red)] block mb-1">
                                                    {item.category}
                                                </span>
                                            )}
                                            <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-[var(--text-primary)] leading-tight line-clamp-2">{item.name}</h3>
                                            <div className="mt-1.5 md:mt-2">
                                                <p className="text-base md:text-lg font-black text-[var(--text-primary)]">₦{(item.price * item.quantity).toLocaleString()}</p>
                                                <p className="text-[10px] text-[var(--text-muted)] font-bold">₦{item.price.toLocaleString()} each</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-2 md:mt-4 flex-wrap gap-2">
                                            {/* Qty Controls */}
                                            <div className="flex items-center gap-2 md:gap-3 border border-[var(--divider)] rounded-full px-3 md:px-4 py-2">
                                                <button
                                                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                                    className="text-[var(--text-primary)] hover:text-[var(--brand-red)] transition-colors"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus size={13} strokeWidth={3} />
                                                </button>
                                                <span className="text-sm font-black w-6 text-center text-[var(--text-primary)]">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                                    disabled={item.quantity >= (item.stockCount ?? 999)}
                                                    className="text-[var(--text-primary)] hover:text-[var(--brand-red)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus size={13} strokeWidth={3} />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-1.5 md:gap-3">
                                                {/* Buy this item only */}
                                                <button
                                                    onClick={() => navigate(`/checkout/${item.id}`, { state: { quantity: item.quantity } })}
                                                    className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-[var(--brand-red)] border border-[var(--brand-red)] px-2.5 md:px-5 py-2 rounded-full hover:bg-[var(--brand-red)] hover:text-white transition-all whitespace-nowrap"
                                                >
                                                    Buy Now
                                                </button>
                                                {/* Remove */}
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                                                    aria-label={`Remove ${item.name} from cart`}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-40 bg-[var(--bg-secondary)] rounded-2xl md:rounded-[48px] p-5 md:p-10 border border-[var(--divider)]">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-5 md:mb-10">Order Summary</h2>

                            <div className="space-y-3 md:space-y-4 mb-5 md:mb-8">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                    <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                                    <span className="text-[var(--text-primary)]">₦{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                    <span>Delivery</span>
                                    <span>Calculated at checkout</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 md:pt-6 border-t-2 border-[var(--divider)]">
                                    <span className="text-sm md:text-base font-black uppercase tracking-wider md:tracking-widest text-[var(--text-primary)]">Estimated Total</span>
                                    <span className="text-2xl md:text-3xl font-black text-[var(--brand-red)]">₦{cartTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="hidden md:flex w-full bg-black text-white py-7 rounded-[24px] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[var(--brand-red)] transition-all shadow-2xl items-center justify-center gap-4 group"
                            >
                                Checkout All
                                <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                            </button>

                            <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-40 border-t border-[var(--divider)] bg-[var(--bg-primary)]/95 px-4 py-3 backdrop-blur md:hidden">
                                <div className="mx-auto flex max-w-6xl items-center gap-3">
                                    <div className="min-w-0 shrink-0">
                                        <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Total</span>
                                        <span className="block text-lg font-black text-[var(--brand-red)]">₦{cartTotal.toLocaleString()}</span>
                                    </div>
                                    <button
                                        onClick={() => navigate('/checkout')}
                                        className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-black px-4 text-xs font-black uppercase tracking-wider text-white"
                                    >
                                        Checkout <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>

                            {confirmClear ? (
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => { clearCart(); setConfirmClear(false) }}
                                        className="min-h-11 rounded-xl bg-red-600 px-3 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-red-700"
                                    >
                                        Confirm clear
                                    </button>
                                    <button
                                        onClick={() => setConfirmClear(false)}
                                        className="min-h-11 rounded-xl border border-[var(--divider)] px-3 text-xs font-bold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-primary)]"
                                    >
                                        Keep items
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setConfirmClear(true)}
                                    className="mt-4 min-h-11 w-full rounded-xl bg-red-600 px-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-red-700"
                                >
                                    Clear cart
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart
