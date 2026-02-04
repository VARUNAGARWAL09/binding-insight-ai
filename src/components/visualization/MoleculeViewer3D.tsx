import { useState, useRef, useEffect } from "react";
import { RotateCcw, ZoomIn, ZoomOut, Play, Pause, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Atom {
  id: number;
  symbol: string;
  fullName: string;
  x: number;
  y: number;
  z: number;
  importance?: number;
}

interface Bond {
  from: number;
  to: number;
  strength?: number;
}

interface MoleculeViewer3DProps {
  smiles?: string;
  atomImportances?: Array<{ atom_index: number; symbol: string; importance: number }>;
  bindingAffinity?: number;
  showBinding?: boolean;
  className?: string;
}

// Full atom names - comprehensive list for drug molecules
const atomFullNames: Record<string, string> = {
  // Common organic atoms
  C: 'Carbon',
  N: 'Nitrogen',
  O: 'Oxygen',
  S: 'Sulfur',
  P: 'Phosphorus',
  H: 'Hydrogen',
  // Halogens
  F: 'Fluorine',
  Cl: 'Chlorine',
  Br: 'Bromine',
  I: 'Iodine',
  At: 'Astatine',
  // Metals commonly in drugs
  Fe: 'Iron',
  Cu: 'Copper',
  Zn: 'Zinc',
  Mg: 'Magnesium',
  Ca: 'Calcium',
  Na: 'Sodium',
  K: 'Potassium',
  Li: 'Lithium',
  Pt: 'Platinum',
  Au: 'Gold',
  Ag: 'Silver',
  Co: 'Cobalt',
  Mn: 'Manganese',
  Ni: 'Nickel',
  // Metalloids and others
  B: 'Boron',
  Si: 'Silicon',
  Se: 'Selenium',
  Te: 'Tellurium',
  As: 'Arsenic',
  Sb: 'Antimony',
  Bi: 'Bismuth',
  // Rare in drugs but possible
  Al: 'Aluminum',
  Ga: 'Gallium',
  Ge: 'Germanium',
  Sn: 'Tin',
  Pb: 'Lead',
  Ti: 'Titanium',
  V: 'Vanadium',
  Cr: 'Chromium',
  Mo: 'Molybdenum',
  W: 'Tungsten',
  Tc: 'Technetium',
  Re: 'Rhenium',
  Ru: 'Ruthenium',
  Rh: 'Rhodium',
  Pd: 'Palladium',
  Os: 'Osmium',
  Ir: 'Iridium',
  Hg: 'Mercury',
  Tl: 'Thallium',
  // Lanthanides (for contrast agents)
  Gd: 'Gadolinium',
  Eu: 'Europium',
  Tb: 'Terbium',
  Dy: 'Dysprosium',
  // Noble gases (rare)
  He: 'Helium',
  Ne: 'Neon',
  Ar: 'Argon',
  Kr: 'Krypton',
  Xe: 'Xenon',
};

// Generate pseudo-3D coordinates from SMILES
function generateMoleculeFromSmiles(
  smiles: string, 
  importances?: Array<{ atom_index: number; symbol: string; importance: number }>,
  bindingAffinity?: number
): { atoms: Atom[]; bonds: Bond[] } {
  const atomSymbols: string[] = [];
  
  // Two-letter atom symbols (must check before single letters)
  const twoLetterAtoms = [
    'Cl', 'Br', 'Fe', 'Cu', 'Zn', 'Mg', 'Ca', 'Na', 'Li', 'Pt', 'Au', 'Ag',
    'Co', 'Mn', 'Ni', 'Si', 'Se', 'Te', 'As', 'Sb', 'Bi', 'Al', 'Ga', 'Ge',
    'Sn', 'Pb', 'Ti', 'Cr', 'Mo', 'Tc', 'Re', 'Ru', 'Rh', 'Pd', 'Os', 'Ir',
    'Hg', 'Tl', 'Gd', 'Eu', 'Tb', 'Dy', 'He', 'Ne', 'Ar', 'Kr', 'Xe', 'At'
  ];
  
  // Single-letter atom symbols
  const singleLetterAtoms = ['C', 'N', 'O', 'S', 'P', 'F', 'I', 'H', 'B', 'K', 'V', 'W'];
  
  // Aromatic lowercase atoms
  const aromaticAtoms = ['c', 'n', 'o', 's', 'p', 'b'];
  
  let i = 0;
  while (i < smiles.length) {
    const char = smiles[i];
    
    // Skip non-atom characters (bonds, rings, branches, stereochemistry)
    if (/[0-9()=\-+#@\[\]\\\/.:,%]/.test(char)) {
      i++;
      continue;
    }
    
    // Check for two-letter atoms first (case-sensitive matching)
    const twoChar = smiles.slice(i, i + 2);
    const twoCharMatch = twoLetterAtoms.find(a => 
      twoChar === a || twoChar === a.toLowerCase()
    );
    if (twoCharMatch) {
      atomSymbols.push(twoCharMatch);
      i += 2;
      continue;
    }
    
    // Check for single-letter atoms (uppercase)
    if (singleLetterAtoms.includes(char)) {
      atomSymbols.push(char);
      i++;
      continue;
    }
    
    // Handle lowercase aromatic atoms - convert to uppercase
    if (aromaticAtoms.includes(char)) {
      atomSymbols.push(char.toUpperCase());
      i++;
      continue;
    }
    
    i++;
  }

  const atoms: Atom[] = atomSymbols.slice(0, 35).map((symbol, i) => {
    const angle = (i / atomSymbols.length) * Math.PI * 4;
    const radius = 1.5 + (i * 0.12);
    const heightVariation = Math.sin(i * 0.8) * 1.5;
    
    const importance = importances?.find(imp => imp.atom_index === i)?.importance || 0;
    
    return {
      id: i,
      symbol,
      fullName: atomFullNames[symbol] || symbol,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      z: heightVariation,
      importance,
    };
  });

  // Generate bonds with strength based on affinity
  const bonds: Bond[] = [];
  const baseStrength = bindingAffinity ? Math.min(bindingAffinity / 10, 1) : 0.5;
  
  for (let i = 0; i < atoms.length - 1; i++) {
    bonds.push({ 
      from: i, 
      to: i + 1,
      strength: baseStrength + (Math.random() * 0.3 - 0.15)
    });
  }
  if (atoms.length > 5) {
    bonds.push({ from: 0, to: 5, strength: baseStrength });
  }
  if (atoms.length > 10) {
    bonds.push({ from: 5, to: 10, strength: baseStrength * 0.8 });
  }
  if (atoms.length > 15) {
    bonds.push({ from: 10, to: 15, strength: baseStrength * 0.7 });
  }

  return { atoms, bonds };
}

// Atom colors - CPK coloring scheme extended for all elements
const atomColors: Record<string, string> = {
  // Common organic atoms
  C: '#4a5568',   // Gray (Carbon)
  N: '#3b82f6',   // Blue (Nitrogen)
  O: '#ef4444',   // Red (Oxygen)
  S: '#eab308',   // Yellow (Sulfur)
  P: '#f97316',   // Orange (Phosphorus)
  H: '#e5e7eb',   // Light gray (Hydrogen)
  B: '#ffb5b5',   // Salmon (Boron)
  // Halogens - green family
  F: '#22c55e',   // Green (Fluorine)
  Cl: '#16a34a',  // Dark green (Chlorine)
  Br: '#991b1b',  // Brown-red (Bromine)
  I: '#7c3aed',   // Purple (Iodine)
  At: '#6b21a8',  // Dark purple (Astatine)
  // Alkali metals - violet/purple
  Li: '#cc80ff',  // Light violet
  Na: '#ab5cf2',  // Violet
  K: '#8b2fcf',   // Purple
  // Alkaline earth metals - green tones
  Mg: '#66ff00',  // Bright green
  Ca: '#3dff00',  // Yellow-green
  // Transition metals
  Fe: '#e06633',  // Orange-brown (Iron)
  Cu: '#c88033',  // Copper
  Zn: '#7d80b0',  // Blue-gray (Zinc)
  Co: '#f090a0',  // Pink (Cobalt)
  Ni: '#50d050',  // Green (Nickel)
  Mn: '#9c7ac7',  // Purple (Manganese)
  Cr: '#8a99c7',  // Blue (Chromium)
  V: '#a6a6ab',   // Gray (Vanadium)
  Ti: '#bfc2c7',  // Silver (Titanium)
  Mo: '#54b5b5',  // Teal (Molybdenum)
  W: '#2194d6',   // Blue (Tungsten)
  Tc: '#3b9e9e',  // Teal (Technetium)
  Re: '#267dab',  // Blue (Rhenium)
  Ru: '#248f8f',  // Teal (Ruthenium)
  Rh: '#0a7d8c',  // Dark teal (Rhodium)
  Pd: '#006985',  // Dark blue (Palladium)
  Os: '#266696',  // Blue (Osmium)
  Ir: '#175487',  // Dark blue (Iridium)
  // Precious metals
  Pt: '#d0d0e0',  // Silver-white (Platinum)
  Au: '#ffd123',  // Gold
  Ag: '#c0c0c0',  // Silver
  Hg: '#b8b8d0',  // Silver-blue (Mercury)
  // Metalloids
  Si: '#f0c8a0',  // Tan (Silicon)
  Ge: '#668f8f',  // Gray-green (Germanium)
  As: '#bd80e3',  // Purple (Arsenic)
  Se: '#ffa100',  // Orange (Selenium)
  Te: '#d47a00',  // Dark orange (Tellurium)
  Sb: '#9e63b5',  // Purple (Antimony)
  Bi: '#9e4fb5',  // Purple (Bismuth)
  // Post-transition metals
  Al: '#bfa6a6',  // Gray-pink (Aluminum)
  Ga: '#c28f8f',  // Pink-gray (Gallium)
  Sn: '#668080',  // Gray (Tin)
  Pb: '#575961',  // Dark gray (Lead)
  Tl: '#a6544d',  // Brown (Thallium)
  // Lanthanides (contrast agents)
  Gd: '#45ffc7',  // Cyan-green (Gadolinium)
  Eu: '#61ffc7',  // Cyan (Europium)
  Tb: '#30ffc7',  // Cyan (Terbium)
  Dy: '#1fffc7',  // Cyan (Dysprosium)
  // Noble gases - cyan family
  He: '#d9ffff',  // Very light cyan
  Ne: '#b3e3f5',  // Light blue
  Ar: '#80d1e3',  // Blue
  Kr: '#5cb8d1',  // Dark blue
  Xe: '#429eb0',  // Teal
};

// Bond color based on strength (affinity)
function getBondColor(strength: number): string {
  if (strength >= 0.8) return '#22c55e'; // Strong - Green
  if (strength >= 0.6) return '#3b82f6'; // Medium-Strong - Blue
  if (strength >= 0.4) return '#eab308'; // Medium - Yellow
  return '#ef4444'; // Weak - Red
}

export function MoleculeViewer3D({ 
  smiles = "CC(=O)OC1=CC=CC=C1C(=O)O", 
  atomImportances, 
  bindingAffinity,
  showBinding = false,
  className = "" 
}: MoleculeViewer3DProps) {
  const [rotation, setRotation] = useState({ x: -20, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isRotating, setIsRotating] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredAtom, setHoveredAtom] = useState<Atom | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const { atoms, bonds } = generateMoleculeFromSmiles(smiles, atomImportances, bindingAffinity);

  // Get unique atom types present in the molecule for dynamic legend
  const uniqueAtomTypes = [...new Set(atoms.map(a => a.symbol))];

  useEffect(() => {
    if (isRotating) {
      const animate = () => {
        setRotation(prev => ({ ...prev, y: prev.y + 0.5 }));
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRotating]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev + delta)));
  };

  const project = (x: number, y: number, z: number): { x: number; y: number; scale: number } => {
    const radX = (rotation.x * Math.PI) / 180;
    const radY = (rotation.y * Math.PI) / 180;

    const x1 = x * Math.cos(radY) - z * Math.sin(radY);
    const z1 = x * Math.sin(radY) + z * Math.cos(radY);
    const y1 = y * Math.cos(radX) - z1 * Math.sin(radX);
    const z2 = y * Math.sin(radX) + z1 * Math.cos(radX);

    const perspective = 8;
    const scale = perspective / (perspective + z2);
    const centerX = isFullscreen ? 300 : 150;
    const centerY = isFullscreen ? 200 : 120;

    return {
      x: x1 * scale * 40 * zoom + centerX,
      y: y1 * scale * 40 * zoom + centerY,
      scale: scale * zoom,
    };
  };

  const sortedAtoms = [...atoms]
    .map(atom => ({
      ...atom,
      projected: project(atom.x, atom.y, atom.z),
    }))
    .sort((a, b) => b.projected.scale - a.projected.scale);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsRotating(false);
    const startX = e.clientX;
    const startY = e.clientY;
    const startRotation = { ...rotation };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      setRotation({
        x: startRotation.x + deltaY * 0.5,
        y: startRotation.y + deltaX * 0.5,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const viewportHeight = isFullscreen ? 400 : 300;

  return (
    <div className={`relative ${className}`}>
      {/* Controls */}
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-background/80 backdrop-blur"
          onClick={() => setIsRotating(!isRotating)}
          title={isRotating ? "Pause rotation" : "Resume rotation"}
        >
          {isRotating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-background/80 backdrop-blur"
          onClick={() => setZoom(z => Math.min(z + 0.3, 3))}
          title="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-background/80 backdrop-blur"
          onClick={() => setZoom(z => Math.max(z - 0.3, 0.3))}
          title="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-background/80 backdrop-blur"
          onClick={() => {
            setRotation({ x: -20, y: 0 });
            setZoom(1);
          }}
          title="Reset view"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-background/80 backdrop-blur"
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Hovered Atom Info */}
      {hoveredAtom && (
        <div className="absolute top-2 left-2 z-10 bg-background/95 backdrop-blur rounded-lg p-3 shadow-lg border border-border">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: atomColors[hoveredAtom.symbol] }}
            />
            <span className="font-semibold text-foreground">{hoveredAtom.fullName}</span>
            <span className="text-muted-foreground text-sm">({hoveredAtom.symbol})</span>
          </div>
          <div className="text-xs text-muted-foreground">
            <div>Position: {hoveredAtom.id + 1}</div>
            {hoveredAtom.importance !== undefined && hoveredAtom.importance > 0 && (
              <div className="text-primary font-medium">
                Importance: {(hoveredAtom.importance * 100).toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3D Viewport */}
      <div
        ref={containerRef}
        className="relative w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-300"
        style={{ height: viewportHeight, perspective: '800px' }}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        {/* Grid */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full">
            {[...Array(15)].map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 30} x2="100%" y2={i * 30} stroke="white" strokeWidth="0.5" />
            ))}
            {[...Array(20)].map((_, i) => (
              <line key={`v-${i}`} x1={i * 30} y1="0" x2={i * 30} y2="100%" stroke="white" strokeWidth="0.5" />
            ))}
          </svg>
        </div>

        <svg className="w-full h-full">
          {/* Bonds */}
          {bonds.map((bond, i) => {
            const fromAtom = atoms.find(a => a.id === bond.from);
            const toAtom = atoms.find(a => a.id === bond.to);
            if (!fromAtom || !toAtom) return null;

            const from = project(fromAtom.x, fromAtom.y, fromAtom.z);
            const to = project(toAtom.x, toAtom.y, toAtom.z);
            const bondColor = showBinding && bond.strength ? getBondColor(bond.strength) : 'rgba(255,255,255,0.4)';

            return (
              <g key={`bond-${i}`}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={bondColor}
                  strokeWidth={showBinding ? 3 * from.scale : 2 * from.scale}
                  className="transition-all duration-75"
                />
                {showBinding && bond.strength && (
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={bondColor}
                    strokeWidth={6 * from.scale}
                    opacity={0.3}
                    className="animate-pulse"
                  />
                )}
              </g>
            );
          })}

          {/* Atoms */}
          {sortedAtoms.map(atom => {
            const color = atomColors[atom.symbol] || '#888';
            const radius = 12 * atom.projected.scale;
            const hasImportance = atom.importance && atom.importance > 0.3;
            const glowColor = atom.importance && atom.importance > 0.5 
              ? `rgba(239, 68, 68, ${atom.importance})` 
              : atom.importance && atom.importance > 0.3 
                ? `rgba(234, 179, 8, ${atom.importance})` 
                : 'transparent';

            return (
              <g 
                key={atom.id} 
                className="transition-all duration-75 cursor-pointer"
                onMouseEnter={() => setHoveredAtom(atom)}
                onMouseLeave={() => setHoveredAtom(null)}
              >
                {hasImportance && (
                  <circle
                    cx={atom.projected.x}
                    cy={atom.projected.y}
                    r={radius * 2}
                    fill={glowColor}
                    className="animate-pulse"
                    style={{ filter: 'blur(6px)' }}
                  />
                )}
                <circle
                  cx={atom.projected.x + 2}
                  cy={atom.projected.y + 2}
                  r={radius}
                  fill="rgba(0,0,0,0.3)"
                />
                <circle
                  cx={atom.projected.x}
                  cy={atom.projected.y}
                  r={radius}
                  fill={color}
                  stroke={hasImportance ? '#ef4444' : 'rgba(255,255,255,0.3)'}
                  strokeWidth={hasImportance ? 2 : 1}
                />
                <circle
                  cx={atom.projected.x - radius * 0.3}
                  cy={atom.projected.y - radius * 0.3}
                  r={radius * 0.4}
                  fill="rgba(255,255,255,0.3)"
                />
                {showLabels && radius > 8 && (
                  <text
                    x={atom.projected.x}
                    y={atom.projected.y + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize={10 * atom.projected.scale}
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {atom.symbol}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Dynamic Legend - only shows atoms present in the molecule */}
        <div className="absolute bottom-2 left-2 flex gap-2 text-xs flex-wrap">
          {uniqueAtomTypes.map(symbol => (
            <div key={symbol} className="flex items-center gap-1 bg-background/80 px-2 py-1 rounded backdrop-blur">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: atomColors[symbol] || '#888' }}
              />
              <span className="text-foreground">{atomFullNames[symbol] || symbol}</span>
            </div>
          ))}
        </div>

        {/* Bond Strength Legend */}
        {showBinding && (
          <div className="absolute bottom-2 right-2 bg-background/80 px-3 py-2 rounded backdrop-blur text-xs">
            <div className="font-semibold text-foreground mb-1">Bond Strength</div>
            <div className="flex items-center gap-1"><div className="w-3 h-1 bg-[#22c55e] rounded" /><span className="text-foreground">Strong</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-1 bg-[#3b82f6] rounded" /><span className="text-foreground">Medium</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-1 bg-[#eab308] rounded" /><span className="text-foreground">Moderate</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-1 bg-[#ef4444] rounded" /><span className="text-foreground">Weak</span></div>
          </div>
        )}

        {atomImportances && atomImportances.some(a => a.importance > 0.3) && !showBinding && (
          <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded backdrop-blur text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-foreground">High Importance</span>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-2">
        Drag to rotate • Scroll to zoom • Hover for atom details
      </p>
    </div>
  );
}
