/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { Session, Prisma } from 'generated/prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.SessionCreateInput): Promise<Session> {
    const session = await this.prisma.session.create({ data });
    return session;
  }

  async findOne(where: Prisma.SessionWhereInput): Promise<Session | null> {
    const session = await this.prisma.session.findFirst({ where: where });
    return session;
  }

  async findMany(where: Prisma.SessionWhereInput): Promise<Session[]> {
    const sessions = await this.prisma.session.findMany({ where: where });
    return sessions;
  }

  async update(id: number, data: Partial<Session>): Promise<Session> {
    const session = await this.prisma.session.update({ where: { id }, data });
    return session;
  }

  async delete(id: number): Promise<void> {
    await this.prisma.session.delete({ where: { id } });
  }

  async deleteMany(where: Prisma.SessionWhereInput): Promise<void> {
    await this.prisma.session.deleteMany({ where });
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { expiresAt: { lte: new Date() } },
    });
  }
}
