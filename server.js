require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const DbConnect = require("./database");
const router = require("./routes");
const path = require("path");
const cookieParser = require("cookie-parser");
const roomsModel = require("./models/roomsModel");
const PORT = process.env.PORT || 8000;
const server = require("http").createServer(app);

// socket.io config
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["POST", "GET"],
  },
});

// app config
app.use(cookieParser());
const corsOption = {
  credentials: true,
  origin: [process.env.FRONTEND_URL],
};
app.use(cors(corsOption));
global.appRoot = path.resolve(__dirname);

// middlewares
app.use(
  express.json({
    limit: "15mb",
  })
);
app.use(router);
app.use("/uploads", express.static("uploads"));

// db config
DbConnect();

// socket
const socketUserMapping = {};

io.on("connection", (socket) => {
  socket.on("join", async ({ roomId, user }) => {
    socketUserMapping[socket.id] = user;
    const room = await roomsModel.findById(roomId);
    if (room.speakers.length > 0) {
      const existingUser = room.speakers.filter(
        (item) => item.toString() === user.id.toString()
      );
      if (!existingUser.length) {
        room.speakers = [...room.speakers, user.id];
        await room.save();
      }
    }
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    clients.forEach((client) => {
      io.to(client).emit("add_peer", {
        socketId: socket.id,
        createOffer: false,
        user,
      });
      socket.emit("add_peer", {
        socketId: client,
        createOffer: true,
        user: socketUserMapping[client],
      });
    });
    socket.join(roomId);
  });

  socket.on("relay_ice", ({ socketId, icecandidate }) => {
    io.to(socketId).emit("icecandidate", {
      socketId: socket.id,
      icecandidate,
    });
  });

  socket.on("relay_sdp", ({ socketId, sessionDescription }) => {
    io.to(socketId).emit("session_description", {
      socketId: socket.id,
      sessionDescription,
    });
  });

  // handle mute/unmute
  const handleMuteUnmute = ({ eventName, roomId, userId }) => {
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    clients.forEach((client) => {
      io.to(client).emit(eventName, { userId });
    });
  };

  socket.on("mute", ({ roomId, userId }) => {
    handleMuteUnmute({ eventName: "mute", roomId, userId });
  });

  socket.on("un_mute", ({ roomId, userId }) => {
    handleMuteUnmute({ eventName: "un_mute", roomId, userId });
  });

  // leaving the room
  const leaveRoom = () => {
    const { rooms } = socket;
    Array.from(rooms).forEach(async (room) => {
      const clients = Array.from(io.sockets.adapter.rooms.get(room) || []);
      clients.forEach((client) => {
        io.to(client).emit("remove_peer", {
          socketId: socket.id,
          userId: socketUserMapping[socket.id]?.id,
        });
        socket.emit("remove_peer", {
          socketId: client,
          userId: socketUserMapping[client]?.id,
        });
      });
      if (room.length > 20) {
        const roomInDb = await roomsModel.findById(room);
        if (roomInDb) {
          if (roomInDb.speakers.length > 1) {
            roomInDb.speakers = roomInDb.speakers.filter(
              (speaker) =>
                speaker.toString() !==
                socketUserMapping[socket.id]?.id.toString()
            );
            await roomInDb.save();
          } else {
            await roomInDb.remove();
          }
          delete socketUserMapping[socket.id];
        }
      }
      socket.leave(room);
    });
  };
  socket.on("leave", leaveRoom);
  socket.on("disconnecting", leaveRoom);
});

// app listner
server.listen(PORT, () =>
  console.log(`server is running on http://localhost:${PORT}`)
);
