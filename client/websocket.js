const socket = io();

//  Log connection events
socket.on("connect", () => {
  console.log("✅ Connected to server with ID:", socket.id);
  if(typeof userName !== "ubdefined"){
    socket.emit("registerName" , userName);
  }
});

socket.on("connect_error", (err) => {
  console.error("❌ Connection failed:", err.message);
});

// Send drawing data to server (includes eraser info)
function sendDrawData(x, y, color, width, erasing = false) {
  socket.emit("draw", { x, y, color, width, erasing });
}

//  Color change sync
function sendColorChange(color) {
  socket.emit("colorChange", { color });
  setRemoteColor(color);
}

socket.on("colorChange", (data) => {
  console.log("🎨 Color synced from another user:", data.color);
  setRemoteColor(data.color);
});

//  Remote stroke begin/end
socket.on("beginPath", (data) => remoteBeginPath(data.x, data.y));
socket.on("endPath", () => remoteEndPath());

//  Draw updates from other users (real-time)
socket.on("draw", (data) => {
  drawFromServer(data);
});

//  Redraw full canvas (undo/redo or reconnect)
socket.on("updateCanvas", (newHistory) => {
  console.log("🖼️ Full canvas update received");
  redrawCanvas(newHistory || []);
});

//  Partial stroke update (adds without full redraw)
socket.on("newStroke", (stroke) => {
  console.log("🖊️ New stroke received");
  redrawCanvas(stroke); // optional: or push to local
});

//  Cursor position updates from others
socket.on("cursorMove", ({ id, x, y, color, name }) => {
  if (typeof drawCursors === "function") {
    userCursors[id]={x,y,color,name,drawing};
    // updateCursorPosition(id, x, y, color, name);
    drawCursors();
  }
});
