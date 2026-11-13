import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

export const collections = {
  course: defineCollection({
    loader: glob({ pattern: '**/*.md', base: 'content/course' }),
    schema: z.object({
      id: z.string().regex(/^p[12]-ch\d+$/),
      part: z.union([z.literal(1), z.literal(2)]),
      chapter: z.number().int().min(0).max(10),
      title: z.string(),
      pace: z.enum(['准备', '核心', '快', '拆解', '实战', '检验']),
      goal: z.string(),
      status: z.enum(['框架', '成文']),
      updated: z.string(),
      prereq: z.string().optional(),
    }),
  }),
  gates: defineCollection({
    loader: glob({ pattern: '**/*.md', base: 'content/gates' }),
    schema: z.object({
      id: z.string(),
      title: z.string(),
      category: z.enum(['装不上', '报错了', '改不动', '拍不了板', '看不懂概念', '出事故']),
      layer: z.string(),
      severity: z.string(),
      status: z.string(),
      updated: z.string(),
    }),
  }),
  cases: defineCollection({
    loader: glob({ pattern: '**/*.md', base: 'content/cases' }),
    schema: z.object({
      id: z.string(),
      title: z.string(),
      status: z.string(),
      updated: z.string(),
    }),
  }),
  dict: defineCollection({
    loader: glob({ pattern: '**/*.md', base: 'content/dict' }),
    schema: z.object({
      term: z.string(),
      aka: z.array(z.string()).default([]),
    }),
  }),
  about: defineCollection({
    loader: glob({ pattern: 'about.md', base: 'content' }),
    schema: z.object({
      title: z.string(),
      contact: z.string().optional(),
    }),
  }),
}
