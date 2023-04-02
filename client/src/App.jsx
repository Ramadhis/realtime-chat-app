import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Chat from "./component/chat";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

// const socket = io.connect("http://localhost:3000");
const socket = io("http://localhost:3000", {
  transports: ["websocket"], // Required when using Vite
  upgrade: false,
});

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [roomListArr, setRoomListArr] = useState([]);
  const [joinstatus, setJoinstatus] = useState(false);

  const join = (e) => {
    e.preventDefault();
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setJoinstatus(true);
    }
  };

  const quickJoin = (e) => {
    e.preventDefault();
    //quick_join_room
    if (username !== "") {
      socket.emit("quick_join_room");
      setJoinstatus(true);
    }
  };

  const roomList = async () => {
    return await axios
      .get("http://localhost:3000/roomList")
      .then(function (response) {
        // handle success
        setRoomListArr(Array.from(response.data));
        console.log(response.data);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  };

  useEffect(() => {
    //useEffect
    socket.on("auto_join", (data) => {
      setRoom(data);
    });
    roomList();
  }, [socket]);

  return (
    <div className="container">
      {joinstatus === false ? (
        <div className="col-md-12 mt-3">
          <div className="row">
            <div className="card card-join-chat col-md-6 col-12 ">
              <div className="card-header">Create or Join Room</div>
              <div className="card-body">
                <label className="form-label">Name</label>
                <form onSubmit={join}>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="name..."
                    onChange={(e) => {
                      setUsername(e.target.value);
                    }}
                    required
                  />
                  <label className="form-label mt-2">Room id</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="room id..."
                    onChange={(e) => {
                      setRoom(e.target.value);
                    }}
                    required
                  />
                  <button type="submit" className="w-100 mt-3 btn btn-success">
                    Join Room
                  </button>
                </form>
                <button onClick={quickJoin} className="w-100 mt-3 btn btn-success">
                  Quick Join
                </button>
              </div>
            </div>
            <div className="col-md-6 ps-4">
              <div className="h3">RoomList</div>
              {roomListArr ? (
                <div>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>roomID</th>
                        <th>createdAt</th>
                        <th>option</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roomListArr.map((arr, index) => {
                        return (
                          <tr key={index}>
                            <td>{arr.roomID}</td>
                            <td>{arr.createdAt}</td>
                            <td>option</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div>data kosong</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <Chat socket={socket} username={username} room={room} />
      )}
    </div>
  );
}

export default App;
