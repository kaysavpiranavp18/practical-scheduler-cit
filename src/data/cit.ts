export const citRegulations = [
	{ name: "R2022", description: "Anna University Regulation 2022" },
	{ name: "R2024", description: "Anna University Regulation 2024" },
	{ name: "R2025", description: "Anna University Regulation 2025" },
];

export const citDepartments: string[] = [
	"Civil Engineering",
	"Mechanical Engineering",
	"Computer Science and Engineering",
	"Electrical and Electronics Engineering",
	"Electronics and Communication Engineering",
	"Mechatronics Engineering",
	"Biomedical Engineering",
	"Information Technology",
	"Computer Science and Business Systems",
	"Artificial Intelligence and Data Science",
	"Computer Science and Engineering (AI & ML)",
	"Computer Science and Engineering (Cyber Security)",
];

export function defaultLabsForDepartment() {
	return [
		{ name: "Lab 1", capacity: 30 },
		{ name: "Lab 2", capacity: 30 },
		{ name: "Lab 3", capacity: 24 },
	];
}


