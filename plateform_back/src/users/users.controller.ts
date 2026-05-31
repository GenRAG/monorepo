import { Controller, Get, Delete, UseGuards, HttpCode } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserSafe } from 'src/users/dto/create-user.request';
import { CurrentUserPipe } from 'src/users/pipes/user-validation.pipe';
import { UsersService } from 'src/users/users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('me')
    getMe(@CurrentUser(CurrentUserPipe) user: UserSafe): UserSafe {
        return user;
    }

    @Delete('me')
    @HttpCode(204)
    async deleteCurrentUser(@CurrentUser(CurrentUserPipe) user: UserSafe): Promise<void> {
        await this.usersService.delete(user.id);
    }
}
