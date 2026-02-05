import mongoose from "mongoose"



export const  connectedDB = async() => {
    try {
           await mongoose.connect(process.env.MONGO_URI);

          console.log("✅ Connected to MongoDB successfully :> ");
          
    } catch (error) {
        console.log("❌ Failed to connect to MongoDB " );
        
    }
}