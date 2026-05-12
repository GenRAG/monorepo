import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from 'src/auth/token-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
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

    validate(payload: TokenPayload): TokenPayload {
        return payload;
    }
}
