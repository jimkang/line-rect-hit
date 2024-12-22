import { version } from './package.json';
import './app.css';
import { select, pointer } from 'd3-selection';
import { getVectorMagnitude, subtractPairs } from 'basic-2d-math';
import { lineRectHit } from './line-rect-hit';

var boardSel = select('#board');
var boxSel = select('#box');
var lineSel = select('#line');
var lineBSel = select('#lineB');
var answerSel = select('#answer');
var lineAnswerSel = select('#line-answer');

var boxRect = { left: 64, top: 128, right: 300, bottom: 250 };
var linePoints = { pt1: [540, 48], pt2: [100, 500] };
var lineBPoints = { pt1: [540, 448], pt2: [100, 550] };
var dragging = false;
var onDragUpdaterFn;

(async function go() {
  window.addEventListener('error', reportTopLevelError);
  renderVersion();

  boardSel.on('mousedown', onBoardMouseDown);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('mousemove', onMouseMove);

  renderBox(boxRect);
  renderLine(lineSel, linePoints);
  renderLine(lineBSel, lineBPoints);
})();

function renderBox({ left, top, right, bottom }) {
  boxSel
    .attr('x', left)
    .attr('y', top)
    .attr('width', right - left)
    .attr('height', bottom - top);
}

function renderLine(lineSel, { pt1, pt2 }) {
  lineSel
    .attr('x1', pt1[0])
    .attr('y1', pt1[1])
    .attr('x2', pt2[0])
    .attr('y2', pt2[1]);
}

function renderAnswer(isHitting) {
  answerSel.text(isHitting ? 'Yes' : 'No');
}

function renderLineAnswer(isHitting) {
  lineAnswerSel.text(isHitting ? 'Yes' : 'No');
}

// Drag stuff
function onBoardMouseDown(e) {
  e.preventDefault();
  dragging = true;

  var point = pointer(e);
  const distTo1 = getDist(linePoints.pt1, point);
  const distTo2 = getDist(linePoints.pt2, point);
  const distToB1 = getDist(lineBPoints.pt1, point);
  const distToB2 = getDist(lineBPoints.pt2, point);
  const distToUpperLeft = getDist([boxRect.left, boxRect.top], point);
  const distToUpperRight = getDist([boxRect.right, boxRect.top], point);
  const distToLowerLeft = getDist([boxRect.left, boxRect.bottom], point);
  const distToLowerRight = getDist([boxRect.right, boxRect.bottom], point);

  const closestLineEndDist = Math.min(distTo1, distTo2);
  const closestLineBEndDist = Math.min(distToB1, distToB2);
  const closestBoxCornerDist = Math.min(
    distToUpperLeft,
    distToUpperRight,
    distToLowerLeft,
    distToLowerRight
  );

  if (
    closestLineEndDist < closestBoxCornerDist &&
    closestLineEndDist < closestLineBEndDist
  ) {
    if (distTo1 < distTo2) {
      onDragUpdaterFn = (point) => (linePoints.pt1 = point);
    } else {
      onDragUpdaterFn = (point) => (linePoints.pt2 = point);
    }
  } else if (closestLineBEndDist < closestBoxCornerDist) {
    if (distToB1 < distToB2) {
      onDragUpdaterFn = (point) => (lineBPoints.pt1 = point);
    } else {
      onDragUpdaterFn = (point) => (lineBPoints.pt2 = point);
    }
  } else {
    if (closestBoxCornerDist === distToUpperLeft) {
      onDragUpdaterFn = (point) => {
        boxRect.left = point[0];
        boxRect.top = point[1];
      };
    } else if (closestBoxCornerDist === distToUpperRight) {
      onDragUpdaterFn = (point) => {
        boxRect.right = point[0];
        boxRect.top = point[1];
      };
    } else if (closestBoxCornerDist === distToLowerLeft) {
      onDragUpdaterFn = (point) => {
        boxRect.left = point[0];
        boxRect.bottom = point[1];
      };
    } else if (closestBoxCornerDist === distToLowerRight) {
      onDragUpdaterFn = (point) => {
        boxRect.right = point[0];
        boxRect.bottom = point[1];
      };
    }
  }
}

function onMouseUp() {
  dragging = false;
  onDragUpdaterFn = null;
}

function onMouseMove(e) {
  if (!dragging) {
    return;
  }

  if (onDragUpdaterFn) {
    onDragUpdaterFn([e.offsetX, e.offsetY]);
  }

  renderAnswer(lineRectHit({ line: linePoints, rect: boxRect }));
  renderLineAnswer(lineRectHit({ line: lineBPoints, rect: boxRect }));
  renderLine(lineSel, linePoints);
  renderLine(lineBSel, lineBPoints);
  renderBox(boxRect);
}

function getDist(ptA, ptB) {
  return getVectorMagnitude(subtractPairs(ptA, ptB));
}

function reportTopLevelError(event) {
  console.error('Top level error:', event.error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info');
  versionInfo.textContent = version;
}
