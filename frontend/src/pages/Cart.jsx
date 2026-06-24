import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, ChevronRight } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { cdnHero } from '../lib/img'

const Cart = () => {
    const navigate = useNavigate()
    const { cart, cartTotal, updateCartQuantity, removeFromCart, clearCart } = useStore()

    if (cart.length === 0) {
        return (
            <div className="pt-40 pb-40 min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center font-['Sen',sans-serif]">
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
        <div className="pt-40 pb-40 bg-[var(--bg-primary)] transition-colors duration-700 font-['Sen',sans-serif]">
            <div className="container px-6 max-w-6xl mx-auto">

                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-24 border-b border-[var(--divider)] pb-12">
                    <div>
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--brand-red)] mb-4 block"
                        >
                            {cart.length} {cart.length === 1 ? 'item' : 'items'}
                        </motion.span>
                        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-[var(--text-primary)] leading-none">Your Cart</h1>
                    </div>
                    <Link
                        to="/products"
                        className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] hover:text-[var(--brand-red)] transition-all flex items-center gap-2 mb-2"
                    >
                        <ArrowLeft size={16} /> Continue Shopping
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    {/* Cart Items */}
                    <div className="lg:col-span-7 space-y-6">
                        <AnimatePresence initial={false}>
                            {cart.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                                    className="flex gap-6 p-6 rounded-[32px] border border-[var(--divider)] bg-[var(--bg-secondary)]"
                                >
                                    {/* Image */}
                                    <div className="w-28 h-36 rounded-[20px] overflow-hidden bg-[var(--bg-primary)] border border-[var(--divider)] shrink-0">
                                        <img
                                            src={cdnHero(item.image)}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            {item.category && (
                                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--brand-red)] block mb-1">
                                                    {item.category}
                                                </span>
                                            )}
                                            <h3 className="text-sm font-black uppercase tracking-tight text-[var(--text-primary)] leading-tight">{item.name}</h3>
                                            <div className="mt-2">
                                                <p className="text-lg font-black text-[var(--text-primary)]">₦{(item.price * item.quantity).toLocaleString()}</p>
                                                <p className="text-[10px] text-[var(--text-muted)] font-bold">₦{item.price.toLocaleString()} each</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                                            {/* Qty Controls */}
                                            <div className="flex items-center gap-3 border border-[var(--divider)] rounded-full px-4 py-2.5">
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

                                            <div className="flex items-center gap-3">
                                                {/* Buy this item only */}
                                                <button
                                                    onClick={() => navigate(`/checkout/${item.id}`, { state: { quantity: item.quantity } })}
                                                    className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--brand-red)] border border-[var(--brand-red)] px-5 py-2.5 rounded-full hover:bg-[var(--brand-red)] hover:text-white transition-all whitespace-nowrap"
                                                >
                                                    Buy Now
                                                </button>
                                                {/* Remove */}
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                                                    aria-label="Remove item"
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
                        <div className="lg:sticky lg:top-40 bg-[var(--bg-secondary)] rounded-[48px] p-10 border border-[var(--divider)]">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-10">Order Summary</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                    <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                                    <span className="text-[var(--text-primary)]">₦{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                    <span>Delivery</span>
                                    <span>Calculated at checkout</span>
                                </div>
                                <div className="flex justify-between items-center pt-6 border-t-2 border-[var(--divider)]">
                                    <span className="text-base font-black uppercase tracking-widest text-[var(--text-primary)]">Estimated Total</span>
                                    <span className="text-3xl font-black text-[var(--brand-red)]">₦{cartTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-black text-white py-7 rounded-[24px] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[var(--brand-red)] transition-all shadow-2xl flex items-center justify-center gap-4 group"
                            >
                                Checkout All
                                <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                            </button>

                            <button
                                onClick={clearCart}
                                className="w-full mt-4 py-4 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-red-500 transition-colors"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart
