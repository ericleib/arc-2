import * as fs from 'fs/promises';
import * as path from 'path';
import { Canvas, createCanvas } from 'canvas';
import type { Case } from './case';
import { Grid } from './grid';

const WIDTH_PNG = 512;
const HEIGHT_PNG = 512;
const COLORS = ['black', 'blue', 'red', 'green', 'yellow', 'grey', 'pink', 'orange', 'cyan', 'brown'];

export async function createImages(imagesDir: string, c: Case) {

  const imageDir = path.join(imagesDir, c.name);
  await fs.mkdir(imageDir, { recursive: true }).catch();
  
  for (const type of ['train', 'test'] as const) {
    for (let s = 0; s < c[type].length; s++) {
      const sample = c[type][s];
      await saveImage(createImage(sample.input), path.join(imageDir, `${type}-${s}-input.png`));
      await saveImage(createImage(sample.output), path.join(imageDir, `${type}-${s}-output.png`));
    }
  }
}

export async function saveImage(canvas: Canvas, file: string) {
  await fs.writeFile(file, canvas.createPNGStream());
}

export async function asBuffer(canvas: Canvas) {
  const data = await Array.fromAsync(canvas.createPNGStream());
  return Buffer.concat(data);
}

export function createImage(grid: Grid) {
  const canvas = createCanvas(WIDTH_PNG, HEIGHT_PNG);
  const ctx = canvas.getContext('2d');
  const max = Math.max(grid.width, grid.height);
  const innerWidth = WIDTH_PNG / max;
  const innerHeight = HEIGHT_PNG / max;
  const textHeight = Math.min(20, innerHeight - 12);
  for (let i = 0; i < grid.width; i++) {
    for (let j = 0; j < grid.height; j++) {
      ctx.fillStyle = COLORS[grid.at(i, j)];
      ctx.fillRect(i * innerWidth, j * innerHeight, innerWidth, innerHeight);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(i * innerWidth, j * innerHeight, innerWidth, innerHeight);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'white';
      ctx.font = `${textHeight}px Arial`;
      ctx.fillText(grid.at(i,j).toString(), i * innerWidth + innerWidth / 2, j * innerHeight + innerHeight / 2);
    }
  }
  return canvas;
}