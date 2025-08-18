import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { FaRegComment, FaRegHeart, FaTrash } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegBookmark } from "react-icons/fa6";

import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date/dateTools";


const Post = ({ post }) => {
  const [comment, setComment] = useState("");
  const [likes, setLikes] = useState(post.likes || []);

  const queryClient = useQueryClient();

  // Fetch authenticated user info (already cached in other places)
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const postOwner = post.user;
  const isMyPost = authUser._id === postOwner._id;
  const isLiked = likes.includes(authUser._id?.toString());
  const formattedDate = formatPostDate(post.createdAt);

  /*
   * Utility function for API calls
   * Helps avoid repeating try/catch/fetch boilerplate
   */
  const apiRequest = async (url, method = "GET", body) => {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.error || data.message || "Something went wrong");
    return data;
  };

  // ----- DELETE POST -----
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: () => apiRequest(`/api/posts/${post._id}`, "DELETE"),
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => toast.error(error.message),
  });

  // ----- LIKE POST -----
  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: () => apiRequest(`/api/posts/like/${post._id}`, "POST"),
    onSuccess: (data) => setLikes(data.updatedLikes),
    onMutate: () => {
      // Optimistic UI update
      setLikes((prev) =>
        isLiked
          ? prev.filter((id) => id !== authUser._id)
          : [...prev, authUser._id]
      );
    },
    onError: (error) => toast.error(error.message),
  });

	// ----- COMMENT ON POST -----
  const { mutate: commentPost, isPending: isCommenting } = useMutation({
	mutationFn: (commentText) => {
		console.log("mutationFn called with:", commentText, "type:", typeof commentText);
		return apiRequest(`/api/posts/comment/${post._id}`, "POST", { text: commentText });
	},

	onSuccess: () => {
		console.log("Comment posted successfully");
		toast.success("Commented successfully");
		setComment("");
		queryClient.invalidateQueries({ queryKey: ["posts"] });
	},

	onError: (error) => {
		console.log("Comment mutation error:", error);
		toast.error(error.message || "Something went wrong");
	},
	});

  // ----- HANDLERS -----
  const handleDeletePost = () => !isDeleting && deletePost();
  const handleLikePost = () => !isLiking && likePost();
  const handlePostComment = (e) => {
		e.preventDefault();
		console.log("handlePostComment called. comment state:", comment, "type:", typeof comment);

		// Make sure it's a string before trimming
		if (typeof comment !== "string") {
			console.error("Error: comment is not a string!", comment);
			toast.error("Something went wrong with your comment");
			return;
		}

		const trimmed = comment.trim();
		console.log("Trimmed comment:", trimmed);

		if (!trimmed) {
			toast.error("Comment cannot be empty");
			return;
		}

		if (!isCommenting) {
			console.log("Calling commentPost with:", trimmed);
			commentPost(trimmed);
		}
	};

  // ----- REPOST -----
  const { mutate: rePost, isPending: isReposting } = useMutation({
    mutationFn: async (text = "") => {

      console.log("➡️ Attempting repost for post:", post._id, "with text:", text);

      const res = await apiRequest(
        `/api/posts/${post._id}/repost`,
        "POST",
        { text }
      );
      console.log("✅ Repost API response:", res);
      return res;
    },

    onSuccess: (data) => {

      console.log("🎉 Repost successful:", data);
      toast.success("Reposted successfully!");

      // if you want the repost to appear right away, invalidate queries or update local state:
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },

    onError: (error) => {
      console.error("❌ Error while reposting:", error);
      toast.error(error.message || "Failed to repost");
    },
  });

  const [isRepostModalOpen, setIsRepostModalOpen] = useState(false);
  const [repostText, setRepostText] = useState("");

  return (
    <div className="flex gap-2 items-start p-4 border-b border-gray-700">

      {/* Profile Image */}
      <div className="avatar">
        <Link
          to={`/profile/${postOwner.username}`}
          className="w-8 rounded-full overflow-hidden"
        >
          <img
            src={postOwner.profileImg || "/avatar-placeholder.png"}
            alt={`${postOwner.fullName} profile`}
          />
        </Link>
      </div>

      {/* Post Content */}
      <div className="flex flex-col flex-1">

        {/* Header */}
        <div className="flex gap-2 items-center">
          <Link to={`/profile/${postOwner.username}`} className="font-bold">
            {postOwner.fullName}
          </Link>

          <span className="text-gray-700 flex gap-1 text-base">
            <Link to={`/profile/${postOwner.username}`}>
              @{postOwner.username}
            </Link>

            <span>·</span>

            <span>{formattedDate}</span>

          </span>

          {/* Delete Button */}
          {isMyPost && (
            <span className="flex justify-end flex-1">
              {!isDeleting ? (
                <FaTrash
                  className="cursor-pointer hover:text-red-500"
                  onClick={handleDeletePost}
                />
              ) : (
                <LoadingSpinner size="sm" />
              )}
            </span>
          )}
        </div>

        {/* Text + Image */}
        <div className="flex flex-col gap-3 overflow-hidden">
          <span>{post.text}</span>
          {post.img && (
            <img
              src={post.img}
              className="h-80 object-contain rounded-lg border border-gray-700"
              alt="Post attachment"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-3">

          <div className="flex gap-4 items-center w-2/3 justify-between">
            {/* Comments */}
            <div
              className="flex gap-1 items-center cursor-pointer group"
              onClick={() =>
                document.getElementById(`comments_modal${post._id}`).showModal()
              }
            >
              <FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
              <span className="text-sm text-slate-500 group-hover:text-sky-400">
                {post.comments.length}
              </span>
            </div>

            {/* Comment Modal */}
            <dialog
              id={`comments_modal${post._id}`}
              className="modal border-none outline-none"
            >
              <div className="modal-box rounded border border-gray-600">
                <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
                <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                  {post.comments.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Be the first to comment.
                    </p>
                  ) : (
                    post.comments.map((comment) => (
                      <div key={comment._id} className="flex gap-2 items-start">

                        <div className="avatar">
                          <div className="w-8 rounded-full">
                            <img
                              src={
                                comment.user.profileImg ||
                                "/avatar-placeholder.png"
                              }
                              alt={`${comment.user.fullName} profile`}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-bold">
                              {comment.user.fullName}
                            </span>

                            <span className="text-gray-500 text-sm">
                              @{comment.user.username}
                            </span>

                          </div>

                          <div className="text-base">{comment.text}</div>

						  <div>
							<span className="text-gray-500 text-sm">
								{formatPostDate(comment.createdAt)}
							</span>
						  </div>

                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Input */}
                <form
                  className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                  onSubmit={handlePostComment}
                >
                  <textarea
                    className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                    {isCommenting ? <LoadingSpinner size="md" /> : "Post"}
                  </button>
                </form>
              </div>
              <form method="dialog" className="modal-backdrop">
                <button className="outline-none">close</button>
              </form>
            </dialog>

            {/* Repost */}
        
            <div
              className="flex gap-1 items-center group cursor-pointer"
              onClick={() => setIsRepostModalOpen(true)}
            >
              <BiRepost className="w-6 h-6 group-hover:text-green-500 text-slate-500" />
            </div>

            {isRepostModalOpen && (
              <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center">
                <div className="bg-black p-4 rounded-lg w-[400px]">
                  <textarea
                    value={repostText}
                    onChange={(e) => setRepostText(e.target.value)}
                    placeholder="Add your thoughts..."
                    className="w-full border rounded p-2"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => setIsRepostModalOpen(false)}
                      className="px-3 py-1 bg-gray-200 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={isReposting}
                      onClick={() => {
                        rePost(repostText);
                        setIsRepostModalOpen(false);
                        setRepostText("");
                      }}
                      className="px-3 py-1 bg-green-500 text-white rounded"
                    >
                      {isReposting ? "Reposting..." : "Repost"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Likes */}
            <div
              className="flex gap-1 items-center group cursor-pointer"
              onClick={handleLikePost}
            >
              {isLiking && <LoadingSpinner size="sm" />}
              {!isLiked && !isLiking && (
                <FaRegHeart className="w-4 h-4 text-slate-500 group-hover:text-pink-500" />
              )}
              {isLiked && !isLiking && (
                <FaRegHeart className="w-4 h-4 text-pink-500" />
              )}
              <span
                className={`text-sm group-hover:text-pink-500 ${
                  isLiked ? "text-pink-500" : "text-slate-500"
                }`}
              >
                {likes.length}
              </span>
            </div>
          </div>

          {/* Right Action Group */}
          <div className="flex w-1/3 justify-end gap-2 items-center">
            <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
