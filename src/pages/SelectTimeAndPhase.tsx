import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, ArrowRight } from "lucide-react";

export default function SelectTimeAndPhase() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedPhase, setSelectedPhase] = useState<string>("");

  const timePeriods = [
    {
      id: "nov-dec-2025",
      label: "November - December 2025",
      description: "End semester practical examinations",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      id: "apr-may-2025",
      label: "April - May 2025",
      description: "Mid semester practical examinations",
      icon: <Calendar className="h-5 w-5" />,
    },
  ];

  const phases = [
    {
      id: "phase-1",
      label: "Phase 1",
      description: "IV Year (R2022 Regulation)",
      yearGroup: "4th Year",
      sessions: 2,
      timing: "8:30-11:30 AM, 12:00-3:00 PM",
      regulation: "R2022",
      icon: <Users className="h-5 w-5" />,
      color: "bg-primary text-primary-foreground",
    },
    {
      id: "phase-2",
      label: "Phase 2",
      description: "2nd & 3rd Year (R2024 + R2022)",
      yearGroup: "2nd & 3rd Year",
      sessions: 2,
      timing: "8:30-11:30 AM, 12:00-3:00 PM",
      regulation: "R2024 + R2022",
      icon: <Users className="h-5 w-5" />,
      color: "bg-accent text-accent-foreground",
    },
    {
      id: "phase-3",
      label: "Phase 3",
      description: "1st Year (R2025 Regulation)",
      yearGroup: "1st Year",
      sessions: 3,
      timing: "8:30-10:30 AM, 11:00-1:00 PM, 1:30-3:30 PM",
      regulation: "R2025",
      icon: <Users className="h-5 w-5" />,
      color: "bg-success text-success-foreground",
    },
  ];

  const handleContinue = () => {
    if (selectedPeriod && selectedPhase) {
      navigate(`/select-regulation?period=${selectedPeriod}&phase=${selectedPhase}`);
    }
  };

  return (
    <AppLayout title="Select Examination Period & Phase">
      <div className="space-y-8">
        {/* Time Period Selection */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Select Examination Period</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {timePeriods.map((period) => (
              <Card
                key={period.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-md border-2 ${
                  selectedPeriod === period.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedPeriod(period.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {period.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{period.label}</CardTitle>
                        <CardDescription>{period.description}</CardDescription>
                      </div>
                    </div>
                    {selectedPeriod === period.id && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Phase Selection */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Select Examination Phase</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {phases.map((phase) => (
              <Card
                key={phase.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-md border-2 ${
                  selectedPhase === phase.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedPhase(phase.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {phase.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{phase.label}</CardTitle>
                        <CardDescription>{phase.description}</CardDescription>
                      </div>
                    </div>
                    {selectedPhase === phase.id && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Year Group:</span>
                      <Badge className={phase.color}>{phase.yearGroup}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Sessions:</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{phase.sessions} per day</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <strong>Timing:</strong> {phase.timing}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <strong>Regulation:</strong> {phase.regulation}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center pt-6">
          <Button
            size="lg"
            variant="gradient"
            onClick={handleContinue}
            disabled={!selectedPeriod || !selectedPhase}
            className="px-8"
          >
            Continue to Regulation Selection
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}