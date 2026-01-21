export interface ImageProviderConfig {
  prompt: string;
  width: number;
  height: number;
  seed?: number;
}

export interface ImageProvider {
  // @ts-ignore - Buffer type is available at runtime via Node.js
  generateColoringPage(config: ImageProviderConfig): Promise<Buffer>;
}
