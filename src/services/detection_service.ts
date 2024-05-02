
import { LayersModel, loadLayersModel, Tensor, tensor2d, tidy } from '@tensorflow/tfjs';

export class DetectionService {
  private static instance: DetectionService;
  private vocabData: object | null = null;
  private model: LayersModel | null = null;

  private constructor() { }

  public static getInstance(): DetectionService {
    if (!DetectionService.instance) {
      DetectionService.instance = new DetectionService();
    }

    return DetectionService.instance;
  }

  private async loadVocabData(): Promise<any> {
    try {
      const response = await fetch(process.env.VOCAB_FILE_URL || '');
      if (!response.ok) {
        throw new Error('');
      }

      return await response.json();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async loadModel() {
    try {
      let data = await this.loadVocabData();
      console.log(typeof data);
      if (data instanceof Error) {
        console.log(data);
        return;
      } else {
        this.vocabData = data;
      }
    } catch (error) {
      console.log('error=' + error);
    }

    
    this.model = await loadLayersModel(process.env.MODEL_FILE_URL || '');
  }

  private tokenize(message: string): number[] {
    return message
      .split('')
      .map((e: string) => e.trim())
      .filter((e: string) => e.length != 0)
      .map((e: string) => {
        if (this.vocabData) {
          console.log(this.vocabData[e as keyof object]);
          return Number(this.vocabData[e as keyof object]);
        }
        
        return 0;
      });
  }

  private padSequence(sequence: number[]): number[] {
    const paddedSequence = new Array(300).fill(0);
    const startIndex = paddedSequence.length - sequence.length;
    sequence.forEach((value, index) => {
      paddedSequence[startIndex + index] = value;
    });

    return paddedSequence;
  }

  async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getResultFromResultTensor(tensor: Tensor | Tensor[] | undefined): number[] | null {
    if (!tensor || !(tensor instanceof Tensor)) {
      return null;
    }

    let arraySync = tensor.arraySync();
    if (!Array.isArray(arraySync) || arraySync.length !== 1) {
      return null;
    }

    arraySync = arraySync[0];
    if (!Array.isArray(arraySync) || arraySync.length !== 2) {
      return null;
    }

    let probBenign = arraySync[1];
    let probMalicious = arraySync[0];
    
    if (Array.isArray(probBenign) || Array.isArray(probMalicious)) {
      return null;
    }

    return [probMalicious, probBenign];
  }

  async scanUrl(url: string): Promise<boolean> {
    if (this.model === null) {
      await this.loadModel();
    }

    const tensor = tidy(() => {
      const tokenizedUrl = this.tokenize(url);
      const sequence = this.padSequence(tokenizedUrl);
      return this.model?.predict(tensor2d(sequence, [1, sequence.length]))
    });

    console.log(tensor);
    const result = this.getResultFromResultTensor(tensor);
    if (result === null) {
      return false;
    }

    console.log(result);
    return result[0] >= result[1];
  }
}
