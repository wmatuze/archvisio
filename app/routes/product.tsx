import type { Route } from "./+types/product";
import Navbar from "../../components/Navbar";
import { RENDER_STYLES } from "../../lib/constants";
import { Upload, Cpu, Image, ArrowRight } from "lucide-react";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Product — ArchVisio" },
        { name: "description", content: "AI-powered floor plan to 3D render pipeline. See how ArchVisio works." },
    ];
}

export default function Product() {
    const steps = [
        {
            icon: <Upload size={22} />,
            title: "Upload your floor plan",
            description: "Drop any 2D floor plan — JPG or PNG. ArchVisio reads walls, doors, windows, and fixture symbols automatically.",
        },
        {
            icon: <Cpu size={22} />,
            title: "AI generates a 3D render",
            description: "Our model converts the plan into a photorealistic top-down architectural visualization with accurate materials and lighting.",
        },
        {
            icon: <Image size={22} />,
            title: "Export and iterate",
            description: "Download high-resolution renders, switch between design styles, and regenerate until it's perfect.",
        },
    ];

    return (
        <div className="page-shell">
            <Navbar />

            <section className="page-hero">
                <span className="page-label">Product</span>
                <h1>From sketch to render in seconds</h1>
                <p className="page-subtitle">
                    ArchVisio uses AI to transform 2D floor plans into photorealistic
                    3D architectural visualizations — no 3D modeling experience needed.
                </p>
            </section>

            <section className="product-steps">
                <h2>How it works</h2>

                <div className="steps-grid">
                    {steps.map((step, i) => (
                        <div key={i} className="step-card">
                            <div className="step-number">{String(i + 1).padStart(2, "0")}</div>
                            <div className="step-icon">{step.icon}</div>
                            <h3>{step.title}</h3>
                            <p>{step.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="product-styles">
                <h2>Render styles</h2>
                <p className="section-subtitle">
                    Choose from five curated design styles — each one changes materials,
                    furniture, lighting, and color palette.
                </p>

                <div className="styles-grid">
                    {RENDER_STYLES.map((style) => (
                        <div key={style.id} className="style-card">
                            <h3>{style.label}</h3>
                            <p>{style.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="product-cta">
                <h2>Ready to try it?</h2>
                <p>Upload your first floor plan and see the result in under a minute.</p>
                <a href="/#upload" className="cta-btn">
                    Get Started <ArrowRight size={16} />
                </a>
            </section>
        </div>
    );
}

