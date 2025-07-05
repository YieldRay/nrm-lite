# nrm-lite

[![npm](https://img.shields.io/npm/v/nrm-lite)](https://www.npmjs.com/package/nrm-lite)
[![node-current](https://img.shields.io/node/v/nrm-lite)](https://nodejs.dev/)
[![install size](https://packagephobia.com/badge?p=nrm-lite)](https://packagephobia.com/result?p=nrm-lite)

Fast and lightweight Npm [Registry](https://docs.npmjs.com/cli/using-npm/registry) Manager, for the minimalists.  
Like [dnrm](https://github.com/markthree/dnrm), but in pure Node.js.

[![asciicast](https://asciinema.org/a/646571.svg)](https://asciinema.org/a/646571)

## Features

- Super lightweight, pure Node.js with NO dependency
- Fast, DO NOT parse the `.npmrc` file
- Correct, follow the rules of the `.npmrc` file

## Install

```sh
# install the `nrml` command globally
npm install -g nrm-lite

# test if it's installed
nrml --help

# examples
nrml ls
nrml use taobao
nrml test
```

It is well-known that [Deno](https://deno.com/)'s cold start is faster than Node.js.  
Consequently, installing `nrm-lite` in Deno allows it to perform as quickly as `dnrm`.

```sh
# install `nrml` in deno
deno install -Afgr npm:nrm-lite -n nrml

# test if it's installed
nrml --help
```

## Usage

```sh
nrm-lite

Usage:
    nrml ls                List registries
    nrml use  <name>       Use registry
    nrml test [<timeout>]  Test registry speed, optional timeout in second (default: 2)
    nrml add  <name> <url> Add custom registry
    nrml del  <name>       Delete custom registry
    nrml rc                Open .npmrc file
    nrml help              Show this help
Global Options:
    --local                Use local .npmrc file, rather than the global one (default: false)
```
