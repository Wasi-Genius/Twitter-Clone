import mongoose from 'mongoose';

const connectMongoDB = async () => {
  try {
    const conn = await mongoogse.connect(process.env.MONGO_URI);
    console.log('MongoDB connected ', conn.connection.host);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); 
  }
}

export default connectMongoDB;