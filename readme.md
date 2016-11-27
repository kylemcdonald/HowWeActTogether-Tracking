# How We Act Together (Tracker)

Computer vision and rendering of faces for a crowdsourced durational performance.

## bugs

  - if the face is too small, just restart.
  - has big issues with side and beneath lighting, could we highpass or something?
  - sometimes finds faces in evenly lit areas.
  - don't show the new face immediately, wait a moment to be sure it's good
  - it's possible for runnerBox to be undefined inside the runnerFunction loop, causing a crash (temporarily)

## general

  - don't draw irises all the way to eyelids
  - use better system for getting scale and orientation
  - need to test on different resolution webcams, and different framerates

## todo

  - recognize scream audio
  - recognize eyes shut: more difficult than expected...
  - additional visual indicator of gesture being "activated"

## acts

### greet

  - advanced version would do autocorrelation on low resolution images?
  - or the difference image of the last two difference images (second derivative)
  - remove the average motion from anything (global motion) like body moving, laptop moving...
  - autocorrelation works for high framerates, but we really need to just look for noisiness. this could be described as: rmse of high pass signal, or recent sum of squared derivative.

### scream

  - use audio input from p5 to detect loud noises
  - plus mouth open from clmtrackr

### eye contact

  - frame differencing, very still motion
  - advanced version: object detect eyes, stabilize, check there is no motion in eye region
  - also possibility: use clmtrackr to get eye position and watch for no rapid changes

### nod

  - motion works pretty well, could track the bounding box of face for better motion
  - might be a better detector for watching for sine-wave shapes: e.g., fit to zero crossings, then fit to peaks and valleys, look for deviation from sine wave...