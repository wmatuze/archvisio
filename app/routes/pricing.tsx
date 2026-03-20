import type { Route } from "./+types/pricing";
import Navbar from "../../components/Navbar";
import { Check, ArrowRight } from "lucide-react";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Pricing — ArchVisio" },
        { name: "description", content: "Simple, transparent pricing for individuals and teams." },
    ];
}

const plans = [
    {
        name: "Free",
        price: "$0",
        period: "forever",
        description: "For trying things out",
        features: [
            "3 renders per month",
            "Standard resolution export",
            "2 render styles",
            "Community support",
        ],
        cta: "Get Started",
        highlighted: false,
    },
    {
        name: "Pro",
        price: "$19",
        period: "per month",
        description: "For professionals and freelancers",
        features: [
            "Unlimited renders",
            "High resolution export",
            "All 5 render styles",
            "Priority processing",
            "Project history",
            "Email support",
        ],
        cta: "Start Free Trial",
        highlighted: true,
    },
    {
        name: "Team",
        price: "$49",
        period: "per month",
        description: "For studios and agencies",
        features: [
            "Everything in Pro",
            "5 team members included",
            "Shared project workspace",
            "Brand export presets",
            "API access",
            "Dedicated support",
        ],
        cta: "Contact Sales",
        highlighted: false,
    },
];

export default function Pricing() {
    return (
        <div className="page-shell">
            <Navbar />

            <section className="page-hero">
                <span className="page-label">Pricing</span>
                <h1>Simple, transparent pricing</h1>
                <p className="page-subtitle">
                    Start for free. Upgrade when you need more renders, higher
                    resolution, or team features.
                </p>
            </section>

            <section className="pricing-grid-section">
                <div className="pricing-grid">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`plan-card ${plan.highlighted ? "highlighted" : ""}`}
                        >
                            {plan.highlighted && <span className="popular-badge">Most Popular</span>}
                            <h3>{plan.name}</h3>
                            <div className="price-row">
                                <span className="price">{plan.price}</span>
                                <span className="period">/ {plan.period}</span>
                            </div>
                            <p className="plan-desc">{plan.description}</p>

                            <ul className="feature-list">
                                {plan.features.map((f) => (
                                    <li key={f}>
                                        <Check size={14} className="check-icon" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <a
                                href="/#upload"
                                className={`plan-cta ${plan.highlighted ? "primary" : ""}`}
                            >
                                {plan.cta} <ArrowRight size={14} />
                            </a>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

