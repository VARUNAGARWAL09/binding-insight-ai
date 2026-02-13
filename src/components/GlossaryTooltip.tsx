import { HelpCircle } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { getDefinition } from "@/data/glossary";

interface GlossaryTooltipProps {
    term: string;
    children?: React.ReactNode;
    underline?: boolean;
}

export function GlossaryTooltip({ term, children, underline = true }: GlossaryTooltipProps) {
    const glossaryEntry = getDefinition(term);

    if (!glossaryEntry) {
        // If term not found in glossary, render children without tooltip
        return <>{children || term}</>;
    }

    return (
        <TooltipProvider>
            <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                    <span
                        className={`${underline ? 'border-b border-dotted border-muted-foreground' : ''} cursor-help inline-flex items-center gap-1`}
                    >
                        {children || term}
                        <HelpCircle className="h-3 w-3 text-muted-foreground inline" />
                    </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    <div className="space-y-1">
                        <div className="font-semibold text-sm">{glossaryEntry.term}</div>
                        <div className="text-xs text-muted-foreground">{glossaryEntry.definition}</div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
