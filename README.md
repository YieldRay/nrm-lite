# nrm-lite

[![npm](https://img.shields.io/npm/v/nrm-lite)](https://www.npmjs.com/package/nrm-lite)  [![install size](https://packagephobia.com/badge?p=nrm-lite)](https://packagephobia.com/result?p=nrm-lite)

Simple and lightweight replacement for nrm.  
Like [dnrm](https://github.com/markthree/dnrm), but in pure Node.js

## Features

-   Super lightweight, pure Node.js with NO dependency
-   Fast, DO NOT parse the `.npmrc` file (slightly slower that `dnrm`, due to the runtime)
-   Correct, follow the rules of the `.npmrc` file

## Install

```sh
# install the `nrml` command globally
npm install -g nrm-lite

nrml --help
```

## Usage

```sh
nrm-lite

Usage:
    nrml ls            List registry
    nrml use [name]    Use registry
    nrml test          Test registry speed
    nrml rc            Open .npmrc file
    nrml help          Show this help
Global Options:
    --local            Use local .npmrc file, rather than the global one (default: false)
```
