/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<{
    id: number;
    username: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new Error('Username or email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...safeUser } = newUser;
    return safeUser;
  }

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });

    if (!user) throw new Error('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error('Invalid credentials');

    const payload = { sub: user.id, username: user.username };

    return {
      token: this.jwtService.sign(payload),
    };
  }
}
