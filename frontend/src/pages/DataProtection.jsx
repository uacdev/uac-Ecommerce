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

const DataProtection = () => {
    useEffect(() => {
        document.title = 'Data Protection Policy | UAC Foods'
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="bg-[var(--bg-primary)] min-h-screen pt-40 pb-40 font-['Sen',sans-serif]">
            <div className="max-w-3xl mx-auto px-6">
                <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-16">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--brand-red)] mb-4 block">Legal</span>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-[var(--text-primary)] mb-6">
                        Data Protection<br />Policy
                    </h1>
                    <p className="text-[13px] text-[var(--text-muted)]">Effective in accordance with the Nigeria Data Protection Act 2023</p>
                </motion.div>

                <div className="space-y-2">
                    <Section number="1" title="Introduction">
                        <p>
                            This Data Protection Policy outlines how UAC Foods Limited ("UFL") collects, processes, stores, protects, and manages personal data in compliance with applicable data protection laws, including the Nigeria Data Protection Act 2023.
                        </p>
                        <p>This policy complements our Privacy Policy and Terms &amp; Conditions.</p>
                    </Section>

                    <Section number="2" title="Objectives">
                        <p>This policy is designed to:</p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>Ensure lawful and fair processing of personal data</Bullet>
                            <Bullet>Protect the rights of data subjects</Bullet>
                            <Bullet>Prevent unauthorized access, loss, or misuse of data</Bullet>
                            <Bullet>Ensure compliance with regulatory requirements</Bullet>
                        </ul>
                    </Section>

                    <Section number="3" title="Scope">
                        <p>This policy applies to:</p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>All employees, contractors, and third parties handling data</Bullet>
                            <Bullet>All systems, platforms, and processes involving personal data</Bullet>
                            <Bullet>All forms of data (digital and physical)</Bullet>
                        </ul>
                    </Section>

                    <Section number="4" title="Types of Data Collected">
                        <p>We may process the following categories of personal data:</p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>Identity data (name, date of birth)</Bullet>
                            <Bullet>Contact data (email, phone number)</Bullet>
                            <Bullet>Technical data (IP address, device information)</Bullet>
                            <Bullet>Usage data (website activity, interactions)</Bullet>
                            <Bullet>Transaction data (purchases, payments)</Bullet>
                        </ul>
                    </Section>

                    <Section number="5" title="Lawful Basis for Processing">
                        <p>We process personal data based on:</p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>Consent from the user</Bullet>
                            <Bullet>Contractual necessity</Bullet>
                            <Bullet>Legal obligations</Bullet>
                            <Bullet>Legitimate business interests</Bullet>
                        </ul>
                    </Section>

                    <Section number="6" title="Data Protection Principles">
                        <p>We follow these core principles:</p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>Lawfulness, fairness, and transparency</Bullet>
                            <Bullet>Purpose limitation (only for specific purposes)</Bullet>
                            <Bullet>Data minimization (only necessary data collected)</Bullet>
                            <Bullet>Accuracy (data kept up to date)</Bullet>
                            <Bullet>Storage limitation (not kept longer than needed)</Bullet>
                            <Bullet>Integrity and confidentiality (secured properly)</Bullet>
                        </ul>
                    </Section>

                    <Section number="7" title="Data Security Measures">
                        <p>We implement appropriate security measures, including:</p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>Encryption of sensitive data</Bullet>
                            <Bullet>Secure servers and firewalls</Bullet>
                            <Bullet>Access control and authentication systems</Bullet>
                            <Bullet>Regular security audits and monitoring</Bullet>
                            <Bullet>Staff training on data protection</Bullet>
                        </ul>
                    </Section>

                    <Section number="8" title="Data Retention">
                        <p>Personal data is retained only for as long as necessary:</p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>To fulfill the purpose it was collected</Bullet>
                            <Bullet>To comply with legal obligations</Bullet>
                            <Bullet>To resolve disputes</Bullet>
                        </ul>
                        <p className="mt-3">After this period, data is securely deleted or anonymized.</p>
                    </Section>

                    <Section number="9" title="Data Subject Rights">
                        <p>Under applicable laws, users have the right to:</p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>Access their personal data</Bullet>
                            <Bullet>Request correction of inaccurate data</Bullet>
                            <Bullet>Request deletion ("right to be forgotten")</Bullet>
                            <Bullet>Restrict or object to processing</Bullet>
                            <Bullet>Withdraw consent at any time</Bullet>
                            <Bullet>Request data portability</Bullet>
                        </ul>
                    </Section>

                    <Section number="10" title="Data Breach Management">
                        <p>In the event of a data breach:</p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>It will be identified and contained immediately</Bullet>
                            <Bullet>Affected users will be notified where required</Bullet>
                            <Bullet>Regulatory authorities will be informed as required by law</Bullet>
                            <Bullet>Corrective actions will be implemented</Bullet>
                        </ul>
                    </Section>

                    <Section number="11" title="Third-Party Data Sharing">
                        <p>We may share data with:</p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>Service providers and partners</Bullet>
                            <Bullet>Regulatory authorities (when required by law)</Bullet>
                        </ul>
                        <p className="mt-3">All third parties must comply with strict data protection standards.</p>
                    </Section>

                    <Section number="12" title="Data Protection Officer (DPO)">
                        <p>UFL may appoint a Data Protection Officer responsible for:</p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>Monitoring compliance</Bullet>
                            <Bullet>Advising on data protection obligations</Bullet>
                            <Bullet>Acting as a contact point for regulators and users</Bullet>
                        </ul>
                    </Section>

                    <Section number="13" title="Cross-Border Data Transfer">
                        <p>Where data is transferred outside Nigeria:</p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>Adequate safeguards will be implemented</Bullet>
                            <Bullet>Transfers will comply with applicable legal requirements</Bullet>
                        </ul>
                    </Section>

                    <Section number="14" title="Policy Updates">
                        <p>This policy may be updated periodically. Users will be notified where necessary.</p>
                    </Section>

                    <Section number="15" title="Contact Information">
                        <p>
                            For any data protection concerns or requests, contact{' '}
                            <a href="mailto:Ababalola@uacfoodsng.com" className="text-[var(--brand-red)] hover:underline font-semibold">
                                Ababalola@uacfoodsng.com
                            </a>.
                        </p>
                    </Section>
                </div>
            </div>
        </div>
    )
}

export default DataProtection
