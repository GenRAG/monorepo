import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CurrentUserPipe } from 'src/users/pipes/user-validation.pipe';
import { UserRepository } from 'src/users/user.repository';
import { DatasetModule } from 'src/dataset/dataset.module';

@Module({
    imports: [PrismaModule, DatasetModule],
    controllers: [UsersController],
    providers: [UsersService, CurrentUserPipe, UserRepository],
    exports: [UsersService],
})
export class UsersModule {}
