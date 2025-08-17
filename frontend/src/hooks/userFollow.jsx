import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

/*

 * Custom hook for following/unfollowing a user.
 * Handles API call, error handling, and React Query cache updates.
 
*/
const useFollow = () => {
	const queryClient = useQueryClient();

	const { mutate: follow, isPending } = useMutation({
		// --- API Call ---
		mutationFn: async (userId) => {
			const res = await fetch(`/api/users/follow/${userId}`, {
				method: "POST",
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Something went wrong");
			}
			return data;
		},

		// --- On Success: Update UI ---
		onSuccess: () => {
			// Invalidate all queries that may be affected by follow changes
			const queriesToInvalidate = [
				["suggestedUsers"], // Updates suggested users list
				["authUser"], // Updates follower/following count
				["userProfile"], // Updates the viewed profile
			];

			Promise.all(
				queriesToInvalidate.map((queryKey) =>
					queryClient.invalidateQueries({ queryKey })
				)
			);
		},

		// --- On Error: Show Notification ---
		onError: (error) => {
			toast.error(error.message || "Something went wrong");
		},
	});

	return { follow, isPending };
};

export default useFollow;
