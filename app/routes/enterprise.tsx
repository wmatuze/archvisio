import type { Route } from "./+types/enterprise";
import Navbar from "../../components/Navbar";
import { Building2, Lock, Zap, Headphones, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { submitEnterpriseInquiry } from "../../lib/puter.action";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Enterprise — ArchVisio" },
        { name: "description", content: "ArchVisio for teams and organizations. Custom integrations, dedicated support, and volume pricing." },
    ];
}

export default function Enterprise() {
    const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const errors: Record<string, string> = {};
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.email.trim()) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Enter a valid email';
        if (!formData.company.trim()) errors.company = 'Company name is required';
        return errors;
    };

    const handleChange = (field: keyof typeof formData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        if (validationErrors[field]) {
            setValidationErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }
        setIsSubmitting(true);
        setSubmitStatus('idle');
        try {
            const ok = await submitEnterpriseInquiry(formData);
            setSubmitStatus(ok ? 'success' : 'error');
            if (ok) setFormData({ name: '', email: '', company: '', message: '' });
        } catch {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };
    const benefits = [
        {
            icon: <Zap size={20} />,
            title: "Volume rendering",
            description: "Process hundreds of floor plans per month with priority queue access and faster generation.",
        },
        {
            icon: <Lock size={20} />,
            title: "Private workspace",
            description: "All projects stay within your organization. SSO, role-based access, and audit logs included.",
        },
        {
            icon: <Building2 size={20} />,
            title: "Custom styles",
            description: "Train custom render styles that match your firm's design language and branding guidelines.",
        },
        {
            icon: <Headphones size={20} />,
            title: "Dedicated support",
            description: "A named account manager, SLA guarantees, and onboarding assistance for your team.",
        },
    ];

    return (
        <div className="page-shell">
            <Navbar />

            <section className="page-hero">
                <span className="page-label">Enterprise</span>
                <h1>ArchVisio at scale</h1>
                <p className="page-subtitle">
                    Built for architecture firms, real estate developers, and design
                    studios that need volume, security, and customization.
                </p>
            </section>

            <section className="enterprise-benefits">
                <div className="benefits-grid">
                    {benefits.map((b, i) => (
                        <div key={i} className="benefit-card">
                            <div className="benefit-icon">{b.icon}</div>
                            <h3>{b.title}</h3>
                            <p>{b.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="enterprise-contact">
                <div className="contact-card">
                    <h2>Let's talk</h2>
                    <p>
                        Tell us about your team's needs and we'll put together a plan
                        that fits. Most teams are up and running within a week.
                    </p>

                    {submitStatus === 'success' ? (
                        <div className="form-success">
                            <CheckCircle2 size={32} />
                            <h3>Thanks for reaching out!</h3>
                            <p>We'll get back to you within 1–2 business days.</p>
                        </div>
                    ) : (
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-field">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Your name"
                                        className={`form-input ${validationErrors.name ? 'has-error' : ''}`}
                                        value={formData.name}
                                        onChange={handleChange('name')}
                                        disabled={isSubmitting}
                                    />
                                    {validationErrors.name && <span className="field-error">{validationErrors.name}</span>}
                                </div>
                                <div className="form-field">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Work email"
                                        className={`form-input ${validationErrors.email ? 'has-error' : ''}`}
                                        value={formData.email}
                                        onChange={handleChange('email')}
                                        disabled={isSubmitting}
                                    />
                                    {validationErrors.email && <span className="field-error">{validationErrors.email}</span>}
                                </div>
                            </div>
                            <div className="form-field">
                                <input
                                    type="text"
                                    name="company"
                                    placeholder="Company name"
                                    className={`form-input full ${validationErrors.company ? 'has-error' : ''}`}
                                    value={formData.company}
                                    onChange={handleChange('company')}
                                    disabled={isSubmitting}
                                />
                                {validationErrors.company && <span className="field-error">{validationErrors.company}</span>}
                            </div>
                            <textarea
                                name="message"
                                placeholder="Tell us about your use case (optional)"
                                rows={4}
                                className="form-input full"
                                value={formData.message}
                                onChange={handleChange('message')}
                                disabled={isSubmitting}
                            />
                            {submitStatus === 'error' && (
                                <p className="form-error">Something went wrong. Please try again.</p>
                            )}
                            <button type="submit" className="cta-btn" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Request a Demo'} <ArrowRight size={16} />
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </div>
    );
}

