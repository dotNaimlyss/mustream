import React, { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

// Assuming you have this type defined in your Redux slice or elsewhere
interface ChatMessage {
  username: string;
  message: string;
}

interface ChatComponentProps {
  sessionId: string;
  selectedTrack: string;
  selectedArtist: string;
  currentUser: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  sessionId,
  selectedTrack,
  selectedArtist,
  currentUser,
}) => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:3000");

    socketRef.current.emit("join session", selectedTrack, selectedArtist);
    socketRef.current.on("chat message", (msg: ChatMessage) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("chat message");
        socketRef.current.emit("leave session", sessionId);
        socketRef.current.disconnect();
      }
    };
  }, [sessionId, selectedTrack, selectedArtist]);

  const sendChatMessage = useCallback(() => {
    if (input.trim() && socketRef.current) {
      const message: ChatMessage = {
        username: currentUser,
        message: input,
      };
      socketRef.current.emit("chat message", message, sessionId);
      setInput("");
    }
  }, [input, sessionId, currentUser]);

  return (
    <div className="chat-container max-w-xl mx-auto border rounded-lg overflow-hidden mt-5">
  <ul className="message-list flex flex-col p-4 space-y-2 overflow-y-auto max-h-96">
    {messages.map((msg, index) => (
      <li
        key={index}
        className={`message-item flex ${msg.username === currentUser ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`rounded px-4 py-2 ${msg.username === currentUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
          {msg.username !== currentUser && <span className="message-sender font-bold mr-2">{msg.username}:</span>}
          <span className="message-content">{msg.message}</span>
        </div>
      </li>
    ))}
  </ul>
  <div className="p-4 bg-gray-100 flex">
    <input
      className="message-input flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
      placeholder="Type your message here..."
    />
    <button
      className="send-button bg-secondary hover:bg-primary text-white p-2 rounded-lg transition duration-150 mx-5"
      onClick={sendChatMessage}
    >
      Send
    </button>
  </div>
</div>

  );
};

export default ChatComponent;
