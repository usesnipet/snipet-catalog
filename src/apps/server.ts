import { env } from "@/env.js";
import fastifyBasicAuth from '@fastify/basic-auth';
import { createLogger } from "@/logger.js";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import {
  fastifyZodOpenApiPlugin,
  fastifyZodOpenApiTransformers,
  serializerCompiler,
  validatorCompiler,
  type FastifyZodOpenApiTypeProvider,
} from "fastify-zod-openapi";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createFastifyLogger } from "@/server/logger.js";
import { createCompositionRoot } from "./composition-root.js";
import { createControllers } from "@/server/controllers/index.js";
import { stringify as stringifyYaml } from "yaml";


export async function bootstrapServer() {
  const app = Fastify({
    loggerInstance: createFastifyLogger({ context: "server" })
  }).withTypeProvider<FastifyZodOpenApiTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(cors, { origin: true });

  await app.register(fastifyZodOpenApiPlugin);

  await app.register(swagger, {
    openapi: {
      openapi: "3.1.0",
      info: {
        title: "Snipet Catalog API",
        description: "API documentation for Snipet Catalog",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          basicAuth: {
            type: 'http',
            scheme: 'basic'
          }
        }
      }
    },
    ...fastifyZodOpenApiTransformers,
  });

  await app.register(swaggerUi, {
    routePrefix: "/swagger",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
  });

  await app.register(fastifyBasicAuth, {
    validate(username, password, _req, reply, done) {
      if (username !== env.BASIC_AUTH_USERNAME || password !== env.BASIC_AUTH_PASSWORD) {
        reply.code(401).send({ error: "Invalid credentials" });
        return;
      }
      done();
    },
    authenticate: true,
  });

  const logger = createLogger({ context: "server" });
  const { services, close } = await createCompositionRoot({ logger, appId: "server" });
  createControllers(app, { logger: logger.child("routes"), services })

  app.addHook("onClose", async () => await close());

  const port = env.PORT;
  await app.listen({ port, host: "0.0.0.0" });

  const spec = app.swagger();
  const swaggerPath = join(process.cwd(), "swagger.yaml");
  await writeFile(swaggerPath, stringifyYaml(spec), "utf-8");
  logger.info("Swagger spec written to swagger.yaml");

  return async () => {
    await close();
  };
}