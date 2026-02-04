import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Prediction from "./pages/Prediction";
import Explainability from "./pages/Explainability";
import Performance from "./pages/Performance";
import Dataset from "./pages/Dataset";
import Documentation from "./pages/Documentation";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import { VoiceAssistant } from "./components/assistant/VoiceAssistant";
import { AssistantProvider } from "./components/assistant/AssistantContext";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AssistantProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/prediction" element={<Prediction />} />
              <Route path="/explainability" element={<Explainability />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/dataset" element={<Dataset />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/about" element={<About />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <VoiceAssistant />
          </BrowserRouter>
        </AssistantProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
