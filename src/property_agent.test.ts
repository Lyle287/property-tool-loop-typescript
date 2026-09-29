import assert from "node:assert/strict";
import { chooseTool, requestSchema, toolResult } from "./property_agent.js";

const request = requestSchema.parse({
  propertyId: "building-17",
  tenantId: "tenant-204",
  kind: "inspection",
  details: "Annual smoke-detector check",
});

assert.equal(chooseTool(request), "schedule_inspection");
assert.equal(toolResult(request), "inspection reminder scheduled for building-17/tenant-204");
assert.throws(() => requestSchema.parse({ propertyId: "", tenantId: "t", kind: "document", details: "lease" }));
console.log("property decision test passed");
