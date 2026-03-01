import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { ShieldCheck, MessageCircle, ArrowLeft, Truck, Info, Instagram, ChevronLeft, ChevronRight, Plus, Minus, ShoppingBag, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useStore } from '../context/StoreContext'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'

const ProductDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [activeImage, setActiveImage] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const { products, addToCart, toggleFavorite, isFavorite } = useStore()

    const product = products.find(p => p.id === id)

    // Slideshow logic
    const productImages = product ? (product.images || [product.image, product.image, product.image]) : []
    
    useEffect(() => {
        if (!product || productImages.length <= 1) return;
        
        const interval = setInterval(() => {
            setActiveImage((prev) => (prev + 1) % productImages.length);
        }, 5000); // 5 seconds per image

        return () => clearInterval(interval);
    }, [product, productImages.length]);

    if (!product) {
        return (
            <div className="pt-40 text-center container" style={{ color: 'var(--text-muted)' }}>
                <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
                <button onClick={() => navigate('/')} className="text-[#F18B24] hover:underline">
                    Return Home
                </button>
            </div>
        )
    }

    const nextImage = () => setActiveImage((prev) => (prev + 1) % productImages.length)
    const prevImage = () => setActiveImage((prev) => (prev - 1 + productImages.length) % productImages.length)

    const liked = product ? isFavorite(product.id) : false

    const handleAddToCart = () => {
        addToCart(product, quantity)
        
        confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.55 },
            colors: ['#F18B24', '#ffffff', '#000000']
        })

        toast.success(`${quantity}x ${product.name} added to cart!`, {
            icon: '🛍️',
            style: {
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid #F18B24',
                fontSize: '14px',
                fontWeight: 'bold',
                borderRadius: '16px',
            },
        })
    }

    const handleFavorite = () => {
        toggleFavorite(product)
        toast(liked ? 'Removed from favourites' : 'Saved to favourites ❤️', {
            icon: liked ? '💔' : '❤️',
            style: {
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid #F18B24',
                fontWeight: 'bold',
                borderRadius: '16px',
                fontSize: '13px',
            },
        })
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-48 pb-20 container"
        >
            <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 mb-8 transition-colors group text-sm font-bold uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Gallery
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Image Gallery */}
                <div className="space-y-4">
                    <motion.div
                        layoutId={`prod-img-${id}`}
                        className="aspect-square glass overflow-hidden rounded-3xl relative group"
                    >
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={activeImage}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                src={productImages[activeImage]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </AnimatePresence>

                        {/* Navigation Arrows */}
                        <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <button 
                                onClick={(e) => { e.preventDefault(); prevImage(); }}
                                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white pointer-events-auto hover:bg-[#F18B24] transition-colors"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button 
                                onClick={(e) => { e.preventDefault(); nextImage(); }}
                                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white pointer-events-auto hover:bg-[#F18B24] transition-colors"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        {/* Pagination Dots */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                            {productImages.map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`h-1 rounded-full transition-all duration-300 ${activeImage === i ? 'w-8 bg-[#F18B24]' : 'w-2 bg-white/40'}`}
                                />
                            ))}
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-3 gap-4">
                        {productImages.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImage(i)}
                                className={`aspect-square glass rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-[#F18B24]' : 'border-transparent'}`}
                            >
                                <img
                                    src={img}
                                    alt=""
                                    className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Product Info */}
                <div className="flex flex-col">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full w-fit mb-6" style={{ background: 'var(--badge-bg)', border: '1px solid var(--brand-orange)' }}>
                        <ShieldCheck size={14} className="text-[#F18B24]" />
                        <span className="text-[10px] font-black text-[#F18B24] uppercase tracking-[0.2em]">Verified Transaction Gateway</span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-[var(--bg-secondary)] border border-[var(--divider)] rounded text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Delivered by Sellout & Relocate</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black mb-4 font-heading tracking-tight" style={{ color: 'var(--text-primary)' }}>{product.name}</h1>

                    <div className="flex items-center gap-4 mb-6">
                        <p className="text-3xl font-extrabold text-[#F18B24]">₦{product.price.toLocaleString()}</p>
                        <div className="h-4 w-[1px]" style={{ background: 'var(--divider)' }} />
                        <p style={{ color: 'var(--text-muted)' }}>{product.location}</p>
                        <button
                            onClick={handleFavorite}
                            className={`ml-auto w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90 shadow-md ${
                                liked
                                    ? 'bg-red-500 scale-110'
                                    : 'bg-[var(--bg-secondary)] hover:bg-red-50 hover:scale-110 border border-[var(--divider)]'
                            }`}
                            title={liked ? 'Remove from favourites' : 'Save to favourites'}
                        >
                            <Heart
                                size={20}
                                className={`transition-all ${ liked ? 'text-white' : 'text-red-500' }`}
                                fill={liked ? 'white' : 'none'}
                            />
                        </button>
                    </div>

                    <p className="mb-8 leading-relaxed max-w-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                        {product.description}
                    </p>

                    {/* Quantity Selector */}
                    <div className="mb-10 space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Quantity</p>
                        <div className="flex items-center gap-6 w-fit bg-[var(--bg-secondary)] p-2 rounded-2xl border" style={{ borderColor: 'var(--divider)' }}>
                            <button 
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--badge-bg)] active:scale-90 transition-all cursor-pointer"
                            >
                                <Minus size={18} style={{ color: 'var(--text-primary)' }} />
                            </button>
                            <span className="text-xl font-black w-8 text-center" style={{ color: 'var(--text-primary)' }}>{quantity}</span>
                            <button 
                                onClick={() => setQuantity(q => q + 1)}
                                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--badge-bg)] active:scale-90 transition-all cursor-pointer"
                            >
                                <Plus size={18} style={{ color: 'var(--text-primary)' }} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6 mb-10">
                        <div className="flex items-start gap-4 p-4 glass">
                            <Truck size={24} style={{ color: 'var(--text-muted)' }} className="mt-1" />
                            <div>
                                <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Delivery Window</h4>
                                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{product.delivery_window || "2-3 Working Days"}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-5 rounded-2xl border bg-[var(--bg-secondary)]" style={{ borderColor: 'var(--divider)' }}>
                            <Info size={24} style={{ color: 'var(--text-muted)' }} className="mt-1" />
                            <div>
                                <h4 className="font-black text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-primary)' }}>Inspection & Trust Policy</h4>
                                <p className="text-xs font-bold leading-relaxed" style={{ color: 'var(--text-muted)' }}>This is a human-assisted transaction. Physical inspection is mandatory or optional based on location before final payment release to seller.</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Banner */}
                    {product.status === 'sold' && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
                            <p className="text-red-500 font-bold text-sm">This item has been sold.</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {product.status === 'sold' ? (
                                <span className="py-4 text-center rounded-xl font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                                    Sold Out
                                </span>
                            ) : (
                                <button
                                    onClick={() => navigate(`/checkout/${product.id}`)}
                                    className="btn-primary py-4 text-center font-black uppercase tracking-widest text-xs cursor-pointer active:scale-95 transition-transform"
                                >
                                    Buy Now
                                </button>
                            )}
                            <button
                                onClick={handleAddToCart}
                                className="flex items-center justify-center gap-2 py-4 rounded-xl transition-all font-black uppercase tracking-widest text-xs border-2 cursor-pointer active:scale-95 hover:bg-[#F18B24] hover:text-white"
                                style={{ 
                                    borderColor: '#F18B24', 
                                    color: '#F18B24',
                                    background: 'transparent'
                                }}
                                disabled={product.status === 'sold'}
                            >
                                <ShoppingBag size={18} />
                                {product.status === 'sold' ? 'Unavailable' : 'Add to Cart'}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 py-4 border border-[#25D366] text-[#25D366] rounded-xl hover:bg-[#25D366] hover:text-white active:scale-95 transition-all cursor-pointer font-bold text-xs uppercase tracking-widest">
                                <MessageCircle size={18} />
                                WhatsApp
                            </button>
                            <a href="https://www.instagram.com/selloutandrelocate.ng?igsh=djByMTlvb21sMmVn" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-4 border border-[#E4405F] text-[#E4405F] rounded-xl hover:bg-[#E4405F] hover:text-white active:scale-95 transition-all cursor-pointer font-bold text-xs uppercase tracking-widest">
                                <Instagram size={18} />
                                Instagram
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default ProductDetails
