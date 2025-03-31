To install dependencies:

```bash
bun install
```

Add a `.env` file and/or set the `OPENAI_API_KEY` environment variable.

To run:

```bash
bun run src/index.ts
```

# Intuition

- Patterns in ARC tasks are mostly visual patterns. Therefore a VLM viewing the data as images is more likely to detect the patterns than an LLM viewing the data as text.
- Tasks can be solved with short programs, given the right abstractions and utilities.
- LLMs can write programs, but they need to test these programs until they work, like a human would.

To write programs that solve tasks, we provide a `Grid` class that includes methods to transform the data (select, insert, rotate, etc.). It also includes more complex algorithms (partition, floodFill). See [`grid.ts`](https://github.com/ericleib/arc-2/blob/master/src/grid.ts). 

The [`solutions.ts`](https://github.com/ericleib/arc-2/blob/master/src/solutions.ts) file shows that (at least some) tasks can be solved with fairly short programs (5-10 loc) using the `Grid` methods.

For example, the solution to the task [`00576224`](https://arcprize.org/play?task=00576224) is:

```js
grid => {
  const row = grid.concat(grid, 'x').concat(grid, 'x');
  return row.concat(row.flip('x'), 'y').concat(row, 'y');
}
```

# Algorithm

For each task,
- Create image representations of each test case input and output data.
- Use a VLM to analyze the image pairs (generate thoughts about the problem, try to identify patterns)
- Then, iteratively and within the same growing conversation with the VLM:
  - Generate a program that transform inputs into outputs. The program is a JavaScript function that takes one argument of type `Grid` and returns a `Grid`.
  - Execute the program on all the test cases
  - If the program is fully successfull, then stop
  - Else,
    - Generate images of the program output
    - Insert these images in the conversation
    - Ask the model to rewrite the program, given its actual vs expected output.

# Results

So far, the algorithm fails to solve any of the first 10 tasks in the training set. The VLM does understand some of the patterns, and generates programs that are plausible, but it fails to correct them. Generally, the programs are more complicated than they need to be. It also seems that VLMs do not generate internal representations that are very suited to detecting the puzzles' patterns.