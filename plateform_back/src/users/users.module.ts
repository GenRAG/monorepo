import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CurrentUserPipe } from 'src/users/pipes/user-validation.pipe';

@Module({
    imports: [PrismaModule],
    controllers: [UsersController],
    providers: [UsersService, CurrentUserPipe],
    exports: [UsersService],
})
export class UsersModule {}
