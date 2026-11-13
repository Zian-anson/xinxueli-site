import { buildArchiveMd, type Anno, type Progress } from '../lib/archive'

function collect(): { progress: Record<string, Progress>; annosByPage: Record<string, Anno[]> } {
  let progress: Record<string, Progress> = {}
  try {
    progress = JSON.parse(localStorage.getItem('xxl:progress') ?? '{}')
  } catch {
    progress = {}
  }
  const annosByPage: Record<string, Anno[]> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k || !k.startsWith('xxl:anno:')) continue
    try {
      annosByPage[k.slice('xxl:anno:'.length)] = JSON.parse(localStorage.getItem(k) ?? '[]')
    } catch {
      // 单键损坏时跳过，不影响整份档案
    }
  }
  return { progress, annosByPage }
}

function archiveText() {
  const { progress, annosByPage } = collect()
  return buildArchiveMd(new Date().toISOString(), progress, annosByPage)
}

const view = document.getElementById('archive-view')
const exportButton = document.getElementById('export-archive')
const copyButton = document.getElementById('copy-archive')
const empty = document.querySelector<HTMLElement>('[data-empty]')
const status = document.querySelector<HTMLElement>('[data-copy-status]')

function render() {
  if (!view) return
  const { progress, annosByPage } = collect()
  view.textContent = buildArchiveMd(new Date().toISOString(), progress, annosByPage)

  const progressKeys = Object.keys(progress)
  const read = progressKeys.filter((id) => /^p[12]-ch\d+$/.test(id)).length
  let annotations = 0
  let replies = 0
  for (const list of Object.values(annosByPage)) {
    annotations += list.length
    replies += list.filter((a) => a.reply).length
  }
  const statRead = document.querySelector<HTMLElement>('[data-stat-read]')
  const statAnno = document.querySelector<HTMLElement>('[data-stat-anno]')
  const statReply = document.querySelector<HTMLElement>('[data-stat-reply]')
  if (statRead) statRead.textContent = String(read)
  if (statAnno) statAnno.textContent = String(annotations)
  if (statReply) statReply.textContent = String(replies)
  if (empty) empty.hidden = progressKeys.length > 0 || annotations > 0
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    ta.remove()
    return ok
  }
}

if (exportButton) {
  exportButton.addEventListener('click', () => {
    const md = archiveText()
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const a = document.createElement('a')
    const d = new Date()
    a.href = URL.createObjectURL(blob)
    a.download = `新学力-学习档案-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.md`
    a.click()
    URL.revokeObjectURL(a.href)
  })
}

if (copyButton) {
  copyButton.addEventListener('click', async () => {
    const ok = await copyText(archiveText())
    if (status) status.textContent = ok ? '已复制，去粘贴给你的 AI 导师' : '复制失败，请用导出按钮'
    window.setTimeout(() => {
      if (status) status.textContent = ''
    }, 2500)
  })
}

render()
