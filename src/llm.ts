import { OpenAI } from 'openai';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import type { Case, Sample } from './case';
import { asBuffer, createImage, saveImage } from './image';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const MODEL = 'gpt-4o';
const PROMPT = `You are an expert puzzle solver.
Your task is to understand the pattern in the following input/output image pairs.
The images are 2D grids of colored cells.
Each cell is a color represented by a number (the colors and number mapping is always the same).
The examples are given in no particular order. Your solution must not assume that the order matters.
Observe the input and output images carefully, take your time.
Make various hypotheses and test them.
It's okay to make mistakes, but try to learn from them.
When you are ready, explain the pattern in the input and output images.`

const PROMPT_CODE = `Given your analysis, write a JavaScript arrow function that can transform the inputs into their corresponding outputs.
This function must also work for the following image (the output image is the actual solution to the puzzle).
The function signature is (input: Grid) => Grid. Only write the function, do not assign it to a variable.
The function should typically be around 5-10 lines of code.

The Grid class has the following methods/properties:
- width: number (returns the width of the grid)
- height: number (returns the height of the grid)
- select(x: number, y: number, width: number = 1, height: number = 1): Grid (returns the selected region of the grid; if the selection is out of bounds, the missing cells are filled with -1, ie. transparent)
- insert(grid: Grid, x: number, y: number): Grid (returns the grid with the given grid inserted at the given position; out-of-bounds and transparent areas are ignored)
- rotate(angle: 'right' | 'left'): Grid (returns the grid rotated 90 degrees to the right or left)
- flip(axis: 'x' | 'y'): Grid (returns the grid flipped horizontally or vertically)
- transpose(): Grid (returns the grid with x/y axes transposed)
- concat(grid: Grid, axis: 'x' | 'y'): Grid (concatenates the grid with another grid along the given axis; missing cells are filled with -1, ie. transparent)
- partition(background=0, diagonal=false): {grid: Grid, x: number, y: number}[] (returns an array of partitions of the grid, each partition is a grid with the top-left corner at x, y; this grid is transparent (-1) inside and outside the partition; the default background color is 0; by default only direct neighbors are in the same partition, if diagonal is true, diagonal neighbors are also considered)
- clear(fill = 0): Grid (returns a grid with the same dimensions filled with the given color, default is 0)
- at(x: number, y: number): number (returns the color at the given position)
- find(fn: (v: number, x?: number, y?: number) => boolean): {value: number, x: number, y: number} | undefined (returns the first cell that satisfies the condition)
- replace(fn: (v: number, x?: number, y?: number) => boolean, value: number): Grid (returns a new grid with all cells that satisfy the condition replaced by the given value)
- count(fn: (v: number, x?: number, y?: number) => boolean): number (returns the number of cells that satisfy the condition)
- equals(grid: Grid): boolean (returns true if the grid is equal to the given grid)

The Grid class is immutable, all methods return a new Grid object.
To create new grid, use the static method Grid.create(width: number, height: number, fill: number): Grid.

If you cannot figure it out right away, attempt a partial solution, and you will be given more information to help you.
Write the source code directly, DO NOT include any explanation except for comments in the code.`;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function analyze(data: Case, runsDir: string) {

  const runDir = join(runsDir, data.name, `${Date.now()}`);
  await mkdir(runDir, {recursive: true});

  const messages = [
    {
      role: 'developer' as const,
      content: PROMPT
    },
    ...await createMessages(data.train)
  ];

  let res = await openai.chat.completions.create({
    model: MODEL,
    messages
  });

  const analysis = res.choices[0].message.content;
  let {prompt_tokens, completion_tokens} = res.usage!;

  messages.push(res.choices[0].message);  
  messages.push({
    role: 'user',
    content: [
      {
        type: 'text',
        text: PROMPT_CODE
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

  const context = {
    attempt: 0,
    messages,
    case: data,
    runDir,
    prompt_tokens,
    completion_tokens,
    predictions: [] as string[],
    tests: [] as any[]
  }

  let success = false;
  while(!success && context.attempt < 5) {
    const {messages: newMessages, ...test} = await predict(context);
    success = test.success;
    if(!success) {
      context.messages.push(...newMessages);
    }
  }
  
  await writeFile(
    join(runDir, 'messages.json'),
    JSON.stringify(messages, null, 2)
  );

  return {
    case: data.name,
    solution: data.test[0].output.toString(),
    analysis,
    predictions: context.predictions,
    tests: context.tests,
    prompt_tokens: context.prompt_tokens,
    completion_tokens: context.completion_tokens
  };
}

async function predict(
  context: {
    case: Case,
    messages: OpenAI.ChatCompletionCreateParams['messages'],
    runDir: string,
    attempt: number,
    prompt_tokens: number,
    completion_tokens: number,
    predictions: string[],
    tests: any[]
  }
) {

  context.attempt++;
  let res = await openai.chat.completions.create({
    model: MODEL,
    messages: context.messages
  });

  context.prompt_tokens += res.usage!.prompt_tokens;
  context.completion_tokens += res.usage!.completion_tokens;

  context.messages.push(res.choices[0].message);

  let prediction = extractCodeBlock(res.choices[0].message.content!);
  context.predictions.push(prediction);
  
  let test = context.case.evalStr(prediction);
  context.tests.push(test);

  const messages: OpenAI.ChatCompletionCreateParams['messages'] = [];

  if(!test.success) {
    messages.push({
      role: 'user',
      content: 'Your attempt failed some of the test cases above. Observe the generated images for each failed test case, and generate a new function that fixes your mistakes.'
    });
  }

  if(test.error) {
    messages.push({
      role: 'user',
      content: `Error message: ${test.error}`
    });
  }

  if(test.reports) {
    for(let i=0; i<test.reports.length; i++) {
      const report = test.reports[i];
      if(report.output) {
        const canvas = createImage(report.output);
        if(report.success) {
          messages.push({
            role: 'user',
            content: `test case ${i+1} passed.`
          });
        }
        else {
          messages.push({
            role: 'user',
            content: [
              {
                type: 'text',
                text: `test case ${i+1} failed. the following image was generated by your function.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: getImageUrl(await asBuffer(canvas)),
                  detail: 'low'
                }
              }
            ]
          });
        }
        await saveImage(canvas, join(context.runDir, `attempt-${context.attempt}-test-${i}-${report.success? 'success' : 'fail'}.png`))
      }
      else {
        messages.push({
          role: 'user',
          content: `test case ${i+1} failed: ${report.error ?? 'unknown error'}`
        });
      }
    }
  }
  return {...test, messages};
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

// Extract code from markdown
function extractCodeBlock(markdown: string) {
  let i = markdown.lastIndexOf('```');
  if(i===-1) {
    return markdown
  }
  markdown = markdown.substring(0, i);
  i = markdown.lastIndexOf('```');
  if(i===-1) {
    return markdown;
  }
  markdown = markdown.substring(i, markdown.length);
  return markdown.replaceAll(/```((javascript)|(typescript)|(js)|(ts))?/gi, '')
}