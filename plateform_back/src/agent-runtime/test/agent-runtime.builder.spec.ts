import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { RagPipelineBuilder } from 'src/agent-runtime/agent-runtime.builder';
import { AgentService } from 'src/agent/agent.service';
import { WorkflowService } from 'src/workflow/workflow.service';
import { DatasetService } from 'src/dataset/dataset.service';

const fakeBlocks = [
    { name: 'query', type: 'query' },
    { name: 'retrieve', type: 'retrieve', collection_name: 'kb', top_k: 5, datasetIds: [] },
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

const mockDatasetService = {
    resolveOrgIdsForAgent: jest.fn() as any,
};

const withRetrieve = (retrieve: Record<string, unknown>) => ({
    ...fakeWorkflow,
    definition: { nodes: [], edges: [], blocks: [fakeBlocks[0], retrieve, fakeBlocks[2]] },
});

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
                { provide: DatasetService, useValue: mockDatasetService },
            ],
        }).compile();

        builder = module.get<RagPipelineBuilder>(RagPipelineBuilder);
        jest.clearAllMocks();
        mockDatasetService.resolveOrgIdsForAgent.mockResolvedValue(['dataset-1']);
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

        it('should return blocks from workflow definition, with org_ids instead of datasetIds', async () => {
            mockAgentService.findProductionWorkflowVersion.mockResolvedValue(null);
            mockWorkflowService.findActive.mockResolvedValue(fakeWorkflow);

            const result = await builder.buildPipeline({ agentId: 'agent-1' });

            expect(result).toEqual([
                fakeBlocks[0],
                { name: 'retrieve', type: 'retrieve', collection_name: 'kb', top_k: 5, org_ids: ['dataset-1'] },
                fakeBlocks[2],
            ]);
        });

        it('should read legacy workflows whose definition is the blocks array', async () => {
            mockAgentService.findProductionWorkflowVersion.mockResolvedValue(null);
            mockWorkflowService.findActive.mockResolvedValue({ ...fakeWorkflow, definition: fakeBlocks });

            const result = await builder.buildPipeline({ agentId: 'agent-1' });

            expect(result.map((b) => b.type)).toEqual(['query', 'retrieve', 'answer']);
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

        describe('datasets', () => {
            const retrieveWith = (extra: Record<string, unknown>) =>
                withRetrieve({ name: 'retrieve', type: 'retrieve', collection_name: 'kb', top_k: 5, ...extra });

            beforeEach(() => {
                mockAgentService.findProductionWorkflowVersion.mockResolvedValue(null);
            });

            it('should build one retrieve block with the org_ids of every valid Dataset setting, deduplicated', async () => {
                mockWorkflowService.findActive.mockResolvedValue(
                    retrieveWith({ datasetIds: ['d1', 'd2', 'd1', 'foreign'] }),
                );
                mockDatasetService.resolveOrgIdsForAgent.mockResolvedValue(['d1', 'd2']);

                const result = await builder.buildPipeline({ agentId: 'agent-1' });

                expect(mockDatasetService.resolveOrgIdsForAgent).toHaveBeenCalledWith('agent-1', [
                    'd1',
                    'd2',
                    'd1',
                    'foreign',
                ]);
                const retrieves = result.filter((b) => b.type === 'retrieve');
                expect(retrieves).toEqual([
                    { name: 'retrieve', type: 'retrieve', collection_name: 'kb', top_k: 5, org_ids: ['d1', 'd2'] },
                ]);
            });

            it('should use every attached dataset when the retriever has no Dataset setting', async () => {
                mockWorkflowService.findActive.mockResolvedValue(retrieveWith({}));
                mockDatasetService.resolveOrgIdsForAgent.mockResolvedValue(['d1', 'd2']);

                const result = await builder.buildPipeline({ agentId: 'agent-1' });

                expect(mockDatasetService.resolveOrgIdsForAgent).toHaveBeenCalledWith('agent-1', []);
                expect(result.find((b) => b.type === 'retrieve')).toMatchObject({ org_ids: ['d1', 'd2'] });
            });

            it('should never emit a retrieve block without org_id when the agent has no dataset', async () => {
                mockWorkflowService.findActive.mockResolvedValue(fakeWorkflow);
                mockDatasetService.resolveOrgIdsForAgent.mockResolvedValue([]);

                const result = await builder.buildPipeline({ agentId: 'agent-1' });

                expect(result.map((b) => b.type)).toEqual(['query', 'answer']);
            });

            it('should ignore an org_id stored in the workflow', async () => {
                mockWorkflowService.findActive.mockResolvedValue(
                    retrieveWith({ org_id: 'other-tenant', org_ids: ['other-tenant'] }),
                );
                mockDatasetService.resolveOrgIdsForAgent.mockResolvedValue(['d1']);

                const result = await builder.buildPipeline({ agentId: 'agent-1' });

                expect(result.find((b) => b.type === 'retrieve')).toEqual({
                    name: 'retrieve',
                    type: 'retrieve',
                    collection_name: 'kb',
                    top_k: 5,
                    org_ids: ['d1'],
                });
            });

            it('should use the org override instead of the agent datasets', async () => {
                mockWorkflowService.findActive.mockResolvedValue(fakeWorkflow);

                const result = await builder.buildPipeline({ agentId: 'agent-1', orgIdOverride: 'onboarding' });

                expect(mockDatasetService.resolveOrgIdsForAgent).not.toHaveBeenCalled();
                expect(result.find((b) => b.type === 'retrieve')).toMatchObject({ org_ids: ['onboarding'] });
            });
        });
    });
});
