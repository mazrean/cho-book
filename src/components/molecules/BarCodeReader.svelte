<script lang="ts">
  import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';

  const dispatcher = createEventDispatcher();

  let videoRef: HTMLVideoElement;

  const codeReader = new BrowserMultiFormatReader();

  let control: IScannerControls
  onMount(async () => {
    control = await codeReader.decodeFromConstraints({
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
  onDestroy(() => {
    control.stop();
  });
</script>

<video bind:this={videoRef}>
  <track kind="captions">
</video>
