# How We Act Together (Tracker)

Computer vision and rendering of faces for a crowdsourced durational performance.

## bugs

  - often initializes with a big rotation, not good.
  - if the face is too small, just restart. or modify library to add min (and max?) face size.
  - has big issues with side and beneath lighting, could we highpass or something?
  - sometimes finds faces in black or white areas.
  - warning: webkitCancelRequestAnimationFrame should not be called before cancelRequestAnimationFrame
  - don't show the new face immediately, wait a moment to be sure it's good
  - it's possible for runnerBox to be undefined inside the runnerFunction loop, causing a crash (temporarily)

## general

  - tell people to put their face in the center? initialize only in a small area to avoid false positives?
  - can we detect the goodness of the fit from the reasonableness of the parameters?
  - to get the scale: given three points with a known geometry, find the position and orientation
  - need to add hysteresis to the description of the face, so it doesn't flicker
  - manual "reload" button?
  - should be able to change the effective cpu usage by modifying the runner function
  - switch the utils that don't need to be public to private

## todo

  - convert to multiple p5 canvases
  - center recordings for playback
  - recognize overall motion
  - recognize nod yes
  - recognize nod no
  - recognize yawn / scream
  - recognize wave hello: how to visualize this?
  - recognize eyes shut: more difficult than expected...
  - add clean interface for start/stop and returning status
  - additional visual indicator of gesture being "activated"