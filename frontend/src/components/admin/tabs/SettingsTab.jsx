import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { SettingInput } from '../ui/shared_ui'

const SettingsTab = () => {
    const [subTab, setSubTab] = useState('profile')
    return (
        <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl text-[var(--text-primary)]">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Account Settings</h2>
                <p className="text-[14px] text-[var(--text-muted)] mt-1 font-medium">General profile management and system security configurations.</p>
            </div>
            
            <div className="flex border-b border-[var(--divider)] gap-10">
                {['profile', 'security'].map(s => (
                    <button 
                        key={s} 
                        onClick={() => setSubTab(s)} 
                        className={`pb-5 text-[13px] font-bold transition-all relative capitalize tracking-tight ${subTab === s ? 'text-[#ed0000]' : 'text-[var(--text-muted)]'}`}
                    >
                        {s} details
                        {subTab === s && <motion.div layoutId="setTab" className="absolute bottom-0 left-0 w-full h-1 bg-[#ed0000] rounded-full" />}
                    </button>
                ))}
            </div>

            <div className="bg-[var(--bg-tertiary)] p-12 rounded-3xl border border-[var(--divider)] shadow-sm">
                {subTab === 'profile' ? (
                    <div className="space-y-10">
                        <div className="flex items-center gap-8">
                            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/20 flex items-center justify-center text-[#ed0000] font-bold text-2xl shadow-xl ring-4 ring-white dark:ring-[#222]">
                                SJ
                            </div>
                            <button className="text-[12px] font-bold text-[#ed0000] border border-red-100 dark:border-red-900/40 px-6 py-3 rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
                                Update Photo
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <SettingInput label="Full Name" value="Sarah Johnson" />
                            <SettingInput label="Email address" value="s.johnson@uacfoods.com" />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <SettingInput label="Current Password" type="password" value="" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <SettingInput label="New Password" type="password" value="" />
                            <SettingInput label="Confirm Password" type="password" value="" />
                        </div>
                    </div>
                )}
                <div className="mt-14 pt-8 border-t border-[var(--divider)] flex justify-end">
                    <button className="px-12 py-4 bg-black text-white rounded-2xl font-bold text-[13px] shadow-2xl hover:bg-zinc-800 transition-all active:scale-[0.98]">
                        Commit changes
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SettingsTab
