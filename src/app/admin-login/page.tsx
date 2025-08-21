"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AdminLogin() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	async function login() {
		setLoading(true); setError("");
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		setLoading(false);
		if (error) { setError(error.message); return; }
		router.replace("/");
	}

	return (
		<main className="py-6">
			<Card className="card-enhanced max-w-md mx-auto">
				<CardHeader>
					<CardTitle className="text-gradient">Admin Login</CardTitle>
				</CardHeader>
				<CardContent className="space-y-5">
					<div>
						<Label className="text-sm text-muted-foreground">Email</Label>
						<Input className="input-enhanced mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
					</div>
					<div>
						<Label className="text-sm text-muted-foreground">Password</Label>
						<Input className="input-enhanced mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
					</div>
					{error && <p className="text-sm text-red-600">{error}</p>}
					<Button className="btn-gradient" onClick={login} disabled={loading || !email || !password}>Login</Button>
				</CardContent>
			</Card>
		</main>
	);
}
