type Anno = {
  id: string
  unitId: string
  quote: string
  note: string
  reply: string
  created: string
}

const pageId = document.documentElement.dataset.pageId
if (pageId) {
  const key = `xxl:anno:${pageId}`

  const read = <T,>(k: string, fallback: T): T => {
    try {
      const raw = localStorage.getItem(k)
      return raw ? (JSON.parse(raw) as T) : fallback
    } catch {
      return fallback
    }
  }
  const write = (k: string, value: unknown) => {
    try {
      localStorage.setItem(k, JSON.stringify(value))
    } catch {
      // 浏览器禁用存储时，标注只在本次页面内有效
    }
  }

  const load = () => read<Anno[]>(key, [])
  const save = (list: Anno[]) => write(key, list)

  const esc = (s: string) =>
    s.replace(/[&<>"']/g, (c) => (({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }) as Record<string, string>)[c] as string)

  const day = (iso: string) => esc(iso ? iso.slice(0, 10) : '')
  const safeId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, '')

  const copyText = async (text: string) => {
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

  const promptFor = (a: Anno) =>
    `在新学力页面（pageId: ${pageId}）里有一条「不懂」标注：\n引文：${a.quote}\n我的问题：${a.note}\n请按 /tutor.json 的导师协议回填这条标注：先直接回答，再给一个看得见的例子，大白话两三句；更长的讲解留在对话里。`

  const findAnchor = (unit: HTMLElement, quote: string): Element | null => {
    const norm = (s: string) => s.replace(/\s+/g, '')
    const needle = norm(quote).slice(0, 24)
    if (!needle) return null
    const blocks = unit.querySelectorAll('p, li, h2, h3, blockquote, td, th')
    for (const block of blocks) {
      if (norm(block.textContent ?? '').includes(needle)) return block
    }
    return null
  }

  let panel: HTMLDivElement | null = null
  let bubble: HTMLButtonElement | null = null
  let pending: { text: string; unitId: string; rect: DOMRect } | null = null

  const remove = (el: Element | null) => el?.remove()

  const closePanel = () => {
    remove(panel)
    panel = null
    pending = null
  }

  const closeBubble = () => {
    remove(bubble)
    bubble = null
  }

  const closeAll = () => {
    closePanel()
    closeBubble()
  }

  const render = () => {
    document.querySelectorAll('aside[data-annotation]').forEach((node) => node.remove())

    const lastAfter = new WeakMap<Element, Element>()
    for (const a of load()) {
      const unit = document.getElementById(a.unitId)
      if (!unit) continue

      const aside = document.createElement('aside')
      const domId = safeId(a.id)
      aside.dataset.annotation = ''
      aside.dataset.annotationId = a.id
      aside.dataset.quote = a.quote
      aside.dataset.note = a.note
      aside.dataset.state = a.reply ? '已回填' : '待回填'
      aside.className = 'my-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm shadow-[0_10px_24px_-22px_rgba(180,83,9,0.6)]'
      aside.innerHTML = `
        <div class="flex items-center justify-between gap-2 text-xs">
          <span class="text-amber-800/70">不懂 · ${day(a.created)}</span>
          <span class="rounded-full ${a.reply ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'} px-2 py-0.5" data-state-label>${a.reply ? '已回填' : '待回填'}</span>
        </div>
        <p class="mt-2 font-medium text-stone-900">「${esc(a.quote)}」</p>
        <p class="mt-1 leading-6 text-stone-600">${esc(a.note)}</p>
        <div class="mt-3 rounded-lg border border-amber-200 bg-white/80 p-3">
          <label class="block text-xs text-stone-500" for="reply-${domId}">导师回填</label>
          <textarea id="reply-${domId}" rows="3" class="mt-1 w-full resize-y rounded-md border border-line bg-white p-2 text-sm" placeholder="AI 按导师协议把讲解填在这里">${esc(a.reply)}</textarea>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <button id="save-reply-${domId}" type="button" class="rounded-md bg-amber-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-800">保存回填</button>
            <button type="button" data-copy class="rounded-md border border-line bg-white px-3 py-1.5 text-xs text-stone-600 transition hover:border-amber-300 hover:text-brand">复制导师指令</button>
            <button type="button" data-delete class="ml-auto text-xs text-stone-400 transition hover:text-red-600">删除</button>
          </div>
          <p data-feedback class="mt-1 text-xs text-stone-400"></p>
        </div>`

      const textarea = aside.querySelector('textarea') as HTMLTextAreaElement
      const saveButton = aside.querySelector('button[id^="save-reply-"]') as HTMLButtonElement
      const feedback = aside.querySelector<HTMLElement>('[data-feedback]')

      saveButton.addEventListener('click', () => {
        const list = load()
        const target = list.find((x) => x.id === a.id)
        if (!target) return
        target.reply = textarea.value.trim()
        save(list)
        render()
      })

      aside.querySelector<HTMLButtonElement>('[data-copy]')?.addEventListener('click', async () => {
        const ok = await copyText(promptFor(a))
        if (feedback) feedback.textContent = ok ? '已复制，去 Qoder 粘贴给 AI' : '复制失败，请手动复制'
        window.setTimeout(() => {
          if (feedback) feedback.textContent = ''
        }, 2500)
      })

      aside.querySelector<HTMLButtonElement>('[data-delete]')?.addEventListener('click', () => {
        if (!window.confirm('删除这条标注？')) return
        save(load().filter((x) => x.id !== a.id))
        render()
      })

      const anchor = findAnchor(unit, a.quote)
      if (anchor) {
        const base = lastAfter.get(anchor) ?? anchor
        base.insertAdjacentElement('afterend', aside)
        lastAfter.set(anchor, aside)
      } else {
        unit.appendChild(aside)
      }
    }
  }

  const openPanel = (data: { text: string; unitId: string; rect: DOMRect }) => {
    closeAll()
    pending = data
    const width = Math.min(320, window.innerWidth - 24)
    const left = Math.max(12, Math.min(data.rect.left, window.innerWidth - width - 12))
    const top = Math.max(70, Math.min(data.rect.bottom + 8, window.innerHeight - 230))

    panel = document.createElement('div')
    panel.dataset.annoUi = ''
    panel.className = 'fixed z-50 rounded-xl border border-line bg-white p-4 shadow-2xl'
    panel.style.width = `${width}px`
    panel.style.left = `${left}px`
    panel.style.top = `${top}px`
    panel.innerHTML = `
      <p class="text-xs text-stone-500">标不懂</p>
      <p class="mt-1 line-clamp-2 text-sm font-medium text-stone-800">「${esc(data.text.slice(0, 60))}${data.text.length > 60 ? '…' : ''}」</p>
      <textarea data-note rows="2" placeholder="哪里不懂？一句话" class="mt-2 w-full resize-y rounded-md border border-line p-2 text-sm"></textarea>
      <div class="mt-2 flex items-center gap-2">
        <button type="button" data-save class="rounded-md bg-amber-700 px-3 py-1.5 text-xs font-medium text-white">保存标注</button>
        <button type="button" data-cancel class="rounded-md border border-line px-3 py-1.5 text-xs text-stone-600">取消</button>
      </div>`

    const textarea = panel.querySelector('textarea') as HTMLTextAreaElement
    panel.querySelector<HTMLButtonElement>('[data-save]')?.addEventListener('click', () => {
      const note = textarea.value.trim()
      if (!note) {
        textarea.focus()
        return
      }
      if (!pending) return
      const list = load()
      const id = `${pageId}-a${Date.now()}`
      list.push({
        id,
        unitId: pending.unitId,
        quote: pending.text,
        note,
        reply: '',
        created: new Date().toISOString(),
      })
      save(list)
      closePanel()
      render()
      document.querySelector(`[data-annotation-id="${id}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    })
    panel.querySelector<HTMLButtonElement>('[data-cancel]')?.addEventListener('click', closePanel)
    document.body.appendChild(panel)
    window.setTimeout(() => textarea.focus(), 30)
  }

  const showBubble = (sel: Selection) => {
    const text = sel.toString().trim()
    if (text.length < 2) {
      closeBubble()
      return
    }
    const anchorNode = sel.anchorNode
    const anchorEl = anchorNode instanceof Element ? anchorNode : anchorNode?.parentElement
    const unit = anchorEl?.closest<HTMLElement>('section[data-unit]')
    if (!unit) {
      closeBubble()
      return
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect()
    if (bubble) bubble.remove()
    bubble = document.createElement('button')
    bubble.type = 'button'
    bubble.dataset.annoUi = ''
    bubble.dataset.text = text
    bubble.textContent = '标不懂'
    bubble.className = 'fixed z-50 rounded-full bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-lg transition hover:bg-brand'
    bubble.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - 90))}px`
    bubble.style.top = `${Math.min(rect.bottom + 8, window.innerHeight - 44)}px`
    bubble.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      const captured = { text, unitId: unit.id, rect }
      openPanel(captured)
    })
    document.body.appendChild(bubble)
  }

  document.addEventListener('mouseup', (event) => {
    const target = event.target instanceof Element ? event.target : null
    if (target?.closest('[data-anno-ui]')) return
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) {
      closeBubble()
      return
    }
    window.setTimeout(() => showBubble(sel), 0)
  })

  document.addEventListener('mousedown', (event) => {
    const target = event.target instanceof Element ? event.target : null
    if (panel && !target?.closest('[data-anno-ui]')) closePanel()
  })

  document.addEventListener(
    'touchend',
    (event) => {
      const target = event.target instanceof Element ? event.target : null
      if (target?.closest('[data-anno-ui]')) return
      window.setTimeout(() => {
        if (panel) return
        const sel = window.getSelection()
        if (!sel || sel.rangeCount === 0) return
        const text = sel.toString().trim()
        if (bubble?.dataset.text === text) return
        showBubble(sel)
      }, 150)
    },
    { passive: true },
  )

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAll()
  })

  window.addEventListener('scroll', closeBubble, { passive: true })

  const pkey = 'xxl:progress'
  const progress = read<Record<string, { firstRead: string; lastRead: string }>>(pkey, {})
  const now = new Date().toISOString()
  progress[pageId] = { firstRead: progress[pageId]?.firstRead ?? now, lastRead: now }
  write(pkey, progress)

  render()

  if (!localStorage.getItem('xxl:hint-seen')) {
    const hint = document.createElement('div')
    hint.dataset.annoUi = ''
    hint.className = 'fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-amber-200 bg-white p-4 text-sm shadow-2xl'
    hint.innerHTML = `
      <p class="font-medium text-stone-900">读到不懂的地方？</p>
      <p class="mt-1 leading-6 text-stone-600">选中一句话，点「标不懂」。在 Qoder 里打开本页，AI 会按导师协议看到并回填。</p>
      <div class="mt-3 flex justify-end">
        <button type="button" data-dismiss class="rounded-md bg-stone-900 px-3 py-1.5 text-xs text-white">知道了</button>
      </div>`
    hint.querySelector<HTMLButtonElement>('[data-dismiss]')?.addEventListener('click', () => {
      try {
        localStorage.setItem('xxl:hint-seen', '1')
      } catch {
        // 存不了就只关掉本次提示
      }
      hint.remove()
    })
    document.body.appendChild(hint)
  }
}
