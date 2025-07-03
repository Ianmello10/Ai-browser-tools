<script lang="ts">
	import '../app.css';
	import HomeButton from '$lib/components/HomeButton.svelte';

	let { children } = $props();
</script>

{@render children()}

<HomeButton />