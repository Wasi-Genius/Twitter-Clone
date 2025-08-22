import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./LoadingSpinner";
import useFollow from "../../hooks/userFollow";

// Fetch helpers
const fetchSuggestedUsers = async () => {
	try {
		console.log("[fetchSuggestedUsers] Fetching suggested users...");
		const res = await fetch("/api/users/suggested");
		const data = await res.json();

		console.log("[fetchSuggestedUsers] Response:", data);

		if (!res.ok) {
			console.error("[fetchSuggestedUsers] Error:", data.error);
			throw new Error(data.error || "Failed to fetch suggested users");
		}

		return data.users;
	} catch (error) {
		console.error("[fetchSuggestedUsers] Exception:", error.message);
		throw new Error(error.message || "Error fetching suggested users");
	}
};

const fetchFollowers = async (userId) => {
  try {
    console.log(`[fetchFollowers] Fetching followers for userId=${userId}...`);

    const res = await fetch(`/api/users/followers/${userId}`);
    const data = await res.json();

    console.log(`[fetchFollowers] Response for userId=${userId}:`, data);

    if (!res.ok) {
      console.error("[fetchFollowers] Error:", data.error);
      throw new Error(data.error || "Failed to fetch followers");
    }

    return data;
  } catch (error) {
    console.error("[fetchFollowers] Exception:", error.message);
    throw new Error(error.message || "Error fetching followers");
  }
};

const fetchFollowing = async (userId) => {
  try {
    console.log(`[fetchFollowing] Fetching following for userId=${userId}...`);

    const res = await fetch(`/api/users/following/${userId}`);
    const data = await res.json();

    console.log(`[fetchFollowing] Response for userId=${userId}:`, data);

    if (!res.ok) {
      console.error("[fetchFollowing] Error:", data.error);
      throw new Error(data.error || "Failed to fetch following");
    }

    return data;
  } catch (error) {
    console.error("[fetchFollowing] Exception:", error.message);
    throw new Error(error.message || "Error fetching following");
  }
};

const RightPanel = ({ type = "suggested", username, isModal = false }) => {
	console.log("[RightPanel] Rendered with props:", { type, username, isModal });

	const { data: users, isLoading, error } = useQuery({
		queryKey: [type, username],
		queryFn: () => {
			console.log("[useQuery] Running query for:", { type, username });
			if (type === "followers") return fetchFollowers(username);
			if (type === "following") return fetchFollowing(username);
			return fetchSuggestedUsers();
		},
		enabled: type === "suggested" || !!username,
	});

	const { follow, isPending } = useFollow();

	if (error) {
		console.error("[RightPanel] Query error:", error.message);
	}

	// If no users, show invisible box (keeps layout consistent for suggested)
	if (!isLoading && (!users || users.length === 0) && !isModal) {
		console.warn("[RightPanel] No users returned for type:", type);
		return (
			<div className="hidden lg:block my-4 mx-2">
				<div className="invisible p-4 rounded-md sticky top-2">
					<p className="font-bold">Who to follow:</p>
				</div>
			</div>
		);
	}

	console.log("[RightPanel] Users data:", users);

	return (
		<div className={`my-4 mx-2 ${isModal ? "block" : "hidden lg:block"}`}>
			<div className="bg-[#16181C] p-4 rounded-md sticky top-2">
				<p className="font-bold">
					{type === "followers"
						? "Followers"
						: type === "following"
						? "Following"
						: "Who to follow"}
				</p>

				<div className="flex flex-col gap-4">
					{isLoading
						? Array.from({ length: 4 }).map((_, idx) => (
								<RightPanelSkeleton key={idx} />
						  ))
						: users?.map((user) => {
								console.log("[RightPanel] Rendering user:", user);
								return (
									<Link
										to={`/profile/${user.username}`}
										className="flex items-center justify-between gap-4"
										key={user._id}
									>
										<div className="flex gap-2 items-center">
											<div className="avatar">
												<div className="w-8 rounded-full">
													<img
														src={
															user.profileImg ||
															"/avatar-placeholder.png"
														}
														alt={user.fullName}
													/>
												</div>
											</div>
											<div className="flex flex-col">
												<span className="font-semibold tracking-tight truncate w-28">
													{user.fullName}
												</span>
												<span className="text-sm text-slate-500">
													@{user.username}
												</span>
											</div>
										</div>

										{/* Only show Follow button for suggested users */}
										{type === "suggested" && (
											<button
												className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
												onClick={(e) => {
													e.preventDefault();
													console.log(
														"[RightPanel] Follow clicked for user:",
														user._id
													);
													follow(user._id);
												}}
											>
												{isPending ? (
													<LoadingSpinner size="sm" />
												) : (
													"Follow"
												)}
											</button>
										)}
									</Link>
								);
						  })}
				</div>
			</div>
		</div>
	);
};

export default RightPanel;
