import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import dts from 'rollup-plugin-dts'
import path from 'path'
import fs from 'fs'

const cleanTypesfolder = (folderPath) => {
  return {
    name: 'clean-types-folder',
    closeBundle() {
      const typesPath = path.resolve(folderPath)
      if (fs.existsSync(typesPath)) {
        fs.rmSync(typesPath, { recursive: true, force: true })
      }
    },
  }
}

export default defineConfig([
  {
    input: './src/index.ts',
    output: [
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        exports: 'named',
      },
      {
        file: 'dist/index.mjs',
        format: 'esm',
        exports: 'named',
      },
    ],
    external: ['axios'],
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      json(),
      typescript({
        rootDir: './src',
      }),
    ],
  },
  {
    input: './dist/types/index.d.ts', // 类型声明文件的入口
    output: [
      {
        file: 'dist/index.d.ts',
        format: 'esm',
      },
    ],
    plugins: [dts(), cleanTypesfolder('dist/types')],
  },
])
