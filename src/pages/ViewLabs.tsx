import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { FlaskConical, Users, Clock, ArrowRight, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Lab {
  id: string;
  name: string;
  code: string;
  year_group: string;
  department_id: string;
  total_students: number;
  created_at: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Regulation {
  id: string;
  name: string;
  year: number;
}

export default function ViewLabs() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [labs, setLabs] = useState<Lab[]>([]);
  const [department, setDepartment] = useState<Department | null>(null);
  const [regulation, setRegulation] = useState<Regulation | null>(null);
  const [selectedLab, setSelectedLab] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const period = searchParams.get("period");
  const phase = searchParams.get("phase");
  const regulationId = searchParams.get("regulation");
  const departmentId = searchParams.get("department");

  useEffect(() => {
    if (regulationId && departmentId) {
      fetchData();
    }
  }, [regulationId, departmentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (!departmentId || !regulationId) {
        throw new Error("Missing required parameters");
      }
      
      // Get department info
      const { data: departmentData, error: departmentError } = await supabase
        .from("departments")
        .select("*")
        .eq("id", departmentId)
        .single();

      if (departmentError) throw departmentError;

      // Get regulation info
      const { data: regulationData, error: regulationError } = await supabase
        .from("regulations")
        .select("*")
        .eq("id", regulationId)
        .single();

      if (regulationError) throw regulationError;

      // Get labs for this department
      const { data: labsData, error: labsError } = await supabase
        .from("labs")
        .select("*")
        .eq("department_id", departmentId)
        .order("name");

      if (labsError) throw labsError;

      setDepartment(departmentData);
      setRegulation(regulationData);
      setLabs(labsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load lab information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (selectedLab) {
      navigate(`/allocate-sessions?period=${period}&phase=${phase}&regulation=${regulationId}&department=${departmentId}&lab=${selectedLab}`);
    }
  };

  const getSessionsPerDay = (phase: string | null) => {
    if (phase === "phase-3") return 3; // 1st year
    return 2; // 2nd, 3rd, 4th year
  };

  const calculateTotalSessions = (studentsCount: number, studentsPerSession: number = 30) => {
    return Math.ceil(studentsCount / studentsPerSession);
  };

  if (loading) {
    return (
      <AppLayout title="Department Labs" showBackButton backTo={`/select-regulation?period=${period}&phase=${phase}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title="Department Labs" 
      showBackButton 
      backTo={`/select-regulation?period=${period}&phase=${phase}`}
    >
      <div className="space-y-8">
        {/* Context Info */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Examination Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Period</p>
                <p className="font-medium capitalize">{period?.replace('-', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phase</p>
                <p className="font-medium capitalize">{phase?.replace('-', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Regulation</p>
                <p className="font-medium">{regulation?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{department?.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Labs List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Available Labs ({labs.length})
              </h3>
            </div>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{getSessionsPerDay(phase)} sessions/day</span>
            </Badge>
          </div>
          
          {labs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FlaskConical className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">No Labs Available</p>
                <p className="text-muted-foreground text-center">
                  No labs are currently configured for {department?.name} ({regulation?.name}).
                  <br />
                  Please contact the administrator to set up lab information.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {labs.map((lab) => {
                const totalSessions = calculateTotalSessions(lab.total_students);
                const sessionsPerDay = getSessionsPerDay(phase);
                const daysRequired = Math.ceil(totalSessions / sessionsPerDay);
                
                return (
                  <Card
                    key={lab.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-md border-2 ${
                      selectedLab === lab.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedLab(lab.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <FlaskConical className="h-4 w-4" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{lab.name}</CardTitle>
                            <CardDescription className="font-mono text-xs">
                              {lab.code} • {lab.year_group}
                            </CardDescription>
                          </div>
                        </div>
                        {selectedLab === lab.id && (
                          <Badge variant="default">Selected</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total Students:</span>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium">{lab.total_students}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Sessions Needed:</span>
                          <span className="text-sm font-medium">{totalSessions}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Days Required:</span>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium">{daysRequired}</span>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t border-border">
                          <div className="text-xs text-muted-foreground">
                            <strong>Schedule:</strong> {sessionsPerDay} sessions per day
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <strong>Capacity:</strong> ~30 students per session
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Continue Button */}
        {labs.length > 0 && (
          <div className="flex justify-center pt-6">
            <Button
              size="lg"
              variant="gradient"
              onClick={handleContinue}
              disabled={!selectedLab}
              className="px-8"
            >
              Allocate Sessions & Faculty
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}