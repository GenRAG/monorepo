import { AgentStatus } from 'generated/*';
import { DeploymentController } from '../deployment.controller';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const mockDeploymentService: any = {
    findAll: jest.fn(),
    getCurrent: jest.fn(),
    findOne: jest.fn(),
    deploy: jest.fn(),
    rollback: jest.fn(),
};

const fakeUser = { id: 'user-1', email: 'user@example.com' } as any;

describe('DeploymentController', () => {
    let controller: DeploymentController;

    beforeEach(() => {
        controller = new DeploymentController(mockDeploymentService);
        jest.clearAllMocks();
    });

    describe('getHistory', () => {
        it('should delegate to service.findAll with agentId', async () => {
            const deployments = [
                { id: 'v-1', version: 1, name: 'Deploy v1' },
                { id: 'v-2', version: 2, name: 'Deploy v2' },
            ];
            mockDeploymentService.findAll.mockResolvedValue(deployments);

            const result = await controller.getHistory('agent-1');

            expect(mockDeploymentService.findAll).toHaveBeenCalledWith('agent-1');
            expect(result).toEqual(deployments);
        });

        it('should return empty array when no deployments', async () => {
            mockDeploymentService.findAll.mockResolvedValue([]);

            const result = await controller.getHistory('agent-1');

            expect(result).toEqual([]);
        });
    });

    describe('getCurrent', () => {
        it('should return current deployment status and workflow', async () => {
            const current = {
                deploymentStatus: AgentStatus.PRODUCTION,
                name: 'Bot Name',
                latestDeployment: { id: 'v-3', version: 3 },
                activeWorkflow: { id: 'wf-1' },
            };
            mockDeploymentService.getCurrent.mockResolvedValue(current);

            const result = await controller.getCurrent('agent-1', 'ws-1');

            expect(mockDeploymentService.getCurrent).toHaveBeenCalledWith('agent-1', 'ws-1');
            expect(result).toEqual(current);
        });
    });

    describe('getOne', () => {
        it('should delegate to service.findOne with id and agentId', async () => {
            const deployment = {
                id: 'v-2',
                version: 2,
                name: 'Deploy v2',
                toStatus: AgentStatus.PRODUCTION,
            };
            mockDeploymentService.findOne.mockResolvedValue(deployment);

            const result = await controller.getOne('v-2', 'agent-1');

            expect(mockDeploymentService.findOne).toHaveBeenCalledWith('v-2', 'agent-1');
            expect(result).toEqual(deployment);
        });
    });

    describe('deploy', () => {
        it('should delegate to service.deploy with user id', async () => {
            const dto = { name: 'Deploy v5', changelog: 'New features' };
            const result = { id: 'v-5', version: 5, toStatus: AgentStatus.PRODUCTION };
            mockDeploymentService.deploy.mockResolvedValue(result);

            const output = await controller.deploy('agent-1', 'ws-1', dto, fakeUser);

            expect(mockDeploymentService.deploy).toHaveBeenCalledWith('agent-1', 'ws-1', dto, 'user-1');
            expect(output).toEqual(result);
        });

        it('should work with minimal dto (name optional)', async () => {
            const dto = {};
            mockDeploymentService.deploy.mockResolvedValue({ id: 'v-1', version: 1, toStatus: AgentStatus.PRODUCTION });

            await controller.deploy('agent-1', 'ws-1', dto, fakeUser);

            expect(mockDeploymentService.deploy).toHaveBeenCalledWith('agent-1', 'ws-1', dto, 'user-1');
        });
    });

    describe('rollback', () => {
        it('should delegate to service.rollback with user id', async () => {
            const dto = { deploymentId: 'v-2', changelog: 'Rolling back' };
            const result = { id: 'v-3', version: 3, toStatus: AgentStatus.PRODUCTION };
            mockDeploymentService.rollback.mockResolvedValue(result);

            const output = await controller.rollback('agent-1', 'ws-1', dto, fakeUser);

            expect(mockDeploymentService.rollback).toHaveBeenCalledWith('agent-1', 'ws-1', dto, 'user-1');
            expect(output).toEqual(result);
        });

        it('should work with deploymentId only', async () => {
            const dto = { deploymentId: 'v-1' };
            mockDeploymentService.rollback.mockResolvedValue({
                id: 'v-2',
                version: 2,
                toStatus: AgentStatus.PRODUCTION,
            });

            await controller.rollback('agent-1', 'ws-1', dto, fakeUser);

            expect(mockDeploymentService.rollback).toHaveBeenCalledWith('agent-1', 'ws-1', dto, 'user-1');
        });
    });
});
