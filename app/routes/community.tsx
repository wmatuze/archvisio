import type { Route } from "./+types/community";
import Navbar from "../../components/Navbar";
import { Users, MessageSquare, Share2, ArrowRight, Clock, ArrowUpRight, ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublicProjects } from "../../lib/puter.action";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Community — ArchVisio" },
        { name: "description", content: "Join the ArchVisio community. Share renders, get feedback, and learn from other architects and designers." },
    ];
}

export default function Community() {
    const navigate = useNavigate();
    const [publicProjects, setPublicProjects] = useState<DesignItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPublic = async () => {
            setIsLoading(true);
            const items = await getPublicProjects();
            setPublicProjects(items);
            setIsLoading(false);
        };
        fetchPublic();
    }, []);

    const highlights = [
        {
            icon: <Share2 size={20} />,
            title: "Share your work",
            description:
                "Publish renders to the community gallery and get visibility for your projects.",
        },
        {
            icon: <MessageSquare size={20} />,
            title: "Get feedback",
            description:
                "Comment on renders, share tips on style choices, and learn from other designers.",
        },
        {
            icon: <Users size={20} />,
            title: "Grow together",
            description:
                "Connect with architects, interior designers, and visualization artists worldwide.",
        },
    ];

    return (
        <div className="page-shell">
            <Navbar />

            <section className="page-hero">
                <span className="page-label">Community</span>
                <h1>Built by architects, for architects</h1>
                <p className="page-subtitle">
                    A growing community of designers sharing renders, exchanging
                    feedback, and pushing the boundaries of AI-assisted visualization.
                </p>
            </section>

            <section className="community-highlights">
                <div className="highlights-grid">
                    {highlights.map((h, i) => (
                        <div key={i} className="highlight-card">
                            <div className="highlight-icon">{h.icon}</div>
                            <h3>{h.title}</h3>
                            <p>{h.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="community-gallery">
                <div className="section-bar">
                    <h2>Community Gallery</h2>
                    <span className="count">
                        {isLoading ? '...' : `${publicProjects.length} shared`}
                    </span>
                </div>

                {isLoading ? (
                    <div className="gallery-grid">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="gallery-card skeleton" />
                        ))}
                    </div>
                ) : publicProjects.length > 0 ? (
                    <div className="gallery-grid">
                        {publicProjects.map(({ id, name, renderedImage, sourceImage, timestamp, sharedBy }) => (
                            <div
                                key={id}
                                className="gallery-card group"
                                onClick={() => navigate(`/visualizer/${id}`)}
                            >
                                <div className="preview">
                                    {renderedImage || sourceImage ? (
                                        <img src={renderedImage || sourceImage} alt={name || 'Render'} />
                                    ) : (
                                        <div className="preview-placeholder">
                                            <ImageIcon size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="card-body">
                                    <div className="card-info">
                                        <h3>{name || 'Untitled'}</h3>
                                        <div className="meta">
                                            {sharedBy && <span className="author">by {sharedBy}</span>}
                                            <Clock size={12} />
                                            <span>{new Date(timestamp).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="arrow">
                                        <ArrowUpRight size={16} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="coming-soon-card">
                        <h3>No shared projects yet</h3>
                        <p>
                            Be the first to share a render with the community!
                            Create a project and use the Share button in the editor.
                        </p>
                        <a href="/#upload" className="cta-btn">
                            Create a Project <ArrowRight size={16} />
                        </a>
                    </div>
                )}
            </section>
        </div>
    );
}

