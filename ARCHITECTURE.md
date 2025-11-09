# 🧠 Collaborative Canvas — Architecture Documentation

This document provides a detailed overview of the **architecture**, **data flow**, and **design decisions** behind the Collaborative Canvas project.  
It explains how user actions are captured, transmitted, processed, and synchronized across all connected clients in real time.

---

## 🧭 **1. Data Flow Diagram**

Below is a step-by-step breakdown of how drawing data flows from one user to all others:

 ┌────────────────────────────────────────────────┐
 │                  User Action                   │
 │   (Mouse Down / Move / Up on Canvas)           │
 └────────────────────────────────────────────────┘
                          │
                          ▼
          ┌──────────────────────────────┐
          │  Client (canvas.js)          │
          │  • Captures drawing events   │
          │  • Emits via Socket.io       │
          └──────────────────────────────┘
                          │
                          ▼
          ┌──────────────────────────────┐
          │   Server (server.js)         │
          │  • Listens for events        │
          │  • Updates global history    │
          │  • Broadcasts to all users   │
          └──────────────────────────────┘
                          │
                          ▼
          ┌──────────────────────────────┐
          │ Other Clients (canvas.js)    │
          │  • Receive events            │
          │  • Redraw strokes in real time │
          └──────────────────────────────┘



### 🔁 Typical Event Sequence
1. User starts drawing → client emits **`beginPath`**.  
2. User moves mouse → emits **`draw`** with coordinates.  
3. User releases mouse → emits **`endStroke`**.  
4. Server records the stroke → broadcasts to all users.  
5. Other clients instantly update their canvases.

---

## 🔗 **2. WebSocket Protocol**

The system uses **Socket.io** for bi-directional, low-latency communication.  
Each event has a defined purpose and payload for clarity.

| **Event Name** | **Direction** | **Payload** | **Purpose** |
|-----------------|---------------|--------------|--------------|
| `registerName` | Client → Server | `{ name: "Meghana" }` | Register a user’s name |
| `beginPath` | Client → Server | `{ x, y, color, width, erasing }` | Start a new stroke |
| `draw` | Client ↔ Server | `{ x, y, prevX, prevY, color, width, erasing }` | Broadcast live drawing points |
| `endStroke` | Client → Server | `{}` | Finalize a stroke and push to history |
| `undo` / `redo` | Client ↔ Server | `{}` | Trigger global undo/redo |
| `updateCanvas` | Server → Client | `[ { stroke objects } ]` | Sync full canvas state |
| `cursorMove` | Client ↔ Server | `{ x, y, name, color, drawing }` | Show user cursor + drawing state |
| `userList` | Server → Client | `{ id, name, color }` | Update list of connected users |

---

## 🔁 **3. Undo/Redo Strategy**

Undo and Redo are **global**, meaning all users share the same history state.  
This ensures consistent synchronization across all connected clients.

### ⚙️ Internal Design
- **`history[]`** → Stores all completed strokes.
- **`undone[]`** → Stores undone strokes (for redo).

### 🪶 Operation Flow
- **Undo**
  1. The last stroke is popped from `history[]`.
  2. It’s pushed into `undone[]`.
  3. Server emits `updateCanvas` to all users.

- **Redo**
  1. The last stroke is popped from `undone[]`.
  2. It’s re-added to `history[]`.
  3. All users receive the updated canvas.

### 💡 Result
All users view the **same synchronized state**, even if different users trigger undo/redo.

---

## ⚡ **4. Performance Decisions**

To maintain real-time responsiveness, several performance optimizations were made:

### 🧩 1. **Efficient Event Handling**
- Drawing emits only when the user is actively moving the mouse.  
- Prevents unnecessary network traffic and lag.

### 🧩 2. **Lightweight Message Structure**
- Only minimal data (coordinates, color, width, etc.) is sent in each event.  
- Avoids sending redundant metadata or entire canvas images.

### 🧩 3. **Optimized Canvas Rendering**
- Redraw operations are incremental:  
  only new strokes are rendered, not the entire canvas.

### 🧩 4. **Separation of Cursor Overlay**
- The cursor overlay (`#cursor-overlay`) is drawn in a separate HTML layer.  
- Prevents constant re-painting of the canvas and keeps animations smooth.

### 🧩 5. **Server Memory Control**
- Undo/redo stacks are cleared intelligently to prevent memory overflow.  
- Canvas states are not stored persistently (for lightweight operation).

---

## ⚔️ **5. Conflict Resolution**

When multiple users draw simultaneously, the system ensures seamless collaboration.

### 🧠 Strategy:
1. **Independent Strokes:**  
   Each user’s stroke is tracked separately by the server.  
   Overlapping strokes do not overwrite each other.

2. **Sequential Broadcasting:**  
   Socket.io ensures that drawing events are delivered in order.  
   Each client updates its canvas based on the order of received events.

3. **Unique User Colors:**  
   Each user gets a distinct color to visually differentiate strokes.

4. **No Locking Needed:**  
   Users draw freely; there is no blocking or ownership of regions.  
   This promotes natural collaboration rather than isolation.

5. **Last-Event Wins Rule:**  
   If two users draw in the same region simultaneously,  
   the most recent draw event (timestamp-based) is rendered last.

---

## 🧩 **Summary**

- The application achieves **real-time multi-user collaboration** through Socket.io.  
- Every action (draw, undo, redo, cursor move) is synchronized instantly.  
- Undo/Redo operates globally for all connected users.  
- Lightweight event-driven architecture ensures **smooth performance and scalability**.  
- Conflict resolution allows seamless collaboration even during concurrent actions.

---

### 👩‍💻 **Author**
**Meghana Gugulothu**  
Collaborative Canvas — NIT Silchar (2025)


