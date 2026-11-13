# 新学力 · 开发代码

- 本目录是开发源，GitHub 只连本目录。
- 开发：`npm install && npm run dev`
- 发版：`./scripts/sync-to-site.sh`，然后在 Qoder Sites 发布 `../站点代码/dist`。
- 依赖有变：先在 `../站点代码` 运行 `npm install`，再发版。
- `站点代码/` 是发版目录，不在这里改。
