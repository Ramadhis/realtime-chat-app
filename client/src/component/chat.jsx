import React, { useState, useEffect, useRef } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import "./style.css";
const chat = ({ socket, username, room }) => {
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [clientList, setClientList] = useState([]);
  const messagesEndRef = useRef(null);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (message != "") {
      const messageData = {
        room: room,
        author: username,
        message: message,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      };
      await socket.emit("send_message", messageData);
      setMessageList((previousData) => [...previousData, messageData]);
      setMessage("");
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      console.log(data);
      scrollToBottom();
      setMessageList((previousData) => [...previousData, data]);
    });

    socket.on("receive_client_join_room", (data) => {
      setClientList(data);
      console.log("user Join :", data);
    });
  }, [socket]);
  return (
    <div>
      <div className="row">
        <div className="col-md-6 mt-3 mb-3">
          <div className="card card-chat">
            <div className="card-header h4">Chat</div>
            <div className="card-body card-chat-height">
              <div className="container">
                {/* <div className="row overflow-x-hidden"> */}
                {/* <ScrollToBottom className={"card-chat-height overflow-x-hidden"}>
                    <div className="row overflow-x-hidden px-1">
                      {messageList.map((arr, index) => {
                        return (
                          <div className="col-md-12">
                            <div key={index} className={"card mt-1 width-chat " + (username === arr.author ? "my-chat" : "other-chat")}>
                              <div className="card-body">{arr.message}</div>
                              <div className="card-footer ">from : {username === arr.author ? "MyMessage" : arr.author}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollToBottom> */}

                <div className={"row"}>
                  {messageList.map((arr, index) => {
                    return (
                      <div key={index} className="col-12 w-100" style={{ width: "300px !important;" }}>
                        <div className={"card mt-1 width-chat " + (username === arr.author ? "my-chat" : "other-chat")}>
                          <div className="card-body">{arr.message}</div>
                          <div className="card-footer ">from : {username === arr.author ? "MyMessage" : arr.author}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* </div> */}
              </div>

              <div className="bottom text-muted" style={{ marginTop: "100px" }} ref={messagesEndRef}>
                last message
              </div>
            </div>

            <div className="card-footer">
              <form className="d-flex" onSubmit={sendMessage}>
                <input
                  className="form-control"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                  }}
                  // onKeyPress={(e) => {
                  //   event.key == "Enter" && sendMessage();
                  // }}
                  type="text"
                  placeholder="text chat ..."
                  required
                />
                <button type="submit" className="btn btn-success">
                  send
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-6 ps-3 mt-3">
          {clientList ? (
            clientList.map((list, index) => {
              return <div key={index}>{list}</div>;
            })
          ) : (
            <div>room kosong</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default chat;
