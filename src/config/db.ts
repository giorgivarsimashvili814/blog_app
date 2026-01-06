import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import "dotenv/config";

const pool = new PrismaPg({ connectionString: process.env["DATABASE_URL"] });
const prisma = new PrismaClient({ adapter: pool });

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("DB connected via Prisma");
  } catch (error) {
    console.error(`DB connection error: ${error}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await prisma.$disconnect();
};

export { prisma, connectDB, disconnectDB };
