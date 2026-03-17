import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import ResourceMap from "@/pages/ResourceMap";
import HospitalPage from "@/pages/HospitalPage";
import AdminPage from "@/pages/AdminPage";
import UserPage from "@/pages/UserPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppProvider>
              <div className="min-h-screen bg-background">
                <Navbar />
                <Routes>
                  <Route path="/" element={<ResourceMap />} />
                  <Route path="/user" element={<UserPage />} />
                  <Route path="/hospital" element={<HospitalPage />} />
                  <Route path="/hospital/dashboard" element={<HospitalPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </AppProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
