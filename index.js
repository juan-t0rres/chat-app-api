require('dotenv').config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const mongoose = require('mongoose');
const { Message } = require('./models/message');
const db = process.env.DATABASE_URL;

mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const app = express();

const http = require("http").Server(app);
const io = require("socket.io");
const socket = io(http);
const port = process.env.PORT;

app.use(cors())
app.use(morgan("common"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

socket.on("connection", (socket) => {
  console.log("user connected");
  // listen for incoming chat messages
  socket.on("chat message", (msg) => {
    // broadcast message to other connected users
    socket.broadcast.emit("received", msg);
    // save message to our database
    Message.create(msg);
  });
  socket.on("disconnect", () => {
    console.log("Disconnected");
  });
});

// GET LAST 30 MESSAGES
app.get('/api/messages', async (req, res, next) => {
    try {
        const messages = await Message.find().sort({ _id: 1 }).limit(30);
        res.json(messages);
    }
    catch (error) {
        res.status(400);
        next(error);
    }
});

// DELETE ALL MESSAGES
app.delete('/api/clear', async (req, res, next) => {
    try {
        const deleted = await Message.deleteMany({});
        res.json(deleted);
    }
    catch (error) {
        res.status(400);
        next(error);
    }
});

// DEFAULT ROUTE (IF NO ROUTE FOUND)
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// ERROR HANDLING
app.use((error, req, res, next) => {
  res.json({
    msg: error.message,
    statusCode: res.statusCode,
  });
});

http.listen(port, () => {
  console.log("connected to port: " + port);
});