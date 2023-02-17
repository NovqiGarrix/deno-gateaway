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

  set(service: Service): void {
    // There should be a validation here
    const validationResult = serviceSchema.safeParse(service);
    if (!validationResult.success) {
      throw new ServiceExeption(parseZodError(validationResult.error));
    }

    this.services.set(service.endpoint, service);
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

  del(endpoint: string): void {
    this.services.delete(endpoint);
  }

  async saveToRedis(): Promise<void> {
    logger.info("Saving services to Redis...");
    if (!this.services.size) return;

    await redisClient.set(
      this.REDIS_SERVICES_KEY,
      JSON.stringify(this.getAllInArray()),
    );
  }

  async getFromRedis(): Promise<void> {
    const cacheServices = await redisClient.get(this.REDIS_SERVICES_KEY);
    if (!cacheServices) return;

    (JSON.parse(cacheServices) as Array<Service>).forEach((service) => {
      this.services.set(service.endpoint, service);
    });
  }
}

const serviceManager = ServiceManager.getInstance();
export default serviceManager;
