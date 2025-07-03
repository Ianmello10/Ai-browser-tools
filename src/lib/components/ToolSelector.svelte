<script lang="ts">
	interface Tool {
		name: string;
		description: string;
		path: string;
		icon: string;
		category: string;
		features: string[];
	}

	const tools: Tool[] = $state([
		{
			name: 'Background Remover',
			description:
				'Remove the background from your images with ease and precision, ideal for e-commerce and graphic design.',
			path: '/remove-bg',
			icon: '✂️',
			category: 'Editing',
			features: ['Advanced AI', 'High Precision', 'Batch Processing']
		},
		{
			name: 'Image Upscaler',
			description:
				'Increase the resolution of your images by up to 4x without losing quality, perfect for prints and high-definition screens.',
			path: '/upscale',
			icon: '🔍',
			category: 'Enhancement',
			features: ['2x Resolution', 'Lossless', 'Super Fast']
		}
	]);
</script>

<div class="container mx-auto max-w-6xl p-6">
	<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
		{#each tools as tool (tool.name)}
			<div
				class="card from-base-100 to-base-200 hover:shadow-primary/20 border-base-300/50 hover:border-primary/30 group transform overflow-hidden border bg-gradient-to-br shadow-2xl transition-all duration-500 ease-out hover:-translate-y-3"
			>
				<!-- Card header with category badge -->
				<div class="absolute top-4 right-4 z-10">
					<div class="badge badge-primary badge-outline">{tool.category}</div>
				</div>

				<div class="card-body relative p-8">
					<!-- Background decoration -->
					<div
						class="from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
					></div>

					<!-- Icon with enhanced styling -->
					<div class="relative z-10 mb-6 flex justify-center">
						<div
							class="bg-primary/10 group-hover:bg-primary/20 flex h-20 w-20 items-center justify-center rounded-full text-4xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
						>
							{tool.icon}
						</div>
					</div>

					<!-- Title -->
					<h2
						class="card-title text-base-content group-hover:text-primary mb-4 justify-center text-center text-2xl font-bold transition-colors duration-300"
					>
						{tool.name}
					</h2>

					<!-- Description -->
					<p class="text-base-content/70 relative z-10 mb-6 text-center leading-relaxed">
						{tool.description}
					</p>

					<!-- Features -->
					<div class="relative z-10 mb-6 flex flex-wrap justify-center gap-2">
						{#each tool.features as feature}
							<div class="badge badge-ghost badge-sm">{feature}</div>
						{/each}
					</div>

					<!-- Divider -->
					<div class="divider divider-primary opacity-30"></div>

					<!-- Action button -->
					<div class="card-actions relative z-10 justify-center">
						<a
							href={tool.path}
							class="btn btn-primary btn-lg btn-wide group-hover:btn-secondary hover:shadow-primary/30 gap-3 shadow-lg transition-all duration-300 hover:scale-105"
						>
							<span class="text-xl transition-transform duration-300 group-hover:rotate-12">🚀</span
							>
							Get Started
							<svg
								class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								></path>
							</svg>
						</a>
					</div>
				</div>

				<!-- Bottom accent -->
				<div
					class="from-primary to-secondary h-1 origin-left scale-x-0 transform bg-gradient-to-r transition-transform duration-500 group-hover:scale-x-100"
				></div>
			</div>
		{/each}
	</div>

	<!-- Hero section -->
	<div
		class="hero from-primary/10 via-secondary/10 to-accent/10 border-primary/20 mt-16 rounded-3xl border bg-gradient-to-r p-8"
	>
		<div class="hero-content text-center">
			<div class="max-w-2xl">
				<div class="mb-4 flex justify-center">
					<div class="badge badge-primary badge-lg gap-2">
						<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
							<path
								d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
							></path>
						</svg>
						Premium Tools
					</div>
				</div>

				<h1
					class="from-primary to-secondary mb-4 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent"
				>
					AI Image Tools
				</h1>

				<p class="text-base-content/70 mb-8 text-lg leading-relaxed">
					Transform your images with our professional AI-powered tools. Get professional results in
					seconds, no technical knowledge required.
				</p>

				<div
					class="stats stats-horizontal bg-base-100/80 border-primary/20 border shadow-xl backdrop-blur-sm"
				>
					<div class="stat place-items-center">
						<div class="stat-title text-primary font-semibold">Tools</div>
						<div class="stat-value text-primary text-3xl">{tools.length}</div>
						<div class="stat-desc text-base-content/60">Available</div>
					</div>

					<div class="stat place-items-center">
						<div class="stat-title text-secondary font-semibold">Users</div>
						<div class="stat-value text-secondary text-3xl">10K+</div>
						<div class="stat-desc text-base-content/60">Satisfied</div>
					</div>

					<div class="stat place-items-center">
						<div class="stat-title text-accent font-semibold">Images</div>
						<div class="stat-value text-accent text-3xl">1M+</div>
						<div class="stat-desc text-base-content/60">Processed</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
