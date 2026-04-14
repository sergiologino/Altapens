import fs from 'node:fs'
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))
const pub = path.join(root, '..', 'public')
const input = path.join(pub, 'landing_source.png')
const output = path.join(pub, 'landing_picture.webp')

if (!fs.existsSync(input)) {
  if (fs.existsSync(output)) {
    console.log('convert-hero: skip (нет исходника, есть', output + ')')
    process.exit(0)
  }
  console.error('convert-hero: положите landing_source.png в public/ или добавьте', output)
  process.exit(1)
}

await sharp(input).webp({ quality: 85 }).toFile(output)
console.log('Wrote', output)
