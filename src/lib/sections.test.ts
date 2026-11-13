import { describe, it, expect } from 'vitest'
import { splitUnits } from './sections'

const body = `## 本课目标
看得懂。

## 正文
第一段。

## 要点卡
- 要点
`

describe('splitUnits', () => {
  it('按 H2 切单元，id 带 pageId 前缀与序号', () => {
    const us = splitUnits('p1-ch1', body)
    expect(us.map((u) => u.title)).toEqual(['本课目标', '正文', '要点卡'])
    expect(us[0].id).toBe('p1-ch1-s1')
    expect(us[1].md).toContain('第一段')
  })
  it('无 H2 返回空数组', () => {
    expect(splitUnits('x', '没有栏目')).toEqual([])
  })
})
