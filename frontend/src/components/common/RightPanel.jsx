import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import useFollow from "../../hooks/useFollow";
import LoadingSpinner from "./LoadingSpinner";
const RightPanel = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ["usersForRightPanel"],
    queryFn: async () => {
      {
        try {
          const response = await fetch("/api/users/suggested");
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error);
          }
          return data.users;
        } catch (error) {
          console.log(error);
        }
      }
    },
  });
  const [loadingUserId, setLoadingUserId] = useState(null);
  const { followUser, isPending } = useFollow();
  const handleFollow = (userId, e) => {
    e.preventDefault();
    setLoadingUserId(userId);
    followUser(userId).finally(() => {
      setLoadingUserId(null); // Reset the loading state after the action is complete
    });
  };
  return (
    <div className="hidden lg:block my-4 mx-2">
      <div className="bg-[#16181C] p-4 rounded-md sticky top-2">
        <p className="font-bold">Who to follow</p>
        <div className="flex flex-col gap-4">
          {/* item */}
          {isLoading && (
            <>
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
            </>
          )}
          {!isLoading &&
            users?.map((user) => (
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center justify-between gap-4"
                key={user._id}
              >
                <div className="flex gap-2 items-center">
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img
                        src={user.profileImage || "/avatar-placeholder.png"}
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
                <div>
                  <button
                    id={user._id}
                    className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
                    onClick={(e) => handleFollow(user._id, e)}
                    disabled={isPending && loadingUserId === user._id}
                  >
                    {isPending && loadingUserId === user._id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      "Follow"
                    )}
                  </button>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};
export default RightPanel;
