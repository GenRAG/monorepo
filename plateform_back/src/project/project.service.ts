import { Injectable } from '@nestjs/common';
import { Project } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import {
    AllProjectQuery,
    CreateProjectRequest,
} from 'src/project/dto/create-project.request';

@Injectable()
export class ProjectService {
    constructor(private readonly prismaService: PrismaService) {}

    async createProject(
        createProjectRequest: CreateProjectRequest,
    ): Promise<Project> {
        const { name, description, workspaceId } = createProjectRequest;

        const project = await this.prismaService.project.create({
            data: {
                name: name,
                description: description,
                workspaceId: workspaceId,
            },
        });

        if (!project) {
            throw new Error('Failed to create project');
        }

        return project;
    }

    async getAllProjects(AllProjectQuery: AllProjectQuery): Promise<Project[]> {
        const { workspaceId } = AllProjectQuery;

        const projects = await this.prismaService.project.findMany({
            where: {
                workspaceId: workspaceId,
            },
        });

        if (!projects) {
            throw new Error('No projects found for the given workspace');
        }

        return projects;
    }
}
