import { db } from "../../db";
import { serviceProjects, type ServiceProject, type InsertServiceProject } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IServiceProjectStorage {
  createServiceProject(project: InsertServiceProject): Promise<ServiceProject>;
  getServiceProjectById(id: number): Promise<ServiceProject | undefined>;
  getClientServiceProjects(clientId: number, status?: string): Promise<ServiceProject[]>;
  getProviderServiceProjects(providerId: number, status?: string): Promise<ServiceProject[]>;
  updateServiceProjectStatus(id: number, status: string): Promise<ServiceProject | undefined>;
  updateServiceProjectProgress(id: number, progress: number): Promise<ServiceProject | undefined>;
}

export class ServiceProjectStorage implements IServiceProjectStorage {
  async createServiceProject(project: InsertServiceProject): Promise<ServiceProject> {
    const [createdProject] = await db
      .insert(serviceProjects)
      .values({
        ...project,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdProject;
  }

  async getServiceProjectById(id: number): Promise<ServiceProject | undefined> {
    const [project] = await db
      .select()
      .from(serviceProjects)
      .where(eq(serviceProjects.id, id));
    return project;
  }

  async getClientServiceProjects(clientId: number, status?: string): Promise<ServiceProject[]> {
    let whereConditions = [eq(serviceProjects.client_id, clientId)];

    if (status) {
      whereConditions.push(eq(serviceProjects.status, status));
    }

    return await db
      .select()
      .from(serviceProjects)
      .where(and(...whereConditions));
  }

  async getProviderServiceProjects(providerId: number, status?: string): Promise<ServiceProject[]> {
    let whereConditions = [eq(serviceProjects.provider_id, providerId)];

    if (status) {
      whereConditions.push(eq(serviceProjects.status, status));
    }

    return await db
      .select()
      .from(serviceProjects)
      .where(and(...whereConditions));
  }

  async updateServiceProjectStatus(id: number, status: string): Promise<ServiceProject | undefined> {
    const [updatedProject] = await db
      .update(serviceProjects)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(serviceProjects.id, id))
      .returning();
    return updatedProject;
  }

  async updateServiceProjectProgress(id: number, progress: number): Promise<ServiceProject | undefined> {
    const [updatedProject] = await db
      .update(serviceProjects)
      .set({
        progress,
        updated_at: new Date()
      })
      .where(eq(serviceProjects.id, id))
      .returning();
    return updatedProject;
  }
}

export const serviceProjectStorage = new ServiceProjectStorage();
