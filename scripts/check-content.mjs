import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const REQ = {
  'content/course': ['本课目标', '正文', '要点卡', '动手练习', '自测'],
  'content/gates': ['真实现象', '当时怎么描述给 AI', '怎么定位', '通用解法', '下次怎么预防'],
  'content/cases': ['目标', '当时怎么和 AI 沟通', '卡在哪、怎么过', '结果与现状'],
  'content/dict': ['正文'],
}

let bad = 0
for (const [dir, req] of Object.entries(REQ)) {
  if (!existsSync(dir)) continue
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.md')) continue
    const text = readFileSync(join(dir, f), 'utf8')
    const have = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim())
    for (const h of req) {
      if (!have.includes(h)) {
        console.error(`${dir}/${f} 缺栏目：${h}`)
        bad++
      }
    }
  }
}
if (bad) {
  console.error(`内容栏目校验：${bad} 处缺失`)
  process.exit(1)
}
console.log('内容栏目校验：通过')
