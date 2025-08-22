import { useRef, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";

import { formatMemberSinceDate } from "../../utils/date/dateTools.js";
import useFollow from "../../hooks/userFollow";
import RightPanel from "../../components/common/RightPanel.jsx";

import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const ProfilePage = () => {
  // ---------------------- State ----------------------
  const [bannerImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [feedType, setFeedType] = useState("posts");

  // ---------------------- Refs ----------------------
  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  // ---------------------- Params ----------------------
  const { username } = useParams();

  // ---------------------- Custom Hooks ----------------------
  const { follow, isPending } = useFollow();
  const queryClient = useQueryClient();

  // ---------------------- Queries ----------------------

  // Get logged-in user
  const { data: authUser } = useQuery({
    
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Failed to fetch auth user");
      return res.json();
    },
  });

  // Get profile user
  const {
    data: user,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}`);
        const data = await res.json();

        if (!res.ok)
          throw new Error(data.error || "Failed to fetch user profile");

        return data;
      } catch (error) {
        throw new Error(error.message || "Failed to fetch user profile");
      }
    },
  });

  // Update profile
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useMutation({
      mutationFn: async () => {
        try {
          const res = await fetch(`/api/users/update`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              coverImg: bannerImg,
              profileImg,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Something went wrong");
          }

          return data;
        } catch (error) {
          console.error("[updateProfile] Error:", error);
          throw new Error(error.message || "Something went wrong");
        }
      },

      onSuccess: (updatedUser) => {
        const username = updatedUser?.username;
        if (!username) {
          console.warn("[updateProfile] No username found in updated user.");
        } else {
          console.log(
            `[updateProfile] Invalidating queries for userProfile: ${username}`
          );
        }

        toast.success("Profile updated successfully");

        Promise.all([
          queryClient.invalidateQueries({ queryKey: ["authUser"] }),
          queryClient.invalidateQueries({
            queryKey: ["userProfile", username],
          }),
        ]);
      },

      onError: (error) => {
        console.error("[updateProfile] Mutation error:", error);
        toast.error(error.message);
      },
    });

  // ---------------------- Derived Values ----------------------
  const isMyProfile = authUser?._id === user?._id;
  const memberSince = formatMemberSinceDate(user?.createdAt);
  const amIFollowing = authUser?.following?.includes(user?._id);

  // ---------------------- Handlers ----------------------
  const handleImgChange = (e, state) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        state === "coverImg" && setCoverImg(reader.result);
        state === "profileImg" && setProfileImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    refetch();
    setFeedType("posts");
  }, [username, refetch]);

  const normalizeLink = (url) => {
    if (!url) return "";
    if (!/^https?:\/\//i.test(url)) {
      return "https://" + url;
    }
    return url;
  };

  // ---------------------- JSX ----------------------
  return (
    
    <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen">

      {/* Skeleton or Error State */}
      {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
      {!isLoading && !isRefetching && !user && (
        <p className="text-center text-lg mt-4">User not found</p>
      )}

      {/* Profile Header & Info */}
      {!isLoading && !isRefetching && user && (
        <>
          {/* Bottom Left Profile Section */}
          <div className="flex gap-10 px-4 py-2 items-center">
            <Link to="/">
              <FaArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex flex-col">
              <p className="font-bold text-lg">{user?.fullName}</p>
            </div>
          </div>

          {/* Banner Image + Edit */}
          <div className="relative group/cover">
            <img
              src={bannerImg || user?.coverImg || "/banner-placeholder.png"}
              className="h-52 w-full object-cover"
              alt="banner image"
            />

            {/* Edit Banner Image */}
            {isMyProfile && (
              <div
                className="absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200"
                onClick={() => coverImgRef.current.click()}
              >
                <MdEdit className="w-5 h-5 text-white" />
              </div>
            )}

            {/* Hidden File Inputs */}
            <input
              type="file"
              hidden
              accept="image/*"
              ref={coverImgRef}
              onChange={(e) => handleImgChange(e, "coverImg")}
            />
            <input
              type="file"
              hidden
              accept="image/*"
              ref={profileImgRef}
              onChange={(e) => handleImgChange(e, "profileImg")}
            />

            {/* Avatar */}
            <div className="avatar absolute -bottom-16 left-4">
              <div className="w-32 rounded-full relative group/avatar">
                <img
                  src={
                    profileImg || user?.profileImg || "/avatar-placeholder.png"
                  }
                />
                <div className="absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer">
                  {isMyProfile && (
                    <MdEdit
                      className="w-4 h-4 text-white"
                      onClick={() => profileImgRef.current.click()}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Buttons (Edit / Follow / Update) */}
          <div className="flex justify-end px-4 mt-5">
            {isMyProfile && <EditProfileModal authUser={authUser} />}

            {!isMyProfile && (
              <button
                className="btn btn-outline rounded-full btn-sm"
                onClick={() => follow(user?._id)}
              >
                {isPending && "Loading..."}
                {!isPending && amIFollowing && "Unfollow"}
                {!isPending && !amIFollowing && "Follow"}
              </button>
            )}

            {(bannerImg || profileImg) && (
              <button
                className="btn btn-primary rounded-full btn-sm text-white px-4 ml-2"
                onClick={async () => {
                  await updateProfile({ coverImg: bannerImg, profileImg });
                  setProfileImg(null);
                  setCoverImg(null);
                }}
              >
                {isUpdatingProfile ? "Updating..." : "Update"}
              </button>
            )}
          </div>

          {/* Profile Info Section */}

          {/* User Information*/}
          <div className="flex flex-col gap-4 mt-8 px-4">
            <div className="flex flex-col">
              <span className="font-bold text-lg">{user?.fullName}</span>
              <span className="text-base text-slate-500">
                @{user?.username}
              </span>
              <span className="text-lg">{user?.bio}</span>
            </div>

            {/* Link */}
            <div className="flex gap-2 flex-wrap -mt-2">
              {user?.link && (
                <div className="flex gap-1 items-center ">
                  <FaLink className="w-3 h-3 text-slate-500" />
                  <a
                    href={normalizeLink(user.link)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-base text-blue-500 hover:underline"
                  >
                    {user.link}
                  </a>
                </div>
              )}
            </div>

            {/* Join Date */}
            <div className="flex gap-2 items-center">
              <IoCalendarOutline className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-500">{memberSince}</span>
            </div>

            {/* Follow/Followers */}

            <div className="flex gap-4">
              {/* Following */}
              <div
                className="flex gap-1 items-center cursor-pointer"
                onClick={() =>
                  document
                    .getElementById(`following_modal_${user._id}`)
                    .showModal()
                }
              >
                <span className="font-bold text-sm">
                  {user?.following.length}
                </span>
                <span className="text-slate-500 text-sm">Following</span>
              </div>

              <dialog
                id={`following_modal_${user._id}`}
                className="modal border-none outline-none"
              >
                <div className="modal-box rounded border border-gray-600 w-[400px]">
                  <RightPanel
                    type="following"
                    username={user.username}
                    isModal
                  />
                </div>

                <form method="dialog" className="modal-backdrop">
                  <button className="outline-none">close</button>
                </form>
              </dialog>

              {/* Followers */}
              <div
                className="flex gap-1 items-center cursor-pointer"
                onClick={() =>
                  document
                    .getElementById(`followers_modal_${user._id}`)
                    .showModal()
                }
              >
                <span className="font-bold text-sm">
                  {user?.followers.length}
                </span>
                <span className="text-slate-500 text-sm">Followers</span>
              </div>

              <dialog
                id={`followers_modal_${user._id}`}
                className="modal border-none outline-none"
              >
                <div className="modal-box rounded border border-gray-600 w-[400px]">
                  <RightPanel
                    type="followers"
                    username={user.username}
                    isModal
                  />
                </div>

                <form method="dialog" className="modal-backdrop">
                  <button className="outline-none">close</button>
                </form>
              </dialog>
            </div>
          </div>

          {/* Tabs: Posts / Likes / Bookmarks*/}

          <div className="flex w-full border-b border-gray-700 mt-4">
            <div
              className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer"
              onClick={() => setFeedType("posts")}
            >
              Posts
              {feedType === "posts" && (
                <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
              )}
            </div>

            <div
              className="flex justify-center flex-1 p-3 text-slate-500 hover:bg-secondary transition duration-300 relative cursor-pointer"
              onClick={() => setFeedType("likes")}
            >
              Likes
              {feedType === "likes" && (
                <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
              )}
            </div>

            {isMyProfile && (
              <div
                className="flex justify-center flex-1 p-3 text-slate-500 hover:bg-secondary transition duration-300 relative cursor-pointer"
                onClick={() => setFeedType("bookmarks")}
              >
                Bookmarks
                {feedType === "bookmarks" && (
                  <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
                )}
            </div>)}
          </div>
        </>
      )}

      {/* Posts Feed */}
      <Posts feedType={feedType} username={username} userId={user?._id} />
    </div>
  );
};

export default ProfilePage;
