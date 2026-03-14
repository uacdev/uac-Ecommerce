import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ArrowLeft, Trash2, ShoppingBag } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import EmptyState from '../components/EmptyState'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'

const Favorites = () => {
    const { favorites, toggleFavorite, addToCart } = useStore()
    const navigate = useNavigate()

    const handleUnlike = (product) => {
        toggleFavorite(product)
        toast('Removed from favourites', {
            icon: '💔',
            style: {
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--divider)',
                fontWeight: 'bold',
                borderRadius: '16px',
                fontSize: '13px',
            },
        })
    }

    const handleAddToCart = (product) => {
        addToCart(product, 1)
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#F18B24', '#ffffff'] })
        toast.success(`${product.name} added to cart!`, {
            icon: '🛍️',
            style: {
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid #F18B24',
                fontSize: '13px',
                fontWeight: 'bold',
                borderRadius: '16px',
            },
        })
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-48 pb-24 container max-w-7xl"
        >
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 mb-10 text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#F18B24] transition-colors cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
            >
                <ArrowLeft size={16} />
                Go Back
            </button>

            {/* Header */}
            <div className="flex items-end justify-between mb-16 flex-wrap gap-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F18B24] mb-3">Your Collection</p>
                    <h1 className="text-5xl md:text-7xl font-black font-heading tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        Favourites
                    </h1>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 rounded-full border" style={{ borderColor: 'var(--divider)', background: 'var(--bg-secondary)' }}>
                    <Heart size={16} className="text-red-500" fill="currentColor" />
                    <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                        {favorites.length} {favorites.length === 1 ? 'item' : 'items'}
                    </span>
                </div>
            </div>

            {/* Empty State */}
            {favorites.length === 0 && (
                <EmptyState
                    icon={Heart}
                    title="No saved items"
                    description="Tap the heart icon on any product to save it here for later. Build your dream collection today."
                    actionLabel="Discover Products"
                    onAction={() => navigate('/shop')}
                />
            )}

            {/* Product Grid */}
            <AnimatePresence mode="popLayout">
                <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {favorites.map((product, i) => (
                        <motion.div
                            key={product.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                            transition={{ delay: i * 0.05 }}
                            className="group flex flex-col"
                        >
                            {/* Image */}
                            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4" style={{ background: 'var(--bg-tertiary)' }}>
                                <Link to={`/product/${product.id}`}>
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                                    />
                                </Link>

                                {/* Unlike button */}
                                <button
                                    onClick={() => handleUnlike(product)}
                                    className="absolute top-3 right-3 w-9 h-9 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 active:scale-90 transition-all cursor-pointer"
                                    title="Remove from favourites"
                                >
                                    <Heart size={16} className="text-white" fill="white" />
                                </button>

                                {/* Add to cart overlay */}
                                <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        disabled={product.status === 'sold'}
                                        className="w-full py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#F18B24] hover:text-white active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                                    >
                                        <ShoppingBag size={14} />
                                        {product.status === 'sold' ? 'Sold Out' : 'Add to Cart'}
                                    </button>
                                </div>

                                {product.status === 'sold' && (
                                    <div className="absolute top-3 left-3">
                                        <span className="bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">Sold</span>
                                    </div>
                                )}
                            </div>

                            {/* Info Row */}
                            <div className="flex items-start justify-between gap-2 px-1">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-black truncate" style={{ color: 'var(--text-primary)' }}>{product.name}</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-muted)' }}>{product.category}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <p className="text-sm font-black text-[#F18B24] shrink-0">₦{(product.price / 1000).toFixed(0)}k</p>
                                    <button
                                        onClick={() => handleUnlike(product)}
                                        className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 cursor-pointer transition-colors flex items-center gap-1"
                                    >
                                        <Trash2 size={10} /> Unlike
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    )
}

export default Favorites
