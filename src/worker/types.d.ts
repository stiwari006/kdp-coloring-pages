/// <reference types="node" />

// Ensure Node.js built-in modules are available
declare module 'url' {
  export function fileURLToPath(url: string | URL): string;
}

declare module 'path' {
  export function resolve(...pathSegments: string[]): string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
    }
  }
  
  var process: {
    argv: string[];
    exit(code?: number): never;
    env: NodeJS.ProcessEnv;
  };
  
  var Buffer: {
    new (str: string, encoding?: string): Buffer;
    from(data: any): Buffer;
    isBuffer(obj: any): obj is Buffer;
  };
}

export {};
