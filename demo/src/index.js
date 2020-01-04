import Worker from './H264NALDecoder.worker'
import YUVSurfaceShader from './YUVSurfaceShader'
import Texture from './Texture'

let tinyH264Worker = null
let videoStreamId = 1

let canvas = null
/**
 * @type {YUVSurfaceShader}
 */
let yuvSurfaceShader = null
let yTexture = null
let uTexture = null
let vTexture = null

/**
 * @param {Uint8Array} h264Nal
 */
function decode (h264Nal) {
  tinyH264Worker.postMessage({
    type: 'decode',
    data: h264Nal.buffer,
    offset: h264Nal.byteOffset,
    length: h264Nal.byteLength,
    renderStateId: videoStreamId
  }, [h264Nal.buffer])
}

/**
 * @param {{width:number, height:number, data: ArrayBuffer}}message
 */
function onPictureReady (message) {
  const { width, height, data } = message
  onPicture(new Uint8Array(data), width, height)
}

/**
 * @param {Uint8Array}buffer
 * @param {number}width
 * @param {number}height
 */
function onPicture (buffer, width, height) {
  canvas.width = width
  canvas.height = height

  // the width & height returned are actually padded, so we have to use the frame size to get the real image dimension
  // when uploading to texture
  const stride = width // stride
  // height is padded with filler rows

  // if we knew the size of the video before encoding, we could cut out the black filler pixels. We don't, so just set
  // it to the size after encoding
  const sourceWidth = width
  const sourceHeight = height
  const maxXTexCoord = sourceWidth / stride
  const maxYTexCoord = sourceHeight / height

  const lumaSize = stride * height
  const chromaSize = lumaSize >> 2

  const yBuffer = buffer.subarray(0, lumaSize)
  const uBuffer = buffer.subarray(lumaSize, lumaSize + chromaSize)
  const vBuffer = buffer.subarray(lumaSize + chromaSize, lumaSize + (2 * chromaSize))

  const chromaHeight = height >> 1
  const chromaStride = stride >> 1

  // we upload the entire image, including stride padding & filler rows. The actual visible image will be mapped
  // from texture coordinates as to crop out stride padding & filler rows using maxXTexCoord and maxYTexCoord.

  yTexture.image2dBuffer(yBuffer, stride, height)
  uTexture.image2dBuffer(uBuffer, chromaStride, chromaHeight)
  vTexture.image2dBuffer(vBuffer, chromaStride, chromaHeight)

  yuvSurfaceShader.setTexture(yTexture, uTexture, vTexture)
  yuvSurfaceShader.updateShaderData({ w: width, h: height }, { maxXTexCoord, maxYTexCoord })
  yuvSurfaceShader.draw()
}

function release () {
  if (tinyH264Worker) {
    tinyH264Worker.postMessage({ type: 'release', renderStateId: videoStreamId })
    tinyH264Worker = null
  }
}

function initWebGLCanvas () {
  canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl')
  yuvSurfaceShader = YUVSurfaceShader.create(gl)
  yTexture = Texture.create(gl, gl.LUMINANCE)
  uTexture = Texture.create(gl, gl.LUMINANCE)
  vTexture = Texture.create(gl, gl.LUMINANCE)

  document.body.append(canvas)
}

function main () {
  initWebGLCanvas()
  new Promise((resolve) => {
    /**
     * @type {Worker}
     * @private
     */
    tinyH264Worker = new Worker()
    tinyH264Worker.addEventListener('message', (e) => {
      const message = /** @type {{type:string, width:number, height:number, data:ArrayBuffer, renderStateId:number}} */e.data
      switch (message.type) {
        case 'pictureReady':
          onPictureReady(message)
          break
        case 'decoderReady':
          resolve(tinyH264Worker)
          break
      }
    })
  }).then(() => {
    fetch('out.h264').then(response => {
      response.arrayBuffer().then(function (buffer) {
        // do something with buffer
        decode(new Uint8Array(buffer))
      })
    })
  })
}

main()
