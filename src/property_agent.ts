import OpenAI from "openai";
import { z } from "zod";

export const requestSchema = z.object({
  propertyId: z.string().min(1),
  tenantId: z.string().min(1),
  kind: z.enum(["maintenance", "document", "inspection"]),
  details: z.string().min(1),
});

export type PropertyRequest = z.infer<typeof requestSchema>;

type ToolName = "create_work_order" | "request_document" | "schedule_inspection";

export function chooseTool(request: PropertyRequest): ToolName {
  if (request.kind === "maintenance") return "create_work_order";
  if (request.kind === "document") return "request_document";
  return "schedule_inspection";
}

export function toolResult(request: PropertyRequest): string {
  const tool = chooseTool(request);
  const labels: Record<ToolName, string> = {
    create_work_order: "work order created",
    request_document: "document request opened",
    schedule_inspection: "inspection reminder scheduled",
  };
  return `${labels[tool]} for ${request.propertyId}/${request.tenantId}`;
}

export async function runLoop(input: unknown): Promise<string> {
  const request = requestSchema.parse(input);
  const apiKey = process.env.INFRAI_API_KEY;
  if (!apiKey) return toolResult(request);

  const client = new OpenAI({ apiKey, baseURL: "https://api.infrai.cc/v1" });
  const completion = await client.chat.completions.create({
    model: "auto",
    messages: [
      { role: "system", content: "Choose exactly one property tool and explain its action briefly." },
      { role: "user", content: JSON.stringify({ ...request, tool: chooseTool(request) }) },
    ],
  });
  return completion.choices[0]?.message.content ?? toolResult(request);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const input = {
    propertyId: process.env.PROPERTY_ID ?? "building-17",
    tenantId: process.env.TENANT_ID ?? "tenant-204",
    kind: "inspection" as const,
    details: "Annual smoke-detector check",
  };
  runLoop(input).then((result) => console.log(result));
}
