import { Client } from "https://deno.land/x/mysql/mod.ts";
const config = JSON.parse(Deno.readTextFileSync("./conf.json"));

const client = await new Client().connect({
    hostname: config.hostname,
    username: config.username,
    db: config.db,
    password: config.password,
    poolSize: 14
});


export class sql_query {
    private async query_insert(sql: string) {
        await client.execute(`${sql}`);
    }
    private async query_update(sql: string) {
        await client.execute(`${sql}`);
    }
    private async query_delete(sql: string) {
        await client.execute(`${sql}`);
    }
    private async query_select(sql: string) {
        try {
            let result = await client.query(`${sql}`);
            return result;
        } catch (err) {
            console.log(err)
        }
    }
}