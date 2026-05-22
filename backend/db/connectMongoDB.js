import mongoose from "mongoose";

const connectMongoDB = async () => {
	try {
		// ADD THESE TWO LOGS:
        console.log("--- DEBUGGING ENV VARIABLES ---");
        console.log("What Node sees for MONGO_URI:", process.env.MONGO_URI);
		const conn = await mongoose.connect(process.env.MONGO_URI);
	} catch (error) {
		console.error("Error connecting to MongoDB:", error.message);
		process.exit(1);
	}
};

export default connectMongoDB;
