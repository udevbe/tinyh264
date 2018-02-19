# Tiny H264

This project was forked from [h264bsd](https://github.com/mbebenita/Broadway).

All non-essential operations like color conversions, querying cropping parameters or render to canvas have been removed.
All required decoding operations have been moved to C to optimize performance. 

Quick tests show an up to 50% performance improvement on chrome, and up to 20% on Firefox.

Input is expected to be complete NALs, the output result is a yuv420 buffer.
