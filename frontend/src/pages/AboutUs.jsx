import { motion } from 'framer-motion'
import { useEffect } from 'react'

const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { 
            duration: 0.8, 
            ease: [0.16, 1, 0.3, 1] 
        } 
    }
}

const AboutUs = () => {
    useEffect(() => {
        document.title = 'Story | UAC Foods'
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="bg-[var(--bg-primary)] min-h-screen pt-40 pb-40 font-['Sen',sans-serif]">
            <div className="container px-6">
                
                {/* Editorial Hero */}
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeUp}
                    className="mb-32"
                >
                    <motion.span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--brand-red)] mb-8 block">
                        Our Heritage
                    </motion.span>
                    <motion.h1 className="text-6xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.8] text-[var(--text-primary)] mb-12">
                        Feeding <br /> Nigeria's <br /> Ambition.
                    </motion.h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
                        <div className="h-[2px] bg-[var(--brand-red)] w-full" />
                        <p className="text-xl md:text-3xl font-black text-[var(--text-primary)] leading-tight uppercase tracking-tight">
                            UAC Foods Limited is the pioneering leader in Nigeria's snack and beverage category, nourishing millions since 1962.
                        </p>
                    </div>
                </motion.div>

                {/* Imagery & Text Bento */}
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeUp}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-40"
                >
                    <div className="lg:col-span-2 aspect-video rounded-[60px] overflow-hidden bg-[var(--bg-secondary)] border border-[var(--divider)] relative">
                        <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000" className="w-full h-full object-cover grayscale brightness-50" alt="Legacy" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <h2 className="text-white text-5xl md:text-8xl font-black uppercase tracking-tighter">Est. 1962</h2>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center p-12 bg-black text-white rounded-[60px]">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--brand-red)] mb-8 block">Our Mission</h3>
                        <p className="text-2xl font-bold leading-relaxed mb-8">"Providing nutritious, hygienic, and safe products to 80% of Nigerians daily."</p>
                        <div className="h-[1px] bg-white/20 w-full mb-8" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic font-serif">- CORPORATE VALUES</p>
                    </div>
                </motion.div>

                {/* Brand Portfolio Story */}
                <div className="space-y-40">
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeUp}
                        className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center"
                    >
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--brand-red)] mb-8 block">Iconic Legacy</span>
                            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-[var(--text-primary)] mb-12">The Gala <br /> Standard.</h2>
                            <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-12">
                                For over six decades, Gala has been the gold standard for sausage rolls in Nigeria. It's more than a snack; it's a companion for the morning commute, the student's break, and the busy professional's fuel.
                            </p>
                            <div className="flex gap-12">
                                <div>
                                    <h4 className="text-3xl font-black text-[var(--text-primary)]">62+</h4>
                                    <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Years of Trust</p>
                                </div>
                                <div>
                                    <h4 className="text-3xl font-black text-[var(--text-primary)]">12+</h4>
                                    <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Nutritious Brands</p>
                                </div>
                            </div>
                        </div>
                        <div className="aspect-[4/5] rounded-[80px] overflow-hidden bg-white border border-[var(--divider)] p-12 flex items-center justify-center">
                             <img src="/images/gala.jpg" className="w-full h-full object-contain" alt="The Gala Standard" />
                        </div>
                    </motion.div>

                    {/* Values Statement */}
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeUp}
                        className="text-center max-w-4xl mx-auto py-20 border-y border-[var(--divider)]"
                    >
                         <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[var(--text-primary)] mb-12">Driven by <br /> Excellence.</h2>
                         <p className="text-xl md:text-3xl font-black uppercase tracking-tight text-[var(--text-muted)] italic leading-none">
                            Customer Focus · Innovation · Integrity · Team Spirit
                         </p>
                    </motion.div>
                </div>

                {/* CEO Quote Section */}
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeUp}
                    className="mt-40 bg-[var(--bg-secondary)] rounded-[100px] p-24 text-center"
                >
                     <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--brand-red)] mb-8 block">Leadership</span>
                     <p className="text-2xl md:text-5xl font-black italic tracking-tighter text-[var(--text-primary)] leading-tight mb-12">
                        "We continue to innovate and expand our footprint while staying true to our core value of providing quality nutrition for all Nigerians."
                     </p>
                     <h4 className="text-xl font-black uppercase tracking-widest text-[var(--brand-red)]">Oluyemi Oloyede</h4>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">MD/CEO, UAC FOODS LIMITED</p>
                </motion.div>

            </div>
        </div>
    )
}

export default AboutUs
