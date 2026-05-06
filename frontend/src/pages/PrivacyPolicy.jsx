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

const PrivacyPolicy = () => {
    useEffect(() => {
        document.title = 'Privacy Notice | UAC Foods'
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="bg-[var(--bg-primary)] min-h-screen pt-40 pb-40 font-['Sen',sans-serif]">
            <div className="max-w-3xl mx-auto px-6">
                <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-16">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--brand-red)] mb-4 block">Legal</span>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-[var(--text-primary)] mb-6">
                        Website Privacy<br />Notice
                    </h1>
                    <p className="text-[13px] text-[var(--text-muted)]">In compliance with the Nigeria Data Protection Act 2023 and GAID 2025</p>
                </motion.div>

                <div className="space-y-2">
                    <Section number="1" title="Overview">
                        <p>
                            This Privacy Notice provides information on how UAC Foods Limited collects and processes your personal data when you visit our website and other related platforms ("Site"). It sets out what we do with your personal data and how we keep it secure and explains the rights that you have in relation to your personal data.
                        </p>
                    </Section>

                    <Section number="2" title="Who We Are">
                        <p>
                            UAC Foods Limited ("UAC Foods", "Company", "we", "us" or "our") is a subsidiary of UAC of Nigeria PLC. The Company is a leading manufacturer and marketer of packaged foods and beverages in Nigeria.
                        </p>
                    </Section>

                    <Section number="3" title="Nature of Personal Data We Collect and Process">
                        <p>UAC Foods collects the following personal data directly from you when you register your personal details on our Site:</p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>Contact details such as your full name, postal addresses, phone numbers and email addresses</Bullet>
                            <Bullet>Demographic information such as your date of birth and gender</Bullet>
                            <Bullet>Online registration information such as your password and other authentication information</Bullet>
                            <Bullet>Payment details such as your credit card information and billing address</Bullet>
                            <Bullet>In certain cases, your marketing preferences</Bullet>
                        </ul>
                        <p className="mt-3">We automatically collect and store certain types of information regarding your use of our Site including information about your searches, views, downloads and purchases.</p>
                    </Section>

                    <Section number="4" title="Use of Your Personal Data">
                        <p>We may use your personal data collected on our Site:</p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>To register and onboard you as a new user</Bullet>
                            <Bullet>To process and respond to your needs on our platform</Bullet>
                            <Bullet>To manage your relationship with us</Bullet>
                            <Bullet>To improve our website functionalities, products and services</Bullet>
                            <Bullet>To comply with our legal and regulatory obligations, including verifying your identity where necessary</Bullet>
                            <Bullet>To prevent, detect and manage risk against fraud and illegal activities</Bullet>
                            <Bullet>Any other purpose that we disclose to you in the course of providing products and services to you</Bullet>
                        </ul>
                    </Section>

                    <Section number="5" title="Legal Basis for the Processing of Your Personal Data">
                        <p>We are committed to ensuring that we legally process your personal data in our custody. UAC Foods Limited shall only process your personal data if at least one of the following conditions apply:</p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>You have given your consent to the processing of your personal data for one or more specific purposes</Bullet>
                            <Bullet>The processing is necessary for the performance of a contract to which you are a party or in order to take steps at your request prior to entering into a contract</Bullet>
                            <Bullet>Processing is necessary for compliance with a legal obligation to which UAC Foods Limited is subject</Bullet>
                            <Bullet>Processing is necessary in order to protect your vital interests or that of another natural person</Bullet>
                            <Bullet>Processing is necessary for the purpose of the legitimate interest pursued by UAC Foods Limited, or by a third party to whom the data is disclosed subject to certain conditions</Bullet>
                            <Bullet>Processing is necessary for the performance of a task carried out in the public interest or in exercise of official public mandate vested in UAC Foods Limited</Bullet>
                        </ul>
                    </Section>

                    <Section number="6" title="Sharing of Your Personal Data with Third Parties">
                        <p>We may need to share your personal data with third parties under the following circumstances:</p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>To enable us provide our services to you, end to end</Bullet>
                            <Bullet>To analyze data, provide marketing assistance, process payments, transmit content, and provide customer service</Bullet>
                            <Bullet>To comply with applicable laws and regulations or to respond to valid legal process, including from law enforcement or other government agencies</Bullet>
                            <Bullet>To protect the rights of our customers, operate and maintain the security of our systems and networks to ensure the preservation of life and property and prevention of fraud and cyberattack</Bullet>
                            <Bullet>To protect the rights or property of UAC Foods Limited or others, including enforcing our agreements, terms, and policies</Bullet>
                        </ul>
                    </Section>

                    <Section number="7" title="Transfer of Personal Data Abroad">
                        <p>
                            UAC Foods shall implement appropriate safeguards to ensure the security of personal data to be transferred to a foreign country in compliance with the provision of the Nigeria Data Protection Act 2023 ("NDPA") and the General Application and Implementation Directive 2025 ("GAID") or any other applicable data protection legislation. In particular, we shall, among other things, enter into Data Processing Agreements with the recipients of such personal data in the foreign country to ensure protection of your personal data.
                        </p>
                        <p>
                            Where personal data is to be transferred to a recipient in a foreign country deemed to have inadequate data protection laws, UAC Foods Limited will take all necessary steps to ensure that informed consent is obtained from you, and you are aware of the risks inherent including ensuring that personal data is transmitted in a safe and secure manner.
                        </p>
                    </Section>

                    <Section number="8" title="Data Security and Retention">
                        <p>
                            We take the security of your personal data in our possession seriously. In line with our commitment to protecting your personal data in our possession, we have developed appropriate organizational, technical and physical measures to protect the personal data you provide, or we collect against unauthorized access, loss or theft, as well as against any risk of loss, disclosure, copying, misuse or modification. Such measures include but are not limited to the use of secure servers, firewall, multiple factor authentication security, data anonymization and pseudonymization (as may be necessary), data encryption and granting access on a need-to-know basis only to employees in order to perform their job responsibilities.
                        </p>
                        <p>UAC Foods Limited will only retain your personal data under the following circumstances:</p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>As long as reasonably necessary for the purpose of providing our services to you</Bullet>
                            <Bullet>For the period needed to comply with our legal and statutory obligations under applicable law</Bullet>
                        </ul>
                    </Section>

                    <Section number="9" title="Your Rights in Relation to Your Personal Data">
                        <p>Users of our Site are entitled to exercise the following rights in relation to their personal data collected and processed by UAC Foods Limited:</p>
                        <ul className="space-y-2 mt-2">
                            <Bullet>Right to withdraw consent in relation to the processing of your personal data</Bullet>
                            <Bullet>Right to be informed regarding your personal data</Bullet>
                            <Bullet>Right to request for and access any personal data collected and stored by UAC Foods Limited</Bullet>
                            <Bullet>Right to request the deletion of your data</Bullet>
                            <Bullet>Right to be informed about appropriate safeguards in place where data is transferred abroad</Bullet>
                            <Bullet>Right to request rectification of personal data which is stored by UAC Foods Limited</Bullet>
                            <Bullet>Right to request the transmission of data from UAC Foods Limited to a third party (right to the portability of data)</Bullet>
                            <Bullet>Right to object to automated decision making and processing</Bullet>
                            <Bullet>Right to object to direct marketing</Bullet>
                            <Bullet>Right to lodge a complaint with the NDPC</Bullet>
                            <Bullet>Right to request the processing of your information</Bullet>
                        </ul>
                    </Section>

                    <Section number="10" title="Review of Our Privacy Notice">
                        <p>
                            We may need to review and make necessary updates, modifications or amendments to our Privacy Notice to ensure compliance with applicable data protection legislations including the NDPA and GAID or as a result of changes in our systems and processes arising from the use of technology. We will notify you of any material changes in the way we collect and process your personal data on our website by placing a notice online or via email. Your continuous use of our services after such notice will be construed as your consent to carry on with the processing of your personal data.
                        </p>
                    </Section>

                    <Section number="11" title="Dispute Resolution and Complaint Handling">
                        <p>
                            In line with our objective of creating a rewarding customer experience on our website and mobile application, UAC Foods Limited has developed a dispute resolution and complaint handling process to ensure the effective management and timely resolution of all complaints relating to this Privacy Notice. In the event that you have any complaint regarding this Privacy Notice, please send us an email via{' '}
                            <a href="mailto:DPO@uacfoodsng.com" className="text-[var(--brand-red)] hover:underline font-semibold">
                                DPO@uacfoodsng.com
                            </a>. We will investigate and work towards ensuring the prompt resolution of all disputes and complaints relating to the use and disclosure of personal data in line with the provisions of the NDPA and the GAID.
                        </p>
                        <p>In the event that the outcome of the resolution of your complaint is unsatisfactory, you are at liberty to lodge a complaint to the Nigeria Data Protection Commission (NDPC).</p>
                    </Section>

                    <Section number="12" title="Contact Details of Our Data Protection Officer (DPO)">
                        <p>
                            In the event that you have any questions or inquiries relating to the collection and processing of your personal data on our website or the exercise of your rights as a data subject under the NDPA and GAID, please send an email to our DPO via{' '}
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

export default PrivacyPolicy
