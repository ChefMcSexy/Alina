import { serve, Response } from "https://deno.land/std@0.104.0/http/server.ts";
const server = serve({ port: 7536 });
import {sql_query} from "./sql.ts";

async function main(request) {
    let response: Response = {}

    console.log(request.url)
    try{
        if(request.url === "/getLastDomain") {
            let sql = new sql_query();
            let result = await sql.query_select(`SELECT * FROM checking LIMIT 1`);
            response.body = JSON.stringify(result);
        } else if(request.url === "/addDomain") {
            let sql = new sql_query();
            let value0 = await Deno.readAll(request.body);
            let value = new TextDecoder("utf-8").decode(value0).replace(/ /g, "");
            if(checkingDomain(value)){
                let data = await sql.query_select(`SELECT * FROM domain WHERE domain = '${value}'`);
                if(data.length === 0){
                    await sql.query_insert(`INSERT INTO domain(domain, lastcheck) VALUES ('${value}', '${Date.now()}')`);
                }
            }
            response.body = "ok"
        } else if(request.url === "/addLink") {
            let sql = new sql_query();
            let value0 = await Deno.readAll(request.body);
            let value = JSON.parse(new TextDecoder("utf-8").decode(value0));
            let checking = await sql.query_select(`SELECT * FROM links WHERE link = '${value.link}'`);
            if(checking.length === 0){
                await sql.query_insert(`INSERT INTO links (link, title, lastpass) VALUES ('${value.link}','${value.title}', '${Date.now()}')`);
            }
            response.body = "ok"
        } else if(request.url === "/addMedia") {
            let sql = new sql_query();
            let value0 = await Deno.readAll(request.body);
            let value = JSON.parse(new TextDecoder("utf-8").decode(value0));
            await sql.query_insert(`INSERT INTO media (link, name, type, ext, lastpass) VALUES ('${value.link}','${value.name}','${value.type}','${value.ext}', '${Date.now()}')`);
            response.body = "ok"
        } else if(request.url === "/addChecking") {
            let sql = new sql_query();
            let value0 = await Deno.readAll(request.body);
            let value = new TextDecoder("utf-8").decode(value0)
            //check if not allready in db
            let checking = await sql.query_select(`SELECT * FROM checking WHERE url = '${value}'`);
            if(checking.length === 0){
                await sql.query_insert(`INSERT INTO checking (url) VALUES ('${value}')`);
            }
            response.body = "ok"
        } else if(request.url === "/delFT") {
            let sql = new sql_query();
            let value0 = await Deno.readAll(request.body);
            let value = new TextDecoder("utf-8").decode(value0)
            let sqlRequest = `DELETE FROM checking WHERE url = '${value}'`
            await sql.query_delete(sqlRequest);
            response.body = "ok"
        } else if(request.url === "/search") {
            let sql = new sql_query();
            let value0 = await Deno.readAll(request.body);
            let value = new TextDecoder("utf-8").decode(value0).replace(/'/g, "").replace(/%/g, "");
            let sqlRequest = `SELECT * FROM links WHERE title LIKE '%${value}%' LIMIT 0, 50`
            response.body = JSON.stringify(await sql.query_select(sqlRequest));
        } else if(request.url === "/getPictures") {
            let sql = new sql_query();
            let sqlRequest = `SELECT * FROM media WHERE type='picture' AND ext IN("png", "jpg", "jpeg") ORDER BY RAND() LIMIT 0, 1`
            response.body = JSON.stringify(await sql.query_select(sqlRequest));
        } else {
            response.body = "no"
        }
    
    } catch(err){}

    
    request.respond(response)
}


function checkingDomain(url){
    let data = url.split(".");
    if(data.length === 2){
        if(data[1] === "onion"){
            return true
        }
    } 
    return false
}

// --------------------- API START -----------------------------
for await (const request of server) {
    if(["GET", "POST"].indexOf(request.method) > -1){
        main(request);
    } else {
        request.respond({status: 418, body: "I'm a teapot"});
    }
}