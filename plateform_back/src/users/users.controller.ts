import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateUserRequest, UserSafe } from 'src/users/dto/create-user.request';
import { CurrentUserPipe } from 'src/users/pipes/user-validation.pipe';
import { UsersService } from 'src/users/users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    createUser(@Body() request: CreateUserRequest) {
        return this.usersService.createUser(request);
    }

    @Get()
    getUsers() {
        return this.usersService.getUsers();
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMe(@CurrentUser(CurrentUserPipe) user: UserSafe): UserSafe {
        return user;
    }
}
