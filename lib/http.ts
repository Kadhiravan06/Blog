import type { ZodType } from "zod";

export type ApiErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "validation_failed"
  | "payload_too_large"
  | "unsupported_media_type"
  | "rate_limited"
  | "internal";

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public status: number,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function jsonError(error: ApiError): Response {
  return Response.json(
    { error: { code: error.code, message: error.message, ...(error.fields ? { fields: error.fields } : {}) } },
    { status: error.status },
  );
}

export function route<Args extends unknown[]>(handler: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ApiError) return jsonError(error);
      console.error("Unhandled API error", error);
      return jsonError(new ApiError("internal", 500, "Something went wrong on our side."));
    }
  };
}

export async function readJson<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ApiError("validation_failed", 422, "The request body must be valid JSON.");
  }
  return parseWith(schema, body);
}

export function parseWith<T>(schema: ZodType<T>, value: unknown): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fields[issue.path.join(".") || "body"] = issue.message;
    }
    throw new ApiError("validation_failed", 422, "Some fields need attention.", fields);
  }
  return parsed.data;
}

export function isOwnCoverUrl(url: string): boolean {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(base) && url.startsWith(`${base}/storage/v1/object/public/covers/`);
}
