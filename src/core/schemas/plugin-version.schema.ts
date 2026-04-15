import z from "zod";

export const pluginVersionSchema = z.object({
  id: z.uuid(),

  pluginId: z.uuid(),
  version: z.string().min(1).max(255),

  pluginManifest: z.unknown(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PluginVersion = z.infer<typeof pluginVersionSchema>;

export const createPluginVersionSchema = pluginVersionSchema.pick({
  pluginId: true,
  version: true,
  pluginManifest: true,
})
export type CreatePluginVersion = z.infer<typeof createPluginVersionSchema>;