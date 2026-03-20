export const PUTER_WORKER_URL = import.meta.env.VITE_PUTER_WORKER_URL || "";

// Storage Paths
export const STORAGE_PATHS = {
    ROOT: "archvisio",
    SOURCES: "archvisio/sources",
    RENDERS: "archvisio/renders",
} as const;

// Timing Constants (in milliseconds)
export const SHARE_STATUS_RESET_DELAY_MS = 1500;
export const PROGRESS_INCREMENT = 15;
export const REDIRECT_DELAY_MS = 600;
export const PROGRESS_INTERVAL_MS = 100;
export const PROGRESS_STEP = 5;

// UI Constants
export const GRID_OVERLAY_SIZE = "24px 24px";
export const GRID_COLOR = "#94a3b8";

// HTTP Status Codes
export const UNAUTHORIZED_STATUSES = [401, 403];

// Image Dimensions
export const IMAGE_RENDER_DIMENSION = 1024;

// ── Render Styles ──────────────────────────────────────────────────
export type RenderStyleId =
    | "modern"
    | "scandinavian"
    | "industrial"
    | "luxury"
    | "minimalist";

export interface RenderStyle {
    id: RenderStyleId;
    label: string;
    description: string;
    /** Style-specific prompt fragment injected into the LIGHTING & STYLE section */
    promptFragment: string;
}

export const RENDER_STYLES: RenderStyle[] = [
    {
        id: "modern",
        label: "Modern",
        description: "Clean lines, neutral tones, contemporary furnishings",
        promptFragment: `
   - Light source: bright, neutral daylight from upper-left direction.
   - Shadows: soft, subtle, and consistent in direction.
   - Materials: realistic with subtle texture variation. Wood shows plank
     lines, tile shows grout lines, walls have very subtle surface variation.
   - Color palette: natural, warm, and inviting. Neutral tones with
     occasional muted accent colors. Avoid over-saturation.
   - Furniture style: contemporary clean-lined pieces. Simple geometric
     forms, slim profiles, and understated elegance.`,
    },
    {
        id: "scandinavian",
        label: "Scandinavian",
        description: "Light woods, cozy textures, bright airy spaces",
        promptFragment: `
   - Light source: soft, bright daylight flooding in from upper-left.
   - Shadows: very soft and diffused, emphasizing airiness.
   - Materials: light birch or ash wood floors with pale grain. Walls in
     clean white or soft off-white. Textiles with woven or knit textures.
   - Color palette: whites, pale grays, soft pastels, and light natural
     wood tones. Occasional warm accents (mustard, blush, sage).
   - Furniture style: organic rounded forms, tapered wooden legs, cozy
     throws and cushions. Hygge-inspired warmth and simplicity.`,
    },
    {
        id: "industrial",
        label: "Industrial",
        description: "Exposed brick, metal accents, raw textures",
        promptFragment: `
   - Light source: warm tungsten-tinted daylight from upper-left.
   - Shadows: slightly harder and more defined, adding drama.
   - Materials: exposed red/brown brick on accent walls, polished concrete
     or dark stained wood floors, visible metal fixtures and hardware.
     Matte black metal framing on furniture and shelving.
   - Color palette: warm grays, charcoal, rust, aged brown, black metal.
     Raw and earthy with warm undertones.
   - Furniture style: reclaimed wood surfaces, metal-frame pieces, leather
     upholstery, vintage-industrial lighting fixtures.`,
    },
    {
        id: "luxury",
        label: "Luxury",
        description: "Premium materials, rich finishes, elegant details",
        promptFragment: `
   - Light source: warm, golden-hour daylight from upper-left.
   - Shadows: refined and controlled, adding depth without harshness.
   - Materials: polished marble or herringbone hardwood floors. Walls with
     subtle textured wallpaper or venetian plaster finish. Brushed gold
     or polished chrome hardware and fixtures.
   - Color palette: deep navy, emerald, burgundy accents against cream,
     ivory, and champagne base tones. Rich and sophisticated.
   - Furniture style: high-end designer pieces with plush velvet or silk
     upholstery, tufted details, sculptural forms, statement lighting.`,
    },
    {
        id: "minimalist",
        label: "Minimalist",
        description: "Ultra-clean, monochrome, essential forms only",
        promptFragment: `
   - Light source: crisp, pure white daylight from upper-left.
   - Shadows: extremely subtle, almost flat lighting.
   - Materials: smooth matte white walls, light concrete or pale wood
     floors with minimal grain. Seamless surfaces with no ornamentation.
   - Color palette: strict white, off-white, light gray, and black.
     No accent colors. Monochromatic purity.
   - Furniture style: absolute essentials only. Ultra-simple geometric
     forms, no decorative elements, hidden storage, flush surfaces.`,
    },
];

export const DEFAULT_STYLE_ID: RenderStyleId = "modern";

// ── Prompt builder ────────────────────────────────────────────────

const PROMPT_BASE_BEFORE_STYLE = `
TASK: Convert the input 2D floor plan into a photorealistic, top-down 3D
architectural render.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRICT REQUIREMENTS (never violate these):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1) REMOVE ALL TEXT:
   - Do not render any letters, numbers, labels, dimensions, annotations,
     title blocks, legends, watermarks, logos, or scale bars.
   - Where text occupied floor space, fill seamlessly with the same floor
     material as the surrounding room. No blank patches or artifacts.

2) GEOMETRY MUST MATCH EXACTLY:
   - The output footprint (outer boundary) must replicate the input plan
     precisely. If the plan is L-shaped, T-shaped, U-shaped, or has
     notches/cutouts/extensions, preserve them exactly.
   - Do NOT regularize irregular shapes into rectangles or simplify the
     outline.
   - Count every distinct enclosed room in the input. The output must
     contain the SAME number of rooms in the SAME positions with the
     SAME proportional sizes.
   - Wall junctions, corners, and offsets must align to the source plan.
     Do not shift, resize, merge, or split any room.

3) TOP-DOWN VIEW:
   - Overhead camera at approximately 85–90° looking straight down.
   - Walls should show a slight visible top surface (approximately
     20–30 cm depth cue) so the render reads as 3D, but the view
     must remain essentially orthographic overhead.
   - No dramatic perspective tilt, no isometric angle, no vanishing
     points.

4) CLEAN, REALISTIC OUTPUT:
   - Crisp edges, balanced lighting, realistic materials.
   - No sketch, cartoon, watercolor, or hand-drawn aesthetic.
   - No noise, grain, or low-resolution artifacts.

5) NO EXTRA CONTENT:
   - Do not add rooms, furniture, landscaping, people, vehicles, or
     objects that are not clearly indicated by symbols/icons in the
     source plan.

6) SCHEMATIC SYMBOLS ARE NOT PHYSICAL GEOMETRY:
   - Door swing arcs, dimension lines, dimension arrows, north arrows,
     center lines, dashed construction lines, grid lines, and other
     drafting symbols must be interpreted semantically.
   - They must NEVER be rendered as physical walls, floors, surfaces,
     curved structures, or any visible 3D geometry.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRUCTURE & DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WALLS:
   - Extrude walls precisely from the plan's wall lines.
   - Maintain consistent wall height and realistic thickness throughout.
   - Interpret double parallel lines as ONE wall with thickness, not two
     separate walls.
   - Wall material: clean, smooth painted surface (white or light gray).
   - Wall tops should be flat and uniform.

DOORS (CRITICAL — read carefully):
   - In 2D floor plans, doors are represented by a straight line (the door
     leaf) attached to a quarter-circle arc (the swing path).
   - Step 1: Identify every door symbol by finding quarter-circle arcs
     connected to wall openings.
   - Step 2: COMPLETELY REMOVE the quarter-circle arc. Do NOT render it
     as a curved wall, curved floor marking, raised surface, ramp, or
     any physical object.
   - Step 3: Identify the hinge point (where the arc's straight edge
     meets the wall).
   - Step 4: Render a realistic rectangular door panel (leaf) positioned
     at approximately 90° open, resting flush against the wall on the
     hinge side.
   - Step 5: Include a visible door frame/trim around the opening.
   - Door material: realistic painted wood with subtle grain texture.
   - The floor beneath and around the door must be clean and continuous —
     no arc imprint, no curved shadow, no residual geometry.
   - If a double door is indicated (two arcs mirrored), render both
     panels open at 90° in opposite directions.

WINDOWS:
   - Identify window symbols: typically short parallel lines breaking an
     exterior wall, sometimes with a center line indicating glass.
   - Do NOT convert every thin wall line into a window. Only lines that
     clearly match window symbol conventions should become windows.
   - Render as recessed glass panes set within the wall thickness.
   - Glass material: slight blue-green tint with subtle reflection and
     transparency.
   - Include thin, visible frame/mullion lines so windows are clearly
     distinguishable from wall gaps or door openings.

DIAGONAL & ANGLED ELEMENTS:
   - Thick diagonal lines at wall-weight thickness → render as angled walls.
   - Thin diagonal lines within rooms → interpret as countertops, island
     edges, or furniture boundaries.
   - Dashed diagonal lines → overhead/ceiling elements; do not render or
     render very subtly as a faint shadow on the floor.
   - When ambiguous, default to a standard-thickness wall and maintain
     the exact angle from the source plan.

STAIRS (if present):
   - Parallel lines within a rectangular boundary indicate stairs.
   - Render as realistic steps with visible treads and risers.
   - Arrow indicates direction of ascent.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FURNITURE & FIXTURE MAPPING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(Only render where icons/fixture symbols are clearly shown in the plan)

   - Bed icon → realistic bed with duvet/comforter and pillows, matching
     the icon's size and orientation.
   - Sofa icon → modern sofa or sectional, matching icon position.
   - Dining table icon → table with chairs arranged around it.
   - Kitchen fixtures → countertops along indicated walls, sink where
     sink symbol appears, stove/range where burner symbol appears.
     If a kitchen island line exists, render as a countertop island.
   - Bathroom fixtures → toilet where toilet symbol appears, sink/vanity
     where basin symbol appears, bathtub where tub rectangle appears,
     shower where shower tray symbol appears.
   - Office/study icon → desk, office chair, and minimal shelving.
   - Porch/patio/balcony → if furniture icons exist, add minimal outdoor
     seating. If only horizontal lines (decking), render as bare deck
     with wood plank flooring.
   - Utility/laundry icon → washer/dryer units and minimal cabinetry.
   - Closet → leave as empty recessed space with shelf line if indicated.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FLOOR MATERIAL MAPPING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   - Bedrooms, living rooms, family rooms → warm wood flooring
     (medium oak or walnut tone, visible plank grain).
   - Kitchens → light tile, stone, or subtle linoleum.
   - Bathrooms → light ceramic tile (white, cream, or light gray).
   - Laundry/utility rooms → light tile or concrete.
   - Hallways/corridors → match the dominant adjacent room material,
     or use neutral wood.
   - Porch/patio/balcony/deck → wood plank decking (slightly weathered
     tone), stone, or concrete pavers.
   - Garage (if present) → smooth gray concrete.
   - Ensure clear material transitions at room boundaries (subtle
     threshold line where materials change).`;

const PROMPT_AFTER_STYLE = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXTERIOR & BACKGROUND:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   - Areas outside the floor plan boundary: render as a clean, neutral
     background (soft white, light gray, or very subtle ground plane).
   - Do NOT add grass, trees, landscaping, driveways, neighboring
     buildings, or terrain unless explicitly shown in the plan.
   - If the plan shows an exterior feature (deck, patio, porch), render
     it but do not extend beyond what is drawn.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL OUTPUT CHECKLIST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   ☐ Zero text, labels, or annotations visible anywhere
   ☐ Building footprint exactly matches input plan shape
   ☐ Room count matches input plan
   ☐ All door arcs removed; door panels shown open at ~90°
   ☐ Windows show glass material, clearly distinguishable from openings
   ☐ No curved wall remnants from door swing arcs
   ☐ Floor materials are room-appropriate and seamless
   ☐ Orthographic top-down view maintained
   ☐ Professional architectural visualization quality
   ☐ No watermarks, logos, or UI elements
   ☐ Single image output matching input plan's aspect ratio`;

/**
 * Build the full render prompt for a given style.
 * Falls back to `DEFAULT_STYLE_ID` if the id is not found.
 */
export const buildRenderPrompt = (styleId: RenderStyleId = DEFAULT_STYLE_ID): string => {
    const style = RENDER_STYLES.find((s) => s.id === styleId) ?? RENDER_STYLES[0];

    return [
        PROMPT_BASE_BEFORE_STYLE,
        `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nLIGHTING & STYLE (${style.label}):\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        style.promptFragment,
        PROMPT_AFTER_STYLE,
    ].join("\n").trim();
};

/** @deprecated Use buildRenderPrompt(styleId) instead */
export const ARCHVISIO_RENDER_PROMPT = buildRenderPrompt(DEFAULT_STYLE_ID);
