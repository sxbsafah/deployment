import express from "express";
import connectDB from "./utils/connectDB.js";
import disconnectDB from "./utils/disconnectDB.js";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import roomsRouter from "./routes/rooms.route.js";
import path from "path"


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;



const __dirname = path.resolve();

// Body parsing middleware
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/auth", authRouter);
app.use("/room", roomsRouter);

if (process.env.NODE_ENV === "prodcution") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("/{*any}", (request,response) => {
    response.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  })
}
app.get("/",(request,response) => {
  response.send(`the __dirname is : ${__dirname} and the process.env.NODE_ENV Is ${process.env.NODE_ENV === "prodcution"}`)
})
// Start server
const server = app.listen(PORT, async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
});


server.on("close", async () => {
    await disconnectDB()
})
