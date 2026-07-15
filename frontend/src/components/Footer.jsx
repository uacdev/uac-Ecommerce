import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'

const formatWhatsAppHref = (num) => {
    const digits = String(num || '').replace(/\D/g, '');
    if (!digits) return 'https://wa.me/2349098050402';
    if (digits.startsWith('0')) return `https://wa.me/234${digits.replace(/^0+/, '')}`;
    if (digits.startsWith('234')) return `https://wa.me/${digits}`;
    return `https://wa.me/${digits}`;
}

const Footer = () => {
    const { whatsappNumber } = useStore() || {}
    const waHref = formatWhatsAppHref(whatsappNumber)

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
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                                </svg>
                            </a>
                            <a href={waHref} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[#25D366] hover:border-[#25D366] transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="hidden lg:block lg:col-span-1" />

                    <div>
                        <h4 className="text-white text-[11px] font-bold tracking-widest mb-8">Navigation</h4>
                        <ul className="space-y-4">
                            <li><Link to="/" className="text-white/40 hover:text-[var(--brand-red)] text-xs font-medium transition-colors">Home</Link></li>
                            <li><Link to="/about" className="text-white/40 hover:text-[var(--brand-red)] text-xs font-medium transition-colors">Process</Link></li>
                            <li><Link to="/products" className="text-white/40 hover:text-[var(--brand-red)] text-xs font-medium transition-colors">Collection</Link></li>
                        </ul>
                    </div>
 
                    <div>
                        <h4 className="text-white text-[11px] font-bold tracking-widest mb-8">Support</h4>
                        <ul className="space-y-4">
                            <li><Link to="/privacy-policy" className="text-white/40 hover:text-[var(--brand-red)] text-xs font-medium transition-colors">Privacy policy</Link></li>
                            <li><Link to="/terms" className="text-white/40 hover:text-[var(--brand-red)] text-xs font-medium transition-colors">Terms of service</Link></li>
                            <li><Link to="/data-protection" className="text-white/40 hover:text-[var(--brand-red)] text-xs font-medium transition-colors">Data protection</Link></li>
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
