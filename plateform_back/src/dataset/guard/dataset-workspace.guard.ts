import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { DatasetRepository } from 'src/dataset/dataset.repository';

@Injectable()
export class DatasetBelongsToWorkspaceGuard implements CanActivate {
    constructor(private readonly datasetRepository: DatasetRepository) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { workspaceId, datasetId, id } = request.params;
        const effectiveDatasetId = datasetId ?? id;

        if (!effectiveDatasetId || !workspaceId) return true;

        const dataset = await this.datasetRepository.exists(effectiveDatasetId, workspaceId);
        if (!dataset) throw new NotFoundException('Base de connaissances introuvable');

        return true;
    }
}
