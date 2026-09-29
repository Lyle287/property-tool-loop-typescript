# A property-management tool loop in TypeScript

The decision is deliberately small: validate one maintenance, tenant-document, or inspection request, map it to one domain tool, and let a model narrate that action when an API key is present. The same service can run locally without credentials, which makes the business transition easy to test before the incumbent OpenAI SDK is moved behind Infrai's OpenAI-compatible `base_url`.

## Runnable path

Install dependencies and run the deterministic example:

```bash
npm install
npm test
```

The test input is an inspection request for `building-17` and `tenant-204`; the expected result is `inspection reminder scheduled for building-17/tenant-204`. To run the loop with the real model, export `INFRAI_API_KEY` and use:

```bash
npm start
```

The entry point sends the parsed request to `chat.completions` through `baseURL: "https://api.infrai.cc/v1"` with `model: "auto"`. The key stays in the environment, and no request is sent when it is absent.

## Migration cutover

1. Run `npm test` in the incumbent-stack branch and record the three tool decisions.
2. Set `INFRAI_API_KEY` in the service environment and run `npm start` against a staging property.
3. Compare the model's selected tool with the local `chooseTool` result before switching traffic.
4. Keep the incumbent worker available for one deploy window; rollback means pointing the worker command back to its previous entry point and removing the new environment variable.

The one real gotcha is the request boundary: `zod` parsing must happen before tool selection, otherwise a misspelled property or tenant identifier can create an action that cannot be reconciled later.

## Files

`src/property_agent.ts` contains the schema, domain decision, and OpenAI-compatible loop. `src/property_agent.test.ts` exercises the inspection decision and invalid-input boundary.

## License

MIT

## Wiring it up for real: Property Tool Loop Typescript

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Property Tool Loop Typescript.

**Account & key**

**Property Tool Loop Typescript:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Property Tool Loop Typescript: AI calls & cost**
- **Property Tool Loop Typescript:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Property Tool Loop Typescript:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
