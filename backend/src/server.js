import dotenv from "dotenv";
import express from "express";
import { initDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
dotenv.config();

import transactionRoutes from "./routes/transactionRoutes.js";


const app = express();

//middleware
app.use(rateLimiter);
app.use(express.json());


const PORT = process.env.PORT || 5001;




app.use("/api/transactions",transactionRoutes)


initDB().then(() => {
    app.listen(5001,()=>{
    console.log("server is up and running on port:",PORT);
});
})

