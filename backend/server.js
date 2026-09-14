import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './utils/db.js';
import { startBot } from './telegram/bot.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Try MONGODB_URI first (if set). If it fails and a MONGO_URI fallback exists, try that next.
    const primaryUri = process.env.MONGODB_URI;
    const fallbackUri = process.env.MONGO_URI;

    const tryConnect = async (uri) => {
      if (!uri) return false;
      try {
        await connectDB(uri);
        return true;
      } catch (err) {
        console.warn(`MongoDB connection to ${uri} failed: ${err.message}`);
        return false;
      }
    };

    let connected = false;
    if (primaryUri) {
      connected = await tryConnect(primaryUri);
    }

    if (!connected && fallbackUri) {
      console.log('Attempting fallback MongoDB URI (MONGO_URI)');
      connected = await tryConnect(fallbackUri);
    }

    if (!connected) {
      throw new Error('Could not connect to any MongoDB URI. Check your .env or start local MongoDB.');
    }

    const server = app.listen(PORT, async () => {
      console.log(`EthioJobs backend listening on port ${PORT}`);
      await startBot();
    });
    return server;
  } catch (error) {
    console.error('Failed to start backend:', error);
    process.exit(1);
  }
};

startServer();
