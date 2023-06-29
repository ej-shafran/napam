# napam

Starts your repository no matter the command.

Goes through `npm run start:dev`, `npm run dev`, and `npm start` (in that order) to see which is the start script for the current directory, then runs that.

## Installation

This package depends on `zx`, so install that as well:

```bash
npm i -g zx napam
```

## Usage

```bash
napam
```

