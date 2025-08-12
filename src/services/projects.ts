import { AxiosInstance } from 'axios';
import { 
  Project, 
  CreateProjectRequest, 
  ListProjectsOptions, 
  PaginatedResponse 
} from '../types';

/**
 * Service for managing projects
 */
export class ProjectsService {
  constructor(private httpClient: AxiosInstance) {}

  /**
   * Create a new project
   */
  async create(projectData: CreateProjectRequest): Promise<Project> {
    const response = await this.httpClient.post('/projects', projectData);
    return response.data;
  }

  /**
   * Get a project by ID
   */
  async get(projectId: string): Promise<Project> {
    const response = await this.httpClient.get(`/projects/${projectId}`);
    return response.data;
  }

  /**
   * List projects with optional filtering
   */
  async list(options: ListProjectsOptions = {}): Promise<PaginatedResponse<Project>> {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.status) params.append('status', options.status);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);

    const response = await this.httpClient.get(`/projects?${params.toString()}`);
    return response.data;
  }

  /**
   * Update a project
   */
  async update(projectId: string, updates: Partial<CreateProjectRequest>): Promise<Project> {
    const response = await this.httpClient.patch(`/projects/${projectId}`, updates);
    return response.data;
  }

  /**
   * Launch a project (make it active for investments)
   */
  async launch(projectId: string): Promise<Project> {
    const response = await this.httpClient.post(`/projects/${projectId}/launch`);
    return response.data;
  }

  /**
   * Pause a project
   */
  async pause(projectId: string): Promise<Project> {
    const response = await this.httpClient.post(`/projects/${projectId}/pause`);
    return response.data;
  }

  /**
   * Resume a paused project
   */
  async resume(projectId: string): Promise<Project> {
    const response = await this.httpClient.post(`/projects/${projectId}/resume`);
    return response.data;
  }

  /**
   * Cancel a project
   */
  async cancel(projectId: string): Promise<Project> {
    const response = await this.httpClient.post(`/projects/${projectId}/cancel`);
    return response.data;
  }

  /**
   * Get project statistics
   */
  async getStats(projectId: string): Promise<{
    totalRaised: string;
    investorCount: number;
    currentTier: number;
    tierProgress: number;
    completionPercentage: number;
  }> {
    const response = await this.httpClient.get(`/projects/${projectId}/stats`);
    return response.data;
  }

  /**
   * Get active projects (shorthand for list with status filter)
   */
  async getActive(options: Omit<ListProjectsOptions, 'status'> = {}): Promise<PaginatedResponse<Project>> {
    return this.list({ ...options, status: 'active' });
  }
}