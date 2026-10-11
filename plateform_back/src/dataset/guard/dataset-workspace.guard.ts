import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatasetRepository } from 'src/dataset/dataset.repository';

@Injectable()
export class DatasetBelongsToWorkspaceGuard implements CanActivate {
    constructor(private readonly datasetRepository: DatasetRepository) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { workspaceId, datasetId, id } = request.params;
        const effectiveDatasetId = datasetId ?? id;

        // Never fail open: a route mounted without a workspace must not skip the ownership check.
        if (!workspaceId) throw new ForbiddenException();
        // Collection routes (list, create) have no dataset to check.
        if (!effectiveDatasetId) return true;

        const dataset = await this.datasetRepository.exists(effectiveDatasetId, workspaceId);
        if (!dataset) throw new NotFoundException('Base de connaissances introuvable');

        return true;
    }
}
