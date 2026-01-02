import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthUsernameLoginDto } from './dtos/auth-username-login.dto';
import { LoginResponseType } from './types/login-response.type';
import { AuthRegisterDto } from './dtos/auth-register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() craeteuserDto: AuthRegisterDto) {
    return await this.authService.register(craeteuserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: AuthUsernameLoginDto): Promise<LoginResponseType> {
    return this.authService.login(loginDto);
  }
}
