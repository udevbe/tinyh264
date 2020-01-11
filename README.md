# Tiny H264

This project was forked from [h264bsd](https://github.com/oneam/h264bsd).

Available on npm as `tinyh264` and meant to be used with a builder system like webpack as [worker module](https://webpack.js.org/loaders/worker-loader/).
See `demo` folder for an example.

All non-essential operations like color conversions, querying cropping parameters or render to canvas have been removed.
All required decoding operations have been moved to C to optimize performance. 

Quick tests show an up to 50% performance improvement on chrome, and up to 20% on Firefox.

Input is expected to be complete NALs (access units) as Uint8Array, the output result is a yuv420 buffer as Uint8Array.

This project was created for use in [Greenfield](https://github.com/udevbe/greenfield)

# Building
## Prerequisites
- Bash

Make sure you have sourced the emscripten environment and run `npm install && npm run build`.
