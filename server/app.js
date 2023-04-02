import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { instrument } from "@socket.io/admin-ui";
const app = express();
app.use(cors());
//create server
const serv = http.createServer(app);
let userData = [];
let room = [];

// check room ID in array room and request room ID
let roomManager = (roomArr, roomReq) => {
  return roomArr.find((rooms) => {
    return rooms.roomID === roomReq;
  });
};

//sort array room by date
let roomSort = (room) => {
  return room.sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
};

//find room index in array room where roomId == roomId request
let roomIndex = (roomArr, roomReq) => {
  return roomArr.findIndex((rooms) => {
    return rooms.roomID === roomReq;
  });
};

//delete data from array userData if user disconnected
let userOffline = (userData, socketId) => {
  return userData.splice(
    userData.findIndex((userArr) => {
      return userArr === socketId;
    }),
    1
  );
};

//get all client socket in room by roomid(data)
let getAllClientInRoom = (io, roomId) => {
  return io.sockets.adapter.rooms.get(roomId);
};

let getAllRoom = (io) => {
  return io.sockets.adapter.rooms;
};

let countAllClientInRoom = (io) => {
  return io.sockets.adapter.rooms.get(data).size;
};

let checkIfRoomExists = (io, socket, roomId) => {
  if (io.sockets.adapter.rooms.has(roomId)) {
    return true;
    // socket.join(roomId);
  } else {
    return false;
    // console.log(socket.id + "tried to join " + roomId + "but the room does not exist.");
    // Socket.join is not executed, hence the room not created.
  }
};

const io = new Server(serv, {
  cors: {
    origin: ["http://127.0.0.1:5173", "https://admin.socket.io"],
    // methods: ["GET", "POST"],
    // allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`user Connected: ${socket.id}`);
  userData.push(socket.id);
  console.log("userOnline", userData);

  socket.on("join_room", async (data) => {
    //parameter data = roomID
    if (checkIfRoomExists(io, socket, data)) {
      console.log("room Exsists");
    }
    socket.join(data);

    if (!roomManager(room, data)) {
      room.push({
        roomID: data,
        roomName: null,
        password: null,
        roomMaster: socket.id,
        createdAt: new Date(),
      });

      // let allroom = getAllRoom(io);
      // console.log("getAllRoom", allroom);
    }
    console.log(`user with ID: ${socket.id} joined room: ${data}`);
    let allroom = getAllRoom(io);
    console.log("getAllRoom", allroom);
    let getClientRoom = Array.from(getAllClientInRoom(io, data));
    socket.to(data).emit("receive_client_join_room", getClientRoom);
    console.log("all client in room: ", getClientRoom);
    // console.log("Active Room", room);
    console.log("Active Room with sort", roomSort(room));
  });

  socket.on("quick_join_room", async () => {
    roomSort(room);
    socket.join(room[0].roomID);
    io.to(socket.id).emit("auto_join", room[0].roomID);
    console.log(`user with id ${socket.id} join room ${room[0].roomID}`);
  });

  socket.on("send_message", (data) => {
    console.log(data);
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    userOffline(userData, socket.id);
    console.log("userOnline :", userData);
  });
});

app.get("/roomList", function (req, res) {
  res.json(room);
});

instrument(io, {
  auth: false,
});

serv.listen(3000, () => {
  console.log("server running");
});
