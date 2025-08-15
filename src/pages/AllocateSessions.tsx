import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Users, AlertTriangle, Save, Download, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface Lab {
  id: string;
  name: string;
  code: string;
  year_group: string;
  total_students: number;
}

interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  specialization: string;
  years_of_experience: number;
}

interface SessionTiming {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
  phase_id: string;
}

interface SessionAllocation {
  sessionNumber: number;
  date: string;
  timingId: string;
  studentsCount: number;
  assignedFacultyId: string | null;
}

export default function AllocateSessions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [lab, setLab] = useState<Lab | null>(null);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [sessionTimings, setSessionTimings] = useState<SessionTiming[]>([]);
  const [sessions, setSessions] = useState<SessionAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [warningDialog, setWarningDialog] = useState<{
    open: boolean;
    facultyId: string;
    sessionIndex: number;
    facultyName: string;
  }>({ open: false, facultyId: "", sessionIndex: -1, facultyName: "" });

  const period = searchParams.get("period");
  const phase = searchParams.get("phase");
  const regulationId = searchParams.get("regulation");
  const departmentId = searchParams.get("department");
  const labId = searchParams.get("lab");

  useEffect(() => {
    if (labId && departmentId) {
      fetchData();
    }
  }, [labId, departmentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get lab info
      const { data: labData, error: labError } = await supabase
        .from("labs")
        .select("*")
        .eq("id", labId)
        .single();

      if (labError) throw labError;

      // Get faculty for this department
      const { data: facultyData, error: facultyError } = await supabase
        .from("faculty")
        .select("*")
        .eq("department", departmentId)
        .order("name");

      if (facultyError) throw facultyError;

      // Get session timings for this phase
      const { data: timingsData, error: timingsError } = await supabase
        .from("session_timings")
        .select("*")
        .eq("phase_id", phase)
        .order("start_time");

      if (timingsError) throw timingsError;

      setLab(labData);
      setFaculty(facultyData || []);
      setSessionTimings(timingsData || []);
      
      // Generate sessions based on student count
      generateSessions(labData.total_students, timingsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load session allocation data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSessions = (totalStudents: number, timings: SessionTiming[]) => {
    const studentsPerSession = 30;
    const totalSessions = Math.ceil(totalStudents / studentsPerSession);
    const sessionsPerDay = timings.length;
    
    const generatedSessions: SessionAllocation[] = [];
    let currentDate = new Date();
    
    for (let i = 0; i < totalSessions; i++) {
      const dayIndex = Math.floor(i / sessionsPerDay);
      const sessionInDay = i % sessionsPerDay;
      const sessionDate = new Date(currentDate);
      sessionDate.setDate(sessionDate.getDate() + dayIndex);
      
      const remainingStudents = totalStudents - (i * studentsPerSession);
      const studentsInThisSession = Math.min(studentsPerSession, remainingStudents);
      
      generatedSessions.push({
        sessionNumber: i + 1,
        date: sessionDate.toISOString().split('T')[0],
        timingId: timings[sessionInDay]?.id || "",
        studentsCount: studentsInThisSession,
        assignedFacultyId: null,
      });
    }
    
    setSessions(generatedSessions);
  };

  const handleFacultyAssignment = (sessionIndex: number, facultyId: string) => {
    const selectedFaculty = faculty.find(f => f.id === facultyId);
    
    if (selectedFaculty && selectedFaculty.years_of_experience < 2) {
      setWarningDialog({
        open: true,
        facultyId,
        sessionIndex,
        facultyName: selectedFaculty.name,
      });
      return;
    }
    
    assignFaculty(sessionIndex, facultyId);
  };

  const assignFaculty = (sessionIndex: number, facultyId: string) => {
    const updatedSessions = [...sessions];
    updatedSessions[sessionIndex].assignedFacultyId = facultyId;
    setSessions(updatedSessions);
  };

  const confirmLowExperienceAssignment = () => {
    assignFaculty(warningDialog.sessionIndex, warningDialog.facultyId);
    setWarningDialog({ open: false, facultyId: "", sessionIndex: -1, facultyName: "" });
  };

  const getAvailableFaculty = (sessionDate: string) => {
    // Filter out faculty already assigned on the same date
    const assignedOnDate = sessions
      .filter(s => s.date === sessionDate && s.assignedFacultyId)
      .map(s => s.assignedFacultyId);
    
    return faculty.filter(f => !assignedOnDate.includes(f.id));
  };

  const saveSchedule = async () => {
    try {
      setSaving(true);
      
      // Create session records
      const sessionData = sessions.map(session => ({
        session_number: session.sessionNumber,
        lab_id: labId,
        timing_id: session.timingId,
        session_date: session.date,
        student_count: session.studentsCount,
        assigned_faculty_id: session.assignedFacultyId,
      }));

      const { error } = await supabase
        .from("sessions")
        .insert(sessionData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session schedule saved successfully",
        variant: "default",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast({
        title: "Error",
        description: "Failed to save schedule",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const downloadPDF = () => {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(16);
    pdf.text("Practical Examination Schedule", 20, 20);
    
    pdf.setFontSize(12);
    pdf.text(`Lab: ${lab?.name} (${lab?.code})`, 20, 35);
    pdf.text(`Period: ${period?.replace('-', ' ')}`, 20, 45);
    pdf.text(`Phase: ${phase?.replace('-', ' ')}`, 20, 55);
    
    // Sessions table
    let yPos = 75;
    pdf.setFontSize(10);
    
    sessions.forEach((session, index) => {
      const timing = sessionTimings.find(t => t.id === session.timingId);
      const assignedFaculty = faculty.find(f => f.id === session.assignedFacultyId);
      
      pdf.text(`Session ${session.sessionNumber}`, 20, yPos);
      pdf.text(`Date: ${session.date}`, 70, yPos);
      pdf.text(`Time: ${timing?.label}`, 120, yPos);
      pdf.text(`Students: ${session.studentsCount}`, 20, yPos + 10);
      pdf.text(`Faculty: ${assignedFaculty?.name || 'Not Assigned'}`, 70, yPos + 10);
      
      yPos += 25;
      
      if (yPos > 270) {
        pdf.addPage();
        yPos = 20;
      }
    });
    
    pdf.save(`${lab?.name}-schedule.pdf`);
  };

  if (loading) {
    return (
      <AppLayout title="Allocate Sessions & Faculty" showBackButton backTo={`/view-labs?period=${period}&phase=${phase}&regulation=${regulationId}&department=${departmentId}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  const getTimingLabel = (timingId: string) => {
    const timing = sessionTimings.find(t => t.id === timingId);
    return timing ? timing.label : "Unknown Time";
  };

  return (
    <AppLayout 
      title="Allocate Sessions & Faculty" 
      showBackButton 
      backTo={`/view-labs?period=${period}&phase=${phase}&regulation=${regulationId}&department=${departmentId}`}
    >
      <div className="space-y-8">
        {/* Lab Summary */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">{lab?.name} - Session Allocation</CardTitle>
            <CardDescription>
              {lab?.code} • Total Students: {lab?.total_students} • Sessions Required: {sessions.length}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Sessions Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Session Allocation</h3>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={downloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="gradient" onClick={saveSchedule} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Schedule"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {sessions.map((session, index) => {
              const availableFaculty = getAvailableFaculty(session.date);
              const assignedFaculty = faculty.find(f => f.id === session.assignedFacultyId);
              
              return (
                <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Session {session.sessionNumber}</CardTitle>
                      <Badge variant={session.assignedFacultyId ? "default" : "outline"}>
                        {session.assignedFacultyId ? "Assigned" : "Pending"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{session.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{getTimingLabel(session.timingId)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{session.studentsCount} students</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Internal Examiner</label>
                      <Select
                        value={session.assignedFacultyId || ""}
                        onValueChange={(value) => handleFacultyAssignment(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select faculty" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFaculty.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{f.name}</span>
                                {f.years_of_experience < 2 && (
                                  <Badge variant="destructive" className="ml-2 text-xs">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Low Exp
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {assignedFaculty && (
                      <div className="bg-secondary/50 p-3 rounded-lg text-sm">
                        <div className="flex items-center space-x-2 mb-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{assignedFaculty.name}</span>
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {assignedFaculty.years_of_experience} years experience
                        </div>
                        {assignedFaculty.specialization && (
                          <div className="text-muted-foreground text-xs">
                            {assignedFaculty.specialization}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Faculty Experience Warning */}
        <Alert className="border-warning bg-warning/5">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning-foreground">
            <strong>Note:</strong> Faculty with less than 2 years of experience will trigger a warning when assigned.
            Once assigned for a day, faculty cannot be double-booked for the same date.
          </AlertDescription>
        </Alert>
      </div>

      {/* Warning Dialog */}
      <Dialog open={warningDialog.open} onOpenChange={(open) => setWarningDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span>Low Experience Warning</span>
            </DialogTitle>
            <DialogDescription>
              {warningDialog.facultyName} has less than 2 years of experience. Are you sure you want to assign them as an internal examiner?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWarningDialog(prev => ({ ...prev, open: false }))}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmLowExperienceAssignment}>
              Assign Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}