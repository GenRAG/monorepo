import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { RagPipelineBuilder } from 'src/agent-runtime/agent-runtime.builder';
import { AgentService } from 'src/agent/agent.service';
import { WorkflowService } from 'src/workflow/workflow.service';

const fakeBlocks = [
    { name: 'query', type: 'query' },
    { name: 'retrieve', type: 'retrieve', collection_name: 'kb', top_k: 5 },
    { name: 'answer', type: 'answer', model: 'gpt-4o', system_prompt: 'You are helpful.' },
];

const fakeWorkflow = {
    id: 'workflow-1',
    agentId: 'agent-1',
    version: 2,
    isActive: true,
    definition: { nodes: [], edges: [], blocks: fakeBlocks },
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockAgentService = {
    findProductionWorkflowVersion: jest.fn() as any,
};

const mockWorkflowService = {
    findByVersion: jest.fn() as any,
    findActive: jest.fn() as any,
};

describe('RagPipelineBuilder', () => {
    let builder: RagPipelineBuilder;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RagPipelineBuilder,
                { provide: AgentService, useValue: mockAgentService },
                { provide: WorkflowService, useValue: mockWorkflowService },
            ],
        }).compile();

        builder = module.get<RagPipelineBuilder>(RagPipelineBuilder);
        jest.clearAllMocks();
    });

    describe('buildPipeline', () => {
        it('should throw NotFoundException when no workflow found', async () => {
            mockAgentService.findProductionWorkflowVersion.mockResolvedValue(null);
            mockWorkflowService.findActive.mockResolvedValue(null);

            await expect(builder.buildPipeline({ agentId: 'agent-1' })).rejects.toThrow(NotFoundException);
        });

        it('should use production workflow version when one exists and forceActive=false', async () => {
            mockAgentService.findProductionWorkflowVersion.mockResolvedValue(2);
            mockWorkflowService.findByVersion.mockResolvedValue(fakeWorkflow);

            await builder.buildPipeline({ agentId: 'agent-1' });

            expect(mockWorkflowService.findByVersion).toHaveBeenCalledWith('agent-1', 2);
            expect(mockWorkflowService.findActive).not.toHaveBeenCalled();
        });

        it('should use active workflow when forceActive=true, ignoring production version', async () => {
            mockWorkflowService.findActive.mockResolvedValue(fakeWorkflow);

            await builder.buildPipeline({ agentId: 'agent-1', forceActive: true });

            expect(mockWorkflowService.findActive).toHaveBeenCalledWith('agent-1');
            expect(mockAgentService.findProductionWorkflowVersion).not.toHaveBeenCalled();
        });

        it('should fallback to active workflow when no production version exists', async () => {
            mockAgentService.findProductionWorkflowVersion.mockResolvedValue(null);
            mockWorkflowService.findActive.mockResolvedValue(fakeWorkflow);

            await builder.buildPipeline({ agentId: 'agent-1' });

            expect(mockWorkflowService.findActive).toHaveBeenCalledWith('agent-1');
            expect(mockWorkflowService.findByVersion).not.toHaveBeenCalled();
        });

        it('should return blocks from workflow definition', async () => {
            mockAgentService.findProductionWorkflowVersion.mockResolvedValue(null);
            mockWorkflowService.findActive.mockResolvedValue(fakeWorkflow);

            const result = await builder.buildPipeline({ agentId: 'agent-1' });

            expect(result).toEqual(fakeBlocks);
        });

        it('should return empty array when definition has no blocks', async () => {
            mockAgentService.findProductionWorkflowVersion.mockResolvedValue(null);
            mockWorkflowService.findActive.mockResolvedValue({
                ...fakeWorkflow,
                definition: { nodes: [], edges: [] },
            });

            const result = await builder.buildPipeline({ agentId: 'agent-1' });

            expect(result).toEqual([]);
        });

        it('should apply instructionOverride to the answer block only', async () => {
            mockAgentService.findProductionWorkflowVersion.mockResolvedValue(null);
            mockWorkflowService.findActive.mockResolvedValue(fakeWorkflow);

            const result = (await builder.buildPipeline({
                agentId: 'agent-1',
                instructionOverride: 'Be concise.',
            })) as Record<string, unknown>[];

            const answerBlock = result.find((b) => b['type'] === 'answer');
            expect(answerBlock?.['system_prompt']).toBe('Be concise.');

            const queryBlock = result.find((b) => b['type'] === 'query');
            expect(queryBlock).not.toHaveProperty('system_prompt');
        });

        it('should return blocks unchanged when no instructionOverride', async () => {
            mockAgentService.findProductionWorkflowVersion.mockResolvedValue(null);
            mockWorkflowService.findActive.mockResolvedValue(fakeWorkflow);

            const result = (await builder.buildPipeline({ agentId: 'agent-1' })) as Record<string, unknown>[];

            const answerBlock = result.find((b) => b['type'] === 'answer');
            expect(answerBlock?.['system_prompt']).toBe('You are helpful.');
        });
    });
});
