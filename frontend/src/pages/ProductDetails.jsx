import { motion } from 'framer-motion'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Plus, Minus, ShoppingBag, MessageCircle, Instagram, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useStore } from '../context/StoreContext'
import { cdnHero } from '../lib/img'
import toast from 'react-hot-toast'
import Preloader from '../components/Preloader'
import NotifyWhenInStock from '../components/NotifyWhenInStock'

const ProductDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [activeImage, setActiveImage] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const { products, loading, addToCart } = useStore()

    const product = products.find(p => p.id === id)
    const productImages = product ? (product.images?.length > 0 ? product.images : [product.image]) : []

    useEffect(() => {
        if (product) document.title = `${product.name} | UAC Foods`
    }, [product])

    // if (loading) return <Preloader />

    if (!product) {
        return (
            <div className="pt-40 text-center container min-h-screen">
                <h2 className="text-2xl font-black uppercase tracking-widest text-[var(--text-primary)]">Product Not Found</h2>
                <Link to="/shop" className="mt-8 inline-block text-[10px] font-black uppercase tracking-[0.3em] text-[var(--brand-red)] border-b border-[var(--brand-red)] pb-1">Back to Shop</Link>
            </div>
        )
    }

    const handleAddToCart = () => {
        addToCart(product, quantity)
        toast.success(`ADDED TO CART`, {
            style: {
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--divider)',
                fontSize: '10px',
                fontWeight: '900',
                letterSpacing: '0.3em',
                borderRadius: '0px',
                padding: '24px 40px'
            }
        })
    }

    return (
        <div className="pt-32 pb-32 bg-[var(--bg-primary)] transition-colors duration-700 font-['Sen',sans-serif]">
            <div className="container px-4 md:px-6">
                <Link 
                    to="/products" 
                    className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] hover:text-[var(--brand-red)] transition-all mb-6 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
                    Back to shop
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-20 items-start">
                    
                    {/* Editorial Gallery */}
                    <div className="space-y-8 max-w-md mx-auto lg:mx-0 w-full">
                        <div className="aspect-[3/4] rounded-[32px] md:rounded-[40px] overflow-hidden bg-[var(--bg-secondary)] border border-[var(--divider)] relative">
                            <motion.img
                                key={activeImage}
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1 }}
                                src={cdnHero(productImages[activeImage])}
                                alt={product.name}
                                className="w-full h-full object-cover grayscale-0"
                            />
                            
                            {productImages.length > 1 && (
                                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
                                    {productImages.map((_, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => setActiveImage(i)}
                                            className={`w-2 h-2 rounded-full transition-all ${activeImage === i ? 'bg-[var(--brand-red)] w-8' : 'bg-black/20'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Specs */}
                    <div className="lg:sticky lg:top-36 w-full">
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] text-[var(--brand-red)] mb-3 block">{product.category}</span>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight text-[var(--text-primary)] mb-6">{product.name}</h1>
                        
                        <div className="flex items-baseline gap-3 mb-4">
                            <span className="text-2xl md:text-3xl font-black text-[var(--text-primary)]">₦{product.price.toLocaleString()}</span>
                            <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Retail Price</span>
                        </div>

                        {/* Stock indicator */}
                        {(() => {
                            const stock = Number(product.stockCount ?? 0)
                            const out = product.status === 'out_of_stock' || stock === 0
                            const low = !out && stock <= 5
                            return (
                                <div className="mb-8 flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border ${
                                        out ? 'bg-red-50 text-[var(--brand-red)] border-red-200'
                                            : low ? 'bg-amber-50 text-amber-700 border-amber-200'
                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${out ? 'bg-[var(--brand-red)]' : low ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                        {out ? 'Out of stock' : low ? `Only ${stock} left` : `${stock} in stock`}
                                    </span>
                                </div>
                            )
                        })()}

                        <div className="space-y-8 mb-10">
                            {product.description ? (
                                <div>
                                    <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-3">Description</h3>
                                    <p className="text-sm md:text-base text-[var(--text-primary)] font-semibold leading-relaxed max-w-lg">{product.description}</p>
                                </div>
                            ) : null}

                            <div className="flex items-start gap-12 pt-6 border-t border-[var(--divider)]">
                                <div className="w-28">
                                    <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-4">Quantity</h3>
                                    <div className="flex items-center justify-between border-b-2 border-[var(--divider)] pb-1.5 group focus-within:border-[var(--brand-red)] transition-colors">
                                        <button onClick={() => setQuantity(q => Math.max(1, q-1))} disabled={(product.stockCount ?? 0) === 0} className="text-lg font-bold hover:text-[var(--brand-red)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">-</button>
                                        <input
                                            type="number"
                                            min="1"
                                            max={Math.max(1, product.stockCount ?? 1)}
                                            value={quantity}
                                            onChange={(e) => {
                                                const n = parseInt(e.target.value) || 1
                                                const stock = Math.max(1, product.stockCount ?? 1)
                                                setQuantity(Math.max(1, Math.min(stock, n)))
                                            }}
                                            disabled={(product.stockCount ?? 0) === 0}
                                            className="w-10 text-center bg-transparent text-lg font-black outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-30"
                                        />
                                        <button
                                            onClick={() => setQuantity(q => Math.min(product.stockCount ?? q, q + 1))}
                                            disabled={(product.stockCount ?? 0) === 0 || quantity >= (product.stockCount ?? 0)}
                                            className="text-lg font-bold hover:text-[var(--brand-red)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        >+</button>
                                    </div>
                                    {quantity >= (product.stockCount ?? 0) && (product.stockCount ?? 0) > 0 && (
                                        <p className="text-[9px] font-bold text-[var(--brand-red)] mt-1.5">Max stock reached</p>
                                    )}
                                </div>
                                
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {product.status === 'out_of_stock' ? (
                                <NotifyWhenInStock productId={product.id || product._id} productName={product.name} />
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    className="w-full bg-black text-white py-5 md:py-6 rounded-2xl md:rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[var(--brand-red)] transition-all shadow-2xl"
                                >
                                    Add to Cart
                                </button>
                            )}
                            
                            <div className="grid grid-cols-1 gap-4 mt-4">
                                {(() => {
                                    const { whatsappNumber } = useStore() || {}
                                    const digits = String(whatsappNumber || '').replace(/\D/g, '')
                                    const href = digits
                                        ? (digits.startsWith('0') ? `https://wa.me/234${digits.replace(/^0+/, '')}` : (digits.startsWith('234') ? `https://wa.me/${digits}` : `https://wa.me/${digits}`))
                                        : 'https://wa.me/2349098050402'
                                    return (
                                        <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-4 border border-[var(--divider)] rounded-xl md:rounded-[18px] text-[11px] font-bold uppercase tracking-widest hover:bg-[var(--bg-secondary)] transition-all">
                                            <MessageCircle size={16} />
                                            WhatsApp
                                        </a>
                                    )
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails
