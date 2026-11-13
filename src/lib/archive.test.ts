import { describe, it, expect } from 'vitest'
import { buildArchiveMd } from './archive'

describe('buildArchiveMd', () => {
  it('三板块齐全，含进度、标注与回填、自测说明', () => {
    const md = buildArchiveMd(
      '2026-11-14T00:00:00Z',
      { 'p1-ch0': { firstRead: '2026-11-13T08:00:00Z', lastRead: '2026-11-14T00:00:00Z' } },
      {
        'p1-ch1': [
          { id: 'a1', unitId: 'p1-ch1-s2', quote: '插件树', note: '不懂这是什么', reply: '就是一张零件组装表', created: '2026-11-13T09:00:00Z' },
        ],
      },
    )
    expect(md).toContain('## 阅读进度')
    expect(md).toContain('- p1-ch0：首读 2026-11-13，最近 2026-11-14')
    expect(md).toContain('## 标注与回填')
    expect(md).toContain('> 插件树')
    expect(md).toContain('- 导师回填：就是一张零件组装表')
    expect(md).toContain('## 自测记录')
  })
  it('空数据不炸，占位说明明确', () => {
    const md = buildArchiveMd('2026-11-14T00:00:00Z', {}, {})
    expect(md).toContain('暂无阅读记录')
    expect(md).toContain('暂无标注')
  })
  it('未回填的标注标注为待回填', () => {
    const md = buildArchiveMd(
      '2026-11-14T00:00:00Z',
      {},
      { 'p1-ch2': [{ id: 'a2', unitId: 'p1-ch2-s1', quote: 'API', note: '这是什么', reply: '', created: '2026-11-13T09:00:00Z' }] },
    )
    expect(md).toContain('- 导师回填：（待回填）')
  })
})
