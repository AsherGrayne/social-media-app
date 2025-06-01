import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import LoadingSpinner from "../../components/common/LoadingSpinner";

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";

const NotificationPage = () => {
	const queryClient = useQueryClient();
	
	const { data: notifications, isLoading, error } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/notifications");
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Failed to fetch notifications");
				return data;
			} catch (error) {
				throw new Error(error.message || "Failed to fetch notifications");
			}
		},
		retry: 1,
	});

	const { mutate: deleteNotifications, isPending: isDeleting } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch("/api/notifications", {
					method: "DELETE",
				});
				const data = await res.json();

				if (!res.ok) throw new Error(data.error || "Failed to delete notifications");
				return data;
			} catch (error) {
				throw new Error(error.message || "Failed to delete notifications");
			}
		},
		onSuccess: (data) => {
			toast.success(data.message || "Notifications deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete notifications");
		},
	});

	if (error) {
		return (
			<div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
				<div className="flex justify-center items-center h-full">
					<div className="text-center">
						<p className="text-red-500 mb-2">{error.message}</p>
						<button 
							onClick={() => queryClient.invalidateQueries({ queryKey: ["notifications"] })}
							className="text-primary hover:underline"
						>
							Try again
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
			<div className="flex justify-between items-center p-4 border-b border-gray-700">
				<p className="font-bold">Notifications</p>
				<div className="dropdown">
					<div tabIndex={0} role="button" className="m-1">
						<IoSettingsOutline className="w-4" />
					</div>
					<ul
						tabIndex={0}
						className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
					>
						<li>
							<button 
								onClick={() => deleteNotifications()}
								disabled={isDeleting || !notifications?.length}
								className="flex items-center gap-2"
							>
								{isDeleting ? (
									<>
										<LoadingSpinner size="sm" />
										Deleting...
									</>
								) : (
									"Delete all notifications"
								)}
							</button>
						</li>
					</ul>
				</div>
			</div>

			{isLoading ? (
				<div className="flex justify-center h-full items-center">
					<LoadingSpinner size="lg" />
				</div>
			) : notifications?.length === 0 ? (
				<div className="text-center p-4 font-bold">No notifications 🤔</div>
			) : (
				notifications?.map((notification) => (
					<div className="border-b border-gray-700" key={notification._id}>
						<div className="flex gap-2 p-4">
							{notification.type === "follow" && (
								<FaUser className="w-7 h-7 text-primary" />
							)}
							{notification.type === "like" && (
								<FaHeart className="w-7 h-7 text-red-500" />
							)}
							<Link 
								to={`/profile/${notification.from.username}`}
								className="flex items-center gap-2 hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
							>
								<div className="avatar">
									<div className="w-8 rounded-full">
										<img 
											src={notification.from.profileImg || "/avatar-placeholder.png"} 
											alt={notification.from.username}
										/>
									</div>
								</div>
								<div className="flex gap-1">
									<span className="font-bold">@{notification.from.username}</span>{" "}
									{notification.type === "follow" ? "followed you" : "liked your post"}
								</div>
							</Link>
						</div>
					</div>
				))
			)}
		</div>
	);
};

export default NotificationPage;
