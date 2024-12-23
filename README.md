# line-rect-hit

A simple way to determine if a line has hit a rectangle and a web page to try it out in.

    lineRectHit({ line: { pt1: [0, 2], pt2: [2, 0] }, rect: { left: 1, top: 1, bottom: 3, right: 3 }); // Returns true

It also exports `linesIntersect`, which tell you if two line segments intersect.

    linesIntersect({ pt1: [0, 2], pt2: [2, 0] }, { pt1: [0, 0], pt2: [2, 2] }); // true

`linesIntersect` has an optional third parameter that defaults to false. If true is passed for it, it will ignore intersections that happen at the endpoints of the line segments.

Run the [demo](https://jimkang.com/line-rect-hit/) locally with `make run-demo`.

# Line format

 {
   pt1: [number, number];
   pt2: [number, number];
 }

# Rect format

   {
     left: number;
     top: number;
     right: number;
     bottom: number;
   }
