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

// GET ALL MESSAGES
app.get('/api/messages', async (req, res, next) => {
    try {
        const messages = await Message.find({});
        res.json(messages);
    }
    catch (error) {
        res.status(400);
        next(error);
    }
});

// clear all messages
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

// default route when a route can't be found
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// error handling
app.use((error, req, res, next) => {
  res.json({
    msg: error.message,
    statusCode: res.statusCode,
  });
});

//app.listen(port, () => console.log(`express app listening at http://localhost:${port}`))
http.listen(port, () => {
  console.log("connected to port: " + port);
});