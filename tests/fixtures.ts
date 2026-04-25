export async function readFixture(name: string): Promise<string> {
    return Bun.file(new URL(`../pageshtml/${name}`, import.meta.url)).text();
}
