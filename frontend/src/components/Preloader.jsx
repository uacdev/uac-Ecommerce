import React from 'react'
import { motion } from 'framer-motion'

const Preloader = () => {
    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-white font-['Sen',sans-serif]">
            <div className="flex flex-col items-center gap-12">
                <div className="relative">
                    <motion.img 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        src="/images/uac_foods_full.png" 
                        className="h-24 w-auto object-contain relative z-10" 
                        alt="UAC Foods" 
                    />
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            ease: 'easeOut' 
                        }}
                        className="absolute inset-0 bg-[#ed0000]/10 rounded-full blur-2xl"
                    />
                </div>
                <div className="flex flex-col items-center gap-3">
                    <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0.3, y: 0 }}
                                animate={{ opacity: 1, y: -4 }}
                                transition={{ 
                                    duration: 0.6, 
                                    repeat: Infinity, 
                                    repeatType: 'reverse', 
                                    delay: i * 0.15 
                                }}
                                className="w-1.5 h-1.5 rounded-full bg-[#ed0000]"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Preloader
