import { KacrClient } from "kacr-api";

const client = new KacrClient();

const home = await client.home();
console.log("Home member count:", home.memberCount);
console.log(
    "Today's competition names:",
    home.todaysCompetitions.map((item) => item.name),
);
console.log(
    "Upcoming competition names:",
    home.upcomingCompetitions.map((item) => item.name),
);
console.log(
    "Recently added competition names:",
    home.newlyAddedCompetitions.map((item) => item.name),
);
