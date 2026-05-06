import { useEffect } from 'react'
import { motion } from 'framer-motion'

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
}

const Section = ({ number, title, children }) => (
    <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="border-t border-[var(--divider)] pt-10 pb-4"
    >
        <div className="flex gap-6 items-start">
            <span className="text-[11px] font-black uppercase tracking-widest text-[var(--brand-red)] mt-1 shrink-0 w-6">{number}.</span>
            <div className="flex-1">
                <h2 className="text-lg font-black uppercase tracking-tight text-[var(--text-primary)] mb-5">{title}</h2>
                <div className="text-[14px] text-[var(--text-muted)] leading-relaxed space-y-3">{children}</div>
            </div>
        </div>
    </motion.div>
)

const Bullet = ({ children }) => (
    <li className="flex gap-2 items-start">
        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--brand-red)] shrink-0" />
        <span>{children}</span>
    </li>
)

const NumberedItem = ({ n, children }) => (
    <li className="flex gap-3 items-start">
        <span className="font-black text-[var(--brand-red)] shrink-0 text-[13px]">{n}.</span>
        <span>{children}</span>
    </li>
)

const TermsAndConditions = () => {
    useEffect(() => {
        document.title = 'Terms & Conditions | UAC Foods'
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="bg-[var(--bg-primary)] min-h-screen pt-40 pb-40 font-['Sen',sans-serif]">
            <div className="max-w-3xl mx-auto px-6">
                <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-16">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--brand-red)] mb-4 block">Legal</span>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-[var(--text-primary)] mb-6">
                        Terms &amp;<br />Conditions
                    </h1>
                    <p className="text-[14px] text-[var(--text-muted)] leading-relaxed max-w-xl">
                        Learn more about our standard terms and conditions and how they are applied.
                    </p>
                </motion.div>

                <div className="space-y-2">
                    <Section number="1" title="Introduction">
                        <p>
                            These Website Standard Terms and Conditions ("Terms") govern your use of this website, including all pages within it (collectively referred to as the "Website").
                        </p>
                        <p>
                            By accessing and using this Website, you accept and agree to be bound by these Terms in full. If you disagree with any part of these Terms, you must not use this Website.
                        </p>
                        <p>
                            This Website is not intended for use by minors (individuals under 18 years of age). By using this Website, you confirm that you are at least 18 years old.
                        </p>
                    </Section>

                    <Section number="2" title="Intellectual Property Rights">
                        <p>
                            You acknowledge that UAC Foods Limited ("UFL") owns all rights, title, and interest in and to all intellectual property associated with this Website. This includes, but is not limited to:
                        </p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>Copyrights</Bullet>
                            <Bullet>Trademarks</Bullet>
                            <Bullet>Patents</Bullet>
                            <Bullet>Content, designs, advertisements, and materials</Bullet>
                        </ul>
                        <p className="mt-3">
                            You agree not to create, develop, or use any material that infringes or is likely to infringe upon UFL's intellectual property rights or those of any third party in connection with this Website.
                        </p>
                    </Section>

                    <Section number="3" title="Restrictions">
                        <p>You are expressly prohibited from:</p>
                        <ol className="space-y-2 mt-2">
                            <NumberedItem n="1">Publishing any Website material in any media without permission</NumberedItem>
                            <NumberedItem n="2">Selling, sublicensing, or commercializing Website material</NumberedItem>
                            <NumberedItem n="3">Publicly performing or displaying Website material</NumberedItem>
                            <NumberedItem n="4">Using the Website in any way that may damage the Website, public morals, or UFL</NumberedItem>
                            <NumberedItem n="5">Interfering with user access to the Website</NumberedItem>
                            <NumberedItem n="6">Using the Website in violation of applicable laws or regulations</NumberedItem>
                            <NumberedItem n="7">Engaging in data mining, data harvesting, data extraction, or similar activities</NumberedItem>
                            <NumberedItem n="8">Using the Website for advertising or marketing purposes</NumberedItem>
                        </ol>
                        <p className="mt-3">
                            Certain areas of the Website may be restricted. UFL reserves the right to limit access to any part of the Website at its sole discretion.
                        </p>
                        <p>
                            You are responsible for maintaining the confidentiality of any login credentials (user ID and password) associated with your account.
                        </p>
                    </Section>

                    <Section number="4" title="No Warranties">
                        <p>
                            This Website is provided "as is," with all faults. UFL makes no representations or warranties, express or implied, regarding:
                        </p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>The accuracy or completeness of Website content</Bullet>
                            <Bullet>The availability or reliability of the Website</Bullet>
                        </ul>
                        <p className="mt-3">Nothing on this Website constitutes professional advice.</p>
                    </Section>

                    <Section number="5" title="Limitation of Liability">
                        <p>UFL, including its officers, directors, and employees, shall not be liable for:</p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>Any direct, indirect, incidental, or consequential damages</Bullet>
                            <Bullet>Any loss arising from your use of the Website</Bullet>
                            <Bullet>Any liability arising under contract, tort, or otherwise</Bullet>
                        </ul>
                        <p className="mt-3">Your use of the Website is entirely at your own risk.</p>
                    </Section>

                    <Section number="6" title="Indemnification">
                        <p>You agree to indemnify and hold UFL harmless from and against any and all:</p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>Liabilities</Bullet>
                            <Bullet>Costs</Bullet>
                            <Bullet>Claims</Bullet>
                            <Bullet>Damages</Bullet>
                            <Bullet>Expenses (including reasonable legal fees)</Bullet>
                        </ul>
                        <p className="mt-3">arising from your breach of these Terms.</p>
                    </Section>

                    <Section number="7" title="Severability">
                        <p>If any provision of these Terms is found to be invalid or unenforceable under applicable law:</p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>That provision shall be removed or modified to the minimum extent necessary</Bullet>
                            <Bullet>The remaining provisions shall remain valid and enforceable</Bullet>
                        </ul>
                    </Section>

                    <Section number="8" title="Variation of Terms">
                        <p>
                            UFL reserves the right to revise these Terms at any time. By continuing to use the Website, you agree to be bound by the updated Terms.
                        </p>
                        <p>You are encouraged to review these Terms regularly.</p>
                    </Section>

                    <Section number="9" title="Assignment">
                        <p>
                            UFL may assign, transfer, or subcontract its rights and obligations under these Terms without notice.
                        </p>
                        <p>
                            You may not assign, transfer, or subcontract your rights or obligations under these Terms without prior written consent from UFL.
                        </p>
                    </Section>

                    <Section number="10" title="Entire Agreement">
                        <p>
                            These Terms, along with any legal notices and disclaimers on the Website, constitute the entire agreement between you and UFL regarding your use of the Website.
                        </p>
                        <p>They supersede all prior agreements and understandings.</p>
                    </Section>

                    <Section number="11" title="Governing Law and Jurisdiction">
                        <p>
                            These Terms shall be governed by and interpreted in accordance with the laws of the Federal Republic of Nigeria.
                        </p>
                        <p>
                            You agree to submit to the non-exclusive jurisdiction of the courts of Nigeria for the resolution of any disputes.
                        </p>
                    </Section>
                </div>
            </div>
        </div>
    )
}

export default TermsAndConditions
