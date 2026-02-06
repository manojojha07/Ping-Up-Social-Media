import express from 'express'
import cors  from 'cors'
import 'dotenv/config'
import { connectedDB } from './src/config/db.config.js';
import { inngest, functions } from "./src/ingest/index.js"
import { serve } from "inngest/express";
import { clerkMiddleware } from '@clerk/express'
import userRouter from './src/routes/userRoutes.js';





const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware())


// apis there
app.get('/' ,  (req, res) => {
    res.send("Working fine :> ")
});

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use('/api/user' , userRouter)






// connected to database 
connectedDB();

app.listen(PORT, ()=>{
    console.log(`server liesten :} http://localhost:${PORT}`);
    
})