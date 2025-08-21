"use client";
import React from "react";

type Props = {
	cycle?: string;
	phase?: string;
};

export default function SummaryBar({ cycle, phase }: Props) {
	if (!cycle && !phase) return null;

	function renderPhaseLabel(p?: string) {
		if (!p) return undefined;
		if (p === "phase-1") return "Phase 1";
		if (p === "phase-2") return "Phase 2";
		if (p === "phase-3") return "Phase 3";
		return p;
	}

	const phaseText = renderPhaseLabel(phase)?.toUpperCase();
	const cycleText = (cycle || "").toUpperCase();
	const title = `END-SEMESTER PRACTICAL EXAMINATION - ${cycleText}${phaseText ? ` (${phaseText})` : ""}`;

	return (
		<div className="mb-6">
			<div className="glass p-4 rounded-xl hover-lift">
				<p className="text-lg md:text-2xl font-semibold tracking-wide text-gradient">
					{title}
				</p>
				<div className="mt-2 h-1 progress-bar w-full" />
			</div>
		</div>
	);
}


