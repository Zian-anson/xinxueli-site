export interface Unit {
  id: string
  title: string
  md: string
}

export function splitUnits(pageId: string, body: string): Unit[] {
  const re = /^## (.+)$/gm
  const units: Unit[] = []
  let last: string | null = null
  let lastIdx = 0
  let hit: RegExpExecArray | null
  while ((hit = re.exec(body))) {
    if (last !== null) units.push({ id: `${pageId}-s${units.length + 1}`, title: last, md: body.slice(lastIdx, hit.index).trim() })
    last = hit[1].trim()
    lastIdx = hit.index + hit[0].length
  }
  if (last !== null) units.push({ id: `${pageId}-s${units.length + 1}`, title: last, md: body.slice(lastIdx).trim() })
  return units
}
