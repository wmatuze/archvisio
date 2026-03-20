import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import {ArrowRight, ArrowUpRight, Clock, Layers} from "lucide-react";
import Upload from "../../components/Upload";
import {useNavigate} from "react-router";
import {useEffect, useRef, useState} from "react";
import {createProject, getProjects} from "../../lib/puter.action";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ArchVisio" },
    { name: "description", content: "Welcome to ArchVisio 1.0" },
  ];
}

export default function Home() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<DesignItem[]>([]);
    const isCreatingProjectRef = useRef(false);

    const handleUploadComplete = async (base64Image: string) => {
        try {

            if(isCreatingProjectRef.current) return false;
            isCreatingProjectRef.current = true;
            const newId = Date.now().toString();
            const name = `Residence ${newId}`;

            const newItem = {
                id: newId, name, sourceImage: base64Image,
                renderedImage: undefined,
                timestamp: Date.now()
            }

            const saved = await createProject({ item: newItem, visibility: 'private' });

            if(!saved) {
                console.error("Failed to create project");
                return false;
            }

            setProjects((prev) => [saved, ...prev]);

            navigate(`/visualizer/${newId}`, {
                state: {
                    initialImage: saved.sourceImage,
                    initialRendered: saved.renderedImage || null,
                    name
                }
            });

            return true;
        } finally {
            isCreatingProjectRef.current = false;
        }
    }

    useEffect(() => {
        const fetchProjects = async () => {
            const items = await getProjects();

            setProjects(items)
        }

        fetchProjects();
    }, []);

  return (
      <div className="home">
          <Navbar />

          <section className="hero">
              <div className="hero-text">
                  <span className="announce">
                      <span className="pulse-dot" />
                      Public Beta
                  </span>

                  <h1>Turn floor plans into photorealistic renders</h1>

                  <p className="subtitle">
                      Upload any 2D floor plan and AI transforms it into a
                      stunning 3D architectural visualization — no modeling
                      skills required.
                  </p>

                  <div className="actions">
                      <a href="#upload" className="cta">
                          Get Started <ArrowRight className="icon" />
                      </a>

                      <a href="#projects" className="secondary-link">
                          View your projects <ArrowUpRight size={14} />
                      </a>
                  </div>
              </div>

              <div id="upload" className="hero-upload">
                  <div className="upload-label">
                      <Layers size={18} className="upload-label-icon" />
                      <span>Upload a floor plan</span>
                  </div>

                  <Upload onComplete={handleUploadComplete} />

                  <p className="upload-hint">Supports JPG &amp; PNG up to 10 MB</p>
              </div>
          </section>

          {projects.length > 0 && (
              <section id="projects" className="projects">
                  <div className="section-bar">
                      <h2>Your Projects</h2>
                      <span className="count">{projects.length} total</span>
                  </div>

                  <div className="projects-grid">
                      {projects.map(({id, name, renderedImage, sourceImage, timestamp}, index) => (
                          <div
                              key={id}
                              className={`project-card group ${index === 0 ? 'featured' : ''}`}
                              onClick={() => navigate(`/visualizer/${id}`)}
                          >
                              <div className="preview">
                                  <img src={renderedImage || sourceImage} alt={name} />
                              </div>

                              <div className="card-body">
                                  <div className="card-info">
                                      <h3>{name}</h3>
                                      <div className="meta">
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
              </section>
          )}
      </div>
  )
}
