import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: update, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async (formData) => {
      try {
        const response = await fetch(`/api/users/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error);
        }
        if (data.error) {
          throw new Error(data.error);
        }
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      Promise.all([
        queryClient.invalidateQueries(["authUser"]),
        queryClient.invalidateQueries(["userProfile"]),
      ]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  return { update, isUpdatingProfile };
};
export default useUpdateProfile;
