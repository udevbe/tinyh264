# Javascript WebAssembly implementation

This implementation was compiled with emscripten and includes tools for rendering to a canvas element with WebGL acceleration.

Here's an example of how to use it:
```
var decoder = new H264bsdDecoder();
var display = new H264bsdCanvas(myCanvasElement);

// Render output to the canvas when a new picture is ready
decoder.onPictureReady = function() {
    var width = decoder.outputPictureWidth();
    var height = decoder.outputPictureHeight();
    var croppingParams = decoder.croppingParams();
    var data = decoder.nextOutputPicture();
    display.drawNextOutputPicture(width, height, croppingParams, data);
}

// Resize the canvas to display uncropped content.
decoder.onHeadersReady = function() {
    myCanvasElement.width = decoder.outputPictureWidth();
    myCanvasElement.height = decoder.outputPictureHeight();
}

// Queue input data
decoder.queueInput(myUint8Array);

// Pump the decode loop
var status = H264bsdDecoder.RDY;
while(status != H264bsdDecoder.NO_INPUT) {
    status = decoder.decode();
}
```

This code will decode H.264 annex B encoded bytes stored in a Uint8Array. Each call to `decode()` will decode a single NAL unit, so you need to keep calling it until all of the input data is consumed. Note that each call to `decode()` is synchronous and blocking, so you may want to delay subsequent calls or wrap the whole things in a web worker to keep your app responsive.

`decode()` returns H264bsdDecoder.HDRS_RDY when the output size and cropping information are available and H264bsdDecoder.PIC_RDY when there is a picture ready to render. The decoder will also call the callbacks onHeadersReady and onPictureReady to simplify your code. Use nextOutputPicture or nextOutputPictureRGBA to retrieve i420 or RGBA encoded bytes for the next picture.

H264bsdCanvas will create a 3d context and use a shader program to display YUV encoded data obtained directly from `decoder.nextOutputPicture()`. If WebGL is not available (`isWebGL()` returns false), it will use a 2d context to draw the output, which requires data obtained from `decoder.nextOutputPictureRGBA()`.

## Using the web worker

The project also contains code for a web worker implementation. Here's an example of how it's used:
```
var decoder = new Worker("TinyH264Worker.js");
var display = new H264bsdCanvas(myCanvasElement);

decoder.addEventListener('message', function(e) {
    var message = e.data;
    if (!message.hasOwnProperty('type')) return;

    switch(message.type) {

    // Posted when onHeadersReady is called on the worker
    case 'pictureParams':
        croppingParams = message.croppingParams;
        if(croppingParams === null) {
            canvas.width = message.width;
            canvas.height = message.height;
        } else {
            canvas.width = croppingParams.width;
            canvas.height = croppingParams.height;
        }
        break;

    // Posted when onPictureReady is called on the worker
    case 'pictureReady':
        display.drawNextOutputPicture(
            message.width,
            message.height,
            message.croppingParams,
            new Uint8Array(message.data));
        ++pictureCount;
        break;

    // Posted after all of the queued data has been decoded
    case 'noInput':
        break;

    // Posted after the worker creates and configures a decoder
    case 'decoderReady':
        break;

    // Error messages that line up with error codes returned by decode()
    case 'decodeError':
    case 'paramSetError':
    case 'memAllocError':
        break;
    }
});

// Queue input data.
// The queued data will be immediately decoded.
// Once all of the data has been decoded, a "noInput" message will be posted.
decoder.postMessage({'type' : 'queueInput', 'data' : myUint8Array.buffer}, [myUint8Array.buffer]);

```
