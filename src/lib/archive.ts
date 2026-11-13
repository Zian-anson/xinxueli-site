export interface Progress {
  firstRead: string
  lastRead: string
}

export interface Anno {
  id: string
  unitId: string
  quote: string
  note: string
  reply: string
  created: string
}

export function buildArchiveMd(
  exported: string,
  progress: Record<string, Progress>,
  annosByPage: Record<string, Anno[]>,
): string {
  const lines: string[] = ['# 新学力 · 学习档案', `导出时间：${exported.slice(0, 19).replace('T', ' ')}`, '', '## 阅读进度']
  const ids = Object.keys(progress).sort()
  lines.push(
    ...(ids.length
      ? ids.map((id) => `- ${id}：首读 ${progress[id].firstRead.slice(0, 10)}，最近 ${progress[id].lastRead.slice(0, 10)}`)
      : ['- 暂无阅读记录']),
  )
  lines.push('', '## 标注与回填')
  let any = false
  for (const [page, list] of Object.entries(annosByPage)) {
    for (const a of list) {
      any = true
      lines.push(`### ${page} · ${a.unitId}`, `> ${a.quote}`, `- 不懂：${a.note}`, a.reply ? `- 导师回填：${a.reply}` : '- 导师回填：（待回填）', '')
    }
  }
  if (!any) lines.push('暂无标注。')
  lines.push('## 自测记录', '暂无线上作答（线上自测作答随第二期上线；本期自测在课程章内完成）。')
  return lines.join('\n')
}
