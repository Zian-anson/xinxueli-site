# 新学力 · 协作说明

> 给一起做这个站的人：先读这一份，再看代码。你不需要读源码，也能参与。

## 1. 一句话

新学力是一个给零代码学生的 AI 学习工作台：不写代码、不读源码，教写代码之外的全部编程知识——看得懂系统、说得清问题、验收得住结果，最后做出真实上线的东西。

课程的主线是 DeepSeek Harness（DSH），但它只是课程里的解剖案例，不是产品的全部。

## 2. 现在有什么

- 线上站点：https://xinxueli-4bnezztmcww.qoder.zone/
- 代码仓库：https://gitee.com/Zian-Anson/xinxueli-site （私有，Gitee）
- 线上版本：31 个页面
- 内容：11 章课程、5 条关卡、2 篇案例、23 个白话词条，另有「基础大类」3 页（编程通识地图、前端基础、问题描述器）
- 核心交互：划词标注、AI 按导师协议回填、学习档案导出
- 站点本身：无账号、无支付、无后端；标注和学习档案存在浏览器本地

## 3. 先分清三层

```
content/*.md          内容源：课程、关卡、案例、词典
      ↓
src/                  站点代码：页面、布局、标注脚本
      ↓ npm run build
dist/*.html           构建产物：真正上传到线上的文件
      ↓
Qoder Sites           线上托管，只有 owner 发布
```

- 你改内容，改 `content/` 下的 markdown。
- 你不需要改 `dist/`，它是构建出来的，也不进 Git。
- 线上发布由 owner 做；你本地 `npm run dev` 只是预览。

## 4. 架构

### 4.1 静态站

- Astro 5 + Tailwind 4，构建成静态 HTML。
- 内容放 markdown，构建期校验固定栏目，缺栏目直接失败。
- 没有后端、没有账号、没有支付；所有互动在浏览器里完成。
- 页面地址是真实 `.html`（如 `/course/p1-ch2.html`），因为 Qoder Sites 不支持目录索引。

### 4.2 核心四件套

1. **标注便签**：选中一句话点「标不懂」，标注存在浏览器 `localStorage`，刷新不丢。
2. **机器接口**：每页有 JSON-LD 页面自述，内容单元带固定 `id`，AI 不靠猜。
3. **导师协议**：`/tutor.json` 告诉 AI 怎么识别页面、读标注、回填到哪。
4. **学习档案**：`/me.html` 汇总阅读进度、标注、回填，可导出 markdown 交给 AI 导师。

AI 互动发生在 Qoder 主对话里，站点不做站内聊天；站点只提供机器接口和导师协议。

### 4.3 内容一份源三处用

同一批 markdown，第一版渲染成网页；第二期打包成导师 skill 装进个人 Harness；再往后经 MCP 给任意 Agent 调用。不要为不同用途重写内容。

### 4.4 发布

- 发布动作在 owner 的电脑上：`npm run build` → `dist` → Qoder Sites 发布。
- Qoder Sites 的绑定文件 `.新学力.qoder.site` 只在本机，没进 Git；队友不需要，也不能发布。
- 线上地址发布后不变，刷新就是最新版。

## 5. 目录

| 路径 | 放什么 |
|---|---|
| `content/course/` | 11 章课程正文 |
| `content/gates/` | 关卡库档案（六类坎） |
| `content/cases/` | 案例库 |
| `content/dict/` | 白话词典 |
| `src/pages/` | 页面路由 |
| `src/layouts/Base.astro` | 全站头部、导航、页脚、JSON-LD |
| `src/scripts/annotate.ts` | 划词标注与回填 |
| `src/scripts/me.ts` | 学习档案导出 |
| `src/lib/` | 切内容单元、拼档案的纯函数 |
| `scripts/check-content.mjs` | 构建期内容栏目校验 |
| `public/tutor.json` | 导师协议 |
| `public/favicon.svg` | 站点图标 |

## 6. 本地开发

先装 Node 24、Git、Qoder。然后：

```bash
git clone https://gitee.com/Zian-Anson/xinxueli-site.git
cd xinxueli-site
npm install
npm run dev
```

常用命令：

```bash
npm run dev        # 本地预览
npm run build      # 内容校验 + 构建 dist
npx vitest run     # 单元测试
```

## 7. 协作流程

- Gitee 是协作主线，仓库私有。
- `main` 是受保护分支：只有 owner 能直接推送；开发者不能推 `main`。
- 你可以推自己的分支、开 Pull Request，也可以合并 PR。
- 推荐分支名带日期：`11.14-content-ch3`。
- 提交信息用中文，一小步一提交。
- 合并前本地跑 `npm run build` 和 `npx vitest run`。
- 合并后 owner 拉最新 `main`，构建、测试、发布。
- GitHub 是公开镜像，只由 owner 手动同步；你不需要用 GitHub。

## 8. 你负责什么

优先做内容，不需要碰代码：

- 写/改课程章节、关卡、案例、词典、基础大类页面。
- 用真实使用视角验收：打开页面、点主流程、看手机。
- 发现问题时给出：页面、操作、现象、期望、截图/报错原文。

边界：

- 不要直接推 `main`，走分支 + PR。
- 不要发布站点；发布是 owner 的事。
- 不要改 `dist/`，它是构建产物。
- 共享文件（`Base.astro`、`global.css`、`package.json`、`astro.config.mjs`、`content.config.ts`）先和 owner 说一声再改。
- 不要把令牌、密钥、`.env` 提交到仓库。

## 9. 内容怎么写

### 课程

每章一个 `content/course/p{1|2}-ch{N}.md`，固定 H2 栏目，顺序不能少：

`## 本课目标` → `## 正文` → `## 要点卡` → `## 动手练习` → `## 自测`

frontmatter 关键字段：`id`、`part`、`chapter`、`title`、`pace`、`goal`、`status`、`updated`、`prereq`。

### 关卡

固定 H2：`## 真实现象` → `## 当时怎么描述给 AI` → `## 怎么定位` → `## 通用解法` → `## 下次怎么预防`。

### 案例

固定 H2：`## 目标` → `## 当时怎么和 AI 沟通` → `## 卡在哪、怎么过` → `## 结果与现状`。

### 词典

一个词条一个文件，`## 正文` 里写一句话定义 + 一个看得见的例子。

### 新增页面

先和 owner 说。页面放在 `src/pages/`，链接一律用真实 `.html` 地址。

## 10. 现在的重点和想法

- 当前重点：把 11 章课程和基础大类的内容做扎实；比赛提交前保持线上稳定。
- 模块二「和你的 Agent 一起学」：把这套课程装进学员自己造的 Harness，变成随身导师。
- 模块三「带着项目学」：带真实项目进来，按项目阶段配学习内容。
- 学习档案格式第一版已定死；第二期导师 skill 和 MCP 直接读同一格式。
- 站点不做账号、支付、后端；商业闭环是课程第二部分教学员在自己的产品里跑通，不是站点自己收费。

## 11. 常用链接

- 线上：https://xinxueli-4bnezztmcww.qoder.zone/
- 课程：https://xinxueli-4bnezztmcww.qoder.zone/course.html
- 基础大类：https://xinxueli-4bnezztmcww.qoder.zone/map.html
- 导师协议：https://xinxueli-4bnezztmcww.qoder.zone/tutor.json
- 学习档案：https://xinxueli-4bnezztmcww.qoder.zone/me.html

## 12. 遇到问题

- 先看页面现象和报错全文，不要只说「不行」。
- 卡住超过三次，换打法：拆小、换说法、给例子、重开。
- 找 owner 时带上：哪个页面、做了什么、看到什么、期望什么。
