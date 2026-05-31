import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtBlacklistService } from 'src/auth/jwt-blacklist.service';
import { TokenPayload } from 'src/auth/token-payload.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        private readonly usersService: UsersService,
        private readonly jwtBlacklist: JwtBlacklistService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    const token = req.cookies['Authentication'];
                    return token || null;
                },
            ]),
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
        });
    }

    async validate(payload: TokenPayload): Promise<TokenPayload | null> {
        if (payload.jti && (await this.jwtBlacklist.isBlacklisted(payload.jti))) {
            return null;
        }

        const user = await this.usersService.findOne({ id: payload.userId });
        if (!user) return null;

        return payload;
    }
}
