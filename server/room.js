const rooms = {};

function joinRoom(socket, roomId) {
  if (!rooms[roomId]) {
    rooms[roomId] = { users: [], history: [] };
  }
  rooms[roomId].users.push(socket.id);
  socket.join(roomId);
}

function leaveRoom(socket, roomId) {
  if (rooms[roomId]) {
    rooms[roomId].users = rooms[roomId].users.filter((id) => id !== socket.id);
    if (rooms[roomId].users.length === 0) delete rooms[roomId];
  }
}

function getRoom(roomId) {
  return rooms[roomId];
}

module.exports = { joinRoom, leaveRoom, getRoom };