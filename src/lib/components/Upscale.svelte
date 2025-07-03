<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import UpscaleWorker from '$lib/worker/upscale.worker.ts?worker';

	// --- State Management (Svelte 5 syntax) ---
	let imageFile = $state<File | null>(null);
	let imageUrl = $state<string | null>(null);
	let upscaledImageUrl = $state<string | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let loadingStage = $state<'uploading' | 'initializing' | 'processing' | 'finalizing'>(
		'uploading'
	);
	let progress = $state(0);
	let isDragging = $state(false);
	let worker = $state<Worker | null>(null);
	let fileInput = $state<HTMLInputElement | undefined>();

	// --- UI Helpers ---
	const imageContainerClasses =
		'relative aspect-square w-full overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center border border-base-300/30 group';

	// --- Lifecycle ---
	onMount(() => {
		worker = new UpscaleWorker();
		worker.onmessage = handleWorkerMessage;
		return () => worker?.terminate();
	});

	// --- Worker Communication ---
	function handleWorkerMessage(event: MessageEvent) {
		const { type, stage, progress: workerProgress, output, error: workerError } = event.data;

		switch (type) {
			case 'progress':
				loadingStage = stage;
				progress = workerProgress;
				break;
			case 'complete':
				handleUpscaleComplete(output);
				break;
			case 'error':
				handleUpscaleError(workerError);
				break;
		}
	}

	function handleUpscaleComplete(upscaledImage: {
		data: Uint8Array;
		width: number;
		height: number;
	}) {
		const canvas = document.createElement('canvas');
		canvas.width = upscaledImage.width;
		canvas.height = upscaledImage.height;
		const ctx = canvas.getContext('2d');

		if (ctx) {
			const rgbaData = convertRgbToRgba(
				upscaledImage.data,
				upscaledImage.width,
				upscaledImage.height
			);
			const imageData = new ImageData(
				new Uint8ClampedArray(rgbaData),
				upscaledImage.width,
				upscaledImage.height
			);
			ctx.putImageData(imageData, 0, 0);
			upscaledImageUrl = canvas.toDataURL('image/png');
		}

		progress = 100;
		loading = false;
	}

	function handleUpscaleError(workerError: string) {
		error = `Processing error: ${workerError}`;
		console.error(workerError);
		loading = false;
		progress = 0;
	}

	// --- File Handling ---
	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			processFile(file);
		}
	}

	function handleFileDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		const file = event.dataTransfer?.files[0];
		if (file && file.type.startsWith('image/')) {
			processFile(file);
		}
	}

	function processFile(file: File) {
		resetState();
		imageFile = file;
		const reader = new FileReader();
		reader.onload = (e) => {
			imageUrl = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	}

	// --- Actions ---
	function startUpscale() {
		if (imageUrl) {
			loading = true;
			error = null;
			upscaledImageUrl = null;
			loadingStage = 'uploading';
			progress = 10;
			worker?.postMessage(imageUrl);
		}
	}

	function resetState() {
		imageFile = null;
		imageUrl = null;
		upscaledImageUrl = null;
		error = null;
		loading = false;
		progress = 0;
		if (fileInput) {
			fileInput.value = '';
		}
	}

	// --- UI Helpers ---
	function getLoadingMessage() {
		const messages = {
			uploading: 'Loading image...',
			initializing: 'Initializing AI model...',
			processing: 'Upscaling image...',
			finalizing: 'Finalizing and assembling image...'
		};
		return messages[loadingStage] || 'Processing...';
	}

	function formatFileSize(sizeInBytes: number): string {
		if (sizeInBytes < 1024 * 1024) {
			return `${(sizeInBytes / 1024).toFixed(1)} KB`;
		} else {
			return `${(sizeInBytes / 1024 / 1024).toFixed(1)} MB`;
		}
	}

	function convertRgbToRgba(rgbData: Uint8Array, width: number, height: number): Uint8ClampedArray {
		const rgbaData = new Uint8ClampedArray(width * height * 4);
		for (let i = 0; i < width * height; i++) {
			rgbaData[i * 4] = rgbData[i * 3];
			rgbaData[i * 4 + 1] = rgbData[i * 3 + 1];
			rgbaData[i * 4 + 2] = rgbData[i * 3 + 2];
			rgbaData[i * 4 + 3] = 255; // Alpha channel
		}
		return rgbaData;
	}
</script>

<div class="container mx-auto min-h-screen p-4 sm:p-6 md:p-8">
	<!-- Hero Header -->
	<div class="mb-12 space-y-6 text-center">
		<div class="mb-4 flex justify-center">
			<div class="badge badge-primary badge-lg gap-2 shadow-lg">
				<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
					<path
						d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"
					></path>
				</svg>
				Advanced AI
			</div>
		</div>

		<h1 class="text-base-content text-4xl leading-tight font-bold sm:text-5xl md:text-6xl">
			🔍 Image Upscaler
		</h1>

		<p class="text-base-content/70 mx-auto max-w-3xl text-lg leading-relaxed sm:text-xl">
			Transform your images with cutting-edge AI technology.
			<span class="text-primary font-semibold">Increase resolution by 2x</span>
			while maintaining all original details and quality.
		</p>

		<!-- Features badges -->
		<div class="mt-6 flex flex-wrap justify-center gap-3">
			<div class="badge badge-outline badge-lg">🚀 Super Fast</div>
			<div class="badge badge-outline badge-lg">🎯 High Precision</div>
			<div class="badge badge-outline badge-lg">💎 Premium Quality</div>
		</div>
	</div>

	<!-- Main Card -->
	<div
		class="card from-base-100/90 to-base-200/50 border-primary/20 mx-auto w-full max-w-6xl border bg-gradient-to-br shadow-2xl backdrop-blur-sm"
	>
		<div class="card-body p-8 sm:p-12">
			<!-- Initial State: Enhanced File Drop Zone -->
			{#if !imageUrl}
				<div
					class={`
            border-base-300/70 relative flex w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed py-20 text-center transition-all duration-300
            ${isDragging ? 'border-primary from-primary/10 to-secondary/10 bg-gradient-to-br' : 'hover:border-primary hover:from-primary/5 hover:to-secondary/5 hover:bg-gradient-to-br'}
            group
          `}
					onclick={() => fileInput?.click()}
					ondragenter={() => (isDragging = true)}
					ondragleave={() => (isDragging = false)}
					ondragover={(e) => e.preventDefault()}
					ondrop={handleFileDrop}
					role="button"
					tabindex="0"
					onkeydown={(e) => e.key === 'Enter' && fileInput?.click()}
				>
					<!-- Background decoration -->
					<div
						class="from-primary/5 absolute inset-0 rounded-3xl bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
					></div>

					<!-- Upload icon with enhanced styling -->
					<div
						class="bg-primary/10 group-hover:bg-primary/20 relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110"
					>
						<svg
							class="text-primary h-12 w-12 transition-transform duration-300 group-hover:scale-110"
							stroke="currentColor"
							fill="none"
							viewBox="0 0 48 48"
							aria-hidden="true"
						>
							<path
								d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							></path>
						</svg>
					</div>

					<div class="relative z-10 space-y-3">
						<p
							class="text-base-content group-hover:text-primary text-xl font-bold transition-colors duration-300"
						>
							Drag and drop your image here
						</p>
						<p class="text-base-content/60 text-lg">
							or <span class="text-primary font-semibold">click to select</span>
						</p>
						<div class="mt-4 flex flex-wrap justify-center gap-2">
							<div class="badge badge-ghost">PNG</div>
							<div class="badge badge-ghost">JPEG</div>
							<div class="badge badge-ghost">WEBP</div>
						</div>
					</div>

					<input
						bind:this={fileInput}
						type="file"
						class="hidden"
						onchange={handleFileSelect}
						accept="image/png, image/jpeg, image/webp"
						disabled={loading}
					/>
				</div>
			{/if}

			<!-- Image Processing Interface -->
			{#if imageUrl}
				<div class="w-full space-y-8" transition:slide={{ duration: 400, easing: quintOut }}>
					<!-- Error Display with enhanced styling -->
					{#if error}
						<div
							class="alert alert-error border-error/30 from-error/10 to-error/5 border bg-gradient-to-r shadow-xl"
						>
							<div class="flex items-center gap-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-6 w-6 flex-shrink-0 stroke-current"
									fill="none"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<span class="font-semibold">{error}</span>
							</div>
							<div class="flex-none">
								<button class="btn btn-sm btn-ghost hover:btn-error" onclick={resetState}>
									Try Again
								</button>
							</div>
						</div>
					{/if}

					<!-- Enhanced Image Comparison Grid -->
					<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
						<!-- Original Image Section -->
						<div class="space-y-4">
							<div class="flex items-center justify-between">
								<h3 class="text-base-content flex items-center gap-2 text-xl font-bold">
									<div class="bg-secondary h-3 w-3 rounded-full"></div>
									Original Image
								</h3>
								{#if imageFile}
									<div class="badge badge-secondary badge-outline">
										{formatFileSize(imageFile.size)}
									</div>
								{/if}
							</div>

							<div class={imageContainerClasses}>
								<img
									src={imageUrl || '/placeholder.svg'}
									alt="Original"
									class="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
								/>

								{#if loading}
									<div
										class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-black/70 to-black/50 backdrop-blur-md transition-all duration-300"
									>
										<div class="space-y-4 text-center text-white">
											<div class=" mb-4 flex h-16 w-full items-center justify-center rounded-full">
												<span class="loading loading-spinner loading-lg text-primary"></span>
											</div>
											<p class="text-lg font-semibold">{getLoadingMessage()}</p>
											<div class="badge badge-primary badge-outline">{progress}%</div>
										</div>

										<!-- Enhanced progress bar -->
										<div
											class="absolute bottom-0 left-0 h-2 w-full overflow-hidden rounded-b-2xl bg-black/30"
										>
											<div
												class="from-primary to-secondary h-full bg-gradient-to-r transition-all duration-300 ease-out"
												style="width: {progress}%"
											></div>
										</div>
									</div>
								{/if}
							</div>
						</div>

						<!-- Upscaled Image Section -->
						<div class="space-y-4">
							<div class="flex items-center justify-between">
								<h3 class="text-base-content flex items-center gap-2 text-xl font-bold">
									<div class="bg-primary h-3 w-3 rounded-full"></div>
									Upscaled Result
									<div class="badge badge-primary badge-sm">2x</div>
								</h3>
								{#if upscaledImageUrl}
									<div class="badge badge-success badge-outline">✨ Done</div>
								{/if}
							</div>

							<div class={imageContainerClasses}>
								{#if upscaledImageUrl && !loading}
									<img
										src={upscaledImageUrl || '/placeholder.svg'}
										alt="Upscaled"
										class="h-full w-full object-contain transition-all duration-500 group-hover:scale-105"
										transition:slide={{ duration: 500, easing: quintOut }}
									/>
									<!-- Success indicator -->
									<div class="badge badge-success absolute top-4 right-4 gap-2 shadow-lg">
										<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
											<path
												fill-rule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clip-rule="evenodd"
											></path>
										</svg>
										Done
									</div>
								{:else if !loading}
									<div class="space-y-4 text-center">
										<div
											class="bg-base-300/50 mx-auto flex h-16 w-16 items-center justify-center rounded-full"
										>
											<svg
												class="text-base-content/30 h-8 w-8"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
												></path>
											</svg>
										</div>
										<p class="text-base-content/50 font-medium">The result will appear here</p>
										<div class="badge badge-ghost">Waiting for processing</div>
									</div>
								{/if}
							</div>
						</div>
					</div>

					<!-- Enhanced Action Buttons -->
					<div class="divider divider-primary opacity-30"></div>

					<div class="flex flex-wrap justify-center gap-4 pt-4">
						{#if !loading && !upscaledImageUrl}
							<button
								class="btn btn-primary btn-lg hover:shadow-primary/30 gap-3 shadow-lg transition-all duration-300 hover:scale-105"
								onclick={startUpscale}
							>
								<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
										clip-rule="evenodd"
									></path>
								</svg>
								Start AI Upscale
							</button>
							<button class="btn btn-ghost btn-lg" onclick={resetState}> Cancel </button>
						{/if}

						{#if upscaledImageUrl && !loading}
							<a
								href={upscaledImageUrl}
								download="upscaled-image.png"
								class="btn btn-primary btn-lg hover:shadow-primary/30 gap-3 shadow-lg transition-all duration-300 hover:scale-105"
							>
								<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
									></path>
								</svg>
								Download Image
							</a>
							<button
								class="btn btn-secondary btn-lg hover:shadow-secondary/30 gap-3 shadow-lg transition-all duration-300 hover:scale-105"
								onclick={resetState}
							>
								<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									></path>
								</svg>
								Process Another
							</button>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
