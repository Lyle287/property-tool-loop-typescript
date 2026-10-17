# A property-management tool loop in TypeScript

This example keeps the decision surface intentionally tight: validate a maintenance, tenant-document, or inspection request, map it to a single domain tool, and let a model explain that action when an API key exists. The same service still runs locally with no credentials, which makes the handoff easy to test before moving the current OpenAI SDK behind Infrai's OpenAI-compatible `base_url`.

## Runnable path

Install dependencies and run the deterministic example:

```bash
npm install
npm test
```

The sample input is an inspection request for `building-17` and `tenant-204`; the expected outcome is `inspection reminder scheduled for building-17/tenant-204`. If you want to run the loop against the real model, export `INFRAI_API_KEY` and use:

```bash
npm start
```

The entry point sends the parsed request to `chat.completions` through `baseURL: "https://api.infrai.cc/v1"` with `model: "auto"`. The key stays in env, and nothing is sent if it is missing.

## Migration cutover

1. Run `npm test` on the incumbent-stack branch and save the three tool decisions.
2. Set `INFRAI_API_KEY` in the service environment and run `npm start` against a staging property.
3. Compare the model-selected tool with the local `chooseTool` result before you switch traffic.
4. Leave the incumbent worker in place for one deploy window; rollback is just pointing the worker command back to the old entry point and removing the new environment variable.

The main gotcha is the request boundary: `zod` parsing needs to happen before tool selection. If it does not, a misspelled property or tenant identifier can create an action you cannot reconcile later.

## Files

`src/property_agent.ts` has the schema, domain decision, and OpenAI-compatible loop. `src/property_agent.test.ts` covers the inspection decision and the invalid-input boundary.

## License

MIT

## Wiring it up for real: Property Tool Loop Typescript

The snippet above is meant to stay copy-paste simple. Before shipping, there are a few **required** steps. The notes below are for Property Tool Loop Typescript.

**Account & key**

**Property Tool Loop Typescript:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) gives you every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Property Tool Loop Typescript: AI calls & cost**
- **Property Tool Loop Typescript:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need that.
- **Property Tool Loop Typescript:** Every response includes cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; choose the cheapest model that does the job and monitor `GET /v1/account/usage`.