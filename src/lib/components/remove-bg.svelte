<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import BackgroundRemoverWorker from '$lib/worker/background-remover.worker.ts?worker';

	let imageFile = $state<File | null>(null);
	let outputUrl = $state<string | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let dragActive = $state(false);
	let loadingStage = $state<'uploading' | 'initializing' | 'processing' | 'finalizing'>(
		'uploading'
	);
	let progress = $state(0);
	let worker = $state<Worker | null>(null);

	onMount(() => {
		worker = new BackgroundRemoverWorker();
		worker.onmessage = (event) => {
			const { type, stage, progress: workerProgress, output, error: workerError } = event.data;

			if (type === 'progress') {
				loadingStage = stage;
				progress = workerProgress;
			} else if (type === 'complete') {
				const img = output;
				const canvas = document.createElement('canvas');
				canvas.width = img.width;
				canvas.height = img.height;
				const ctx = canvas.getContext('2d');
				if (ctx) {
					ctx.putImageData(new ImageData(img.data, img.width, img.height), 0, 0);
				}
				outputUrl = canvas.toDataURL('image/png');
				progress = 100;
				loading = false;
			} else if (type === 'error') {
				error = `Error processing: ${workerError}`;
				console.error(workerError);
				loading = false;
				progress = 0;
			}
		};

		return () => {
			worker?.terminate();
		};
	});

	async function startBackgroundRemoval(file: File) {
		loading = true;
		error = null;
		outputUrl = null;
		loadingStage = 'uploading';
		progress = 20;
		worker?.postMessage(file);
	}

	function handleDragEnter(e: DragEvent) {
		e.preventDefault();
		dragActive = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		dragActive = false;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragActive = false;
		const files = e.dataTransfer?.files;
		if (files && files[0] && files[0].type.startsWith('image/')) {
			imageFile = files[0];
		}
	}

	function getLoadingMessage() {
		switch (loadingStage) {
			case 'uploading':
				return 'Uploading image...';
			case 'initializing':
				return 'Initializing AI model...';
			case 'processing':
				return 'Removing image background...';
			case 'finalizing':
				return 'Finalizing processing...';
			default:
				return 'Processing...';
		}
	}

	function formatFileSize(sizeInBytes: number): string {
		if (sizeInBytes < 1024 * 1024) {
			return `${(sizeInBytes / 1024).toFixed(1)} KB`;
		} else {
			return `${(sizeInBytes / 1024 / 1024).toFixed(1)} MB`;
		}
	}

	function resetAll() {
		imageFile = null;
		outputUrl = null;
		error = null;
		loading = false;
		progress = 0;
	}

	$effect(() => {
		if (imageFile) {
			startBackgroundRemoval(imageFile);
		}
	});
</script>

<div class="  min-h-screen p-4 sm:p-6 md:p-8">
	<div class="mx-auto max-w-6xl space-y-8">
		<!-- Cabeçalho Aprimorado -->
		<div class="space-y-6 text-center">
			<div class="mb-4 flex justify-center">
				<div class="badge badge-primary badge-lg gap-2 shadow-lg">
					<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
						<path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"></path>
						<path
							fill-rule="evenodd"
							d="M3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
							clip-rule="evenodd"
						></path>
					</svg>
					Advanced AI
				</div>
			</div>
		</div>

		<h1
			class="text-base-content text-center text-3xl leading-tight font-bold sm:text-5xl md:text-4xl"
		>
			✂️ Remove Background Image
		</h1>

		<p class="text-base-content/70 mx-auto max-w-3xl text-lg leading-relaxed sm:text-xl">
			Automatically remove image backgrounds with cutting-edge AI technology.
			<span class="text-primary font-semibold">Professional results</span>
			in seconds, no technical skills required.
		</p>

		<!-- Feature Badges -->
		<div class="mt-6 flex flex-wrap justify-center gap-3">
			<div class="badge badge-outline badge-lg">🎯 Maximum Precision</div>
			<div class="badge badge-outline badge-lg">⚡ Super Fast</div>
			<div class="badge badge-outline badge-lg">🖼️ HD Quality</div>
		</div>
	</div>

	<!-- Cartão de Upload Aprimorado -->
	<div
		class="card from-base-100/90 to-base-200/50 border-primary/20 mt-10 border bg-gradient-to-br shadow-xl backdrop-blur-sm"
	>
		<div class="card-body p-8 sm:p-12">
			<div
				class={`
            group relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300
            ${dragActive ? 'border-primary from-primary/10 to-secondary/10 bg-gradient-to-br' : 'border-base-300/70'}
            ${!loading ? 'hover:border-primary hover:from-primary/5 hover:to-secondary/5 hover:bg-gradient-to-br' : 'pointer-events-none opacity-60'}
          `}
				ondragenter={handleDragEnter}
				ondragleave={handleDragLeave}
				ondragover={handleDragOver}
				ondrop={handleDrop}
				role="region"
				aria-label="Área de upload de imagem"
			>
				<!-- Decoração de Fundo -->
				<div
					class="from-primary/5 absolute inset-0 rounded-3xl bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
				></div>

				<label class="block cursor-pointer">
					<input
						type="file"
						accept="image/*"
						class="hidden"
						disabled={loading}
						onchange={(e) => {
							imageFile = (e.target as HTMLInputElement).files?.[0] ?? null;
						}}
					/>

					<div
						class="relative z-10 flex flex-col items-center justify-center px-8 py-16 text-center"
					>
						<div class="mb-6">
							{#if loading}
								<div
									class="bg-primary/10 relative flex h-24 w-24 items-center justify-center rounded-full"
								>
									<span class="loading loading-spinner loading-lg text-primary"></span>
									<div class="absolute -bottom-3 left-1/2 -translate-x-1/2 transform">
										<div class="badge badge-primary badge-sm">{progress}%</div>
									</div>
								</div>
							{:else}
								<div
									class="bg-primary/10 group-hover:bg-primary/20 flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110"
								>
									<svg
										class="text-primary h-12 w-12 transition-transform duration-300 group-hover:scale-110"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
										></path>
									</svg>
								</div>
							{/if}
						</div>

						<div class="space-y-3">
							<p
								class="text-base-content group-hover:text-primary text-xl font-bold transition-colors duration-300"
							>
								{loading ? getLoadingMessage() : 'Drag your image here'}
							</p>
							<p class="text-base-content/60 text-lg">
								{loading ? 'Please wait while processing...' : 'or click to select a file'}
							</p>

							{#if !loading}
								<div class="mt-4 flex flex-wrap justify-center gap-2">
									<div class="badge badge-ghost">JPG</div>
									<div class="badge badge-ghost">PNG</div>
									<div class="badge badge-ghost">WEBP</div>
								</div>
							{/if}
						</div>

						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						{#if !loading}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<div
								class="btn btn-primary btn-lg hover:shadow-primary/30 mt-6 gap-3 shadow-lg transition-all duration-300 hover:scale-105"
								onclick={() => {
									if (!loading) {
										const input = document.querySelector(
											'input[type="file"]'
										) as HTMLInputElement | null;
										input?.click();
									}
								}}
							>
								<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
									></path>
								</svg>
								Select Image
							</div>
						{/if}
					</div>
				</label>
			</div>
		</div>

		<!-- Progresso de Carregamento Aprimorado -->
		{#if loading}
			<div
				class="card from-base-100 to-base-200/50 border-primary/30 border bg-gradient-to-r shadow-2xl"
				transition:slide={{ duration: 400, easing: quintOut }}
			>
				<div class="card-body p-8">
					<div class="mb-6 flex items-center space-x-6">
						<div class="flex-shrink-0">
							<div class="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
								{#if loadingStage === 'uploading'}
									<span class="loading loading-ring loading-lg text-info"></span>
								{:else if loadingStage === 'initializing'}
									<span class="loading loading-ball loading-lg text-warning"></span>
								{:else if loadingStage === 'processing'}
									<span class="loading loading-bars loading-lg text-primary"></span>
								{:else}
									<span class="loading loading-dots loading-lg text-success"></span>
								{/if}
							</div>
						</div>

						<div class="flex-1">
							<p class="text-base-content mb-2 text-xl font-bold">{getLoadingMessage()}</p>
							<p class="text-base-content/60">
								{#if loadingStage === 'uploading'}
									Preparing your image for processing...
								{:else if loadingStage === 'initializing'}
									Loading artificial intelligence model...
								{:else if loadingStage === 'processing'}
									Analyzing pixels and removing the background...
								{:else}
									Finalizing and optimizing result...
								{/if}
							</p>
						</div>

						<div class="text-right">
							<div class="text-primary text-3xl font-bold">{progress}%</div>
							<div class="badge badge-sm badge-primary badge-outline">IA Working...</div>
						</div>
					</div>

					<!-- Barra de progresso aprimorada -->
					<div class="bg-base-300 h-4 w-full overflow-hidden rounded-full shadow-inner">
						<div
							class={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out
                ${loadingStage === 'uploading' ? 'from-info to-info' : ''}
                ${loadingStage === 'initializing' ? 'from-warning to-warning' : ''}
                ${loadingStage === 'processing' ? 'from-primary to-secondary' : ''}
                ${loadingStage === 'finalizing' ? 'from-success to-success' : ''}
              `}
							style="width: {progress}%"
						></div>
					</div>

					<!-- Indicadores de estágio aprimorados -->
					<div class="mt-6 flex justify-between text-sm">
						<div class="flex flex-col items-center space-y-2">
							<div
								class={`h-4 w-4 rounded-full transition-all duration-300
                  ${progress > 20 ? 'bg-success' : ''}
                  ${loadingStage === 'uploading' && progress <= 20 ? 'bg-info' : ''}
                  ${loadingStage !== 'uploading' && progress <= 20 ? 'bg-base-content/20' : ''}
                `}
							></div>
							<span
								class={`font-medium transition-colors duration-300
                  ${loadingStage === 'uploading' ? 'text-info' : ''}
                  ${progress > 20 ? 'text-success' : ''}
                  ${loadingStage !== 'uploading' && progress <= 20 ? 'text-base-content/40' : ''}
                `}
							>
								Upload
							</span>
						</div>

						<div class="flex flex-col items-center space-y-2">
							<div
								class={`h-4 w-4 rounded-full transition-all duration-300
                  ${progress > 40 ? 'bg-success' : ''}
                  ${loadingStage === 'initializing' && progress <= 40 ? 'bg-warning' : ''}
                  ${loadingStage !== 'initializing' && progress <= 40 ? 'bg-base-content/20' : ''}
                `}
							></div>
							<span
								class={`font-medium transition-colors duration-300
                  ${loadingStage === 'initializing' ? 'text-warning' : ''}
                  ${progress > 40 ? 'text-success' : ''}
                  ${loadingStage !== 'initializing' && progress <= 40 ? 'text-base-content/40' : ''}
                `}
							>
								IA
							</span>
						</div>

						<div class="flex flex-col items-center space-y-2">
							<div
								class={`h-4 w-4 rounded-full transition-all duration-300
                  ${progress > 70 ? 'bg-success' : ''}
                  ${loadingStage === 'processing' && progress <= 70 ? 'bg-primary' : ''}
                  ${loadingStage !== 'processing' && progress <= 70 ? 'bg-base-content/20' : ''}
                `}
							></div>
							<span
								class={`font-medium transition-colors duration-300
                  ${loadingStage === 'processing' ? 'text-primary' : ''}
                  ${progress > 70 ? 'text-success' : ''}
                  ${loadingStage !== 'processing' && progress <= 70 ? 'text-base-content/40' : ''}
                `}
							>
								Processing
							</span>
						</div>

						<div class="flex flex-col items-center space-y-2">
							<div
								class={`h-4 w-4 rounded-full transition-all duration-300
                  ${progress === 100 || loadingStage === 'finalizing' ? 'bg-success' : ''}
                  ${progress < 100 && loadingStage !== 'finalizing' ? 'bg-base-content/20' : ''}
                `}
							></div>
							<span
								class={`font-medium transition-colors duration-300
                  ${loadingStage === 'finalizing' || progress === 100 ? 'text-success' : ''}
                  ${progress < 100 && loadingStage !== 'finalizing' ? 'text-base-content/40' : ''}
                `}
							>
								Finalization
							</span>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Alerta de Erro Aprimorado -->
		{#if error}
			<div
				class="alert alert-error border-error/30 from-error/10 to-error/5 border bg-gradient-to-r shadow-2xl"
				transition:slide={{ duration: 300, easing: quintOut }}
			>
				<div class="flex items-center gap-3">
					<svg class="h-6 w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						></path>
					</svg>
					<div>
						<h3 class="text-lg font-bold">Error processing image!</h3>
						<div class="text-sm opacity-80">{error}</div>
					</div>
				</div>
				<button class="btn btn-sm btn-ghost hover:btn-error" onclick={resetAll}> Try Again </button>
			</div>
		{/if}

		<!-- Resultado de Sucesso Aprimorado -->
		{#if outputUrl && !loading}
			<div
				class="card from-base-100 to-base-200/50 border-success/20 border bg-gradient-to-br shadow-2xl"
				transition:slide={{ duration: 500, easing: quintOut }}
			>
				<div class="card-body p-8 sm:p-12">
					<!-- Cabeçalho de Sucesso -->
					<div class="mb-8 flex items-center justify-between">
						<div class="flex items-center space-x-4">
							<div class="badge badge-success badge-lg gap-2 shadow-lg">
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									></path>
								</svg>
								Done
							</div>
							<h3 class="text-base-content text-2xl font-bold">Background removed successfully!</h3>
						</div>
						<button
							class="btn btn-secondary btn-lg hover:shadow-secondary/30 gap-2 shadow-lg transition-all duration-300 hover:scale-105"
							onclick={resetAll}
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								></path>
							</svg>
							New Image
						</button>
					</div>

					<!-- Comparação de Imagens Aprimorada -->
					<div class="mb-8 grid gap-8 lg:grid-cols-2">
						<!-- Imagem Original -->
						{#if imageFile}
							<div class="space-y-4">
								<div class="flex items-center justify-between">
									<h4 class="text-base-content flex items-center gap-2 text-xl font-bold">
										<div class="bg-secondary h-3 w-3 rounded-full"></div>
										Original Image
									</h4>
									<div class="badge badge-secondary badge-outline">
										{formatFileSize(imageFile.size)}
									</div>
								</div>

								<div
									class="from-base-100 to-base-200 border-base-300/30 group relative aspect-square overflow-hidden rounded-2xl border bg-gradient-to-br shadow-xl"
								>
									<img
										src={URL.createObjectURL(imageFile) || '/placeholder.svg'}
										alt="Original"
										class="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
									/>
								</div>
							</div>
						{/if}

						<!-- Imagem Processada -->
						<div class="space-y-4">
							<div class="flex items-center justify-between">
								<h4 class="text-base-content flex items-center gap-2 text-xl font-bold">
									<div class="bg-primary h-3 w-3 rounded-full"></div>
									Final Result
									<div class="badge badge-primary badge-sm">No Background</div>
								</h4>
								<div class="badge badge-success badge-outline">✨ HD Quality</div>
							</div>

							<div
								class="from-base-100 to-base-200 border-base-300/30 group relative aspect-square overflow-hidden rounded-2xl border bg-gradient-to-br shadow-xl"
							>
								<!-- Padrão de transparência aprimorado -->
								<div
									class="absolute inset-0 opacity-20"
									style="background-image: url('data:image/svg+xml,%3csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3crect width=\'10\' height=\'10\' fill=\'%23e5e7eb\'/\>%3crect x=\'10\' y=\'10\' width=\'10\' height=\'10\' fill=\'%23e5e7eb\'/\>%3c/svg%3e'); background-size: 20px 20px;"
								></div>

								<img
									src={outputUrl || '/placeholder.svg'}
									alt="Sem fundo"
									class="relative h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
								/>

								<!-- Indicador de sucesso -->
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
							</div>
						</div>
					</div>

					<!-- Botão de Download Aprimorado -->
					<div class="divider divider-primary opacity-30"></div>

					<div class="flex justify-center">
						<a
							href={outputUrl}
							download="sem-fundo.png"
							class="btn btn-primary btn-lg hover:shadow-primary/30 gap-3 shadow-2xl transition-all duration-300 hover:scale-105"
						>
							<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 10v6m0 0l-4-4m4 4l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
							Download Image
							<div class="badge badge-primary-content">HD</div>
						</a>
					</div>
				</div>
			</div>
		{/if}

		<!-- Instruções Aprimoradas -->
		{#if !outputUrl && !loading}
			<div
				class="card from-info/10 via-primary/5 to-secondary/10 border-info/20 border bg-gradient-to-r shadow-xl"
			>
				<div class="card-body p-8">
					<h3 class="text-primary mb-6 flex items-center gap-3 text-2xl font-bold">
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
						How to use this tool
					</h3>

					<div class="steps steps-vertical lg:steps-horizontal">
						<div class="step step-primary">
							<div class="text-left">
								<div class="font-semibold">Select your image</div>
								<div class="text-sm opacity-70">Drag or click to choose</div>
							</div>
						</div>
						<div class="step step-primary">
							<div class="text-left">
								<div class="font-semibold">AI processes automatically</div>
								<div class="text-sm opacity-70">Wait a few seconds</div>
							</div>
						</div>
						<div class="step step-primary">
							<div class="text-left">
								<div class="font-semibold">Download the result</div>
								<div class="text-sm opacity-70">Image without background</div>
							</div>
						</div>
					</div>

					<!-- Dicas -->
					<div class="bg-base-100/50 border-primary/10 mt-8 rounded-xl border p-4">
						<h4 class="text-primary mb-2 font-semibold">💡 Tips for best results:</h4>
						<ul class="text-base-content/70 space-y-1 text-sm">
							<li>• Use images with good lighting</li>
							<li>• Avoid backgrounds too similar to the main object</li>
							<li>• High resolution images yield better results</li>
						</ul>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
