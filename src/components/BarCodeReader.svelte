<script lang="ts">
  import { BrowserMultiFormatReader } from '@zxing/browser';
	import { createEventDispatcher, onMount } from 'svelte';

  const dispatcher = createEventDispatcher();

  let videoRef: HTMLVideoElement;

  const codeReader = new BrowserMultiFormatReader();

  onMount(async () => {
    await codeReader.decodeFromConstraints({
      video: {
        facingMode: 'environment',
      },
    }, videoRef, (result, error) => {
      if (!result) return
      if (error) {
        return
      }

      const strIsbn = result.getText();
      dispatcher('isbn', strIsbn);
    })
  });
</script>

<video bind:this={videoRef}></video>
