import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const Preloader = ({ fullHeight = true }) => {
    const { isDark } = useTheme()

    return (
        <div className={`${fullHeight ? 'h-screen' : 'h-64'} w-full flex flex-col items-center justify-center bg-[var(--bg-primary)] z-[9999]`}>
            <div className="relative">
                {/* Branding Circle */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full border border-[var(--divider)] border-t-[#F18B24]"
                />
                
                {/* Logo in center */}
                <div className="absolute inset-0 flex items-center justify-center p-6">
                    <motion.img 
                        src="/images/logo_nobg.png" 
                        alt="Logo" 
                        className="w-full h-full object-contain"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        style={{ 
                            filter: isDark 
                                ? 'brightness(0) invert(1) drop-shadow(0 0 12px rgba(241,139,36,0.5))' 
                                : 'drop-shadow(0 0 12px rgba(241,139,36,0.3))' 
                        }}
                    />
                </div>
            </div>
            
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 flex flex-col items-center gap-3"
            >
                <p className="text-[12px] font-black uppercase tracking-[0.5em] text-[#F18B24]">Loading</p>
                <div className="w-32 h-[1px] bg-[var(--divider)] relative overflow-hidden">
                    <motion.div 
                        initial={{ left: '-100%' }}
                        animate={{ left: '100%' }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-0 bottom-0 w-1/2 bg-[#F18B24]"
                    />
                </div>
            </motion.div>
        </div>
    )
}

export default Preloader 
