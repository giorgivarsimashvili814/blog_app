import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body()
    body: {
      username: string;
      email: string;
      password: string;
    },
  ) {
    return this.authService.register(body.username, body.email, body.password);
  }

  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token } = await this.authService.login(
      body.username,
      body.password,
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 15,
    });

    return { message: 'Logged in' };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/',
    });
    return { message: 'Logged out' };
  }
}
