import { OpenAI } from 'openai';
import path from 'path';
import fs from 'fs/promises';
import type { Case, Sample } from './case';
import { asBuffer, createImage } from './image';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const MODEL = 'gpt-4o';
const PROMPT = `You are an expert puzzle solver.
Your task is to understand the pattern in the input and output images.
The images are 2D grids of colored cells.
Each cell is a color represented by a number (the colors and number mapping is always the same).
Observe the input and output images carefully, take your time.
Make various hypotheses and test them.
It's okay to make mistakes, but try to learn from them.
When you are ready, explain the pattern in the input and output images.`

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function analyze(file: string, dataDir: string) {
  const filePath = path.join(dataDir, file);
  const str = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(str) as Case;

  const messages = await createMessages(data.train);
  messages.unshift({
    role: 'developer',
    content: PROMPT
  });
  let res = await openai.chat.completions.create({
    model: MODEL,
    messages
  });

  const analysis = res.choices[0].message.content;
  const tokens = res.usage!;
  
  messages.push({
    role: 'user',
    content: [
      {
        type: 'text',
        text: `Given your analysis, what do you think is the output for the following input?`
      },
      {
        type: 'image_url',
        image_url: {
          url: getImageUrl(await asBuffer(createImage(data.test[0].input))),
          detail: 'low'
        }
      }
    ]
  });
  
  res = await openai.chat.completions.create({
    model: MODEL,
    messages
  });
  const prediction = res.choices[0].message.content;

  tokens.prompt_tokens += res.usage!.prompt_tokens;
  tokens.completion_tokens += res.usage!.completion_tokens;

  return { file, analysis, prediction, solution: data.test[0].output, tokens };
}

async function createMessages(data: Sample[]) {
  const messages: OpenAI.ChatCompletionCreateParams['messages'] = [];
  for (let s = 0; s < data.length; s++) {
    const sample = data[s];
    const input = await asBuffer(createImage(sample.input));
    const output = await asBuffer(createImage(sample.output));
    messages.push({
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Example ${s + 1}:`
        },
        {
          type: 'image_url',
          image_url: {
            url: getImageUrl(input),
            detail: 'low'
          }
        },
        {
          type: 'image_url',
          image_url: {
            url: getImageUrl(output),
            detail: 'low'
          }
        }
      ]
    });
  }
  return messages;
}

function getImageUrl(buffer: Buffer) {
  return `data:image/png;base64,${buffer.toString('base64')}`;
}