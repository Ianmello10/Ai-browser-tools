import { pipeline } from '@huggingface/transformers';

let upscaler: any = null;

self.onmessage = async (event) => {
	const image = event.data;

	try {
		self.postMessage({ type: 'progress', stage: 'initializing', progress: 40 });

		if (!upscaler) {
			upscaler = await pipeline('image-to-image', 'Xenova/2x_APISR_RRDB_GAN_generator-onnx');
		}

		self.postMessage({ type: 'progress', stage: 'processing', progress: 70 });

		const output = await upscaler(image);

		self.postMessage({ type: 'progress', stage: 'finalizing', progress: 90 });

		self.postMessage({
			type: 'complete',
			output: output
		});
	} catch (e) {
		const errorMessage = e instanceof Error ? e.message : String(e);
		self.postMessage({ type: 'error', error: errorMessage });
	}
};
