import { motion } from 'framer-motion'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Plus, Minus, ShoppingBag, MessageCircle, Instagram, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useStore } from '../context/StoreContext'
import toast from 'react-hot-toast'
import Preloader from '../components/Preloader'

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

    if (loading) return <Preloader />

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
        toast.success(`ADDED TO BAG`, {
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
        <div className="pt-40 pb-40 bg-[var(--bg-primary)] transition-colors duration-700 font-['Sen',sans-serif]">
            <div className="container px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
                    
                    {/* Editorial Gallery */}
                    <div className="space-y-8">
                        <div className="aspect-[3/4] rounded-[60px] overflow-hidden bg-[var(--bg-secondary)] border border-[var(--divider)] relative">
                            <motion.img 
                                key={activeImage}
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1 }}
                                src={productImages[activeImage]} 
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
                    <div className="lg:sticky lg:top-40">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--brand-red)] mb-4 block">{product.category}</span>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-[var(--text-primary)] mb-8">{product.name}</h1>
                        
                        <div className="flex items-baseline gap-4 mb-12">
                            <span className="text-4xl font-black text-[var(--text-primary)]">₦{product.price.toLocaleString()}</span>
                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Retail Price</span>
                        </div>

                        <div className="space-y-12 mb-16">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-4">Description</h3>
                                <p className="text-lg text-[var(--text-primary)] font-medium leading-relaxed max-w-lg">{product.description || "The original Nigerian snack since 1962. Tasty, nourishing, and trusted by millions."}</p>
                            </div>

                            <div className="flex items-center gap-12">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-4">Quantity</h3>
                                    <div className="flex items-center gap-6 border-b-2 border-[var(--divider)] pb-2">
                                        <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="text-2xl font-black">-</button>
                                        <span className="text-2xl font-black w-8 text-center">{quantity}</span>
                                        <button onClick={() => setQuantity(q => q+1)} className="text-2xl font-black">+</button>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-4">Delivery</h3>
                                    <p className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">24-48 HOURS TRACKING</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <button 
                                onClick={handleAddToCart}
                                className="w-full bg-black text-white py-8 rounded-[32px] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[var(--brand-red)] transition-all shadow-2xl"
                            >
                                Add to Bag
                            </button>
                            
                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <a href="https://wa.me/+2349098050402" target="_blank" className="flex items-center justify-center gap-3 py-6 border border-[var(--divider)] rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-secondary)] transition-all">
                                    <MessageCircle size={18} />
                                    WhatsApp
                                </a>
                                <a href="https://instagram.com" target="_blank" className="flex items-center justify-center gap-3 py-6 border border-[var(--divider)] rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-secondary)] transition-all">
                                    <Instagram size={18} />
                                    Instagram
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails
