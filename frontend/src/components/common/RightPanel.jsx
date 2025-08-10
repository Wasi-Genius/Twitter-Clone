import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./LoadingSpinner";
import useFollow from "../../hooks/userFollow";

// Fetch helper
const fetchSuggestedUsers = async () => {
	try {
		const res = await fetch("/api/users/suggested");
		const data = await res.json();

		if (!res.ok) {
			throw new Error(data.error || "Failed to fetch suggested users");
		}

		return data.users;
	} catch (error) {
		throw new Error(error.message || "Error fetching suggested users");
	}
};

const RightPanel = () => {
	const { data: suggestedUsers, isLoading } = useQuery({
		queryKey: ["suggestedUsers"],
		queryFn: fetchSuggestedUsers,
	});

	const { follow, isPending } = useFollow();

	// If no suggested users, show empty container (keeps layout consistent)
	if (!isLoading && (!suggestedUsers || suggestedUsers.length === 0)) {
		return (
			<div className="hidden lg:block my-4 mx-2">
				<div className="invisible p-4 rounded-md sticky top-2">
					<p className="font-bold">Who to follow:</p>
				</div>
			</div>
		);
	}

	return (
		<div className="hidden lg:block my-4 mx-2">
			<div className="bg-[#16181C] p-4 rounded-md sticky top-2">
				<p className="font-bold">Who to follow</p>
				<div className="flex flex-col gap-4">
					{isLoading
						? Array.from({ length: 4 }).map((_, idx) => (
								<RightPanelSkeleton key={idx} />
						  ))
						: suggestedUsers?.map((user) => (
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
									<button
										className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
										onClick={(e) => {
											e.preventDefault();
											follow(user._id);
										}}
									>
										{isPending ? (
											<LoadingSpinner size="sm" />
										) : (
											"Follow"
										)}
									</button>
								</Link>
						  ))}
				</div>
			</div>
		</div>
	);
};

export default RightPanel;
