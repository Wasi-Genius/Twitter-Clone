import { useQuery } from "@tanstack/react-query";

const Modal = ({ title, children, onClose }) => (

  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-[#16181C] p-4 rounded-md w-[400px] max-h-[80vh] overflow-y-auto">
        
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-2">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      {children}
    </div>
  </div>
);

const FollowModal = ({ username, type, onClose }) => {
  const { data: users, isLoading } = useQuery({
    queryKey: [type, username],
    queryFn: async () => {
      const res = await fetch(`/api/users/${username}/${type}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to fetch ${type}`);
      return data;
    },
    enabled: !!username,
  });

  return (
    <Modal title={type === "followers" ? "Followers" : "Following"} onClose={onClose}>
      {isLoading ? (
        <p className="text-slate-400">Loading...</p>
      ) : users?.length > 0 ? (
        users.map((user) => (
          <div
            key={user._id}
            className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded"
          >
            <img
              src={user.profileImg || "/avatar-placeholder.png"}
              className="w-8 h-8 rounded-full"
              alt={user.fullName}
            />
            <div>
              <p className="font-semibold text-white">{user.fullName}</p>
              <p className="text-slate-500">@{user.username}</p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-slate-400">No {type} found.</p>
      )}
    </Modal>
  );
};

export default FollowModal;
