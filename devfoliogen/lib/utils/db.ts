type CacheRecord = {
  key: string;
  value: string;
  tags: string[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

type CustomUrlRecord = {
  customSlug: string;
  githubUsername: string;
  createdAt: Date;
  updatedAt: Date;
};

type AccountRecord = {
  userId: string;
  providerId: string;
  accessToken: string | null;
};

const cacheStore = new Map<string, CacheRecord>();
const customUrlStore = new Map<string, CustomUrlRecord>();
const accountStore: AccountRecord[] = [];

function createInMemoryPrisma() {
  return {
    __mock: true,
    cache: {
      async findUnique({ where: { key } }: { where: { key: string } }) {
        return cacheStore.get(key) ?? null;
      },
      async upsert({
        where: { key },
        create,
        update,
      }: {
        where: { key: string };
        create: { key: string; value: string; tags: string[]; expiresAt: Date };
        update: { value: string; tags: string[]; expiresAt: Date };
      }) {
        const existing = cacheStore.get(key);
        const now = new Date();
        const record: CacheRecord = existing
          ? { ...existing, ...update, updatedAt: now }
          : { ...create, createdAt: now, updatedAt: now };
        cacheStore.set(key, record);
        return record;
      },
      async delete({ where: { key } }: { where: { key: string } }) {
        cacheStore.delete(key);
      },
      async deleteMany({
        where,
      }: {
        where?: { expiresAt?: { lt: Date }; tags?: { has: string } };
      }) {
        for (const [key, value] of cacheStore.entries()) {
          if (where?.expiresAt?.lt && value.expiresAt >= where.expiresAt.lt) {
            continue;
          }
          if (where?.tags?.has && !value.tags.includes(where.tags.has)) {
            continue;
          }
          cacheStore.delete(key);
        }
      },
    },
    customUrl: {
      async findUnique({ where: { customSlug } }: { where: { customSlug: string } }) {
        return customUrlStore.get(customSlug) ?? null;
      },
      async create({
        data,
      }: {
        data: { customSlug: string; githubUsername: string };
      }) {
        const now = new Date();
        const record: CustomUrlRecord = { ...data, createdAt: now, updatedAt: now };
        customUrlStore.set(data.customSlug, record);
        return record;
      },
    },
    account: {
      async findFirst({
        where,
        select,
      }: {
        where: { userId: string; providerId: string };
        select?: { accessToken?: boolean };
      }) {
        const record =
          accountStore.find(
            account =>
              account.userId === where.userId && account.providerId === where.providerId
          ) ?? null;
        if (!record) {
          return null;
        }
        if (select?.accessToken) {
          return { accessToken: record.accessToken };
        }
        return record;
      },
    },
  };
}

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    return createInMemoryPrisma();
  }

  try {
    const globalForPrisma = globalThis as typeof globalThis & {
      __devfoliogenPrisma?: unknown;
    };

    if (globalForPrisma.__devfoliogenPrisma) {
      return globalForPrisma.__devfoliogenPrisma;
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require('@prisma/client');
    const client = new PrismaClient();
    globalForPrisma.__devfoliogenPrisma = client;
    return client;
  } catch (error) {
    console.warn('Falling back to in-memory database client:', error);
    return createInMemoryPrisma();
  }
}

export const prisma = createPrismaClient();
export const isMockDatabase = Boolean((prisma as { __mock?: boolean }).__mock);
