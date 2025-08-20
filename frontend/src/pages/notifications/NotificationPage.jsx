import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { IoSettingsOutline } from "react-icons/io5";
import { FaUser, FaTrash } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { BiRepost, BiBookmark } from "react-icons/bi";
import { toast } from "react-hot-toast";

const NotificationPage = () => {
  const queryClient = useQueryClient();

  /*
   * Query: Fetch notifications
   */
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to fetch notifications");
      return json;
    },
  });

  /*
   * Mutation: Delete ALL notifications
   */
  const { mutate: deleteNotifications } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", { method: "DELETE" });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to delete notifications");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete notifications");
    },
  });

  /*
   * Mutation: Delete ONE notification by ID
   */
  const { mutate: deleteNotificationById } = useMutation({
    
    mutationFn: async (id) => {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to delete notification");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete notification");
    },
  });

  const handleDeleteNotification = (id) => deleteNotificationById(id);

  return (
    <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">

      {/* Header Section */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <p className="font-bold">Notifications</p>

        {/* Dropdown Settings */}
        <div className="dropdown">
          <div tabIndex={0} role="button" className="m-1">
            <IoSettingsOutline className="w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <button onClick={deleteNotifications}>
                Delete all notifications
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center h-full items-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && data?.notifications?.length === 0 && (
        <div className="text-center p-4 font-bold">No Notifications</div>
      )}

      {/* Notifications List */}
      {data?.notifications?.map((notification) => (
        <div
          className="border-b border-gray-700"
          key={notification._id}
        >
          <div className="flex gap-2 p-4 items-center">
            
            {/* Notification Icon */}
            {notification.type === "follow" && (
              <FaUser className="w-7 h-7 text-primary" />
            )}
            {notification.type === "like" && (
              <FaHeart className="w-7 h-7 text-red-500" />
            )}
            {notification.type === "repost" && (
              <BiRepost className="w-7 h-7 text-green-500" />
            )}
            {notification.type === "bookmark" && (
              <FaRegBookmark className="w-7 h-7 text-purple-500" />
            )}

            {/* Link to Profile */}
            <Link to={`/profile/${notification.from.username}`} className="flex items-center gap-2">
              <div className="avatar">
                <div className="w-8 rounded-full">
                  <img
                    src={notification.from.profileImg || "/avatar-placeholder.png"}
                    alt="profile"
                  />
                </div>
              </div>
              <div className="flex gap-1">

                <span className="font-bold">@{notification.from.username}</span>

                {notification.type === "follow" ? "followed you" : notification.type === "like" ? "liked your post" : "reposted your post"}

              </div>
            </Link>

            {/* Delete Button */}
            <FaTrash
              className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer ml-auto"
              onClick={() => handleDeleteNotification(notification._id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationPage;
