import mongoose from "mongoose";
// import { DB_NAME } from "../constants.js";

const connectDb = async () => {
    try {
        // console.log("URI =", process.env.MONGODB_URI); 
        const connection = await mongoose.connect(
            `${process.env.MONGODB_URI}/${process.env.DB_NAME}`
        );

        console.log(
            `MongoDB Connected !! Host: ${connection.connection.host}`
        );
    } catch (error) {
        console.error("MongoDB connection FAILED ❌", error.message);
        process.exit(1);
    }
};

export default connectDb;
