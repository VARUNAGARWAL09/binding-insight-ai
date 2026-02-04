import { useState, useEffect, useRef } from "react";
import { RotateCcw, ZoomIn, ZoomOut, Play, Pause, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResidueData {
  residue_index: number;
  residue: string;
  importance: number;
}

interface ProteinViewer3DProps {
  fasta?: string;
  residueImportances?: ResidueData[];
  bindingAffinity?: number;
  showBinding?: boolean;
  className?: string;
}

// Full amino acid names
const aaFullNames: Record<string, string> = {
  A: 'Alanine', R: 'Arginine', N: 'Asparagine', D: 'Aspartic Acid',
  C: 'Cysteine', E: 'Glutamic Acid', Q: 'Glutamine', G: 'Glycine',
  H: 'Histidine', I: 'Isoleucine', L: 'Leucine', K: 'Lysine',
  M: 'Methionine', F: 'Phenylalanine', P: 'Proline', S: 'Serine',
  T: 'Threonine', W: 'Tryptophan', Y: 'Tyrosine', V: 'Valine',
};

// Amino acid colors
const aaColors: Record<string, string> = {
  A: '#718096', L: '#718096', I: '#718096', V: '#718096', M: '#718096', F: '#718096', W: '#718096', P: '#718096',
  S: '#48bb78', T: '#48bb78', Y: '#48bb78', N: '#48bb78', Q: '#48bb78', C: '#48bb78',
  K: '#4299e1', R: '#4299e1', H: '#4299e1',
  D: '#f56565', E: '#f56565',
  G: '#a0aec0',
};

export function ProteinViewer3D({ 
  fasta = "MALKERSGDVFLKYTQPWEN", 
  residueImportances,
  bindingAffinity,
  showBinding = false,
  className = "" 
}: ProteinViewer3DProps) {
  const [rotation, setRotation] = useState({ x: -15, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isRotating, setIsRotating] = useState(true);
  const [hoveredResidue, setHoveredResidue] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const animationRef = useRef<number>();

  const sequence = fasta.slice(0, 50);

  useEffect(() => {
    if (isRotating) {
      const animate = () => {
        setRotation(prev => ({ ...prev, y: prev.y + 0.3 }));
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

  const generateHelix = () => {
    const residues = sequence.split('').map((aa, i) => {
      const t = i * 0.5;
      const radius = 2;
      const x = Math.cos(t) * radius;
      const y = i * 0.4 - (sequence.length * 0.2);
      const z = Math.sin(t) * radius;
      
      const importance = residueImportances?.find(r => r.residue_index === i)?.importance || 0;
      
      return { 
        id: i, 
        aa, 
        fullName: aaFullNames[aa] || aa,
        x, 
        y, 
        z,
        importance 
      };
    });
    return residues;
  };

  const residues = generateHelix();

  const project = (x: number, y: number, z: number): { x: number; y: number; scale: number } => {
    const radX = (rotation.x * Math.PI) / 180;
    const radY = (rotation.y * Math.PI) / 180;

    const x1 = x * Math.cos(radY) - z * Math.sin(radY);
    const z1 = x * Math.sin(radY) + z * Math.cos(radY);
    const y1 = y * Math.cos(radX) - z1 * Math.sin(radX);
    const z2 = y * Math.sin(radX) + z1 * Math.cos(radX);

    const perspective = 10;
    const scale = perspective / (perspective + z2);
    const centerX = isFullscreen ? 300 : 150;
    const centerY = isFullscreen ? 200 : 150;

    return {
      x: x1 * scale * 30 * zoom + centerX,
      y: y1 * scale * 30 * zoom + centerY,
      scale: scale * zoom,
    };
  };

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

  const sortedResidues = [...residues]
    .map(r => ({ ...r, projected: project(r.x, r.y, r.z) }))
    .sort((a, b) => a.projected.scale - b.projected.scale);

  const viewportHeight = isFullscreen ? 400 : 300;
  const hoveredResidueData = hoveredResidue !== null ? residues.find(r => r.id === hoveredResidue) : null;

  return (
    <div className={`relative ${className}`}>
      {/* Controls */}
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-background/80 backdrop-blur"
          onClick={() => setIsRotating(!isRotating)}
        >
          {isRotating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-background/80 backdrop-blur"
          onClick={() => setZoom(z => Math.min(z + 0.3, 3))}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-background/80 backdrop-blur"
          onClick={() => setZoom(z => Math.max(z - 0.3, 0.3))}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-background/80 backdrop-blur"
          onClick={() => {
            setRotation({ x: -15, y: 0 });
            setZoom(1);
          }}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-background/80 backdrop-blur"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Hovered Residue Info */}
      {hoveredResidueData && (
        <div className="absolute top-2 left-2 z-10 bg-background/95 backdrop-blur rounded-lg p-3 shadow-lg border border-border">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: aaColors[hoveredResidueData.aa] }}
            />
            <span className="font-semibold text-foreground">{hoveredResidueData.fullName}</span>
            <span className="text-muted-foreground text-sm">({hoveredResidueData.aa})</span>
          </div>
          <div className="text-xs text-muted-foreground">
            <div>Position: {hoveredResidueData.id + 1}</div>
            {hoveredResidueData.importance > 0 && (
              <div className="text-primary font-medium">
                Attention Weight: {(hoveredResidueData.importance * 100).toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3D Viewport */}
      <div
        className="relative w-full bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-950 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-300"
        style={{ height: viewportHeight }}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        <svg className="w-full h-full">
          {/* Backbone */}
          {residues.length > 1 && (
            <path
              d={residues.map((r, i) => {
                const p = project(r.x, r.y, r.z);
                return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
              }).join(' ')}
              stroke="rgba(168, 162, 255, 0.5)"
              strokeWidth="4"
              fill="none"
            />
          )}

          {/* Residues */}
          {sortedResidues.map(r => {
            const color = aaColors[r.aa] || '#888';
            const radius = 10 * r.projected.scale;
            const isHovered = hoveredResidue === r.id;
            const hasImportance = r.importance > 0.4;
            const glowIntensity = r.importance > 0.6 ? 0.8 : r.importance > 0.4 ? 0.5 : 0;

            return (
              <g 
                key={r.id} 
                className="transition-all duration-75 cursor-pointer"
                onMouseEnter={() => setHoveredResidue(r.id)}
                onMouseLeave={() => setHoveredResidue(null)}
              >
                {hasImportance && (
                  <circle
                    cx={r.projected.x}
                    cy={r.projected.y}
                    r={radius * 2.5}
                    fill={`rgba(239, 68, 68, ${glowIntensity})`}
                    className="animate-pulse"
                    style={{ filter: 'blur(8px)' }}
                  />
                )}
                <circle
                  cx={r.projected.x}
                  cy={r.projected.y}
                  r={isHovered ? radius * 1.3 : radius}
                  fill={color}
                  stroke={hasImportance ? '#ef4444' : 'rgba(255,255,255,0.2)'}
                  strokeWidth={hasImportance ? 2 : 1}
                />
                <circle
                  cx={r.projected.x - radius * 0.25}
                  cy={r.projected.y - radius * 0.25}
                  r={radius * 0.35}
                  fill="rgba(255,255,255,0.4)"
                />
                {radius > 6 && (
                  <text
                    x={r.projected.x}
                    y={r.projected.y + 3}
                    textAnchor="middle"
                    fill="white"
                    fontSize={8 * r.projected.scale}
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {r.aa}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 flex gap-1 text-xs flex-wrap max-w-[250px]">
          <div className="flex items-center gap-1 bg-background/80 px-1.5 py-0.5 rounded backdrop-blur">
            <div className="w-2 h-2 rounded-full bg-[#718096]" />
            <span className="text-foreground text-[10px]">Hydrophobic</span>
          </div>
          <div className="flex items-center gap-1 bg-background/80 px-1.5 py-0.5 rounded backdrop-blur">
            <div className="w-2 h-2 rounded-full bg-[#48bb78]" />
            <span className="text-foreground text-[10px]">Polar</span>
          </div>
          <div className="flex items-center gap-1 bg-background/80 px-1.5 py-0.5 rounded backdrop-blur">
            <div className="w-2 h-2 rounded-full bg-[#4299e1]" />
            <span className="text-foreground text-[10px]">Basic (+)</span>
          </div>
          <div className="flex items-center gap-1 bg-background/80 px-1.5 py-0.5 rounded backdrop-blur">
            <div className="w-2 h-2 rounded-full bg-[#f56565]" />
            <span className="text-foreground text-[10px]">Acidic (-)</span>
          </div>
        </div>

        {residueImportances && residueImportances.some(r => r.importance > 0.4) && (
          <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded backdrop-blur text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-foreground">Binding Site Region</span>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-2">
        Drag to rotate • Scroll to zoom • Hover for residue details
      </p>
    </div>
  );
}
