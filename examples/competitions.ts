import { KacrClient } from "kacr";

const client = new KacrClient();

const futureCompetitions = await client.competitions({ page: 1 });
console.log(
    "Future competition count on page 1:",
    futureCompetitions.items.length,
);

const searchedCompetitions = await client.competitions.search({
    name: "Mistrovství",
    from: "2026-01-01",
    to: "2026-12-31",
    duration: "any",
    page: 1,
});

console.log(
    "Search results:",
    searchedCompetitions.items.map((item) => ({
        id: item.id,
        name: item.name,
        dateFrom: item.dateFrom,
    })),
);

const competitionId = searchedCompetitions.items[0]?.id;
if (competitionId) {
    const competition = await client.competitions(competitionId);
    console.log("Competition detail:", {
        id: competition.id,
        name: competition.name,
        dateFrom: competition.dateFrom,
        judges: competition.judges.map((judge) => judge.name),
        runs: competition.runs?.map((run) => run.name),
    });
}
