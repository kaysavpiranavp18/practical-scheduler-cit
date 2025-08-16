import { NextResponse } from "next/server";
import { supabase } from "@/integrations/supabase/client";
import { citDepartments, citRegulations, defaultLabsForDepartment } from "@/data/cit";

export async function POST() {
	// Insert regulations
	const regIds: Record<string, string> = {};
	for (const r of citRegulations) {
		const id = crypto.randomUUID();
		regIds[r.name] = id;
		await supabase.from("regulations").upsert({ id, name: r.name, description: r.description } as any);
	}

	// Attach departments spread across regs (simple round-robin)
	const regNames = citRegulations.map((r) => r.name);
	for (let i = 0; i < citDepartments.length; i += 1) {
		const name = citDepartments[i];
		const regName = regNames[i % regNames.length];
		const departmentId = crypto.randomUUID();
		await supabase.from("departments").upsert({ id: departmentId, name, regulation_id: regIds[regName] } as any);
		// Create default labs
		for (const lab of defaultLabsForDepartment()) {
			await supabase.from("labs").upsert({ id: crypto.randomUUID(), name: lab.name, capacity: lab.capacity, department_id: departmentId } as any);
		}

		// Seed a couple of faculty per department
		const facultySeed = [
			{ name: "Dr. Anitha R", email: `anitha.${i}@cit.edu`, years: 8 },
			{ name: "Prof. Balaji S", email: `balaji.${i}@cit.edu`, years: 1 },
			{ name: "Dr. Chitra K", email: `chitra.${i}@cit.edu`, years: 5 },
			{ name: "Prof. Dinesh M", email: `dinesh.${i}@cit.edu`, years: 3 },
			{ name: "Dr. Elango V", email: `elango.${i}@cit.edu`, years: 12 },
		];
		for (const f of facultySeed) {
			await supabase.from("faculty").upsert({
				id: crypto.randomUUID(),
				name: f.name,
				email: f.email,
				department: departmentId,
				years_of_experience: f.years,
				specialization: i % 2 === 0 ? "CSE/IT" : "ECE/EEE"
			} as any);
		}
	}

	return NextResponse.json({ ok: true });
}


