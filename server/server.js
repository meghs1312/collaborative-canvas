const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const {
  startStroke,
  addPointToStroke,
  endStroke,
  undo,
  redo,
  getHistory,
} = require("./drawing-state");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Serve static client files
app.use(express.static(path.join(__dirname, "../client")));

const users = {};
const userStrokes ={};

//  Assign random user color
function getRandomColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 90%, 55%)`;
}

io.on("connection", (socket) => {
  const userColor = getRandomColor();
  const userName = "User-" + socket.id.slice(0, 4);
  users[socket.id] = { color: userColor, name: userName };

  console.log("🟢 User connected:", socket.id);

  // Send full canvas history to new user
  socket.emit("updateCanvas", getHistory());
  io.emit("userList", users);

  socket.on("registerName", (name) => {
    if (name && name.trim() !== "") {
      users[socket.id].name = name.trim();
      console.log(`✏️ ${socket.id} set name to "${name}"`);
      io.emit("userList", users);
    }
  });

  //  When user starts a stroke
  socket.on("beginPath", (data) => {
    // Add to server-side stroke state
    startStroke(data);
    // Broadcast to others to start drawing immediately
    socket.broadcast.emit("beginPath", data);
  });

  // When user draws points
 socket.on("draw", (data) => {
  // Keep stroke data consistent
  addPointToStroke(data.x, data.y);

  // Broadcast full data including prevX and prevY
  socket.broadcast.emit("draw", {
    x: data.x,
    y: data.y,
    prevX: data.prevX,
    prevY: data.prevY,
    color: data.color,
    width: data.width,
    erasing: data.erasing,
  });
});


  //  When user finishes stroke (mouseup)
  socket.on("endStroke", () => {
    const stroke = endStroke();
    if (stroke) {
      // Broadcast the completed stroke so others can finalize it
      io.emit("newStroke", stroke);
      // Keep all clients’ canvases in sync
      io.emit("updateCanvas", getHistory());
    }
  });

  //  Color change broadcast
  socket.on("colorChange", (data) => {
    console.log(`🎨 User ${socket.id} changed color to ${data.color}`);
    socket.broadcast.emit("colorChange", data);
  });

  //  Global Undo
  socket.on("undo", () => {
    const h = undo();
    io.emit("updateCanvas", h);
    console.log("↩️ Global Undo triggered by", socket.id);
  });

  // Global Redo
  socket.on("redo", () => {
    const h = redo();
    io.emit("updateCanvas", h);
    console.log("↪️ Global Redo triggered by", socket.id);
  });

  //  Cursor Movement Sync
 socket.on("cursorMove", (pos) => {
  socket.broadcast.emit("cursorMove", {
    id: socket.id,
    x: pos.x,
    y: pos.y,
    color: users[socket.id]?.color,
    name: pos.name || users[socket.id]?.name, 
    drawing: pos.drawing || false 
  });
});


  //  User disconnected
  socket.on("disconnect", () => {
    console.log(`🔴 ${userName} disconnected`);
    delete users[socket.id];
    io.emit("userDisconnected", socket.id);
    io.emit("userList", users);
  });
});

//  Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

