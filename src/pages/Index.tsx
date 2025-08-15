import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, GraduationCap, Users, Clock, Building2, FlaskConical } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-primary/5">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-r from-primary to-primary-light p-4 rounded-2xl shadow-lg">
                <Calendar className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              ExamFlow Scheduler
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Comprehensive practical examination scheduling system for Chennai Institute of Technology
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="gradient" asChild className="px-8 py-4 text-lg">
                <Link to="/select-time-phase">
                  Start Scheduling
                  <Calendar className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Comprehensive Scheduling Solution</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Streamline your practical examination scheduling with our intelligent system designed for academic institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Multi-Regulation Support</CardTitle>
                  <CardDescription>R2022, R2024, R2025</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Support for multiple academic regulations with different year groups and session timings.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-accent/10 text-accent">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Faculty Management</CardTitle>
                  <CardDescription>Experience validation</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Intelligent faculty assignment with experience requirements and availability tracking.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-success/10 text-success">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Smart Scheduling</CardTitle>
                  <CardDescription>Automated allocation</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Automatic session distribution based on student count and optimal resource utilization.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Department Integration</CardTitle>
                  <CardDescription>All CIT departments</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Complete integration with all Chennai Institute of Technology departments and labs.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-accent/10 text-accent">
                  <FlaskConical className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Lab Management</CardTitle>
                  <CardDescription>Capacity optimization</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Efficient lab utilization with student capacity management and session optimization.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-success/10 text-success">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Export & Reports</CardTitle>
                  <CardDescription>PDF generation</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Professional PDF reports and schedules for easy distribution and documentation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Start Scheduling?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Begin creating your practical examination schedule in just a few simple steps.
            </p>
            <Button size="lg" variant="gradient" asChild className="px-8 py-4 text-lg">
              <Link to="/select-time-phase">
                Get Started Now
                <Calendar className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 Chennai Institute of Technology. All rights reserved.</p>
            <p className="mt-2">Practical Examination Management System</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
