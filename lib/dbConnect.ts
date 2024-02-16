import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// async function dbConnect() {
//   // Check the initial connection state
//   console.log(`Initial connection state: ${mongoose.connection.readyState}`);

//   if (cached.conn) {
//     console.log(`Using cached database connection`);
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
//       console.log("Database connected");
//       return mongoose;
//     }).catch((error) => {
//       console.error('Database connection error:', error);
//       throw error;
//     });
//   }

//   cached.conn = await cached.promise;
  
//   // Check the connection state after attempting to connect
//   console.log(`Connection state after connect: ${mongoose.connection.readyState}`);
//   return cached.conn;
// }

async function dbConnect() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

export default dbConnect;
