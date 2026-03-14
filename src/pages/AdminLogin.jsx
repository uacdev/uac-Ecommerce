import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const AdminLogin = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()
    const { setUser } = useAuth()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const cleanEmail = email.trim()
        const cleanPassword = password.trim()

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password: cleanPassword,
            })

            if (authError) throw authError
            navigate('/admin')
        } catch (err) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0F1115]">
            {/* Background elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#F18B2410] blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#3B82F608] blur-[120px]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-10">
                    <img src="/images/logo_nobg.png" alt="Logo" className="h-20 mx-auto mb-6 brightness-0 invert" />
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">Sellout Admin Portal</h1>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">Authorized Access Only</p>
                </div>

                <div className="p-8 lg:p-10 rounded-[32px] border border-white/5 bg-white/[0.03] backdrop-blur-xl shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Admin Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F18B24] transition-colors" size={18} />
                                <input 
                                    required
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@sellout.ng"
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-bold outline-none focus:border-[#F18B24] focus:ring-1 focus:ring-[#F18B24] transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Secret Key / Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#3B82F6] transition-colors" size={18} />
                                <input 
                                    required
                                    type={showPassword ? 'text' : 'password'} 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white text-sm font-bold outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors z-20"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button 
                            disabled={loading}
                            type="submit"
                            className="w-full py-4 rounded-2xl bg-[#F18B24] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Establish Link
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">
                            UNAUTHORIZED ACCESS TO THIS PORTAL IS LOGGED.<br />
                            SESSION MONITORING IN EFFECT.
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button 
                        onClick={() => navigate('/')}
                        className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                    >
                        ← Back to Gateway
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

export default AdminLogin
