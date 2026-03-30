
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Orders from "./pages/Orders";
import Cabinet from "./pages/Cabinet";
import MasterCabinet from "./pages/MasterCabinet";
import Offer from "./pages/Offer";
import MasterPage from "./pages/MasterPage";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";
import Masters from "./pages/Masters";
import Rules from "./pages/Rules";
import NotFound from "./pages/NotFound";
import SupportWidget from "./components/support/SupportWidget";
import ChatFab from "./components/chat/ChatFab";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/cabinet" element={<Cabinet />} />
          <Route path="/master" element={<MasterCabinet />} />
          <Route path="/offer" element={<Offer />} />
          <Route path="/master-page" element={<MasterPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/category/:name" element={<CategoryPage />} />
          <Route path="/masters" element={<Masters />} />
          <Route path="/rules" element={<Rules />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <SupportWidget />
        <ChatFab />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;