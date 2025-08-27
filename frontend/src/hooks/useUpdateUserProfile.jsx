import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

/*
 * Custom hook to update the authenticated user's profile.
 * Handles API request, success/error notifications, and cache invalidation.
 */

const useUpdateUserProfile = () => {
	const queryClient = useQueryClient();

	const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useMutation({
		// --- API Request ---
		mutationFn: async (formData) => {
			const res = await fetch(`/api/users/update`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Something went wrong");
			}
			return data;
		},

		// --- On Success ---
		onSuccess: () => {
			toast.success("Profile updated successfully");

			// Invalidate all queries that depend on updated user data
			const queriesToInvalidate = [
				["authUser"], // Updates logged-in user's info
				["userProfile"], // Updates profile view page
			];

			Promise.all(
				queriesToInvalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
			);
		},

		// --- On Error ---
		onError: (error) => {
			toast.error(error.message || "Failed to update profile");
		},
	});

	return { updateProfile, isUpdatingProfile };
};

export default useUpdateUserProfile;
