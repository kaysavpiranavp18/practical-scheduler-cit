import { ReactNode } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, GraduationCap } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  showBackButton?: boolean;
  backTo?: string;
}

export const AppLayout = ({ children, title, showBackButton, backTo }: AppLayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {showBackButton && backTo && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to={backTo}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Link>
                </Button>
              )}
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-primary to-primary-light p-2 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">ExamFlow Scheduler</h1>
                  <p className="text-sm text-muted-foreground">Chennai Institute of Technology</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Academic Portal</span>
            </div>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Chennai Institute of Technology. All rights reserved.</p>
            <p>Examination Management System</p>
          </div>
        </div>
      </footer>
    </div>
  );
};