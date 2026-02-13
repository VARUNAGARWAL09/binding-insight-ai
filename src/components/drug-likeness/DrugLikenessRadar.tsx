
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from 'recharts';
import { Card } from "@/components/ui/card";
import { Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Tooltip as UiTooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface Metric {
    subject: string;
    A: number; // Value normalized 0-100 or actual
    fullMark: number;
    raw: number;
    unit: string;
}

interface DrugLikenessRadarProps {
    properties: {
        molecularWeight: number;
        logP: number;
        hDonors: number;
        hAcceptors: number;
        rotatableBonds: number;
        polarSurfaceArea: number;
    };
}

export function DrugLikenessRadar({ properties }: DrugLikenessRadarProps) {
    // Normalize values for better radar visualization (scale 0-100)
    // MW: max ~600
    // logP: max ~6
    // Donors: max ~6
    // Acceptors: max ~12
    // Rotatable: max ~12
    // PSA: max ~160

    const data: Metric[] = [
        {
            subject: 'Mol. Weight',
            A: Math.min(100, (properties.molecularWeight / 600) * 100),
            fullMark: 100,
            raw: properties.molecularWeight,
            unit: 'Da'
        },
        {
            subject: 'LogP',
            A: Math.min(100, Math.max(0, (properties.logP + 2) / 8 * 100)), // Scale -2 to 6 -> 0-100
            fullMark: 100,
            raw: properties.logP,
            unit: ''
        },
        {
            subject: 'H-Donors',
            A: Math.min(100, (properties.hDonors / 6) * 100),
            fullMark: 100,
            raw: properties.hDonors,
            unit: ''
        },
        {
            subject: 'H-Acceptors',
            A: Math.min(100, (properties.hAcceptors / 12) * 100),
            fullMark: 100,
            raw: properties.hAcceptors,
            unit: ''
        },
        {
            subject: 'Rot. Bonds',
            A: Math.min(100, (properties.rotatableBonds / 12) * 100),
            fullMark: 100,
            raw: properties.rotatableBonds,
            unit: ''
        },
        {
            subject: 'PSA',
            A: Math.min(100, (properties.polarSurfaceArea / 160) * 100),
            fullMark: 100,
            raw: properties.polarSurfaceArea,
            unit: 'Å²'
        },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const dataPoint = data.find(d => d.subject === label);
            return (
                <div className="bg-background border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold text-foreground">{label}</p>
                    <p className="text-primary">
                        Value: {dataPoint?.raw} {dataPoint?.unit}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="p-6 h-[400px] flex flex-col items-center justify-center relative bg-gradient-to-br from-background to-muted/20">
            <div className="absolute top-4 left-4 flex items-center gap-2">
                <h3 className="font-semibold text-lg">Molecular Property Profile</h3>
                <UiTooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Info className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="max-w-xs text-xs">
                            Visualizes 6 key physicochemical properties relative to drug-like thresholds.
                            Ideal zone is typically central/moderate values.
                        </p>
                    </TooltipContent>
                </UiTooltip>
            </div>

            <div className="w-full h-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Properties"
                            dataKey="A"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            fill="hsl(var(--primary))"
                            fillOpacity={0.3}
                        />
                        <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
