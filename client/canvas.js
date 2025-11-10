// Handles canvas drawing logic, UI + WebSocket communication
// Ask user for name before connecting
// let userName = prompt("Enter your name:") || "Guest";


const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cursorOverlay = document.getElementById("cursor-overlay");


let userName = "";

// Wait for socket connection
socket.on("connect", () => {
  userName = prompt("Enter your name:") || "Guest";
  socket.emit("registerName", userName);
});


// Fullscreen canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Drawing state
let drawing = false;
let lastX = 0,
  lastY = 0;
let currentColor = "#000000";
let strokeWidth = 3;
let erasing = false;
const userCursors = {};

function setCursor() {
  canvas.style.cursor = erasing
    ? "url('eraser.png') 6 6, cell"
    : "url('brush.png') 3 3, crosshair";
}
setCursor();

//  Color picker
document.getElementById("colorPicker").addEventListener("input", (e) => {
  currentColor = e.target.value;
  erasing = false;
  document.getElementById("eraser").style.background = "";
  setCursor();
  sendColorChange(currentColor);
});

// Stroke width control
document.getElementById("strokeWidth").addEventListener("input", (e) => {
  strokeWidth = e.target.value;
});

//  Eraser toggle
document.getElementById("eraser").addEventListener("click", () => {
  erasing = !erasing;
  document.getElementById("eraser").style.background = erasing ? "#ffb3b3" : "";
  setCursor();
});

//  Undo / Redo
document.getElementById("undo").addEventListener("click", () => socket.emit("undo"));
document.getElementById("redo").addEventListener("click", () => socket.emit("redo"));

//  Mouse Events
canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  lastX = e.clientX;
  lastY = e.clientY;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);

  socket.emit("beginPath", {
    x: lastX,
    y: lastY,
    color: currentColor,
    width: strokeWidth,
    erasing,
  });
});

canvas.addEventListener("mouseup", () => {
  if (!drawing) return;
  drawing = false;
  socket.emit("cursorMove", { x: lastX, y: lastY, name: userName, drawing: false });

  socket.emit("endStroke");
});

canvas.addEventListener("mousemove", (e) => {
  const x = e.clientX;
  const y = e.clientY;

  socket.emit("cursorMove", { x, y,name: userName , drawing });
  if (!drawing) return;

  // Local drawing
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = "round";
  ctx.globalCompositeOperation = erasing ? "destination-out" : "source-over";
  ctx.strokeStyle = erasing ? "rgba(0,0,0,1)" : currentColor;
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();

  // Broadcast this segment
  socket.emit("draw", {
    x,
    y,
    prevX: lastX,
    prevY: lastY,
    color: currentColor,
    width: strokeWidth,
    erasing,
  });

  lastX = x;
  lastY = y;
});

//  Draw from server data
function drawFromServer(data) {
  ctx.beginPath();
  ctx.moveTo(data.prevX, data.prevY);
  ctx.lineTo(data.x, data.y);
  ctx.lineWidth = data.width;
  ctx.lineCap = "round";
  ctx.globalCompositeOperation = data.erasing ? "destination-out" : "source-over";
  ctx.strokeStyle = data.erasing ? "rgba(0,0,0,1)" : data.color;
  ctx.stroke();
}

// Remote color changes
function setRemoteColor(newColor) {
  currentColor = newColor;
  document.getElementById("colorPicker").value = newColor;
  erasing = false;
  document.getElementById("eraser").style.background = "";
  setCursor();
}

//  Redraw entire canvas (for undo/redo/full sync)
function redrawCanvas(strokes = []) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!strokes || strokes.length === 0) return;

  for (const stroke of strokes) {
    ctx.beginPath();
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.globalCompositeOperation = stroke.erasing
      ? "destination-out"
      : "source-over";
    ctx.strokeStyle = stroke.erasing ? "rgba(0,0,0,1)" : stroke.color;

    stroke.path.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
  }
}

// 👥 Remote cursor tracking
socket.on("cursorMove", ({ id, x, y, color , name,drawing}) => {
  if (id === socket.id) return;
  userCursors[id] = { x, y, color ,name ,drawing};
  drawCursors();
});

function drawCursors() {
  const overlay = document.getElementById("cursor-overlay");
  if (!overlay) return;

  overlay.innerHTML = ""; // clear previous cursors

  for (const [id, pos] of Object.entries(userCursors)) {
    if (id === socket.id) continue;

    const cursor = document.createElement("div");
    cursor.classList.add("cursor-dot");
    cursor.style.left = `${pos.x}px`;
    cursor.style.top = `${pos.y}px`;
    cursor.style.background = pos.color || "#ff0000";

    if (pos.drawing) {
      cursor.classList.add("active-drawing");
    }

    const label = document.createElement("div");
    label.classList.add("cursor-label");
    label.textContent = pos.name || "User";
    label.style.color = pos.color || "#000";

    cursor.appendChild(label);
    overlay.appendChild(cursor);
  }
}

//  Server sync (undo/redo/full canvas updates)
socket.on("updateCanvas", (newHistory) => {
  redrawCanvas(newHistory || []);
});

//  Remote begin/end paths
function remoteBeginPath(x, y) {
  ctx.beginPath();
  ctx.moveTo(x, y);
}
function remoteEndPath() {
  ctx.beginPath();
}

socket.on("userList", (users) => {
  const list = document.getElementById("userList");
  if (!list) return;
  list.innerHTML =
    "<strong>👥 Online Users</strong><br>" +
    Object.values(users)
      .map((u) => `<div style="color:${u.color}">${u.name}</div>`)
      .join("");
});

setCursor();
