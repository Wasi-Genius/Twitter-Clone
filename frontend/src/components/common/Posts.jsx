import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

const Posts = ({ feedType, username, userId }) => {
  // Memoize endpoint to avoid recalculating on every render unless dependencies change
  const POST_ENDPOINT = useMemo(() => {
    switch (feedType) {
      case "following":
        return "/api/posts/following";
      case "posts":
        return `/api/posts/user/${username}`;
      case "likes":
        return `/api/posts/likes/${userId}`;
      case "forYou":
      default:
        return "/api/posts/all";
    }
  }, [feedType, username, userId]);

  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts", feedType, username, userId], // include params to avoid stale cache
    queryFn: async () => {
      const res = await fetch(POST_ENDPOINT);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch posts");
      }
      return data;
    },
    keepPreviousData: true, // keeps old data while fetching new
  });

  // Refetch when feed type or target user changes
  useEffect(() => {
    refetch();
  }, [feedType, username, refetch]);

  // Loading state UI
  if (isLoading || isRefetching) {
    return (
      <div className="flex flex-col justify-center">
        {[...Array(3)].map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state UI
  if (posts?.length === 0) {
    return <p className="text-center my-4">No posts currently in this tab.</p>;
  }

  // Posts list UI
  return (
    <div>
      {posts?.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
};

export default Posts;
