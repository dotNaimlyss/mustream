import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");
interface TrackPlayerProps {
  trackId: string;
}

const TrackPlayer: React.FC<TrackPlayerProps> = ({ trackId }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");

  useEffect(() => {
    socket.emit("joinRoom", { trackId });

    socket.on("message", (message: string) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.emit("leaveRoom", { trackId });
    };
  }, [trackId]);

  const sendMessage = () => {
    socket.emit("message", { trackId, message: inputMessage });
    setInputMessage("");
    console.log(inputMessage);
  };

  return (
    <div>
      {/* Track Player UI */}
      <div>
        <input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <div>
        {messages.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </div>
    </div>
  );
};

export default TrackPlayer;
