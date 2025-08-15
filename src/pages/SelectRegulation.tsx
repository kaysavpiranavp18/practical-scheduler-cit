import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Book, Building, ArrowRight, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Department {
  id: string;
  name: string;
  code: string;
  regulation_id: string;
  created_at: string;
}

interface Regulation {
  id: string;
  name: string;
  year: number;
  departments: Department[];
}

export default function SelectRegulation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [selectedRegulation, setSelectedRegulation] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const period = searchParams.get("period");
  const phase = searchParams.get("phase");

  useEffect(() => {
    fetchRegulationsAndDepartments();
  }, []);

  const fetchRegulationsAndDepartments = async () => {
    try {
      setLoading(true);
      
      // Get regulations
      const { data: regulationsData, error: regulationsError } = await supabase
        .from("regulations")
        .select("*")
        .order("year", { ascending: false });

      if (regulationsError) {
        throw regulationsError;
      }

      // Get departments
      const { data: departmentsData, error: departmentsError } = await supabase
        .from("departments")
        .select("*")
        .order("name");

      if (departmentsError) {
        throw departmentsError;
      }

      // Combine regulations with their departments
      const regulationsWithDepartments = regulationsData?.map(regulation => ({
        ...regulation,
        departments: departmentsData?.filter(dept => dept.regulation_id === regulation.id) || []
      })) || [];

      setRegulations(regulationsWithDepartments);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load regulations and departments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (selectedRegulation && selectedDepartment) {
      navigate(`/view-labs?period=${period}&phase=${phase}&regulation=${selectedRegulation}&department=${selectedDepartment}`);
    }
  };

  const selectedRegulationData = regulations.find(reg => reg.id === selectedRegulation);

  if (loading) {
    return (
      <AppLayout title="Select Regulation & Department" showBackButton backTo="/">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Select Regulation & Department" showBackButton backTo="/">
      <div className="space-y-8">
        {/* Phase Info */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Selected Phase Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Examination Period</p>
                <p className="font-medium capitalize">{period?.replace('-', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phase</p>
                <p className="font-medium capitalize">{phase?.replace('-', ' ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regulation Selection */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Book className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Select Regulation</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {regulations.map((regulation) => (
              <Card
                key={regulation.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-md border-2 ${
                  selectedRegulation === regulation.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => {
                  setSelectedRegulation(regulation.id);
                  setSelectedDepartment(""); // Reset department selection
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{regulation.name}</CardTitle>
                      <CardDescription>Academic Year {regulation.year}</CardDescription>
                    </div>
                    {selectedRegulation === regulation.id && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {regulation.departments.length} departments
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Department Selection */}
        {selectedRegulationData && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Select Department ({selectedRegulationData.name})
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedRegulationData.departments.map((department) => (
                <Card
                  key={department.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-md border-2 ${
                    selectedDepartment === department.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedDepartment(department.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm">{department.name}</CardTitle>
                        <CardDescription className="font-mono text-xs">
                          {department.code}
                        </CardDescription>
                      </div>
                      {selectedDepartment === department.id && (
                        <Badge variant="default" className="text-xs">Selected</Badge>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="flex justify-center pt-6">
          <Button
            size="lg"
            variant="gradient"
            onClick={handleContinue}
            disabled={!selectedRegulation || !selectedDepartment}
            className="px-8"
          >
            View Department Labs
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}