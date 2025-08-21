import "../index.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Image from "next/image";
import { Toaster } from "@/components/ui/sonner";
import ReloadRedirect from "@/components/ReloadRedirect";
import GlobalSubtitle from "@/components/GlobalSubtitle";

export const metadata: Metadata = {
	title: "Practicals Scheduler",
	description: "CIT Practical Exam Scheduling",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-background antialiased">
				<ReloadRedirect />
				{/* App Shell Header */}
				<header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
					<div className="container flex h-14 items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-lg overflow-hidden bg-white shadow-md flex items-center justify-center">
								<Image src="/cit-logo.png" alt="CIT Logo" width={40} height={40} className="object-contain" priority />
							</div>
							<div>
								<p className="text-sm leading-tight text-muted-foreground">Chennai Institute of Technology</p>
								<h1 className="text-base font-semibold tracking-tight">Practicals Scheduler</h1>
							</div>
						</div>
						<div className="text-xs text-muted-foreground hidden sm:block">End-Semester Practical Examination Portal</div>
					</div>
				</header>

				{/* Global dynamic subtitle */}
				<GlobalSubtitle />

				{/* Page Content */}
				<div className="container py-6">
					{children}
				</div>

				{/* Global Toaster */}
				<Toaster />

				{/* Footer */}
				<footer className="mt-10 border-t bg-white/70 backdrop-blur">
					<div className="container py-6 text-center text-xs text-muted-foreground">
						&copy; 2025 Chennai Institute of Technology
					</div>
				</footer>
			</body>
		</html>
	);
}
