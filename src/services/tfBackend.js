import * as tf from '@tensorflow/tfjs';

let backendInitPromise = null;

export async function ensureTfBackend(preferredBackends = ['webgpu', 'webgl', 'wasm', 'cpu']) {
  if (backendInitPromise) return backendInitPromise;

  backendInitPromise = (async () => {
    await tf.ready();

    for (const backend of preferredBackends) {
      try {
        if (tf.getBackend() !== backend) {
          await tf.setBackend(backend);
        }
        await tf.ready();
        return tf.getBackend();
      } catch (error) {
        console.warn(`Backend ${backend} failed, trying next:`, error?.message || error);
      }
    }

    throw new Error('No TensorFlow.js backend could be initialized');
  })();

  return backendInitPromise;
}

export function getActiveBackend() {
  return tf.getBackend();
}

export { tf };
