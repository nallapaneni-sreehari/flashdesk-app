const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../generated/prisma");
const logger = require("../utils/logger");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({ adapter });

async function isDbReady() {
  try {
    const result = await prisma.$queryRaw`SELECT NOW() AS connected_at`;
    logger.info({ connectedAt: result[0].connected_at }, 'Database connected');
  } catch (error) {
    logger.fatal({ err: error }, 'Database connection failed');
    process.exit(1);
  }
}

module.exports = { prisma, isDbReady };
