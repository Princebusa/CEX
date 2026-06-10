import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const root = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(root, ".env") });
dotenv.config({ path: resolve(root, "../../apps/backend/.env") });
dotenv.config({ path: resolve(root, "../../.env") });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set — check packages/db/.env or apps/backend/.env");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);

export const prisma = new PrismaClient({ adapter });
export { PrismaClient };
