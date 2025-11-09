let history = [];
let undone = [];
let currentStroke = null;

function startStroke(data) {
  currentStroke = {
    path: [{ x: data.x, y: data.y }],
    color: data.color,
    width: data.width,
    erasing: data.erasing,
    ts: Date.now(),
  };
}

function addPointToStroke(x, y) {
  if (currentStroke) currentStroke.path.push({ x, y });
}

function endStroke() {
  if (currentStroke && currentStroke.path.length > 0) {
    history.push(currentStroke);
    undone = [];
    currentStroke = null;
  }
  return history;
}

function undo() {
  if (history.length > 0) undone.push(history.pop());
  return history;
}

function redo() {
  if (undone.length > 0) history.push(undone.pop());
  return history;
}

function getHistory() {
  return history;
}

function resetState() {
  history = [];
  undone = [];
  currentStroke = null;
}

module.exports = {
  startStroke,
  addPointToStroke,
  endStroke,
  undo,
  redo,
  getHistory,
  resetState,
};
