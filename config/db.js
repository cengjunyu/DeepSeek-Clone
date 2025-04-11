import mongoose from "mongoose";

const cached = global.mongoose || {conn: null, promise: null};

export default connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }
    if(!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGODB_URI).then((mongoose) => {
            return mongoose;
        });
    }
    try {
        cached.conn = await cached.promise;
    }catch (error) {
        console.error("MongoDB connection error:", error);
    }
    return cached.conn;
}   