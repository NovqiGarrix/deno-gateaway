import { connectRedis, Redis } from "../deps.ts";
import logger from "./logger.ts";

class RedisClient {
  private static redisClient: Redis;

  public static async getClient(): Promise<Redis> {
    if (this.redisClient) return this.redisClient;

    logger.info("Creating new Redis instance...");

    const REDIS_PORT = +Deno.env.get("REDIS_PORT")!;
    const REDIS_HOSTNAME = Deno.env.get("REDIS_HOSTNAME");
    const REDIS_PASSWORD = Deno.env.get("REDIS_PASSWORD");

    if (isNaN(REDIS_PORT) || !REDIS_HOSTNAME) {
      throw new Error(
        "Missing required REDIS_PORT and REDIS_HOSTNAME variables from env variables",
      );
    }

    this.redisClient = await connectRedis({
      hostname: REDIS_HOSTNAME,
      port: REDIS_PORT,
      ...(REDIS_PASSWORD ? { password: REDIS_PASSWORD, tls: true } : {}),
    });

    return this.redisClient;
  }
}

const redisClient = await RedisClient.getClient();
export default redisClient;
