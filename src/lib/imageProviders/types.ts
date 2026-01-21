export interface ImageProviderConfig {
  prompt: string;
  width: number;
  height: number;
  seed?: number;
}

export interface ImageProvider {
  generateColoringPage(config: ImageProviderConfig): Promise<Buffer>;
}
