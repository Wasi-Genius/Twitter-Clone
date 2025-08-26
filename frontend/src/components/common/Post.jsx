import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { FaRegComment, FaRegHeart, FaTrash, FaRegBookmark } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";

import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date/dateTools";

import { useEffect } from "react";

/**
 * Utility function for API requests.
 */
const apiRequest = async (url, method = "GET", body) => {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Something went wrong");
  return data;
};

/**
 * Renders the original post inside a repost.
 */
const RepostContent = ({ repostOf, onImageClick }) => (
  <div className="flex gap-2 items-start p-4 border-b border-gray-700 rounded-lg bg-gray-900">
    <div className="avatar">
      <Link
        to={`/profile/${repostOf.user.username}`}
        className="w-8 h-8 rounded-full overflow-hidden"
      >
        <img
          src={repostOf.user.profileImg || "/avatar-placeholder.png"}
          alt={`${repostOf.user.fullName} profile`}
        />
        {repostOf.user.fullName}
      </Link>
    </div>
    <div className="flex flex-col flex-1">
      <Link to={`/profile/${repostOf.user.username}`} className="font-bold">
        {repostOf.user.fullName}
      </Link>
      <span className="text-gray-700 flex gap-1 text-base">
        <Link to={`/profile/${repostOf.user.username}`}>@{repostOf.user.username}</Link>
        <span>·</span>
        <span>{formatPostDate(repostOf.createdAt)}</span>
      </span>
      <div className="flex flex-col gap-3 overflow-hidden">
        {repostOf.text}
        {repostOf.img && (
          <img
            src={repostOf.img}
            className="h-60 object-contain rounded-md border border-gray-700"
            alt="Original post attachment"
            onClick={() => onImageClick(repostOf.img)}
          />
        )}
      </div>
    </div>
  </div>
);

const Post = ({ post }) => {
  // ----- State -----
  const [comment, setComment] = useState("");
  const [repostText, setRepostText] = useState("");
  const [likes, setLikes] = useState(post.likes || []);
  const [bookmarks, setBookmarks] = useState(post.bookmarks || []);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImg, setPreviewImg] = useState(null); 

  const queryClient = useQueryClient();

  // ----- Authenticated User -----
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Failed to fetch auth user");
      return res.json();
    },
  });

  const postOwner = post.user;
  const isMyPost = authUser._id === postOwner._id;
  const isLiked = likes.includes(authUser._id?.toString());
  const isBookmarked = bookmarks.includes(authUser._id?.toString())
  const formattedDate = formatPostDate(post.createdAt);
  

  // ----- Mutations -----

  // Delete Post
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: () => apiRequest(`/api/posts/${post._id}`, "DELETE"),
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => toast.error(error.message),
  });

  // Like Post
  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: () => apiRequest(`/api/posts/like/${post._id}`, "POST"),
    onSuccess: (data) => setLikes(data.updatedLikes), 
    onMutate: () => {
      // Optimistic UI update
      setLikes((prev) =>
        isLiked ? prev.filter((id) => id !== authUser._id) : [...prev, authUser._id]
      );
    },
    onError: (error) => toast.error(error.message),
  });

  // Bookmark Post
  const { mutate: bookmarkPost, isPending: isBookmarking} = useMutation({
    mutationFn: () => apiRequest(`/api/posts/bookmark/${post._id}`, "POST"),
    onSuccess: (data) => setBookmarks(data.updatedBookmarks),
    onMutate: () => {
      setBookmarks((prev) => 
        isBookmarked ? prev.filter((id) => id !== authUser._id) : [...prev, authUser._id]
      );
    },
    onError: (error) => toast.error(error.message),
  })

  // Comment on Post
  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: (commentText) =>
      apiRequest(`/api/posts/comment/${post._id}`, "POST", { text: commentText }),
    onSuccess: () => {
      toast.success("Commented successfully");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => toast.error(error.message || "Something went wrong"),
  });

  // Delete a comment
  const { mutate: deleteComment} = useMutation({
    mutationFn: async (commentId) => {
      const res = await fetch(`/api/posts/comment/${post._id}/${commentId}`, { method: "DELETE" });

      const json = await res.json(); 

      if (!res.ok) throw new Error(json.error || "Failed to delete the comment!");
      return json;
    },
    onSuccess: () => {
      toast.success("Comment deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => toast.error(error.message || "Failed to delete comment"),
  })

  // Repost
  const { mutate: rePost, isPending: isReposting } = useMutation({
    mutationFn: async (text = "") =>
      apiRequest(`/api/posts/${post._id}/repost`, "POST", { text }),
    onSuccess: () => {
      toast.success("Reposted successfully!");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => toast.error(error.message || "Failed to repost"),
  });

  // ----- Handlers -----
  const handleDeletePost = () => !isDeleting && deletePost();
  const handleDeleteComment = (commentId) => deleteComment(commentId);
  const handleLikePost = () => !isLiking && likePost();
  const handleBookmarkPost = () => !isBookmarking && bookmarkPost();

  const handlePostComment = (e) => {
    e.preventDefault();
    const trimmed = comment.trim();
    if (!trimmed) return toast.error("Comment cannot be empty");
    if (!isCommenting) commentPost(trimmed);
  };

  const handleRepost = (e) => {
    e.preventDefault();
    const trimmed = repostText.trim();
    if (!trimmed && !post.text) return toast.error("Repost must have text");
    if (!isReposting) {
      rePost(trimmed);
      setRepostText("");
      document.getElementById(`repost_modal${post._id}`).close();
    }
  };

  const handleImageClick = (img) => {
    setPreviewImg(img);
    setPreviewOpen(true);
  };


  // ----- Image Modal -----
  function ImageModal({ img, onClose }) {
    // Close with ESC key
    
    useEffect(() => {
      const handler = (e) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
      <div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <img
          src={img}
          alt="Preview"
          className="max-h-[100vh] max-w-[100vw] object-contain rounded-md shadow-lg"
          // Stop closing when clicking the image itself
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  }

  // ----- Render -----
  return (

    <div className="flex gap-2 items-start p-4 border-b border-gray-700">
      {/* Profile Image */}
      <div className="avatar">
        <Link to={`/profile/${postOwner.username}`} className="w-8 rounded-full overflow-hidden">
          <img src={postOwner.profileImg || "/avatar-placeholder.png"} alt={`${postOwner.fullName} profile`} />
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
            <Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
            <span>·</span>
            <span>{formattedDate}</span>
          </span>
          {/* Delete Button */}
          {isMyPost && (
            <span className="flex justify-end flex-1">
              {!isDeleting ? (
                <FaTrash className="cursor-pointer hover:text-red-500" onClick={handleDeletePost} />
              ) : (
                <LoadingSpinner size="sm" />
              )}
            </span>
          )}
        </div>

        {/* Text + Image */}
        <div className="flex flex-col gap-3 overflow-hidden">
          {post.text && <span>{post.text}</span>}
          {post.img && (
            <img
              src={post.img}
              className="h-80 object-contain rounded-lg border border-gray-700"
              alt="Post attachment"
              onClick={() => handleImageClick(post.img)}
            />
          )}

          {/* Repost Section */}
          {post.isRepost && post.repostOf && post.repostOf.user && (
            <RepostContent 
              repostOf={post.repostOf} 
              onImageClick={handleImageClick}
              />
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-3">
          <div className="flex gap-4 items-center w-2/3 justify-between">

            {/* Comments */}
            <div
              className="flex gap-1 items-center cursor-pointer group"
              onClick={() => document.getElementById(`comments_modal${post._id}`).showModal()}
            >
              <FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
              <span className="text-sm text-slate-500 group-hover:text-sky-400">
                {post.comments.length}
              </span>
            </div>

            {/* Comment Modal */}
            <dialog id={`comments_modal${post._id}`} className="modal border-none outline-none">
              <div className="modal-box rounded border border-gray-600 max-w-lg">

                <h3 className="font-bold text-lg mb-4">COMMENTS</h3>

                <div className="flex flex-col gap-3 max-h-80 overflow-auto">
                  {post.comments.length === 0 ? (
                    <p className="text-sm text-slate-500">Be the first to comment.</p>
                  ) : (
                    post.comments.map((comment) => {

                    const userAbleToDeleteComment =
                      comment.user._id === authUser._id || post.user._id === authUser._id;
                    
                    return (

                      // Render each comment item
                      <div key={comment._id} className="flex gap-2 items-start">

                        {/* User Avatar */}
                        <div className="avatar">
                          <div className="w-8 rounded-full">
                            <img
                              src={comment.user.profileImg || "/avatar-placeholder.png"}
                              alt={`${comment.user.fullName} profile`}
                            />
                          </div>
                        </div>

                        {/* User info and comment text */}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-bold">{comment.user.fullName}</span>
                            <span className="text-gray-500 text-sm">@{comment.user.username}</span>
                          </div>

                          <div className="text-base break-words flex-1 max-w-full sm:max-w-[600px]">
                            {comment.text}
                          </div>

                          <span className="text-gray-500 text-sm">{formatPostDate(comment.createdAt)}</span>

                        </div>
                          {/* Delete Button */}

                          {userAbleToDeleteComment && (<FaTrash
                              className="w-5 h-5 min-w-[20px] text-gray-400 hover:text-red-500 cursor-pointer ml-auto translate-y-6 -translate-x-2"
                              onClick={() => handleDeleteComment(comment._id)}
                            />
                          )}
                      </div>
                    );
                  })
                )}
                </div>

                {/* Comment Input */}
                <form
                  className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                  onSubmit={handlePostComment}
                >
                  <textarea
                    className="textarea w-full p-1 rounded text-md resize-y none border focus:outline-none border-gray-800"
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
              onClick={() => document.getElementById(`repost_modal${post._id}`).showModal()}
            >
              <BiRepost className="w-6 h-6 group-hover:text-green-500 text-slate-500" />
            </div>

            {/* Repost Modal */}
            <dialog id={`repost_modal${post._id}`} className="modal border-none outline-none">
              <div className="modal-box rounded border border-gray-600">
                <form className="flex gap-2 items-center border-none" onSubmit={handleRepost}>
                  <textarea
                    className="textarea w-full p-2 rounded text-md resize-width-none border focus:outline-none border-gray-800"
                    placeholder="Add a repost comment..."
                    value={repostText}
                    onChange={(e) => setRepostText(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleRepost}
                      disabled={isReposting}
                      className="btn btn-success rounded-full btn-sm text-white px-4"
                    >
                      {isReposting ? <LoadingSpinner size="md" /> : "Repost"}
                    </button>
                  </div>
                </form>
              </div>
              <form method="dialog" className="modal-backdrop">
                <button className="outline-none">close</button>
              </form>
            </dialog>

            {/* Image Preview Modal */}
            {previewOpen && previewImg && (
              <ImageModal
                img={previewImg}
                onClose={() => setPreviewOpen(false)}
              />
            )}

            {/* Likes */}
            <div className="flex gap-1 items-center group cursor-pointer" onClick={handleLikePost}>
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

          {/* Bookmarks */}
          <div className="flex gap-1 items-center group cursor-pointer"
          onClick={handleBookmarkPost}
          >
            {isBookmarking && <LoadingSpinner size="sm" />}
            {!isBookmarked && !isBookmarking && (
              <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer group-hover:text-purple-500" />
            )}
            {isBookmarked && !isBookmarking && (
              <FaRegBookmark className="w-4 h-4 text-purple-500" />
            )}
            <span
              className={`text-sm group-hover:text-purple-500 ${
                  isBookmarked ? "text-purple-500" : "text-slate-500"
                }`}
            >
              {bookmarks.length}
            </span>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Post;
