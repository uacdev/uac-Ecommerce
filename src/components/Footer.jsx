import { Instagram, MessageCircle, Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className="py-20" style={{ background: '#0A0A0A', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    <div className="lg:col-span-1">
                        <img src="/images/logo_nobg.png" alt="Logo" className="h-20 lg:h-28 w-auto mb-8" style={{ filter: 'brightness(0) invert(1) drop-shadow(0 2px 10px rgba(241,139,36,0.5))' }} />
                        <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-xs">
                            The premium transaction gateway and logistics partner for Instagram sellers.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.instagram.com/selloutandrelocate.ng?igsh=djByMTlvb21sMmVn" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[#F18B24] hover:border-[#F18B24] transition-all">
                                <Instagram size={18} />
                            </a>
                            <a href="https://wa.me/+2349098050402" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[#25D366] hover:border-[#25D366] transition-all">
                                <MessageCircle size={18} />
                            </a>
                        </div>
                    </div>

                    <div className="hidden lg:block lg:col-span-1" />

                    <div>
                        <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">Navigation</h4>
                        <ul className="space-y-4">
                            <li><Link to="/" className="text-white/40 hover:text-[#F18B24] text-xs font-bold uppercase tracking-widest transition-colors">Home</Link></li>
                            <li><a href="#how-it-works" className="text-white/40 hover:text-[#F18B24] text-xs font-bold uppercase tracking-widest transition-colors">Process</a></li>
                            <li><a href="#all-products" className="text-white/40 hover:text-[#F18B24] text-xs font-bold uppercase tracking-widest transition-colors">Collection</a></li>
                            <li><Link to="/admin" className="text-white/40 hover:text-[#F18B24] text-xs font-bold uppercase tracking-widest transition-colors">Admin</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">Support</h4>
                        <ul className="space-y-4">
                            <li><a href="mailto:support@selloutrelocate.ng" className="text-white/40 hover:text-[#F18B24] text-xs font-bold uppercase tracking-widest transition-colors">Contact</a></li>
                            <li><a href="#" className="text-white/40 hover:text-[#F18B24] text-xs font-bold uppercase tracking-widest transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-white/40 hover:text-[#F18B24] text-xs font-bold uppercase tracking-widest transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
                        © {new Date().getFullYear()} SELLOUT. ALL RIGHTS RESERVED.
                    </p>
                    <p className="text-white/10 text-[9px] font-bold uppercase tracking-widest max-w-[400px] text-center md:text-right">
                        Sellout acts as a transaction gateway. All product claims are the responsibility of the seller.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
