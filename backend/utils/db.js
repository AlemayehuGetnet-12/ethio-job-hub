import mongoose from "mongoose";

const connectDB = async (uri) => {
  // If no URI and in development or test, spin up an in-memory MongoDB for local testing
  if (!uri && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')) {
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      // keep reference to stop later if needed
      global.__MONGOD__ = mongod;
      console.log('Using in-memory MongoDB at', uri);
    } catch (e) {
      throw new Error('MONGODB_URI not provided and failed to start in-memory MongoDB: ' + e.message);
    }
  }

  if (!uri) {
    throw new Error("MONGODB_URI or MONGO_URI is required in environment");
  }

  await mongoose.connect(uri);
  console.log("MongoDB connected");
};

export default connectDB;
