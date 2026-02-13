
import { Card } from "@/components/ui/card";
import { AdmetProperties } from "@/lib/drugLikenessCalculator";
import { Activity, Skull, Brain, Droplets, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AdmetCardsProps {
    admet: AdmetProperties;
}

export function AdmetCards({ admet }: AdmetCardsProps) {
    const getAbsorptionColor = (val: string) =>
        val === 'High' ? 'text-green-500' : val === 'Moderate' ? 'text-yellow-500' : 'text-red-500';

    const getToxicityColor = (val: string) =>
        val === 'None' ? 'text-green-500' : val === 'Low' ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="p-4 flex flex-col items-center justify-center space-y-2 border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
                <Droplets className="h-6 w-6 text-blue-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase">Absorption</span>
                <span className={`text-lg font-bold ${getAbsorptionColor(admet.absorption)}`}>{admet.absorption}</span>
            </Card>

            <Card className="p-4 flex flex-col items-center justify-center space-y-2 border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20">
                <Brain className="h-6 w-6 text-purple-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase text-center">BBB Permeable</span>
                <Badge variant={admet.bbbPermeability ? "default" : "secondary"}>
                    {admet.bbbPermeability ? "Yes" : "No"}
                </Badge>
            </Card>

            <Card className="p-4 flex flex-col items-center justify-center space-y-2 border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20">
                <Zap className="h-6 w-6 text-orange-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase text-center">CYP450 Inhibitor</span>
                <Badge variant={admet.cyp450Inhibitor ? "destructive" : "outline"}>
                    {admet.cyp450Inhibitor ? "Yes" : "No"}
                </Badge>
            </Card>

            <Card className="p-4 flex flex-col items-center justify-center space-y-2 border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20">
                <Skull className="h-6 w-6 text-red-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase">Toxicity</span>
                <span className={`text-lg font-bold ${getToxicityColor(admet.toxicity)}`}>{admet.toxicity}</span>
            </Card>

            <Card className="p-4 flex flex-col items-center justify-center space-y-2 border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/20">
                <Activity className="h-6 w-6 text-green-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase">Half-Life</span>
                <span className="text-lg font-bold">{admet.halfLife}</span>
            </Card>
        </div>
    );
}
