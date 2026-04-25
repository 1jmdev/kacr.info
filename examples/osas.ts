import { KacrClient } from "kacr";

const client = new KacrClient();

const byName = await client.osas.search({ name: "Aktij" });
console.log("OSA search by name:", byName.osas);

const byMember = await client.osas.search({ member: "Maro" });
console.log(
    "OSA search by member:",
    byMember.handlers.map((item) => ({
        handler: item.handler.name,
        osa: item.osa?.name,
    })),
);

const osaId = byName.osas[0]?.id ?? byMember.osas[0]?.id;
if (osaId) {
    const osa = await client.osas(osaId, { page: 1 });
    console.log("OSA detail:", {
        id: osa.id,
        name: osa.name,
        email: osa.email,
        website: osa.website,
        memberCount: osa.memberCount,
        members: osa.members.length,
        address: osa.address,
    });
}
