import { intersect } from 'mathjs';
// line format:
// {
//  pt1: [number, number];
//  pt2: [number, number];
// }
// rect format:
// {
//  left: number;
//  top: number;
//  right: number;
//  bottom: number;
// }
//
// Remember: In SVG, +y is down, so the bottom has the higher number than the top.
export function lineRectHit({ line, rect }) {
  if ([line.pt1, line.pt2].some(pointIsInsideRect)) {
    return true;
  }
  // If the leftmost point is to the right of the right side of the rect, they can't hit.
  if (Math.min(line.pt1[0], line.pt2[0]) > rect.right) {
    return false;
  }
  // If the rightmost point is to the left of the left side of the rect, they can't hit.
  if (Math.max(line.pt1[0], line.pt2[0]) < rect.left) {
    return false;
  }
  // If the topmost point is under the bottom side of the rect, they can't hit.
  if (Math.min(line.pt1[1], line.pt2[1]) > rect.bottom) {
    return false;
  }
  // If the bottommost point is above the side bottom of the rect, they can't hit.
  if (Math.max(line.pt1[1], line.pt2[1]) < rect.top) {
    return false;
  }

  const m = getSlope(line);
  const b = getIntercept(m, line.pt1[0], line.pt1[1]);

  if (isInBounds(calcLineY(m, rect.left, b), rect.top, rect.bottom)) {
    // The line hits the left side of the rect.
    return true;
  }
  if (isInBounds(calcLineY(m, rect.right, b), rect.top, rect.bottom)) {
    // The line hits the right side of the rect.
    return true;
  }

  // To check hits to the top and bottom, we rotate and pretend y is x and x is y.
  const rotatedM = 1 / m;
  const rotatedB = getIntercept(rotatedM, line.pt1[1], line.pt1[0]);

  if (
    isInBounds(calcLineY(rotatedM, rect.top, rotatedB), rect.left, rect.right)
  ) {
    // The line hits the top line of the rect.
    return true;
  }
  if (
    isInBounds(
      calcLineY(rotatedM, rect.bottom, rotatedB),
      rect.left,
      rect.right
    )
  ) {
    // The line hits the bottom line of the rect.
    return true;
  }

  return false;

  function pointIsInsideRect(pt) {
    if (pt[0] < rect.left) {
      return false;
    }
    if (pt[0] > rect.right) {
      return false;
    }
    if (pt[1] < rect.top) {
      return false;
    }
    if (pt[1] > rect.bottom) {
      return false;
    }
    return true;
  }
}

function getSlope(line) {
  const dx = line.pt2[0] - line.pt1[0];
  const dy = line.pt2[1] - line.pt1[1];
  if (dx === 0) {
    return undefined;
  }
  return dy / dx;
}

function getIntercept(m, x, y) {
  return y - m * x;
}

function calcLineY(m, x, b) {
  return m * x + b;
}

function isInBounds(n, low, high) {
  return n >= low && n <= high;
}

export function linesIntersect(lineA, lineB, ignoreEndToEndContact = false) {
  const lineALeft = Math.min(lineA.pt1[0], lineA.pt2[0]);
  const lineBRight = Math.max(lineB.pt1[0], lineB.pt2[0]);
  if (lineALeft > lineBRight) {
    // No shared x-space.
    return false;
  }
  const lineARight = Math.max(lineA.pt1[0], lineA.pt2[0]);
  const lineBLeft = Math.min(lineB.pt1[0], lineB.pt2[0]);
  if (lineBLeft > lineARight) {
    // No shared x-space.
    return false;
  }
  const lineATop = Math.min(lineA.pt1[1], lineA.pt2[1]);
  const lineBBottom = Math.max(lineB.pt1[1], lineB.pt2[1]);
  if (lineATop > lineBBottom) {
    // No shared y-space.
    return false;
  }
  const lineABottom = Math.max(lineA.pt1[1], lineA.pt2[1]);
  const lineBTop = Math.min(lineB.pt1[1], lineB.pt2[1]);
  if (lineBTop > lineABottom) {
    // No shared y-space.
    return false;
  }

  const intersection = intersect(lineA.pt1, lineA.pt2, lineB.pt1, lineB.pt2);
  // console.log(intersection);
  if (!intersection) {
    // This happens with perfectly parallel lines.
    return false;
  }
  // But is this intersection actually in both line segments?
  if (intersection[0] < lineALeft || intersection[0] > lineARight) {
    return false;
  }
  if (intersection[1] < lineATop || intersection[1] > lineABottom) {
    return false;
  }
  if (intersection[0] < lineBLeft || intersection[0] > lineBRight) {
    return false;
  }
  if (intersection[1] < lineBTop || intersection[1] > lineBBottom) {
    return false;
  }

  if (ignoreEndToEndContact) {
    if (
      (intersection[0] === lineALeft || intersection[0] === lineARight) &&
      (intersection[1] === lineATop || intersection[1] === lineABottom)
    ) {
      return false;
    }
    if (
      (intersection[0] === lineBLeft || intersection[0] === lineBRight) &&
      (intersection[1] === lineBTop || intersection[1] === lineBBottom)
    ) {
      return false;
    }
  }

  return true;
}
