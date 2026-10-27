import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
prisma: PrismaClient | undefined;
};

function createPrismaClient() {
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
connectionString,
max: 1,
idleTimeoutMillis: 10000,
connectionTimeoutMillis: 10000,
});

return new PrismaClient({
adapter: new PrismaPg(pool),
});
}

if (
process.env.NODE_ENV !== "production" &&
globalForPrisma.prisma &&
(!("reviews" in globalForPrisma.prisma) ||
!("topics" in globalForPrisma.prisma) ||
!("reports" in globalForPrisma.prisma) ||
!("review_likes" in globalForPrisma.prisma) ||
!("user_game_statuses" in globalForPrisma.prisma))
) {
globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;