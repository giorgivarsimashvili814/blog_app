/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { AuthUsernameLoginDto } from './dtos/auth-username-login.dto';
import { LoginResponseType } from './types/login-response.type';
import { AuthRegisterDto } from './dtos/auth-register.dto';
import { User } from 'generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
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

    const { accessToken } = await this.getTokensData({
      id: user.id,
    });

    return { accessToken };
  }

  private async getTokensData(data: { id: User['id'] }) {
    const { id } = data;
    const accessToken = await this.jwtService.signAsync(
      { sub: id },
      { expiresIn: '1h' },
    );

    return { accessToken };
  }
}
