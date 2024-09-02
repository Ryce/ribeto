import { createServer } from "http";
import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid"; // Import UUID for unique connection IDs

const server = createServer();
const wss = new WebSocketServer({ server });

const validateToken = (token: string): boolean => {
  // Replace with your actual token validation logic
  return token === "valid_token";
};

wss.on("connection", (ws, req) => {
  const params = new URLSearchParams(req.url?.split('?')[1]);
  const token = params.get('token');

  if (!token || !validateToken(token)) {
    ws.close(1008, "Invalid token");
    return;
  }

  const connectionId = uuidv4(); // Generate a unique ID for the connection
  console.log(`New client connected: ${connectionId}`);

  ws.on("message", (message) => {
    console.log(`Received message from ${connectionId}: ${message}`);
    ws.send(`Server received: ${message}`);
  });

  const interval = setInterval(() => {
    ws.send(`Server message to ${connectionId}: Hello from server!`);
  }, 5000);

  ws.on("close", () => {
    console.log(`Client disconnected: ${connectionId}`);
    clearInterval(interval);
  });

  ws.send(`Server message to ${connectionId}: Hello from server!`);
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
