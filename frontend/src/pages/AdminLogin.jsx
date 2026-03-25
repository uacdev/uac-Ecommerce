import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, ChevronLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'

const AdminLogin = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const navigate = useNavigate()

    const bannerImages = [
        '/images/login1.png',
        '/images/login2.png',
        '/images/login3.png'
    ]

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % bannerImages.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password.trim(),
            })
            if (authError) throw authError
            navigate('/admin')
        } catch (err) {
            setError('Invalid credentials. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex bg-white font-['Sen',sans-serif] text-slate-800">
            {/* LEFT SIDE: IMAGE CAROUSEL */}
            <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-slate-900">
                <AnimatePresence initial={false}>
                    <motion.img 
                        key={currentImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
                        src={bannerImages[currentImageIndex]} 
                        alt="UAC Banner" 
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </AnimatePresence>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
                
                <div className="absolute bottom-12 left-12 right-12 text-white z-20">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-4xl font-medium tracking-tight mb-4 leading-tight">Access your admin dashboard <br/> and manage your ecommerce platform</h2>
                        <p className="text-white/80 font-medium max-w-sm text-sm leading-relaxed">Centralized inventory, logistics, and customer analytics management platform.</p>
                        
                        <div className="mt-10 flex gap-2.5">
                             {bannerImages.map((_, idx) => (
                                <div key={idx} className={`h-1 rounded-full transition-all duration-700 ${currentImageIndex === idx ? 'w-10 bg-[#ed0000]' : 'w-2 bg-white/20'}`} />
                             ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* RIGHT SIDE: LOGIN FORM */}
            <div className="w-full lg:w-2/5 flex flex-col justify-center px-8 sm:px-12 lg:px-24 bg-white relative">
                {/* BACK TO HOME ACTION */}
                <button 
                    onClick={() => navigate('/')}
                    className="absolute top-10 right-10 flex items-center gap-2 text-[13px] font-bold text-slate-400 hover:text-black transition-all group"
                >
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to home
                </button>

                <div className="max-w-md w-full mx-auto">
                    <div className="mb-14">
                        <img src="/images/uac_foods_full.png" alt="UAC Logo" className="h-16 mb-12 transition-transform active:scale-95 cursor-pointer" onClick={() => navigate('/')} />
                        <h1 className="text-2xl font-medium tracking-tight text-slate-900 leading-tight">Admin sign in</h1>
                        <p className="text-slate-400 font-medium mt-2.5 text-[15px]">Sign in to manage your dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 rounded-xl bg-red-50 text-[#ed0000] text-[13px] font-bold border border-red-100 flex items-center gap-3 shadow-sm"
                            >
                                <ShieldCheck size={18} />
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-4">
                            <label className="text-[14px] font-bold text-slate-600 tracking-tight ml-1 leading-none">Email address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-[#ed0000]" size={18} />
                                <input 
                                    required
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4.5 pl-12 pr-4 text-slate-700 text-sm font-medium outline-none focus:bg-white focus:border-[#ed0000] shadow-sm transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[14px] font-bold text-slate-600 tracking-tight ml-1 leading-none">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-[#ed0000]" size={18} />
                                <input 
                                    required
                                    type={showPassword ? 'text' : 'password'} 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4.5 pl-12 pr-12 text-slate-700 text-sm font-medium outline-none focus:bg-white focus:border-[#ed0000] shadow-sm transition-all"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#ed0000] transition-colors p-2"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-1">
                             <label className="flex items-center gap-2.5 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#ed0000] focus:ring-[#ed0000] transition-all cursor-pointer" />
                                <span className="text-[12px] font-medium text-slate-400 group-hover:text-slate-600">Remember session</span>
                             </label>
                             <button type="button" className="text-[12px] font-medium text-[#ed0000] hover:underline decoration-2">Forgot password?</button>
                        </div>

                        <button 
                            disabled={loading}
                            type="submit"
                            className="w-full py-4.5 rounded-xl bg-black text-white text-[15px] font-bold shadow-xl shadow-slate-100 hover:bg-[#ed0000] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Login
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-16 pt-8 border-t border-slate-50 text-center">
                        <p className="text-[10px] font-medium text-slate-300 uppercase tracking-[0.2em] leading-relaxed">
                            Authorized personnel only. Sessions encrypted & monitored.<br />
                            © 2026 UAC Foods Limited. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminLogin
