class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
    }
  
    process(inputs) {
      const input = inputs[0];
  
      if (input && input[0]) {
        // Convert Float32 PCM samples → to transferable array
        const floatSamples = input[0];
        this.port.postMessage(floatSamples);
      }
  
      return true;
    }
  }
  
  registerProcessor("audio-processor", AudioProcessor);
  