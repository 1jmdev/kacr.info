# `kacr.info client`

Typed client library for the public parts of [`kacr.info`](https://kacr.info).

## Warning

Use this at your own risk.

This is not an official API. The site HTML can change at any time and break behavior.

Read the code before relying on it for anything important.

## Install

```bash
bun add kacr-api
npm install kacr-api
yarn add kacr-api
pnpm add kacr-api
```

## Quick Start

```ts
import { KacrClient } from "kacr-api";

const client = new KacrClient();

const home = await client.home();
console.log(home.todaysCompetitions);

const future = await client.competitions({ page: 1 });
console.log(future.items);

const competition = await client.competitions(5644);
console.log(competition.name);
```

## Usage

Create a client:

```ts
import { KacrClient } from "kacr-api";

const client = new KacrClient();
```

Available methods:

- `client.home()`
- `client.competitions({ page })`
- `client.competitions.search({ number, name, from, to, judgeId, duration, location, page })`
- `client.competitions(id)`
- `client.runs(id)`
- `client.handlers(id)`
- `client.dogs(id)`
- `client.books(id)`
- `client.judges(id, { page })`
- `client.osas.search({ name, member, location })`
- `client.osas(id, { page })`

## Examples

### Home

```ts
import { KacrClient } from "kacr-api";

const client = new KacrClient();
const home = await client.home();

console.log(home.memberCount);
console.log(home.todaysCompetitions.map((competition) => competition.name));
console.log(home.upcomingCompetitions.map((competition) => competition.name));
console.log(home.newlyAddedCompetitions.map((competition) => competition.name));
```

### Competitions

```ts
import { KacrClient } from "kacr-api";

const client = new KacrClient();

const page = await client.competitions({ page: 2 });
for (const competition of page.items) {
    console.log(competition.id, competition.name, competition.dateFrom);
}

const results = await client.competitions.search({
    name: "Bílany",
    from: "2026-04-25",
    to: "2026-12-31",
    duration: "single-day",
});

console.log(results.items);

const competition = await client.competitions(5644);
console.log(competition.name);
console.log(competition.judges);
console.log(competition.runs);
```

### Details

```ts
import { KacrClient } from "kacr-api";

const client = new KacrClient();

const run = await client.runs(124874);
const handler = await client.handlers(3091);
const dog = await client.dogs(13614);
const book = await client.books(15629);
const judge = await client.judges(152, { page: 1 });

console.log(run.name, run.results.length);
console.log(handler.name, handler.books.length);
console.log(dog.name, dog.measurements.length);
console.log(book.number, book.confirmed);
console.log(judge.name, judge.pagination);
```

### OSAs

```ts
import { KacrClient } from "kacr-api";

const client = new KacrClient();

const byName = await client.osas.search({ name: "Aktij" });
const byMember = await client.osas.search({ member: "maro" });

console.log(byName.osas);
console.log(byMember.handlers);

if (byName.osas[0]) {
    const osa = await client.osas(byName.osas[0].id, { page: 1 });
    console.log(osa.name, osa.memberCount, osa.address);
}
```

### Errors

```ts
import { KacrClient, KacrError, NotFoundError, ParseError } from "kacr-api";

const client = new KacrClient({
    userAgent: "my-app/1.0",
    fetch: (input, init) => fetch(input, init),
});

try {
    const competition = await client.competitions(5644);
    console.log(competition.name);
} catch (error) {
    if (error instanceof NotFoundError) {
        console.error("Missing page");
    } else if (error instanceof ParseError) {
        console.error("Parsing failed for", error.sourceUrl);
    } else if (error instanceof KacrError) {
        console.error(error.message);
    } else {
        throw error;
    }
}
```

## Example Files

- `examples/home.ts`
- `examples/competitions.ts`
- `examples/details.ts`
- `examples/osas.ts`
- `examples/errors.ts`

## Development

```bash
bun test
bun run typecheck
bun run check
```
