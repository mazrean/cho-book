<script lang="ts">
  import { BrowserMultiFormatReader, BrowserCodeReader } from '@zxing/browser';

  let videoRef: HTMLVideoElement;

  const codeReader = new BrowserMultiFormatReader()

  async () => {
    const devices = await BrowserCodeReader.listVideoInputDevices()
    if (devices.length === 0) return
  
    await codeReader.decodeFromVideoDevice(devices[0].deviceId, videoRef, (result, error) => {
      if (!result) return
      if (error) {
        console.log('ERROR!! : ', error)
        return
      }

      console.log('RESULT!! : ', result)
    })
  }
</script>

<video bind:this={videoRef}></video>
