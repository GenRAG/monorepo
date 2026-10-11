import { ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, it, expect, jest } from '@jest/globals';
import { DatasetBelongsToWorkspaceGuard } from 'src/dataset/guard/dataset-workspace.guard';

const contextWith = (params: Record<string, string>) =>
    ({ switchToHttp: () => ({ getRequest: () => ({ params }) }) }) as unknown as ExecutionContext;

describe('DatasetBelongsToWorkspaceGuard', () => {
    const exists = jest.fn<(id: string, workspaceId: string) => Promise<{ id: string } | null>>();
    const guard = new DatasetBelongsToWorkspaceGuard({ exists } as never);

    it('refuses a request without workspace instead of skipping the check', async () => {
        await expect(guard.canActivate(contextWith({ id: 'd1' }))).rejects.toThrow(ForbiddenException);
        expect(exists).not.toHaveBeenCalled();
    });

    it('lets collection routes (no dataset in the path) through', async () => {
        await expect(guard.canActivate(contextWith({ workspaceId: 'w1' }))).resolves.toBe(true);
    });

    it('accepts a dataset of the workspace, from `id` or `datasetId`', async () => {
        exists.mockResolvedValue({ id: 'd1' });

        await expect(guard.canActivate(contextWith({ workspaceId: 'w1', id: 'd1' }))).resolves.toBe(true);
        await expect(guard.canActivate(contextWith({ workspaceId: 'w1', datasetId: 'd1' }))).resolves.toBe(true);
        expect(exists).toHaveBeenCalledWith('d1', 'w1');
    });

    it('answers 404 for a dataset of another workspace', async () => {
        exists.mockResolvedValue(null);

        await expect(guard.canActivate(contextWith({ workspaceId: 'w1', id: 'other' }))).rejects.toThrow(
            NotFoundException,
        );
    });
});
