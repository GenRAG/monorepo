import { Injectable, PipeTransform, NotFoundException } from '@nestjs/common';
import { TokenPayload } from 'src/auth/token-payload.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserSafe } from 'src/users/dto/create-user.request';
import { USER_SAFE_SELECT } from 'src/users/user.repository';

@Injectable()
export class CurrentUserPipe implements PipeTransform<TokenPayload, Promise<UserSafe>> {
    constructor(private readonly prismaService: PrismaService) {}

    async transform(payload: TokenPayload): Promise<UserSafe> {
        const user = await this.prismaService.user.findUnique({
            where: { id: payload.userId },
            select: USER_SAFE_SELECT,
        });

        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé');
        }

        return user;
    }
}
