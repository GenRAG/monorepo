import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Project } from 'generated/prisma';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
    AllProjectQuery,
    CreateProjectRequest,
} from 'src/project/dto/create-project.request';
import { ProjectService } from 'src/project/project.service';

@Controller('project')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) {}

    @Post('create')
    @UseGuards(JwtAuthGuard)
    async createProject(
        @Body() createProjectRequest: CreateProjectRequest,
    ): Promise<Project> {
        return this.projectService.createProject(createProjectRequest);
    }

    @Get('all')
    @UseGuards(JwtAuthGuard)
    async getAllProjects(
        @Query() getAllProjectsQuery: AllProjectQuery,
    ): Promise<Project[]> {
        return this.projectService.getAllProjects(getAllProjectsQuery);
    }
}
