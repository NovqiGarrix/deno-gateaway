import { connectRedis, Redis } from "../deps.ts";

class RedisClient {
  public static redisClient: Redis;

  public static async getClient(): Promise<Redis> {
    if (this.redisClient) return this.redisClient;

    const REDIS_PORT = +Deno.env.get("REDIS_PORT")!;
    const REDIS_HOSTNAME = Deno.env.get("REDIS_HOSTNAME")!;
    const REDIS_PASSWORD = Deno.env.get("REDIS_PASSWORD");

    if (!REDIS_PORT || !REDIS_HOSTNAME || !REDIS_PASSWORD) {
      throw new Error("Missing required REDIS variables from env variables");
    }

    this.redisClient = await connectRedis({
      hostname: REDIS_HOSTNAME,
      port: REDIS_PORT,
      password: REDIS_PASSWORD,
      tls: true,
    });

    return this.redisClient;
  }
}

const redisClient = await RedisClient.getClient();
export default redisClient;
