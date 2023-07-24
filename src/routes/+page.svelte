<script lang="ts">
	// @ts-nocheck

	import BarCodeReader from "../components/BarCodeReader.svelte";

</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<button class="uk-button uk-button-default" type="button" uk-toggle="target: #read-modal">書籍追加</button>

<div id="read-modal" uk-modal>
    <div class="uk-modal-dialog uk-modal-body">
        <BarCodeReader />
        <button class="uk-modal-close-default" type="button" uk-close></button>
    </div>
</div>
