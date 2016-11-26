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
  - manual "reload" button?
  - should be able to change the effective cpu usage by modifying the runner function
  - don't draw irises all the way to eyelids
  - use better system for getting scale and orientation
  - need to test on different resolution webcams, and different framerates

## todo

  - recognize scream audio
  - recognize eyes shut: more difficult than expected...
  - additional visual indicator of gesture being "activated"

## acts

### greet

  - advanced version would do autocorrelation on low resolution images