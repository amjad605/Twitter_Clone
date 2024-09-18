import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const useFollow = () => {
  const queryClient = useQueryClient();
  const { mutate: followUser, isPending } = useMutation({
    mutationFn: async (userId) => {
      try {
        const response = await fetch(`/api/users/follow/${userId}`, {
          method: "POST",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error);
        }
        if (data.error) {
          throw new Error(data.error);
        }
        return data;
      } catch (error) {
        console.log(error);
      }
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries(["usersForRightPanel"]),
        queryClient.invalidateQueries(["authUser"]),
      ]);
      toast.success("User followed successfully");
    },
  });
  return { followUser, isPending };
};
export default useFollow;
