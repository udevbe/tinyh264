import TinyH264Decoder from './TinyH264Decoder'
import TinyH264 from './TinyH264'

const h264Decoders = {}

function init () {
  return TinyH264().then((tinyH264) => {
    self.addEventListener('message', (e) => {
      const message = e.data
      const renderStateId = message.renderStateId
      const messageType = message.type
      switch (messageType) {
        case 'decode': {
          let decoder = h264Decoders[renderStateId]
          if (!decoder) {
            decoder = new TinyH264Decoder(tinyH264, (output, width, height) => {
              postMessage({
                type: 'pictureReady',
                width: width,
                height: height,
                renderStateId: renderStateId,
                data: output.buffer
              }, [output.buffer])
            })
            h264Decoders[renderStateId] = decoder
          }
          decoder.decode(new Uint8Array(message.data, message.offset, message.length))
          break
        }
        case 'release': {
          const decoder = h264Decoders[renderStateId]
          if (decoder) {
            decoder.release()
            delete h264Decoders[renderStateId]
          }
          break
        }
      }
    })

    self.postMessage({ 'type': 'decoderReady' })
  })
}

export {
  init
}
