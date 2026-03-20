import { Body, Controller, Get, UseGuards, Delete } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserSafe } from 'src/users/dto/create-user.request';
import { DeleteUserRequest } from 'src/users/dto/delete-user.request';
import { CurrentUserPipe } from 'src/users/pipes/user-validation.pipe';
import { UsersService } from 'src/users/users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    getUsers() {
        return this.usersService.getUsers();
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMe(@CurrentUser(CurrentUserPipe) user: UserSafe): UserSafe {
        return user;
    }

    @Delete('delete')
    @UseGuards(JwtAuthGuard)
    deleteUser(@Body() body: DeleteUserRequest) {
        return this.usersService.deleteUser(body.id);
    }
}
