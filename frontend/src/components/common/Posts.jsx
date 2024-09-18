import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType, username, userId }) => {
  const getPostEndpoint = () => {
    switch (feedType) {
      case "forYou":
        return "/api/posts";
      case "following":
        return "/api/posts/following";
      case "posts":
        return `/api/posts/user/${username}`;
      case "likes":
        return `/api/posts/liked/${userId}`;
      default:
        return "/api/posts";
    }
  };

  const POST_ENDPOINT = getPostEndpoint();

  const {
    data: posts,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts", feedType],
    queryFn: async () => {
      const response = await fetch(POST_ENDPOINT);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch posts");
      }
      const data = await response.json();

      // Log data to inspect its structure
      console.log("API Response:", data);

      return data.posts;
    },
    retry: false,
  });
  useEffect(() => {
    refetch();
  }, [feedType, refetch, username, refetch]);
  if (isLoading || isRefetching) {
    return (
      <div className="flex flex-col justify-center">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (isError) {
    return <p className="text-center my-4">Error: {error.message}</p>;
  }

  // Check if posts is an array before rendering
  if (!Array.isArray(posts)) {
    return (
      <p className="text-center my-4">No posts found or invalid response.</p>
    );
  }

  if (posts.length === 0) {
    return <p className="text-center my-4">No posts in this tab. Switch 👻</p>;
  }

  return (
    <div>
      {posts.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
};

export default Posts;
