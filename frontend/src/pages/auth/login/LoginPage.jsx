import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import SunCloudLogo from "../../../components/svgs/SunCloud.jsx";
import { MdOutlineMail, MdPassword } from "react-icons/md";

/*
 * Login page for Evermore.
 * Handles user authentication and updates global auth state.
 */

const LoginPage = () => {
	const [formData, setFormData] = useState({ username: "", password: "" });

	const queryClient = useQueryClient();

	// --- Mutation for login ---
	const {
		mutate: loginMutation,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: async ({ username, password }) => {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Login failed");
			}

			return data.user;
		},
		onSuccess: () => {
			// Refresh authenticated user data
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
			toast.success("Login successful!");
		},
		onError: (err) => {
			toast.error(err.message || "An error occurred during login.");
		},
	});

	// --- Event Handlers ---
	const handleSubmit = (e) => {
		e.preventDefault();
		loginMutation(formData);
	};

	const handleInputChange = (e) => {
		setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	return (
		<div className="max-w-screen-xl mx-auto flex h-screen">
			{/* Left side graphic (desktop only) */}
			<div className="flex-1 hidden lg:flex items-center justify-center">
				<SunCloudLogo className="lg:w-2/3 fill-white" />
			</div>

			{/* Login Form */}
			<div className="flex-1 flex flex-col justify-center items-center">
				<form className="flex gap-4 flex-col" onSubmit={handleSubmit}>
					<SunCloudLogo className="w-24 lg:hidden fill-white" />
					<h1 className="text-4xl font-extrabold text-white">Login to Evermore.</h1>

					{/* Username */}
					<label className="input input-bordered rounded flex items-center gap-2">
						<MdOutlineMail />
						<input
							type="text"
							className="grow"
							placeholder="Username"
							name="username"
							onChange={handleInputChange}
							value={formData.username}
						/>
					</label>

					{/* Password */}
					<label className="input input-bordered rounded flex items-center gap-2">
						<MdPassword />
						<input
							type="password"
							className="grow"
							placeholder="Password"
							name="password"
							onChange={handleInputChange}
							value={formData.password}
						/>
					</label>

					{/* Submit Button */}
					<button className="btn rounded-full btn-primary text-white">
						{isPending ? "Logging in..." : "Login"}
					</button>

					{/* Error Message */}
					{isError && (
						<p className="text-red-500">{error.message || "An error occurred during login."}</p>
					)}
				</form>

				{/* Sign-up link */}
				<div className="flex flex-col gap-2 mt-4">
					<p className="text-white text-lg">{"Don't"} have an account?</p>
					<Link to="/signup">
						<button className="btn rounded-full btn-primary text-white btn-outline w-full">
							Sign up
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
