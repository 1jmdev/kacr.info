import { KacrClient } from "kacr-api";

const client = new KacrClient();

const runId = 1;
const handlerId = 1;
const dogId = 1;
const bookId = 1;
const judgeId = 1;

const run = await client.runs(runId);
console.log("Run:", {
    id: run.id,
    name: run.name,
    date: run.date,
    resultCount: run.results.length,
});

const handler = await client.handlers(handlerId);
console.log("Handler:", {
    id: handler.id,
    name: handler.name,
    osa: handler.osa?.name,
    books: handler.books.map((book) => book.number ?? book.name),
});

const dog = await client.dogs(dogId);
console.log("Dog:", {
    id: dog.id,
    name: dog.name,
    breed: dog.breed,
    measurementCount: dog.measurements.length,
});

const book = await client.books(bookId);
console.log("Book:", {
    id: book.id,
    number: book.number,
    confirmed: book.confirmed,
    dog: book.dog?.name,
    handler: book.handler?.name,
});

const judge = await client.judges(judgeId, { page: 1 });
console.log("Judge:", {
    id: judge.id,
    name: judge.name,
    competitions: judge.competitions.length,
    pagination: judge.pagination,
});
