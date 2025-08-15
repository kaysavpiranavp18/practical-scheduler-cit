import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SelectTimeAndPhase from "./pages/SelectTimeAndPhase";
import SelectRegulation from "./pages/SelectRegulation";
import ViewLabs from "./pages/ViewLabs";
import AllocateSessions from "./pages/AllocateSessions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/select-time-phase" element={<SelectTimeAndPhase />} />
          <Route path="/select-regulation" element={<SelectRegulation />} />
          <Route path="/view-labs" element={<ViewLabs />} />
          <Route path="/allocate-sessions" element={<AllocateSessions />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
