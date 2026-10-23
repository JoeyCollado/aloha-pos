import { ZodError, ZodSchema } from "zod";

export async function parseJson<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  let raw: unknown;
  try { raw = await req.json(); } catch { throw Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  try { return schema.parse(raw); } catch (err) {
    if (err instanceof ZodError) {
      const fields = err.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
      throw Response.json({ error: "Validation failed", fields }, { status: 400 });
    }
    throw err;
  }
}

export function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}