import { neon } from "@neondatabase/serverless";

// A plain SQL-over-HTTP client. Works identically on Vercel (Node.js) and
// Cloudflare Workers — no native binaries, no WASM query engine, no code
// generation step required. Use as: await sql`SELECT * FROM "Submission"`
export const sql = neon(process.env.DATABASE_URL!);