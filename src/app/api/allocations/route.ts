import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/integrations/supabase/client";
import { generateAllocations } from "@/lib/allocation";

export async function POST(req: NextRequest) {
	const body = await req.json();
	const { department_id, subjects, start, end, sessions_per_day, total_students, faculty_by_subject_day_lab } = body || {};

	if (!department_id || !start || !end || !sessions_per_day || !total_students || !Array.isArray(subjects)) {
		return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
	}

	const { data: labs } = await supabase
		.from("labs")
		.select("id, name, capacity")
		.eq("department_id", department_id);

	const rows = generateAllocations({
		startDate: start,
		endDate: end,
		sessionsPerDay: Number(sessions_per_day),
		totalStudents: Number(total_students),
		labs: (labs || []) as any,
		subjects,
	});

	// Optionally persist internal faculty assignment mapping if table exists
	if (faculty_by_subject_day_lab && typeof faculty_by_subject_day_lab === 'object') {
		try {
			const entries = Object.entries(faculty_by_subject_day_lab as Record<string, string>);
			for (const [subject_code, faculty_id] of entries) {
				await supabase.from('internal_assignments' as any).upsert({
					id: crypto.randomUUID(),
					department_id,
					subject_code,
					faculty_id,
					start_date: start,
					end_date: end,
				});
			}
		} catch {}
	}

	return NextResponse.json({ allocations: rows, faculty_by_subject_day_lab: faculty_by_subject_day_lab || {} });
}


