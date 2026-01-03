/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { AuthUsernameLoginDto } from './dtos/auth-username-login.dto';
import { AuthRegisterDto } from './dtos/auth-register.dto';
import { SessionService } from 'src/session/session.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginResponseType } from './types/login-response.type';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private sessionService: SessionService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: AuthRegisterDto) {
    const { username, email, password } = registerDto;

    const hash = await bcrypt.hash(password, 10);

    await this.usersService.createUser({
      username,
      email,
      password: hash,
    });
  }

  async login(loginDto: AuthUsernameLoginDto): Promise<LoginResponseType> {
    const { username, password } = loginDto;
    const user = await this.usersService.findOneUser({
      username,
    });

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            username: 'notFound',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            password: 'incorrectPassword',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const session = await this.sessionService.create({
      user: { connect: { id: user.id } },
      refreshToken: '',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const accessToken = await this.jwtService.signAsync(
      { id: user.id, sessionId: session.id },
      {
        secret: this.configService.get('auth.secret'),
        expiresIn: '15m',
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sessionId: session.id },
      {
        secret: this.configService.get('auth.refreshSecret'),
        expiresIn: '7d',
      },
    );

    await this.sessionService.update(session.id, { refreshToken });

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string): Promise<LoginResponseType> {
    if (!refreshToken) {
      throw new HttpException('Refresh token missing', HttpStatus.UNAUTHORIZED);
    }

    const session = await this.sessionService.findOne({
      refreshToken,
    });

    if (!session || session.expiresAt < new Date()) {
      throw new HttpException(
        'Invalid or expired refresh token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const userId = session.userId;

    const accessToken = await this.jwtService.signAsync(
      { id: userId, sessionId: session.id },
      {
        secret: this.configService.get('auth.secret'),
        expiresIn: '15m',
      },
    );

    const newRefreshToken = await this.jwtService.signAsync(
      { sessionId: session.id },
      {
        secret: this.configService.get('auth.refreshSecret'),
        expiresIn: '7d',
      },
    );

    await this.sessionService.update(session.id, {
      refreshToken: newRefreshToken,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async invalidateSession(refreshToken: string) {
    const session = await this.sessionService.findOne({ refreshToken });

    if (session) {
      await this.sessionService.delete(session.id);
    }
  }
}
