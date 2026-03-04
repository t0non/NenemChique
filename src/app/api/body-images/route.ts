import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  const dir = path.join(process.cwd(), 'public', 'imagens', 'body')
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    const files = entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter((n) => /\.(png|jpe?g|webp|gif|avif)$/i.test(n))
      .map((n) => ({
        src: `/imagens/body/${n}`,
        filename: n,
      }))
    return NextResponse.json({ files })
  } catch {
    return NextResponse.json({ files: [] })
  }
}
