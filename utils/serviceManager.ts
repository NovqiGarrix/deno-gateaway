import ServiceExeption from "../exeptions/service.exeption.ts";
import { serviceSchema } from "../schemas/service.schema.ts";
import { Service } from "../types.ts";
import parseZodError from "./parseZodErrors.ts";

class ServiceManager {
  private static instance: ServiceManager;
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
}

const serviceManager = ServiceManager.getInstance();
export default serviceManager;
