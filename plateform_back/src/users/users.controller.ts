import { Body, Controller, Delete, Get, HttpCode, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserSafe } from 'src/users/dto/create-user.request';
import { UpdateProfileRequest } from 'src/users/dto/update-profile.request';
import { ChangePasswordRequest } from 'src/users/dto/change-password.request';
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

    @Patch('me')
    async updateMe(@CurrentUser(CurrentUserPipe) user: UserSafe, @Body() dto: UpdateProfileRequest): Promise<UserSafe> {
        return this.usersService.update({ where: { id: user.id }, data: dto });
    }

    @Patch('me/password')
    @HttpCode(204)
    async changePassword(
        @CurrentUser(CurrentUserPipe) user: UserSafe,
        @Body() dto: ChangePasswordRequest,
    ): Promise<void> {
        await this.usersService.changePassword(user.id, dto.currentPassword, dto.newPassword);
    }

    @Delete('me')
    @HttpCode(204)
    async deleteCurrentUser(@CurrentUser(CurrentUserPipe) user: UserSafe): Promise<void> {
        await this.usersService.delete(user.id);
    }
}
