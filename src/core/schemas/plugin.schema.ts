import z from "zod";
import { createPluginVersionSchema } from "./plugin-version.schema.js";

/** Root Plugin schema (source of truth for Plugin DTOs) */
export const pluginSchema = z.object({
  id: z.uuid(),
  packageName: z.string().min(1).max(255),

  name: z.string().min(1).max(255),
  description: z.string().min(1),
  icon: z.string().min(1).max(255),
  background: z.string().min(1).max(255),
  tags: z.array(z.string().min(1).max(255)).default([]),
  latestPluginVersionId: z.uuid().nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Plugin = z.infer<typeof pluginSchema>;

export const createPluginSchema = pluginSchema.pick({
  packageName: true,
  name: true,
  description: true,
  icon: true,
  background: true,
  tags: true,
}).extend({
  version: createPluginVersionSchema.omit({ pluginId: true })
});

export type CreatePlugin = z.infer<typeof createPluginSchema>;

export const updatePluginSchema = pluginSchema.pick({
  packageName: true,
  name: true,
  description: true,
  icon: true,
  background: true,
  tags: true,
}).partial().extend({
  version: createPluginVersionSchema.omit({ pluginId: true }).extend({ setAsLatest: z.boolean().optional() }).optional(),
});
export type UpdatePlugin = z.infer<typeof updatePluginSchema>;
