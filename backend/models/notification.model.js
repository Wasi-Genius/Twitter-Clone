import mongoose from "mongoose";

// Expire notifications after 15 days (in seconds)
const TTL_SECONDS = 15 * 24 * 60 * 60;

const notificationSchema = new mongoose.Schema(
	{
		// User who triggered the notification
		from: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		// User who receives the notification
		to: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},

		// Type of notification
		type: {
			type: String,
			enum: ["follow", "like", "comment", "repost", "bookmark"],
			required: true,
		},

		// Extra data depending on the notification type
		meta: {
			type: mongoose.Schema.Types.Mixed,
			default: {},
		},

		// For TTL indexing
		createdAt: {
			type: Date,
			default: Date.now,
			expires: TTL_SECONDS,
		},
	},
	{
		collection: "notifications",
	}
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
