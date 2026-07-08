import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EventEmitter } from 'events';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { AgentRuntimeOrchestrator } from 'src/agent-runtime/agent-runtime.orchestrator';
import { RagPipelineBuilder } from 'src/agent-runtime/agent-runtime.builder';
import { RagEngineService } from 'src/rag-engine/rag-execution.service';
import { UsageTrackerService } from 'src/credit/usage-tracker.service';
import EventBus from 'src/lib/event-bus';
import { AgentEventType } from 'src/events/agent/agent-events.type';

const fakePipeline = [{ name: 'query', type: 'query' }];

function createMockStream() {
    const stream = new EventEmitter() as any;
    stream.destroy = jest.fn();
    return stream;
}

const mockRagPipelineBuilder = {
    buildPipeline: jest.fn() as any,
};

const mockRagEngineService = {
    sendQuery: jest.fn() as any,
    getQueryStream: jest.fn() as any,
};

const mockUsageTracker = {
    checkOrThrow: jest.fn() as any,
    recordQuery: (jest.fn() as any).mockResolvedValue(undefined),
};

const mockConfigService = {
    get: jest.fn((_key: string) => 'false') as any,
};

describe('AgentRuntimeOrchestrator', () => {
    let orchestrator: AgentRuntimeOrchestrator;
    let emitSpy: ReturnType<typeof jest.spyOn>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AgentRuntimeOrchestrator,
                { provide: RagPipelineBuilder, useValue: mockRagPipelineBuilder },
                { provide: RagEngineService, useValue: mockRagEngineService },
                { provide: UsageTrackerService, useValue: mockUsageTracker },
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        orchestrator = module.get<AgentRuntimeOrchestrator>(AgentRuntimeOrchestrator);
        emitSpy = jest.spyOn(EventBus, 'emit');
        jest.clearAllMocks();
        mockUsageTracker.checkOrThrow.mockResolvedValue(undefined);
        mockUsageTracker.recordQuery.mockResolvedValue(undefined);
    });

    afterEach(() => {
        emitSpy.mockRestore();
    });

    describe('stream', () => {
        it('should check usage when skipUsageTracking=false', async () => {
            mockRagPipelineBuilder.buildPipeline.mockResolvedValue(fakePipeline);
            mockRagEngineService.getQueryStream.mockResolvedValue(createMockStream());

            await orchestrator.streamQuery({ query: 'test', agentId: 'agent-1', workspaceId: 'ws-1' });

            expect(mockUsageTracker.checkOrThrow).toHaveBeenCalledWith('ws-1');
        });

        it('should skip usage check when skipUsageTracking=true', async () => {
            mockRagPipelineBuilder.buildPipeline.mockResolvedValue(fakePipeline);
            mockRagEngineService.getQueryStream.mockResolvedValue(createMockStream());

            await orchestrator.streamQuery({
                query: 'test',
                agentId: 'agent-1',
                workspaceId: 'ws-1',
                skipUsageTracking: true,
            });

            expect(mockUsageTracker.checkOrThrow).not.toHaveBeenCalled();
        });

        it('should propagate ForbiddenException when credits exhausted', async () => {
            mockUsageTracker.checkOrThrow.mockRejectedValue(new ForbiddenException('No credits'));

            await expect(
                orchestrator.streamQuery({ query: 'test', agentId: 'agent-1', workspaceId: 'ws-1' }),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should use agentId as orgId by default', async () => {
            mockRagPipelineBuilder.buildPipeline.mockResolvedValue(fakePipeline);
            mockRagEngineService.getQueryStream.mockResolvedValue(createMockStream());

            await orchestrator.streamQuery({ query: 'test', agentId: 'agent-1', workspaceId: 'ws-1' });

            expect(mockRagEngineService.getQueryStream).toHaveBeenCalledWith(
                expect.objectContaining({ orgId: 'agent-1' }),
            );
        });

        it('should use orgIdOverride when provided', async () => {
            mockRagPipelineBuilder.buildPipeline.mockResolvedValue(fakePipeline);
            mockRagEngineService.getQueryStream.mockResolvedValue(createMockStream());

            await orchestrator.streamQuery({
                query: 'test',
                agentId: 'agent-1',
                workspaceId: 'ws-1',
                orgIdOverride: 'custom-org',
            });

            expect(mockRagEngineService.getQueryStream).toHaveBeenCalledWith(
                expect.objectContaining({ orgId: 'custom-org' }),
            );
        });

        it('should pass forceActive=true to buildPipeline when forceActiveWorkflow=true', async () => {
            mockRagPipelineBuilder.buildPipeline.mockResolvedValue(fakePipeline);
            mockRagEngineService.getQueryStream.mockResolvedValue(createMockStream());

            await orchestrator.streamQuery({
                query: 'test',
                agentId: 'agent-1',
                workspaceId: 'ws-1',
                forceActiveWorkflow: true,
            });

            expect(mockRagPipelineBuilder.buildPipeline).toHaveBeenCalledWith(
                expect.objectContaining({ forceActive: true }),
            );
        });

        it('should return the RAG stream', async () => {
            mockRagPipelineBuilder.buildPipeline.mockResolvedValue(fakePipeline);
            const mockStream = createMockStream();
            mockRagEngineService.getQueryStream.mockResolvedValue(mockStream);

            const result = await orchestrator.streamQuery({
                query: 'test',
                agentId: 'agent-1',
                workspaceId: 'ws-1',
            });

            expect(result).toBe(mockStream);
        });
    });

    describe('execute', () => {
        it('should check usage when skipUsageTracking=false', async () => {
            mockRagPipelineBuilder.buildPipeline.mockResolvedValue(fakePipeline);
            mockRagEngineService.sendQuery.mockResolvedValue({ answer: 'The answer.', costUsd: 0.01 });

            await orchestrator.executeQuery({ query: 'test', agentId: 'agent-1', workspaceId: 'ws-1' });

            expect(mockUsageTracker.checkOrThrow).toHaveBeenCalledWith('ws-1');
        });

        it('should skip usage check when skipUsageTracking=true', async () => {
            mockRagPipelineBuilder.buildPipeline.mockResolvedValue(fakePipeline);
            mockRagEngineService.sendQuery.mockResolvedValue({ answer: 'The answer.', costUsd: 0.01 });

            await orchestrator.executeQuery({
                query: 'test',
                agentId: 'agent-1',
                workspaceId: 'ws-1',
                skipUsageTracking: true,
            });

            expect(mockUsageTracker.checkOrThrow).not.toHaveBeenCalled();
        });

        it('should return { answer } on success', async () => {
            mockRagPipelineBuilder.buildPipeline.mockResolvedValue(fakePipeline);
            mockRagEngineService.sendQuery.mockResolvedValue({ answer: 'The answer is 42.', costUsd: 0.01 });

            const result = await orchestrator.executeQuery({
                query: 'test',
                agentId: 'agent-1',
                workspaceId: 'ws-1',
                skipUsageTracking: true,
            });

            expect(result).toEqual({ answer: 'The answer is 42.' });
        });

        it('should throw when RAG engine returns an empty answer', async () => {
            mockRagPipelineBuilder.buildPipeline.mockResolvedValue(fakePipeline);
            mockRagEngineService.sendQuery.mockResolvedValue({ answer: '', costUsd: 0 });

            await expect(
                orchestrator.executeQuery({
                    query: 'test',
                    agentId: 'agent-1',
                    workspaceId: 'ws-1',
                    skipUsageTracking: true,
                }),
            ).rejects.toThrow('Failed to get an answer from the RAG engine.');
        });

        it('should pass instructionOverride to buildPipeline', async () => {
            mockRagPipelineBuilder.buildPipeline.mockResolvedValue(fakePipeline);
            mockRagEngineService.sendQuery.mockResolvedValue({ answer: 'answer', costUsd: 0.01 });

            await orchestrator.executeQuery({
                query: 'test',
                agentId: 'agent-1',
                workspaceId: 'ws-1',
                instructionOverride: 'Be concise.',
                skipUsageTracking: true,
            });

            expect(mockRagPipelineBuilder.buildPipeline).toHaveBeenCalledWith(
                expect.objectContaining({ instructionOverride: 'Be concise.' }),
            );
        });

        it('should emit AGENT_QUERY_COMPLETED on success when tracking enabled', async () => {
            mockRagPipelineBuilder.buildPipeline.mockResolvedValue(fakePipeline);
            mockRagEngineService.sendQuery.mockResolvedValue({ answer: 'answer', costUsd: 0.01 });

            await orchestrator.executeQuery({ query: 'test', agentId: 'agent-1', workspaceId: 'ws-1' });

            expect(emitSpy).toHaveBeenCalledWith(
                AgentEventType.AGENT_QUERY_COMPLETED,
                expect.objectContaining({ workspaceId: 'ws-1', agentId: 'agent-1' }),
            );
        });

        it('should not emit event when skipUsageTracking=true', async () => {
            mockRagPipelineBuilder.buildPipeline.mockResolvedValue(fakePipeline);
            mockRagEngineService.sendQuery.mockResolvedValue({ answer: 'answer', costUsd: 0.01 });

            await orchestrator.executeQuery({
                query: 'test',
                agentId: 'agent-1',
                workspaceId: 'ws-1',
                skipUsageTracking: true,
            });

            expect(emitSpy).not.toHaveBeenCalled();
        });

        it('should record query with credits converted from the RAG engine cost when tracking enabled', async () => {
            mockRagPipelineBuilder.buildPipeline.mockResolvedValue(fakePipeline);
            mockRagEngineService.sendQuery.mockResolvedValue({ answer: 'answer', costUsd: 0.1 });

            await orchestrator.executeQuery({ query: 'test', agentId: 'agent-1', workspaceId: 'ws-1' });
            await Promise.resolve();

            expect(mockUsageTracker.recordQuery).toHaveBeenCalledWith(
                expect.objectContaining({ workspaceId: 'ws-1', agentId: 'agent-1', creditsUsed: 750 }),
            );
        });

        it('should not record query when skipUsageTracking=true', async () => {
            mockRagPipelineBuilder.buildPipeline.mockResolvedValue(fakePipeline);
            mockRagEngineService.sendQuery.mockResolvedValue({ answer: 'answer', costUsd: 0.1 });

            await orchestrator.executeQuery({
                query: 'test',
                agentId: 'agent-1',
                workspaceId: 'ws-1',
                skipUsageTracking: true,
            });
            await Promise.resolve();

            expect(mockUsageTracker.recordQuery).not.toHaveBeenCalled();
        });
    });
});
