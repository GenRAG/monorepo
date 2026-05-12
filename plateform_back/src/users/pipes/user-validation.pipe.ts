import { Injectable, PipeTransform, NotFoundException } from '@nestjs/common';
import { TokenPayload } from 'src/auth/token-payload.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserSafe } from 'src/users/dto/create-user.request';

@Injectable()
export class CurrentUserPipe
    implements PipeTransform<TokenPayload, Promise<UserSafe>>
{
    constructor(private readonly prismaService: PrismaService) {}

    async transform(payload: TokenPayload): Promise<UserSafe> {
        const user = await this.prismaService.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé');
        }

        return user;
    }
}
