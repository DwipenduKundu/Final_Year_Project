import express from "express";
import errorHandler from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cookieParser());


app.get('/', (req, res) => {
    res.send("Hi this site is working")
})



app.use(
    cors({
        origin:  ["http://localhost:5174","http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

// setting up routes


import userRoutes from "./routes/user.routes.js"
import chatRouter from "./routes/aichat.routes.js"


app.use("/api/v1/users",userRoutes)
app.use('/api/v1/chat',chatRouter)

app.use(errorHandler)

export default app;