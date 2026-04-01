import { Instagram, MessageCircle, Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className="py-20" style={{ background: '#0A0A0A', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    <div className="lg:col-span-1">
                        <img src="/images/uac_foods_full.png" alt="UAC Foods" className="h-28 lg:h-36 w-auto mb-8 object-contain" />
                        <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-xs">
                            UAC Foods Limited: Creating Valuable Foods For Life. Leading manufacturer of tasty, nourishing convenience foods.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.instagram.com/uacfoodslimited" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[var(--brand-red)] hover:border-[var(--brand-red)] transition-all">
                                <Instagram size={18} />
                            </a>
                            <a href="https://wa.me/+2349098050402" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[#25D366] hover:border-[#25D366] transition-all">
                                <MessageCircle size={18} />
                            </a>
                        </div>
                    </div>

                    <div className="hidden lg:block lg:col-span-1" />

                    <div>
                        <h4 className="text-white text-[11px] font-bold tracking-widest mb-8">Navigation</h4>
                        <ul className="space-y-4">
                            <li><Link to="/" className="text-white/40 hover:text-[var(--brand-red)] text-xs font-medium transition-colors">Home</Link></li>
                            <li><a href="#how-it-works" className="text-white/40 hover:text-[var(--brand-red)] text-xs font-medium transition-colors">Process</a></li>
                            <li><a href="#all-products" className="text-white/40 hover:text-[var(--brand-red)] text-xs font-medium transition-colors">Collection</a></li>
                            <li><Link to="/admin" className="text-white/40 hover:text-[var(--brand-red)] text-xs font-medium transition-colors">Admin</Link></li>
                        </ul>
                    </div>
 
                    <div>
                        <h4 className="text-white text-[11px] font-bold tracking-widest mb-8">Support</h4>
                        <ul className="space-y-4">
                            <li><a href="mailto:info@uacfoodsng.com" className="text-white/40 hover:text-[var(--brand-red)] text-xs font-medium transition-colors">Contact</a></li>
                            <li><a href="#" className="text-white/40 hover:text-[var(--brand-red)] text-xs font-medium transition-colors">Privacy policy</a></li>
                            <li><a href="#" className="text-white/40 hover:text-[var(--brand-red)] text-xs font-medium transition-colors">Terms of service</a></li>
                        </ul>
                    </div>
                </div>
 
                <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-white/20 text-[10px] font-medium tracking-widest uppercase">
                        © {new Date().getFullYear()} Uac foods limited. All rights reserved.
                    </p>
                    <p className="text-white/10 text-[9px] font-medium tracking-widest uppercase max-w-[400px] text-center md:text-right">
                        Uac foods limited is a leading food and beverage company. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
