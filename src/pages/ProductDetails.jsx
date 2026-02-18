import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { ShieldCheck, MessageCircle, ArrowLeft, Truck, Info, Instagram } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../context/StoreContext'

const ProductDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [activeImage, setActiveImage] = useState(0)
    const { products, markProductReserved } = useStore()

    const product = products.find(p => p.id === id)

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

    const handleReserve = () => {
        markProductReserved(product.id)
        alert("Item reserved! Please contact us on WhatsApp to finalize.")
    }

    const productImages = product.images || [product.image, product.image, product.image]

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-32 pb-20 container"
        >
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 mb-8 transition-colors group"
                style={{ color: 'var(--text-muted)' }}
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Gallery
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Image Gallery */}
                <div className="space-y-4">
                    <motion.div
                        layoutId={`prod-img-${id}`}
                        className="aspect-square glass overflow-hidden rounded-3xl relative"
                    >
                        <motion.img
                            key={activeImage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                            src={productImages[activeImage]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </motion.div>

                    <div className="grid grid-cols-3 gap-4">
                        {[0, 1, 2].map((i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImage(i)}
                                className={`aspect-square glass rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-[#F18B24]' : 'border-transparent'}`}
                            >
                                <img
                                    src={productImages[i]}
                                    alt=""
                                    className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Product Info */}
                <div className="flex flex-col">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full w-fit mb-4" style={{ background: 'var(--badge-bg)', border: '1px solid rgba(241, 139, 36, 0.2)' }}>
                        <ShieldCheck size={14} className="text-[#F18B24]" />
                        <span className="text-[10px] font-bold text-[#F18B24] uppercase tracking-wider">Delivered by Sellout & Relocate</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading" style={{ color: 'var(--text-primary)' }}>{product.name}</h1>

                    <div className="flex items-center gap-4 mb-6">
                        <p className="text-3xl font-extrabold text-[#F18B24]">₦{product.price.toLocaleString()}</p>
                        <div className="h-4 w-[1px]" style={{ background: 'var(--divider)' }} />
                        <p style={{ color: 'var(--text-muted)' }}>{product.location}</p>
                    </div>

                    <p className="mb-8 leading-relaxed max-w-lg" style={{ color: 'var(--text-muted)' }}>
                        {product.description}
                    </p>

                    <div className="space-y-6 mb-10">
                        <div className="flex items-start gap-4 p-4 glass">
                            <Truck size={24} style={{ color: 'var(--text-muted)' }} className="mt-1" />
                            <div>
                                <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Delivery Window</h4>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{product.delivery_window || "2-3 Working Days"}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 glass">
                            <Info size={24} style={{ color: 'var(--text-muted)' }} className="mt-1" />
                            <div>
                                <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Inspection Policy</h4>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Physical inspection is allowed before final payment release. Ask admin for details.</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Banner */}
                    {product.status === 'sold' && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
                            <p className="text-red-500 font-bold text-sm">This item has been sold.</p>
                        </div>
                    )}
                    {(product.is_reserved || product.status === 'reserved') && product.status !== 'sold' && (
                        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-6">
                            <p className="text-yellow-500 font-bold text-sm">This item is currently reserved.</p>
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
                                    className="btn-primary py-4 text-center"
                                >
                                    Pay Now
                                </button>
                            )}
                            <button
                                onClick={handleReserve}
                                className="btn-outline py-4 text-center"
                                disabled={product.status === 'sold' || product.status === 'reserved'}
                            >
                                {product.status === 'sold' ? 'Unavailable' : product.status === 'reserved' ? 'Reserved' : 'Reserve Item'}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 py-4 border border-[#25D366] text-[#25D366] rounded-xl hover:bg-[#25D36610] transition-colors font-bold text-xs">
                                <MessageCircle size={18} />
                                WhatsApp
                            </button>
                            <button className="flex items-center justify-center gap-2 py-4 border border-[#E4405F] text-[#E4405F] rounded-xl hover:bg-[#E4405F10] transition-colors font-bold text-xs">
                                <Instagram size={18} />
                                Instagram
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default ProductDetails
