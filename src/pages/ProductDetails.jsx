import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { ShieldCheck, MessageCircle, ArrowLeft, Truck, Info, Instagram, ChevronLeft, ChevronRight, Plus, Minus, ShoppingBag, Heart, MapPin, Clock, Package, CheckCircle2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useStore } from '../context/StoreContext'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'
import Preloader from '../components/Preloader'

const ProductDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [activeImage, setActiveImage] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const { products, loading, addToCart, toggleFavorite, isFavorite } = useStore()

    const product = products.find(p => p.id === id)
    const productImages = product ? (product.images?.length > 0 ? product.images : [product.image]) : []

    // SEO and Metadata
    useEffect(() => {
        if (product) {
            document.title = `${product.name} | Sellout`
            
            // Dynamic Meta Tags (Basic)
            const metaDescription = document.querySelector('meta[name="description"]')
            if (metaDescription) {
                metaDescription.setAttribute('content', product.description.substring(0, 160))
            }

            // OG Tags for Social Sharing
            const ogTitle = document.querySelector('meta[property="og:title"]')
            if (ogTitle) ogTitle.setAttribute('content', product.name)
            
            const ogImage = document.querySelector('meta[property="og:image"]')
            if (ogImage) ogImage.setAttribute('content', productImages[0])
        }
        
        return () => {
            document.title = 'Sellout | Premium Gateway'
        }
    }, [product, productImages]);

    useEffect(() => {
        if (!product || productImages.length <= 1) return;
        
        const interval = setInterval(() => {
            setActiveImage((prev) => (prev + 1) % productImages.length);
        }, 5000); // 5 seconds per image

        return () => clearInterval(interval);
    }, [product, productImages.length]);

    if (loading) return <Preloader />

    if (!product) {
        return (
            <div className="pt-40 text-center container" style={{ color: 'var(--text-primary)' }}>
                <h2 className="text-2xl font-black mb-4 uppercase tracking-widest">Listing Not Found</h2>
                <p className="text-[var(--text-muted)] mb-8 font-bold">This product may have been removed or is no longer available.</p>
                <button 
                    onClick={() => navigate('/shop')} 
                    className="px-8 py-4 rounded-xl bg-[#F18B24] text-white font-black uppercase tracking-widest text-xs shadow-lg hover:scale-105 transition-all"
                >
                    Back to Shop
                </button>
            </div>
        )
    }

    const isOutOfStock = product.status === 'out_of_stock'
    const isSold = product.status === 'sold'

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                {/* Left: Image Gallery */}
                <div className="space-y-6">
                    <motion.div
                        layoutId={`prod-img-${id}`}
                        className="aspect-square glass overflow-hidden rounded-[40px] relative group shadow-2xl"
                        style={{ border: '1px solid var(--divider)' }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={activeImage}
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                src={productImages[activeImage]}
                                alt={product.name}
                                className={`w-full h-full object-cover ${(isOutOfStock || isSold) ? 'grayscale' : ''}`}
                            />
                        </AnimatePresence>

                        {/* Status Badge Over Image */}
                        {(isOutOfStock || isSold) && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
                                <div className="bg-red-500/90 backdrop-blur-md px-8 py-4 rounded-2xl border-white/20 shadow-2xl transform -rotate-12 scale-110">
                                    <p className="text-white font-black uppercase tracking-[0.2em] text-sm">
                                        {isOutOfStock ? 'Out of Stock' : 'Sold Out'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Premium Gradient Overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                        {/* Navigation Arrows */}
                        <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <button 
                                onClick={(e) => { e.preventDefault(); prevImage(); }}
                                className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white pointer-events-auto hover:bg-[#F18B24] transition-all transform hover:scale-110 active:scale-90"
                            >
                                <ChevronLeft size={28} />
                            </button>
                            <button 
                                onClick={(e) => { e.preventDefault(); nextImage(); }}
                                className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white pointer-events-auto hover:bg-[#F18B24] transition-all transform hover:scale-110 active:scale-90"
                            >
                                <ChevronRight size={28} />
                            </button>
                        </div>

                        {/* Pagination Dots */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                            {productImages.map((_, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setActiveImage(i)}
                                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${activeImage === i ? 'w-10 bg-[#F18B24]' : 'w-3 bg-white/40 hover:bg-white/60'}`}
                                />
                            ))}
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-4 gap-4">
                        {productImages.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImage(i)}
                                className={`aspect-square glass rounded-2xl overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 ${activeImage === i ? 'border-[#F18B24] shadow-lg shadow-orange-500/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                                <img
                                    src={img}
                                    alt=""
                                    className="w-full h-full object-cover"
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
                        <span className="px-3 py-1 bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-lg text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Verified Secure Transaction</span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 font-heading tracking-tighter" style={{ color: 'var(--text-primary)' }}>{product.name}</h1>

                    <div className="flex items-center gap-6 mb-8 flex-wrap">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Selling Price</p>
                            <p className="text-4xl font-black text-[#F18B24]">₦{product.price.toLocaleString()}</p>
                        </div>
                        <div className="h-10 w-[1px] hidden sm:block" style={{ background: 'var(--divider)' }} />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Pick up from</p>
                            <p className="text-sm font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><MapPin size={16} className="text-[#F18B24]" /> {product.location}</p>
                        </div>
                        {product.delivery_timeframe && (
                            <>
                                <div className="h-10 w-[1px] hidden sm:block" style={{ background: 'var(--divider)' }} />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Delivery Time</p>
                                    <p className="text-sm font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Clock size={16} className="text-[#F18B24]" /> {product.delivery_timeframe}</p>
                                </div>
                            </>
                        )}
                        <button
                            onClick={handleFavorite}
                            className={`ml-auto w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-90 shadow-xl ${
                                liked
                                    ? 'bg-red-500 scale-105'
                                    : 'bg-[var(--bg-secondary)] hover:bg-red-50 border border-[var(--divider)]'
                            }`}
                        >
                            <Heart
                                size={24}
                                className={`transition-all ${ liked ? 'text-white' : 'text-red-500' }`}
                                fill={liked ? 'white' : 'none'}
                            />
                        </button>
                    </div>

                    <div className="p-8 rounded-3xl border mb-10 space-y-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--divider)' }}>
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Description</p>
                        <p className="leading-relaxed font-bold text-sm lg:text-base" style={{ color: 'var(--text-primary)' }}>
                            {product.description}
                        </p>
                    </div>

                    {/* Quantity Selector */}
                    {(!isOutOfStock && !isSold) && (
                        <div className="mb-12 space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Inventory Count</p>
                            <div className="flex items-center gap-8 w-fit bg-[var(--bg-primary)] p-2 rounded-2xl border-2" style={{ borderColor: 'var(--divider)' }}>
                                <button 
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-[var(--bg-secondary)] active:scale-95 transition-all cursor-pointer text-[var(--text-primary)]"
                                >
                                    <Minus size={20} />
                                </button>
                                <span className="text-2xl font-black w-8 text-center" style={{ color: 'var(--text-primary)' }}>{quantity}</span>
                                <button 
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-[var(--bg-secondary)] active:scale-95 transition-all cursor-pointer text-[var(--text-primary)]"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-6 mb-12 py-6 border-y border-[var(--divider)]">
                        <div className="flex items-center gap-4">
                            <Truck size={20} className="text-[#F18B24]" />
                            <div className="flex items-center gap-3">
                                <span className="font-black text-[10px] uppercase tracking-widest text-[#F18B24]">Guided Delivery:</span>
                                <span className="text-xs font-bold text-[var(--text-primary)]">{product.delivery_timeframe || "2-3 Working Days"}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Info size={20} className="text-[#F18B24]" />
                            <div className="flex items-center gap-3">
                                <span className="font-black text-[10px] uppercase tracking-widest text-[#F18B24]">Gatekeep Policy:</span>
                                <span className="text-xs font-bold text-[var(--text-muted)]">Physical inspection mandatory before final escrow release.</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Banner */}
                    {(product.status === 'sold' || product.status === 'out_of_stock') && (
                        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 mb-8 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            <p className="text-red-500 font-black text-xs uppercase tracking-widest">
                                {product.status === 'out_of_stock' ? 'Currently Out of Stock' : 'Listing Sold Out'}
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => !isSold && !isOutOfStock && navigate(`/checkout/${product.id}`)}
                                disabled={isSold || isOutOfStock}
                                className={`py-5 text-center font-black uppercase tracking-widest text-xs transition-all shadow-xl rounded-2xl ${
                                    (isSold || isOutOfStock)
                                        ? 'bg-red-500/10 text-red-500 border border-red-500/20 cursor-not-allowed opacity-50'
                                        : 'btn-primary cursor-pointer hover:scale-[1.02] active:scale-95 shadow-orange-500/20'
                                }`}
                            >
                                {isOutOfStock ? 'Out of Stock' : isSold ? 'Sold Out' : 'Instant Buy'}
                            </button>
                            <button
                                onClick={handleAddToCart}
                                className={`flex items-center justify-center gap-3 py-5 rounded-2xl transition-all font-black uppercase tracking-widest text-xs border-2 ${(isSold || isOutOfStock) ? 'opacity-30 cursor-not-allowed pointer-events-none' : 'cursor-pointer active:scale-95 hover:bg-[#F18B24] hover:text-white'}`}
                                style={{ 
                                    borderColor: '#F18B24', 
                                    color: '#F18B24',
                                    background: 'transparent'
                                }}
                                disabled={isSold || isOutOfStock}
                            >
                                <ShoppingBag size={20} />
                                Add to Cart
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Human Confirmation Required</p>
                            <div className="grid grid-cols-2 gap-4">
                                <a href="https://wa.me/+2349098050402" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 py-5 border-2 border-[#25D366] text-[#25D366] rounded-2xl hover:bg-[#25D366] hover:text-white active:scale-95 transition-all cursor-pointer font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-green-500/10">
                                    <MessageCircle size={20} />
                                    WhatsApp Seller
                                </a>
                                <a href="https://www.instagram.com/selloutandrelocate.ng?igsh=djByMTlvb21sMmVn" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 py-5 border-2 border-[#E4405F] text-[#E4405F] rounded-2xl hover:bg-[#E4405F] hover:text-white active:scale-95 transition-all cursor-pointer font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-pink-500/10">
                                    <Instagram size={20} />
                                    Instagram
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default ProductDetails
