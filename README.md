# 🎨 Collaborative Canvas

A **real-time collaborative drawing web app** built using **Node.js**, **Express**, **Socket.io**, and the **HTML5 Canvas API**.  
Multiple users can draw simultaneously on a shared canvas — with **live updates, user cursors, undo/redo**, and a clean modern UI.

---

## 🚀 Features Overview

### 🖌️ **Drawing Tools**
- Smooth **brush tool** for freehand drawing.
- Adjustable **brush size** using a range slider (1–20px).
- **Color picker** to choose custom drawing colors.
- **Eraser tool** that removes drawn strokes using transparent compositing.

### ⚡ **Real-Time Collaboration**
- Every stroke, color change, and erase action is instantly synced to all connected clients.
- Each user can draw simultaneously without conflicts.
- Uses **Socket.io** for WebSocket-based real-time communication.

### 👥 **User Management**
- Each user enters their **name** before joining.
- A unique **color** is auto-assigned for identification.
- Displays a live list of **online users** on the right-hand sidebar.
- Automatically updates when users connect or disconnect.

### ✏️ **User Indicators**
- Shows every user’s **cursor position** on others’ screens.
- Displays the **user’s name next to their cursor**.
- Cursor glows in that user’s color **while drawing**.
- Smoothly updates without affecting the drawing performance.

### ↩️ **Undo / Redo (Global)**
- Global undo/redo that applies to all users.
- Every stroke is stored in a shared server-side history.
- Undo removes the last stroke for all clients; Redo restores it globally.

### 🧩 **Canvas State Sync**
- New users joining late automatically receive the **full existing canvas state**.
- Server keeps a copy of all strokes to sync the same state across users.
- Canvas redraws seamlessly after undo/redo actions.

### 🎨 **Modern & Intuitive UI**
- Designed using pure **HTML5 + CSS3** (no frontend frameworks).
- Features include:
  - Top header with app title.
  - Left toolbar with tools and controls.
  - Right sidebar showing connected users.
  - Fullscreen responsive canvas.
- Uses clean modern colors, gradients, shadows, and rounded corners for a polished look.

### ⚙️ **Performance Optimizations**
- Only minimal stroke data (`x`, `y`, `color`, `width`, `erasing`) is transmitted.
- Canvas redraw is optimized to only occur when new strokes are received.
- Separate DOM layer for cursors (`#cursor-overlay`) ensures smooth animation.

---

## 🧠 Project Summary

This project demonstrates how to use **Socket.io** for **real-time bidirectional communication** and **HTML Canvas** for collaborative drawing.  
It emphasizes event-driven architecture, shared state synchronization, and UI interactivity without using external frameworks.

---

## 🧩 Folder Structure

collaborative-canvas/
├── client/
│ ├── index.html # Main UI
│ ├── style.css # UI styling
│ ├── canvas.js # Drawing + UI logic
│ ├── websocket.js # WebSocket client communication
├── server/
│ ├── server.js # Express + Socket.io backend
│ ├── drawing-state.js # Stroke history, undo/redo logic
├── package.json
├── README.md # Project documentation
└── ARCHITECTURE.md # System design details



## 🛠️ Setup Instructions

Follow these steps to run the app locally:

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/collaborative-canvas.git
cd collaborative-canvas
cd server.js

2️⃣ Install Dependencies
npm install

3️⃣ Start the Server
npm run dev


4️⃣ Open in Browser

Once the server is running, open:

http://localhost:5000


🧪 How to Test with Multiple Users



Run the app using npm  run dev.

Open multiple browser tabs or different browsers (Chrome, Firefox, Edge).

Enter different names when prompted.

Try the following:

Draw using the brush — you’ll see your drawing appear on all tabs instantly.

Use different colors and brush sizes.

Toggle the eraser tool.

Try Undo/Redo — changes reflect globally.

Move your cursor — others will see your name and position.

Disconnect one user — it disappears from the online list automatically.

You can also test from different systems on the same network using your machine IP.

Known Limitations / Bugs
 Limited mobile support	Touch drawing not optimized
 No persistence	Canvas resets on server restart
 Cursor visibility	May be hard to see on white backgrounds
 Latency	Very fast mouse movement may skip minor points on low bandwidth


 ## 🚀 Time Spent on the Project

Day 1 – Setup and Configuration (1.5 hrs)

Initialized the project with Node.js, Express, and Socket.io.

Configured WebSocket connections for real-time communication.

Day 2 – Canvas and Drawing Logic (3 hrs)

Implemented brush, stroke width, and color selection functionality.

Added eraser support and refined canvas drawing events.

Day 3 – Real-time Sync and Core Features (3.5 hrs)

Developed real-time synchronization using Socket.io for all users.

Built undo/redo logic with history and redo stacks.

Integrated user management (name input, unique color assignment, online list).

Added live cursor tracking with active drawing indicators.

Day 4 – UI Design, Styling, and Testing (3 hrs)

Designed and styled a clean toolbar, sidebar, and cursor overlay using CSS.

Conducted multi-tab and multi-user testing to ensure smooth synchronization.

Fixed minor bugs and optimized performance.

 Total Time Spent: ~11 hours over 4 days 

 🧩 Tech Stack

Frontend: HTML, CSS, JavaScript 

Backend: Node.js

Real-time Communication: Socket.io



💡 How It Works (Simplified)

When a user draws, each mouse movement emits a "draw" event via Socket.io.

The server receives and broadcasts the data (x, y, color, width, etc.) to all connected clients.

All clients update their canvas instantly with that stroke data.

Undo/Redo commands modify the global stroke history stored on the server.

Cursor positions are sent via "cursorMove" events to track user activity live.

🧠 Future Improvements

Add persistent storage using MongoDB or Firebase.

Per-user undo/redo stacks.

Add mobile and touch-screen support.

Enable exporting the canvas as an image (PNG).

Improve latency handling for large concurrent sessions.

👩‍💻 Author

Meghana Gugulothu
Collaborative Canvas Project – NIT Silchar
(2025)