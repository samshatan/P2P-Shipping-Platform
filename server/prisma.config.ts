/// <reference types="node" />
import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL?.replace(/^"|"$/g, '') || '',
  },
  migrate: {
    url: process.env.DATABASE_URL?.replace(/^"|"$/g, '') || '',
  },
});
