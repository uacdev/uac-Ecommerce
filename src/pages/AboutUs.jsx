import { motion } from 'framer-motion'
import { Award, Target, Users, History, CheckCircle2, Building2, Globe2, ShieldCheck, Heart, Sparkles, Building, Utensils, MessageSquare, Briefcase, Mail } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const Counter = ({ value, duration = 2 }) => {
    const [count, setCount] = useState(0)
    const [ref, inView] = useState(false)
    const elementRef = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true)
                }
            },
            { threshold: 0.1 }
        )
        if (elementRef.current) observer.observe(elementRef.current)
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (!inView) return

        const numericValue = parseInt(value.replace(/[^0-9]/g, ''))
        if (isNaN(numericValue)) {
            setCount(value)
            return
        }

        let start = 0
        const end = numericValue
        const totalDuration = duration * 1000
        const increment = end / (totalDuration / 16)

        const timer = setInterval(() => {
            start += increment
            if (start >= end) {
                setCount(value)
                clearInterval(timer)
            } else {
                setCount(Math.floor(start) + value.replace(/[0-9]/g, ''))
            }
        }, 16)

        return () => clearInterval(timer)
    }, [inView, value, duration])

    return <span ref={elementRef}>{count}</span>
}

const AboutUs = () => {
    useEffect(() => {
        document.title = 'About Us | UAC Foods Limited'
        window.scrollTo(0, 0)
    }, [])

    const stats = [
        { label: 'Years of Excellence', value: '62+', icon: History },
        { label: 'Nutritious Brands', value: '12+', icon: Sparkles },
        { label: 'Employees Nationwide', value: '2000+', icon: Users },
        { label: 'ISO Certified Facilities', value: '100%', icon: ShieldCheck }
    ]

    const values = [
        { title: 'Customer Focus', desc: 'Putting the needs of our consumers at the heart of everything we do.', icon: Target },
        { title: 'Innovation', desc: 'Continuously evolving to deliver superior food solutions.', icon: Sparkles },
        { title: 'Integrity', desc: 'Leading with transparency, honesty, and ethical standards.', icon: ShieldCheck },
        { title: 'Team Spirit', desc: 'Fostering a culture of collaboration and mutual respect.', icon: Users }
    ]

    const brands = [
        { name: 'Gala', year: '1962', desc: 'The iconic sausage roll that defined a category.' },
        { name: 'Supreme', year: '1982', desc: 'Nigeria’s most loved premium ice cream brand.' },
        { name: 'Swan', year: '1983', desc: 'Pure natural spring water from the Kerang hills.' },
        { name: 'Funtime', year: '2005', desc: 'Tasty snacks for moments of pure joy.' }
    ]

    return (
        <div className="bg-[var(--bg-primary)] overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative pt-40 md:pt-56 pb-24 px-6">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[var(--brand-red)]/5 blur-[120px] -z-10" />
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 mb-8 text-[var(--brand-red)]"
                    >
                        <Building size={18} />
                        <span className="text-xs font-black uppercase tracking-[0.4em]">The UAC Foods Story</span>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-end">
                        <motion.h1 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] text-[var(--text-primary)]"
                        >
                            Feeding <br />
                            <span className="text-[var(--brand-red)]">Nigeria's</span> <br />
                            Ambition.
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl md:text-2xl text-[var(--text-muted)] font-medium leading-relaxed max-w-xl pb-4"
                        >
                            UAC Foods Limited is a subsidiary of UAC of Nigeria Plc and a leading manufacturer of snacks, beverages and dairy products.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 border-y border-[var(--divider)]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                        {stats.map((s, i) => (
                            <motion.div 
                                key={s.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center lg:text-left"
                            >
                                <div className="w-16 h-16 rounded-3xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--brand-red)] mb-6 mx-auto lg:mx-0 shadow-lg group hover:bg-[var(--brand-red)] hover:text-white transition-colors">
                                    <s.icon size={28} />
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] mb-2">
                                    <Counter value={s.value} />
                                </h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">{s.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission & Purpose */}
            <section className="py-32 md:py-48 px-6 bg-[var(--bg-secondary)] relative">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="rounded-[60px] overflow-hidden shadow-2xl aspect-square"
                        >
                            <img src="/images/gala.jpg" alt="Legacy" className="w-full h-full object-cover" />
                        </motion.div>
                        
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="space-y-10"
                            >
                                <div>
                                    <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-8 text-[var(--text-primary)]">Our Corporate Mission</h2>
                                    <p className="text-xl text-[var(--text-muted)] leading-relaxed font-medium">
                                        "To continuously work towards ensuring that at least 80% of Nigerians are served by our brands every day, providing nutritious, hygienic and safe products."
                                    </p>
                                </div>
                                
                                <div className="grid gap-8">
                                    {values.map((v, i) => (
                                        <div key={v.title} className="flex gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-[var(--brand-red)]/10 flex items-center justify-center text-[var(--brand-red)] shrink-0">
                                                <v.icon size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-[var(--text-primary)] mb-1">{v.title}</h4>
                                                <p className="text-sm font-medium text-[var(--text-muted)]">{v.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Brands Legacy Section */}
            <section className="py-32 md:py-48 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-24"
                    >
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 text-[var(--text-primary)]">A Heritage of Trust</h2>
                        <p className="text-[var(--text-muted)] text-lg md:text-xl max-w-2xl mx-auto font-medium">For decades, UAC Foods has pioneered the food and beverage industry in Nigeria, creating brands that have become household names.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {brands.map((b, i) => (
                            <motion.div
                                key={b.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-[40px] bg-[var(--bg-secondary)] border border-[var(--divider)] hover:border-[var(--brand-red)] transition-all group"
                            >
                                <div className="flex justify-between items-start mb-12">
                                    <span className="text-4xl font-black text-[var(--brand-red)] opacity-20 group-hover:opacity-100 transition-opacity">0{i+1}</span>
                                    <span className="px-4 py-2 rounded-full bg-[var(--brand-red)]/5 text-[var(--brand-red)] text-[10px] font-black tracking-widest uppercase italic">{b.year}</span>
                                </div>
                                <h3 className="text-3xl font-black text-[var(--text-primary)] mb-4">{b.name}</h3>
                                <p className="text-sm font-medium text-[var(--text-muted)] leading-relaxed italic">"{b.desc}"</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Leadership Section */}
            <section className="py-32 md:py-48 px-6 bg-[var(--brand-red)] text-white text-center">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="space-y-10"
                    >
                        <Award size={64} className="mx-auto text-white/40" />
                        <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-none mb-10">Driven by <br /> Excellence.</h2>
                        <p className="text-xl md:text-2xl font-medium opacity-80 leading-relaxed mb-12">
                            Under the leadership of <span className="text-white font-black underline decoration-4 underline-offset-8">Oluyemi Oloyede (MD/CEO)</span>, we continue to innovate and expand our footprint while staying true to our core value of providing quality nutrition for all.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6">
                            <button className="px-10 py-5 rounded-2xl bg-white text-[var(--brand-red)] font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform">Company Profile</button>
                            <button className="px-10 py-5 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/20 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">Investor Relations</button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 text-center">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="container px-6"
                >
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--brand-red)] mb-6">Connect with us</p>
                    <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] mb-12">Join our journey of nourishing Nigeria.</h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-8">
                        <a href="mailto:info@uacfoodsng.com" className="flex items-center gap-3 text-sm font-black uppercase tracking-widest hover:text-[var(--brand-red)] transition-colors">
                            <Mail size={18} /> info@uacfoodsng.com
                        </a>
                        <a href="#" className="flex items-center gap-3 text-sm font-black uppercase tracking-widest hover:text-[var(--brand-red)] transition-colors">
                            <Globe2 size={18} /> uacfoodsng.com
                        </a>
                    </div>
                </motion.div>
            </section>
        </div>
    )
}

export default AboutUs
