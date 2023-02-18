import ServiceExeption from "../exeptions/service.exeption.ts";
import { serviceSchema } from "../schemas/service.schema.ts";
import { Service } from "../types.ts";

import logger from "./logger.ts";
import parseZodError from "./parseZodErrors.ts";
import redisClient from "./redisClient.ts";

class ServiceManager {
  private static instance: ServiceManager;

  private REDIS_SERVICES_KEY = "gateway-services";
  private services: Map<string, Service> = new Map<string, Service>();

  public static getInstance() {
    if (this.instance) return this.instance;

    this.instance = new ServiceManager();
    return this.instance;
  }

  private constructor() {}

  async set(service: Service): Promise<void> {
    const validationResult = serviceSchema.safeParse(service);
    if (!validationResult.success) {
      throw new ServiceExeption(parseZodError(validationResult.error));
    }

    this.services.set(service.endpoint, service);
    const cacheServicesInRedis = await this.getFromRedis();
    cacheServicesInRedis.push(service);

    await redisClient.set(
      this.REDIS_SERVICES_KEY,
      JSON.stringify(cacheServicesInRedis),
    );
  }

  get(endpoint: string) {
    return this.services.get(endpoint);
  }

  getAll(): Map<string, Service> {
    return this.services;
  }

  getAllInArray(): Array<Service> {
    return [...this.services.values()];
  }

  async del(endpoint: string): Promise<void> {
    this.services.delete(endpoint);

    let cacheServicesInRedis = await this.getFromRedis();
    cacheServicesInRedis = cacheServicesInRedis.filter((service) =>
      service.endpoint !== endpoint
    );

    await redisClient.set(
      this.REDIS_SERVICES_KEY,
      JSON.stringify(cacheServicesInRedis),
    );
  }

  async saveToRedis(): Promise<void> {
    logger.info("Saving services to Redis...");
    if (!this.services.size) return;

    const services = this.getAllInArray();

    const servicesInRedis = await this.getFromRedis();
    servicesInRedis.forEach((service) => {
      services.push(service);
    });

    await redisClient.set(
      this.REDIS_SERVICES_KEY,
      JSON.stringify(services),
    );
  }

  async getFromRedis(): Promise<Array<Service>> {
    const cacheServicesInRedis = JSON.parse(
      await redisClient.get(this.REDIS_SERVICES_KEY) || "[]",
    );

    return cacheServicesInRedis;
  }

  async getFromRedisAndSetToMemory(): Promise<void> {
    const cacheServices = await redisClient.get(this.REDIS_SERVICES_KEY);
    if (!cacheServices) return;

    (JSON.parse(cacheServices) as Array<Service>).forEach((service) => {
      this.services.set(service.endpoint, service);
    });
  }

  getRedisKey(): string {
    return this.REDIS_SERVICES_KEY;
  }
}

const serviceManager = ServiceManager.getInstance();
export default serviceManager;
