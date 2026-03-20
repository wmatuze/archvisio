import { useNavigate, useOutletContext, useParams} from "react-router";
import {useEffect, useRef, useState} from "react";
import {generate3DView} from "../../lib/ai.action";
import {AlertCircle, Box, Check, Download, Palette, RefreshCcw, Share2, X} from "lucide-react";
import Button from "../../components/ui/Button";
import {createProject, getProjectById} from "../../lib/puter.action";
import {ReactCompareSlider, ReactCompareSliderImage} from "react-compare-slider";
import {DEFAULT_STYLE_ID, RENDER_STYLES, SHARE_STATUS_RESET_DELAY_MS, type RenderStyleId} from "../../lib/constants";

const VisualizerId = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userId } = useOutletContext<AuthContext>()

    const hasInitialGenerated = useRef(false);

    const [project, setProject] = useState<DesignItem | null>(null);
    const [isProjectLoading, setIsProjectLoading] = useState(true);

    const [isProcessing, setIsProcessing] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [selectedStyle, setSelectedStyle] = useState<RenderStyleId>(DEFAULT_STYLE_ID);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [shareStatus, setShareStatus] = useState<ShareStatus>('idle');

    const handleBack = () => navigate('/');
    const handleExport = () => {
        if (!currentImage) return;

        const link = document.createElement('a');
        link.href = currentImage;
        link.download = `archvisio-${id || 'design'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handleShare = async () => {
        if (!project || !currentImage || shareStatus === 'saving') return;

        const nextPublic = !project.isPublic;
        setShareStatus('saving');

        try {
            const updatedItem: DesignItem = {
                ...project,
                isPublic: nextPublic,
                sharedBy: nextPublic ? (userId ?? project.sharedBy ?? null) : null,
                sharedAt: nextPublic ? new Date().toISOString() : null,
            };

            const saved = await createProject({
                item: updatedItem,
                visibility: nextPublic ? 'public' : 'private',
            });

            if (saved) {
                setProject(saved);
                setShareStatus('done');

                if (nextPublic && saved.publicPath) {
                    await navigator.clipboard.writeText(saved.publicPath);
                }
            }
        } catch (e) {
            console.error('Share failed:', e);
        } finally {
            setTimeout(() => setShareStatus('idle'), SHARE_STATUS_RESET_DELAY_MS);
        }
    };

    const runGeneration = async (item: DesignItem, style: RenderStyleId = selectedStyle) => {
        if(!id || !item.sourceImage) return;

        try {
            setIsProcessing(true);
            setGenerationError(null);
            const result = await generate3DView({ sourceImage: item.sourceImage, style });

            if(result.renderedImage) {
                setCurrentImage(result.renderedImage);

                const updatedItem = {
                    ...item,
                    renderedImage: result.renderedImage,
                    renderedPath: result.renderedPath,
                    timestamp: Date.now(),
                    ownerId: item.ownerId ?? userId ?? null,
                    isPublic: item.isPublic ?? false,
                }

                const saved = await createProject({ item: updatedItem, visibility: "private" })

                if(saved) {
                    setProject(saved);
                    setCurrentImage(saved.renderedImage || result.renderedImage);
                }
            }
        } catch (error) {
            console.error('Generation failed: ', error);
            setGenerationError('Rendering failed. Please try again or choose a different style.');
        } finally {
            setIsProcessing(false);
        }
    }

    useEffect(() => {
        let isMounted = true;

        const loadProject = async () => {
            if (!id) {
                setIsProjectLoading(false);
                return;
            }

            setIsProjectLoading(true);

            const fetchedProject = await getProjectById({ id });

            if (!isMounted) return;

            setProject(fetchedProject);
            setCurrentImage(fetchedProject?.renderedImage || null);
            setIsProjectLoading(false);
            hasInitialGenerated.current = false;
        };

        loadProject();

        return () => {
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {
        if (
            isProjectLoading ||
            hasInitialGenerated.current ||
            !project?.sourceImage
        )
            return;

        if (project.renderedImage) {
            setCurrentImage(project.renderedImage);
            hasInitialGenerated.current = true;
            return;
        }

        hasInitialGenerated.current = true;
        void runGeneration(project);
    }, [project, isProjectLoading]);

    return (
        <div className="visualizer">
            <nav className="topbar">
                <div className="brand">
                    <Box className="logo" />

                    <span className="name">ArchVisio</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
                    <X className="icon" /> Exit Editor
                </Button>
            </nav>

            <section className="content">
                <div className="panel">
                    <div className="panel-header">
                        <div className="panel-meta">
                            <p>Project</p>
                            <h2>{project?.name || `Residence ${id}`}</h2>
                            <p className="note">Created by You</p>
                        </div>

                        <div className="panel-actions">
                            <div className="style-selector">
                                <Palette className="style-icon" />
                                <select
                                    value={selectedStyle}
                                    onChange={(e) => setSelectedStyle(e.target.value as RenderStyleId)}
                                    disabled={isProcessing}
                                    className="style-select"
                                >
                                    {RENDER_STYLES.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => project && runGeneration(project)}
                                className="regenerate"
                                disabled={isProcessing || !project?.sourceImage}
                            >
                                <RefreshCcw className="w-4 h-4 mr-2" /> Re-render
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleExport}
                                className="export"
                                disabled={!currentImage}
                            >
                                <Download className="w-4 h-4 mr-2" /> Export
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleShare}
                                className={`share ${project?.isPublic ? 'is-shared' : ''}`}
                                disabled={shareStatus === 'saving' || !currentImage}
                            >
                                {shareStatus === 'done' ? (
                                    <><Check className="w-4 h-4 mr-2" /> {project?.isPublic ? 'Shared!' : 'Unshared'}</>
                                ) : shareStatus === 'saving' ? (
                                    <><RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                                ) : project?.isPublic ? (
                                    <><Share2 className="w-4 h-4 mr-2" /> Unshare</>
                                ) : (
                                    <><Share2 className="w-4 h-4 mr-2" /> Share</>
                                )}
                            </Button>
                        </div>
                    </div>

                    {generationError && (
                        <div className="render-error">
                            <AlertCircle size={16} />
                            <span>{generationError}</span>
                            <button onClick={() => setGenerationError(null)} className="dismiss">
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <div className={`render-area ${isProcessing ? 'is-processing': ''}`}>
                        {isProjectLoading ? (
                            <div className="render-placeholder skeleton" />
                        ) : !project ? (
                            <div className="render-placeholder not-found">
                                <AlertCircle size={32} />
                                <h3>Project not found</h3>
                                <p>This project may have been deleted or the link is invalid.</p>
                                <Button size="sm" onClick={handleBack}>Back to Home</Button>
                            </div>
                        ) : currentImage ? (
                            <img src={currentImage} alt="AI Render" className="render-img" />
                        ) : (
                            <div className="render-placeholder">
                                {project?.sourceImage && (
                                    <img src={project?.sourceImage} alt="Original" className="render-fallback" />
                                )}
                            </div>
                        )}

                        {isProcessing && (
                            <div className="render-overlay">
                                <div className="rendering-card">
                                    <RefreshCcw className="spinner" />
                                    <span className="title">Rendering...</span>
                                    <span className="subtitle">Generating your 3D visualization</span>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                <div className="panel compare">
                    <div className="panel-header">
                        <div className="panel-meta">
                            <p>Comparison</p>
                            <h3>Before and After</h3>
                        </div>
                        <div className="hint">Drag to compare</div>
                    </div>

                    <div className="compare-stage">
                        {project?.sourceImage && currentImage ? (
                            <ReactCompareSlider
                                defaultValue={50}
                                style={{ width: '100%', height: 'auto' }}
                                itemOne={
                                    <ReactCompareSliderImage src={project?.sourceImage} alt="before" className="compare-img" />
                                }
                                itemTwo={
                                    <ReactCompareSliderImage src={currentImage || project?.renderedImage} alt="after" className="compare-img" />
                                }
                            />
                        ) : (
                            <div className="compare-fallback">
                                {project?.sourceImage && (
                                    <img src={project.sourceImage} alt="Before" className="compare-img" />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
export default VisualizerId
