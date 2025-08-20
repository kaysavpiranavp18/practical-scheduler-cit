import { differenceInCalendarDays, eachDayOfInterval, formatISO } from "date-fns";

export type Lab = { id: string; name: string; capacity: number };
export type Subject = { id?: string; name: string; code: string };

export type AllocationInput = {
	startDate: string;
	endDate: string;
	sessionsPerDay: number;
	totalStudents: number;
	labs: Lab[];
	subjects: Subject[];
};

export type AllocationRow = {
	date: string;
	session: number;
	labName: string;
	labId?: string;
	subjectCode: string;
	subjectName: string;
	studentsAllocated: number;
	time: string;
};

export function generateAllocations(input: AllocationInput): AllocationRow[] {
	const { startDate, endDate, sessionsPerDay, totalStudents, labs, subjects } = input;
	if (!labs.length || !subjects.length) return [];

	const days = eachDayOfInterval({ start: new Date(startDate), end: new Date(endDate) });
	if (days.length === 0 || sessionsPerDay <= 0) return [];

	const rows: AllocationRow[] = [];

	// Define session timings based on the requirements
	const sessionTimings = [
		"8:30 AM - 10:30 AM", // Session 1
		"11:00 AM - 1:00 PM", // Session 2
		"1:30 PM - 3:30 PM",  // Session 3
	];

	// For each subject, allocate ALL students across the available slots evenly
	for (const subject of subjects) {
		let remainingForSubject = totalStudents;
		outer: for (const day of days) {
			for (let s = 1; s <= sessionsPerDay; s += 1) {
				for (const lab of labs) {
					if (remainingForSubject <= 0) break outer;
					const assign = Math.min(lab.capacity, remainingForSubject);
					rows.push({
						date: formatISO(day, { representation: "date" }),
						session: s,
						labName: lab.name,
						labId: lab.id,
						subjectCode: subject.code,
						subjectName: subject.name,
						studentsAllocated: assign,
						time: sessionTimings[s - 1] || "Unknown",
					});
					remainingForSubject -= assign;
				}
			}
		}
	}

	return rows;
}


