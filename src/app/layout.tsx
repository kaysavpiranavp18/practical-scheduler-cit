import "../index.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
	title: "Examflow Schedulr",
	description: "CIT Practical Exam Scheduling",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body>
				{children}
				<Toaster />
			</body>
		</html>
	);
}


