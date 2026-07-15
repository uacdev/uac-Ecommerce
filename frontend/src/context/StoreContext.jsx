import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/products'
import { productApi, orderApi, statsApi, categoryApi, adminApi, settingsApi } from '../api/client'
import { useAuth } from './AuthContext'

const StoreContext = createContext()

const FALLBACK_CATEGORY_NAMES = ['SWAN', 'Supreme', 'Gala', 'Funtime', 'Zuri', 'Kingsway Bread']

const buildFallbackSegments = (products = []) => {
    const names = new Set(FALLBACK_CATEGORY_NAMES)
    products.forEach((product) => {
        if (product?.brand) names.add(String(product.brand).trim())
        if (product?.category) names.add(String(product.category).trim())
    })

    return Array.from(names)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
        .map((name) => ({
            _id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            name,
            parent: 'Brand',
            color: 'bg-indigo-50 text-indigo-600'
        }))
}

export const useStore = () => useContext(StoreContext)

export const StoreProvider = ({ children }) => {
    const { user } = useAuth()
    const [products, setProducts] = useState([])
    const [orders, setOrders] = useState([])
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('ufl_cart')
            return saved ? JSON.parse(saved) : []
        } catch { return [] }
    })
    const [favorites, setFavorites] = useState(() => {
        try {
            const saved = localStorage.getItem('ufl_favorites')
            return saved ? JSON.parse(saved) : []
        } catch { return [] }
    })
    const [loading, setLoading] = useState(true)
    const [apiStats, setApiStats] = useState(null)
    const [adminProfile, setAdminProfileState] = useState(null)
    const [whatsappNumber, setWhatsAppNumber] = useState('')

    // Persistence save for Cart
    useEffect(() => {
        localStorage.setItem('ufl_cart', JSON.stringify(cart))
    }, [cart])

    // Persistence save for Favorites
    useEffect(() => {
        localStorage.setItem('ufl_favorites', JSON.stringify(favorites))
    }, [favorites])

    // Public products always; orders + stats only for signed-in admins.
    useEffect(() => {
        let cancelled = false
        setLoading(true)
        productApi.getAll()
            .then(res => {
                if (cancelled) return
                const fetched = res.data?.data || []
                setProducts(fetched)
            })
            .catch(() => { if (!cancelled) setProducts([]) })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [])

    useEffect(() => {
        let cancelled = false
        settingsApi.getSetting('whatsapp_number')
            .then(res => {
                if (cancelled) return
                if (res.data?.success && res.data.data?.value) {
                    setWhatsAppNumber(res.data.data.value)
                }
            })
            .catch(() => { /* fallback to default */ })
        return () => { cancelled = true }
    }, [])

    const refreshStats = async () => {
        try {
            const res = await statsApi.getKpis()
            if (res.data?.success) setApiStats(res.data.data)
        } catch { /* silent */ }
    }

    // Bumps on every order mutation. Components that maintain their own paginated
    // copy of orders (e.g. OrdersTab) depend on this so they refetch when status
    // or delivery changes — not just when the array length changes.
    const [ordersTick, setOrdersTick] = useState(0)
    const bumpOrdersTick = () => setOrdersTick(t => t + 1)

    useEffect(() => {
        if (!user) { setOrders([]); setApiStats(null); return }
        let cancelled = false
        Promise.allSettled([orderApi.getAll(), statsApi.getKpis()]).then(([oRes, sRes]) => {
            if (cancelled) return
            if (oRes.status === 'fulfilled') setOrders(oRes.value.data?.data || [])
            if (sRes.status === 'fulfilled') setApiStats(sRes.value.data?.data || null)
        })
        return () => { cancelled = true }
    }, [user])

    // Persistence Fallback for Offline Mode (existing logic)...
    useEffect(() => {
        if (products.length > 0) localStorage.setItem('ufl_products', JSON.stringify(products))
    }, [products])

    useEffect(() => {
        if (orders.length > 0) localStorage.setItem('ufl_orders', JSON.stringify(orders))
    }, [orders])

    // ─── Cart Actions ───
    const addToCart = (product, quantity = 1) => {
        setCart(prev => {
            const existingItem = prev.find(item => item.id === product.id)
            if (existingItem) {
                return prev.map(item => 
                    item.id === product.id 
                    ? { ...item, quantity: item.quantity + quantity } 
                    : item
                )
            }
            return [...prev, { ...product, quantity }]
        })
    }

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId))
    }

    const updateCartQuantity = (productId, quantity) => {
        if (quantity < 1) return removeFromCart(productId)
        setCart(prev => prev.map(item => 
            item.id === productId ? { ...item, quantity } : item
        ))
    }

    const clearCart = () => setCart([])

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const cartCount = cart.length

    // ─── Favorites Actions ───
    const toggleFavorite = (product) => {
        setFavorites(prev => {
            const exists = prev.find(p => p.id === product.id)
            return exists ? prev.filter(p => p.id !== product.id) : [product, ...prev]
        })
    }
    const isFavorite = (productId) => favorites.some(p => p.id === productId)

    // ─── Product Actions ───
    const addProduct = async (product) => {
        const stockCount = Number(product.stockCount ?? 0)
        const payload = {
            name: product.name,
            brand: product.brand || '',
            description: product.description || '',
            category: product.category,
            image: product.image || '',
            images: product.images || [],
            location: product.location,
            packaging: product.packaging || '',
            price: Number(product.price),
            stockCount,
            status: stockCount > 0 ? 'available' : 'out_of_stock'
        }
        try {
            const res = await productApi.create(payload)
            const added = res.data.data
            setProducts(prev => [added, ...prev])
            return { success: true, data: added }
        } catch (err) {
            console.error('Add product error:', err)
            return { success: false, message: err.response?.data?.message || err.message }
        }
    }

    const bulkAddProducts = async (productsArray) => {
        try {
            const res = await productApi.bulkCreate(productsArray)
            const added = res.data?.data || []
            if (added.length > 0) {
                setProducts(prev => [...added, ...prev])
            }
            return { success: true, count: added.length, data: added }
        } catch (err) {
            console.error('Bulk add error:', err)
            return { success: false, message: err.response?.data?.message || err.message, errors: err.response?.data?.errors }
        }
    }

    const updateProduct = async (id, updates) => {
        try {
            const res = await productApi.update(id, updates)
            const updated = res.data.data
            setProducts(prev => prev.map(p => (p.id === id || p._id === id) ? { ...p, ...updated } : p))
            return { success: true, data: updated }
        } catch (err) {
            console.error('Update product error:', err)
            return { success: false, message: err.response?.data?.message || err.message }
        }
    }

    const removeProduct = async (id) => {
        try {
            await productApi.delete(id)
            setProducts(prev => prev.filter(p => p.id !== id && p._id !== id))
            return { success: true }
        } catch (err) {
            console.error('Remove product error:', err)
            return { success: false, message: err.response?.data?.message || err.message }
        }
    }

    const markProductReserved = (id) => updateProduct(id, { is_reserved: true, status: 'reserved' })
    const markProductSold = (id) => updateProduct(id, { is_reserved: false, status: 'sold' })
    const markProductAvailable = (id) => updateProduct(id, { is_reserved: false, status: 'available' })

    // ─── Order Actions ───
    const addOrder = async (orderData) => {
        try {
            const res = await orderApi.create({
                items: orderData.items,
                buyerName: orderData.buyerName,
                buyerEmail: orderData.buyerEmail,
                buyerPhone: orderData.buyerPhone,
                buyerAddress: orderData.buyerAddress,
                buyerState: orderData.buyerState || '',
                deliveryZone: orderData.deliveryZone || '',
                paymentMethod: orderData.paymentMethod || '',
                fulfillmentType: orderData.fulfillmentType || 'delivery',
                checkoutSessionId: orderData.checkoutSessionId
            })
            const created = res.data?.data
            if (!created) return { success: false, message: 'Empty response from server' }
            setOrders(prev => [created, ...prev])
            bumpOrdersTick()
            return { success: true, data: created }
        } catch (err) {
            console.error('Add order error:', err)
            return { success: false, message: err.response?.data?.message || err.message }
        }
    }

    const updateOrderStatus = async (id, status) => {
        try {
            const res = await orderApi.updateStatus(id, status)
            const updated = res.data?.data
            setOrders(prev => prev.map(o => (o.id === id || o._id === id) ? updated : o))
            bumpOrdersTick()
            refreshStats()
            return { success: true, data: updated }
        } catch (err) {
            console.error('Update status error:', err)
            return { success: false, message: err.response?.data?.message || err.message }
        }
    }

    const updateOrderDelivery = async (orderId, deliveryMethod, deliveryZone = '', logisticsPartner = '') => {
        try {
            const res = await orderApi.updateDelivery(orderId, { deliveryMethod, deliveryZone, logisticsPartner })
            const updated = res.data?.data
            setOrders(prev => prev.map(o => (o.id === orderId || o._id === orderId) ? updated : o))
            bumpOrdersTick()
            refreshStats()
            return { success: true, data: updated }
        } catch (err) {
            console.error('Update delivery error:', err)
            return { success: false, message: err.response?.data?.message || err.message }
        }
    }

    const removeOrder = async (id) => {
        try {
            await orderApi.delete(id)
            setOrders(prev => prev.filter(o => o.id !== id && o._id !== id))
            bumpOrdersTick()
            refreshStats()
            return { success: true }
        } catch (err) {
            console.error('Delete order error:', err)
            return { success: false, message: err.response?.data?.message || err.message }
        }
    }

    const [businessSegments, setBusinessSegments] = useState([])
    const [categoriesLoading, setCategoriesLoading] = useState(true)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoryApi.getAll()
                const fetched = Array.isArray(res.data?.data) ? res.data.data : []
                if (fetched.length > 0) {
                    setBusinessSegments(fetched)
                    return
                }

                setBusinessSegments(buildFallbackSegments(products))
            } catch (err) {
                console.error('Fetch categories error:', err)
                setBusinessSegments(buildFallbackSegments(products))
            } finally {
                setCategoriesLoading(false)
            }
        }
        fetchCategories()
    }, [products])

    useEffect(() => {
        if (!user) { setAdminProfileState(null); return }
        // Auth user object already carries the profile fields; use it as the initial value
        setAdminProfileState(user)
        let cancelled = false
        adminApi.getProfile()
            .then(res => { if (!cancelled && res.data?.success) setAdminProfileState(res.data.data) })
            .catch(err => console.error('Fetch admin profile failed:', err))
        return () => { cancelled = true }
    }, [user])

    const setAdminProfile = async (updates) => {
        if (!user) return { success: false, message: 'Not signed in' }
        try {
            const res = await adminApi.upsertProfile(updates)
            if (res.data?.success) {
                setAdminProfileState(res.data.data)
                return { success: true, data: res.data.data }
            }
            return { success: false, message: 'Empty response' }
        } catch (err) {
            console.error('Save admin profile failed:', err)
            return { success: false, message: err.response?.data?.message || err.message }
        }
    }

    const updateWhatsAppNumber = async (value) => {
        try {
            const res = await settingsApi.upsertSetting('whatsapp_number', { value })
            if (res.data?.success) {
                setWhatsAppNumber(res.data.data?.value || value)
                return { success: true, data: res.data.data }
            }
            return { success: false, message: 'Could not save WhatsApp number' }
        } catch (err) {
            console.error('Update WhatsApp number failed:', err)
            return { success: false, message: err.response?.data?.message || err.message }
        }
    }

    const deleteWhatsAppNumber = async () => {
        try {
            const res = await settingsApi.deleteSetting('whatsapp_number')
            if (res.data?.success) {
                setWhatsAppNumber('')
                return { success: true }
            }
            return { success: false, message: res.data?.message || 'Could not delete WhatsApp number' }
        } catch (err) {
            console.error('Delete WhatsApp number failed:', err)
            return { success: false, message: err.response?.data?.message || err.message }
        }
    }

    const getOrderById = (id) => orders.find(o => o.id === id)

    const addCategory = async (newCat) => {
        try {
            const res = await categoryApi.create({
                name: newCat.name,
                abstract: newCat.abstract,
                parent: newCat.parent || '',
                color: newCat.color,
                coverImage: newCat.coverImage || ''
            })
            if (res.data?.success) {
                setBusinessSegments(prev => [...prev, res.data.data])
                return { success: true }
            }
        } catch (err) {
            console.error('Add category error:', err)
            return { success: false, message: err.response?.data?.message || err.message }
        }
    }

    const updateCategoryById = async (id, updates) => {
        try {
            const res = await categoryApi.update(id, updates)
            if (res.data?.success) {
                setBusinessSegments(prev => prev.map(c => c._id === id ? res.data.data : c))
                return { success: true }
            }
        } catch (err) {
            console.error('Update category error:', err)
            return { success: false, message: err.response?.data?.message || err.message }
        }
    }

    const removeCategory = async (id) => {
        try {
            await categoryApi.delete(id)
            setBusinessSegments(prev => prev.filter(c => c._id !== id))
            return { success: true }
        } catch (err) {
            console.error('Remove category error:', err)
            return { success: false, message: err.response?.data?.message || err.message }
        }
    }

    const categories = useMemo(
        () => ['All', ...businessSegments.map(c => c.name)],
        [businessSegments]
    )

    const stats = useMemo(() => ({
        totalProducts: apiStats?.totalProducts ?? products.length,
        availableProducts: products.filter(p => !p.is_reserved && p.status !== 'sold').length,
        totalOrders: apiStats?.totalOrders ?? orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        totalRevenue: apiStats?.totalRevenue ?? orders.reduce((sum, o) => sum + (o.amount || 0), 0),
        avgOrderValue: apiStats?.avgOrderValue ?? 0,
        totalCustomers: apiStats?.totalCustomers ?? 0,
        returningRate: apiStats?.returningRate ?? 0,
        abandonmentRate: apiStats?.abandonmentRate ?? 0,
        dailyVisitors: apiStats?.dailyVisitors ?? 0,
        trends: apiStats?.trends ?? null,
        platformIncome: orders
            .filter(o => ['paid', 'confirmed', 'shipped', 'delivered', 'completed'].includes(o.status))
            .reduce((sum, o) => sum + (o.commission || Math.round((o.amount || 0) * 0.1)), 0),
    }), [products, orders, apiStats])

    return (
        <StoreContext.Provider value={{
            products,
            orders,
            cart,
            favorites,
            cartTotal,
            cartCount,
            loading,
            stats,
            adminProfile, setAdminProfile,
            whatsappNumber,
            updateWhatsAppNumber,
            deleteWhatsAppNumber,
            categories,
            businessSegments,
            categoriesLoading,
            addCategory,
            updateCategoryById,
            removeCategory,
            toggleFavorite,
            isFavorite,
            addProduct,
            bulkAddProducts,
            updateProduct,
            removeProduct,
            addToCart,
            removeFromCart,
            updateCartQuantity,
            clearCart,
            markProductReserved,
            markProductSold,
            markProductAvailable,
            addOrder,
            updateOrderStatus,
            updateOrderDelivery,
            removeOrder,
            refreshStats,
            ordersTick,
            getOrderById,
        }}>
            {children}
        </StoreContext.Provider>
    )
}
