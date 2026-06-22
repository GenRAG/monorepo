import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeploymentService } from '../deployment.service';
import { DeploymentRepository } from '../deployment.repository';
import { AgentRepository } from 'src/agent/agent.repository';
import { WorkflowService } from 'src/workflow/workflow.service';
import { AgentStatus } from 'generated/prisma';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';
import EventBus from 'src/lib/event-bus';

jest.mock('src/lib/event-bus', () => ({
    __esModule: true,
    default: {
        emit: jest.fn(),
    },
}));

const mockDeploymentRepository: any = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findLatest: jest.fn(),
    createWithAgentUpdate: jest.fn(),
};

const mockAgentRepository: any = {
    findOneWithActiveWorkflow: jest.fn(),
    findOne: jest.fn(),
};

const mockWorkflowService: any = {
    createSnapshot: jest.fn(),
    findByVersion: jest.fn(),
    update: jest.fn(),
};

describe('DeploymentService', () => {
    let service: DeploymentService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeploymentService,
                { provide: DeploymentRepository, useValue: mockDeploymentRepository },
                { provide: AgentRepository, useValue: mockAgentRepository },
                { provide: WorkflowService, useValue: mockWorkflowService },
            ],
        }).compile();

        service = module.get<DeploymentService>(DeploymentService);
        jest.clearAllMocks();
    });

    describe('deploy', () => {
        it('should create deployment and emit events on successful deploy', async () => {
            const agent = {
                id: 'agent-1',
                name: 'Bot',
                workflow: { id: 'wf-1', definition: { nodes: [] } },
            };
            mockAgentRepository.findOneWithActiveWorkflow.mockResolvedValue(agent);
            mockWorkflowService.createSnapshot.mockResolvedValue({ version: 5 });
            const deployment = { id: 'v-1', version: 1, toStatus: AgentStatus.PRODUCTION };
            mockDeploymentRepository.findLatest.mockResolvedValue(null);
            mockDeploymentRepository.createWithAgentUpdate.mockResolvedValue(deployment);

            const result = await service.deploy('agent-1', 'ws-1', { name: 'Deploy v1' }, 'user-1');

            expect(mockAgentRepository.findOneWithActiveWorkflow).toHaveBeenCalledWith('agent-1', 'ws-1');
            expect(mockWorkflowService.createSnapshot).toHaveBeenCalledWith('agent-1', {
                definition: { nodes: [] },
            });
            expect(mockDeploymentRepository.createWithAgentUpdate).toHaveBeenCalledWith({
                agentId: 'agent-1',
                fromStatus: AgentStatus.DEVELOPMENT,
                toStatus: AgentStatus.PRODUCTION,
                name: 'Deploy v1',
                changelog: undefined,
                workflowVersion: 5,
                userId: 'user-1',
            });
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(EventBus.emit).toHaveBeenCalledTimes(2);
            expect(result).toEqual(deployment);
        });

        it('should throw NotFoundException when agent not found', async () => {
            mockAgentRepository.findOneWithActiveWorkflow.mockResolvedValue(null);

            await expect(service.deploy('missing', 'ws-1', { name: 'Deploy' }, 'user-1')).rejects.toThrow(
                NotFoundException,
            );
            expect(mockDeploymentRepository.createWithAgentUpdate).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when agent has no active workflow', async () => {
            const agent = { id: 'agent-1', name: 'Bot', workflow: null };
            mockAgentRepository.findOneWithActiveWorkflow.mockResolvedValue(agent);

            await expect(service.deploy('agent-1', 'ws-1', { name: 'Deploy' }, 'user-1')).rejects.toThrow(
                BadRequestException,
            );
            expect(mockWorkflowService.createSnapshot).not.toHaveBeenCalled();
        });

        it('should derive current status from latest deployment', async () => {
            const agent = {
                id: 'agent-1',
                workflow: { id: 'wf-1', definition: {} },
            };
            mockAgentRepository.findOneWithActiveWorkflow.mockResolvedValue(agent);
            mockWorkflowService.createSnapshot.mockResolvedValue({ version: 10 });

            const latestDeployment = { version: 3, toStatus: AgentStatus.PRODUCTION };
            mockDeploymentRepository.findLatest.mockResolvedValue(latestDeployment);
            mockDeploymentRepository.createWithAgentUpdate.mockResolvedValue({});

            await service.deploy('agent-1', 'ws-1', { name: 'Deploy' }, 'user-1');

            expect(mockDeploymentRepository.createWithAgentUpdate).toHaveBeenCalledWith(
                expect.objectContaining({
                    fromStatus: AgentStatus.PRODUCTION,
                }),
            );
        });
    });

    describe('rollback', () => {
        it('should rollback to previous deployment version', async () => {
            const agent = { id: 'agent-1', workspaceId: 'ws-1' };
            mockAgentRepository.findOne.mockResolvedValue(agent);

            const targetDeployment = {
                id: 'v-2',
                version: 2,
                workflowVersion: 7,
                toStatus: AgentStatus.PRODUCTION,
            };
            mockDeploymentRepository.findOne.mockResolvedValue(targetDeployment);

            const targetWorkflow = { id: 'wf-7', definition: { nodes: [] } };
            mockWorkflowService.findByVersion.mockResolvedValue(targetWorkflow);

            mockDeploymentRepository.findLatest.mockResolvedValue(targetDeployment);
            mockDeploymentRepository.createWithAgentUpdate.mockResolvedValue({
                version: 3,
            });

            const result = await service.rollback(
                'agent-1',
                'ws-1',
                { deploymentId: 'v-2', changelog: 'Custom rollback msg' },
                'user-1',
            );

            expect(mockWorkflowService.update).toHaveBeenCalledWith('agent-1', {
                definition: { nodes: [] },
            });
            expect(mockDeploymentRepository.createWithAgentUpdate).toHaveBeenCalledWith({
                agentId: 'agent-1',
                workflowVersion: 7,
                fromStatus: AgentStatus.PRODUCTION,
                toStatus: AgentStatus.PRODUCTION,
                name: 'Restauration de v2',
                changelog: 'Custom rollback msg',
                userId: 'user-1',
            });
            expect(result).toBeDefined();
        });

        it('should throw NotFoundException when agent not found', async () => {
            mockAgentRepository.findOne.mockResolvedValue(null);

            await expect(service.rollback('missing', 'ws-1', { deploymentId: 'v-1' }, 'user-1')).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw NotFoundException when deployment not found', async () => {
            const agent = { id: 'agent-1' };
            mockAgentRepository.findOne.mockResolvedValue(agent);
            mockDeploymentRepository.findOne.mockResolvedValue(null);

            await expect(service.rollback('agent-1', 'ws-1', { deploymentId: 'missing' }, 'user-1')).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw BadRequestException when deployment has no workflow version', async () => {
            const agent = { id: 'agent-1' };
            mockAgentRepository.findOne.mockResolvedValue(agent);

            const deployment = { id: 'v-1', version: 1, workflowVersion: null };
            mockDeploymentRepository.findOne.mockResolvedValue(deployment);

            await expect(service.rollback('agent-1', 'ws-1', { deploymentId: 'v-1' }, 'user-1')).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should use default changelog when not provided', async () => {
            const agent = { id: 'agent-1' };
            mockAgentRepository.findOne.mockResolvedValue(agent);

            const deployment = { id: 'v-3', version: 3, workflowVersion: 10, toStatus: AgentStatus.PRODUCTION };
            mockDeploymentRepository.findOne.mockResolvedValue(deployment);
            mockWorkflowService.findByVersion.mockResolvedValue({ definition: {} });

            mockDeploymentRepository.findLatest.mockResolvedValue(deployment);
            mockDeploymentRepository.createWithAgentUpdate.mockResolvedValue({});

            await service.rollback('agent-1', 'ws-1', { deploymentId: 'v-3' }, 'user-1');

            expect(mockDeploymentRepository.createWithAgentUpdate).toHaveBeenCalledWith(
                expect.objectContaining({
                    changelog: 'Restauré depuis v3',
                }),
            );
        });
    });

    describe('getCurrent', () => {
        it('should return current deployment status and active workflow', async () => {
            const agent = {
                id: 'agent-1',
                name: 'Support Bot',
                workflow: { id: 'wf-1' },
            };
            mockAgentRepository.findOneWithActiveWorkflow.mockResolvedValue(agent);

            const latestDeployment = {
                version: 5,
                toStatus: AgentStatus.PRODUCTION,
                name: 'v5 Deploy',
            };
            mockDeploymentRepository.findLatest.mockResolvedValue(latestDeployment);

            const result = await service.getCurrent('agent-1', 'ws-1');

            expect(result).toEqual({
                deploymentStatus: AgentStatus.PRODUCTION,
                name: 'Support Bot',
                latestDeployment,
                activeWorkflow: { id: 'wf-1' },
            });
        });

        it('should return DEVELOPMENT status when no deployments', async () => {
            const agent = {
                id: 'agent-1',
                name: 'Bot',
                workflow: { id: 'wf-1' },
            };
            mockAgentRepository.findOneWithActiveWorkflow.mockResolvedValue(agent);
            mockDeploymentRepository.findLatest.mockResolvedValue(null);

            const result = await service.getCurrent('agent-1', 'ws-1');

            expect(result.deploymentStatus).toBe(AgentStatus.DEVELOPMENT);
            expect(result.latestDeployment).toBeNull();
        });

        it('should return null activeWorkflow when agent has no workflow', async () => {
            const agent = {
                id: 'agent-1',
                name: 'Bot',
                workflow: null,
            };
            mockAgentRepository.findOneWithActiveWorkflow.mockResolvedValue(agent);
            mockDeploymentRepository.findLatest.mockResolvedValue(null);

            const result = await service.getCurrent('agent-1', 'ws-1');

            expect(result.activeWorkflow).toBeNull();
        });

        it('should throw NotFoundException when agent not found', async () => {
            mockAgentRepository.findOneWithActiveWorkflow.mockResolvedValue(null);

            await expect(service.getCurrent('missing', 'ws-1')).rejects.toThrow(NotFoundException);
        });

        it('should parallelize agent and deployment queries', async () => {
            mockAgentRepository.findOneWithActiveWorkflow.mockResolvedValue({
                id: 'agent-1',
                name: 'Bot',
                workflow: { id: 'wf-1' },
            });
            mockDeploymentRepository.findLatest.mockResolvedValue(null);

            await service.getCurrent('agent-1', 'ws-1');

            expect(mockAgentRepository.findOneWithActiveWorkflow).toHaveBeenCalled();
            expect(mockDeploymentRepository.findLatest).toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should delegate to repository', async () => {
            const deployments = [{ id: 'v-1', version: 1 }];
            mockDeploymentRepository.findAll.mockResolvedValue(deployments);

            const result = await service.findAll('agent-1');

            expect(mockDeploymentRepository.findAll).toHaveBeenCalledWith('agent-1');
            expect(result).toEqual(deployments);
        });
    });

    describe('findOne', () => {
        it('should return deployment when found', async () => {
            const deployment = { id: 'v-1', version: 1 };
            mockDeploymentRepository.findOne.mockResolvedValue(deployment);

            const result = await service.findOne('v-1', 'agent-1');

            expect(mockDeploymentRepository.findOne).toHaveBeenCalledWith('v-1', 'agent-1');
            expect(result).toEqual(deployment);
        });

        it('should throw NotFoundException when not found', async () => {
            mockDeploymentRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne('missing', 'agent-1')).rejects.toThrow(NotFoundException);
        });
    });
});
