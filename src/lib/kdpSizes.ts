export type BookSize = '8.5x11' | '8x10' | '8.25x11';

export interface PixelDimensions {
  width: number;
  height: number;
}

const DPI = 300;

const SIZE_MAP: Record<BookSize, { widthInches: number; heightInches: number }> = {
  '8.5x11': { widthInches: 8.5, heightInches: 11 },
  '8x10': { widthInches: 8, heightInches: 10 },
  '8.25x11': { widthInches: 8.25, heightInches: 11 },
};

/**
 * Convert KDP book size to pixel dimensions at 300 DPI
 */
export function getPixelSize(bookSize: BookSize): PixelDimensions {
  const size = SIZE_MAP[bookSize];
  return {
    width: Math.round(size.widthInches * DPI),
    height: Math.round(size.heightInches * DPI),
  };
}

/**
 * Get all available book sizes
 */
export function getAvailableSizes(): BookSize[] {
  return Object.keys(SIZE_MAP) as BookSize[];
}
