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
			return { ...data, userId }; // return userId along with backend response
		},

		// --- Optimistic UI update ---
		onMutate: async (userId) => {
			await queryClient.cancelQueries({ queryKey: ["authUser"] });

			const prevAuthUser = queryClient.getQueryData(["authUser"]);

			// Optimistically update
			queryClient.setQueryData(["authUser"], (old) => {
				if (!old) return old;

				const isFollowing = old.following.includes(userId);

				return {
					...old,
					following: isFollowing
						? old.following.filter((id) => id !== userId)
						: [...old.following, userId],
				};
			});

			return { prevAuthUser };
		},

		// --- On Error: Rollback ---
		onError: (error, _variables, context) => {
			if (context?.prevAuthUser) {
				queryClient.setQueryData(["authUser"], context.prevAuthUser);
			}
			toast.error(error.message || "Something went wrong");
		},

		// --- On Success: Ensure fresh data ---
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["userProfile"] });
			queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
		},
	});

	return { follow, isPending };
};

export default useFollow;
