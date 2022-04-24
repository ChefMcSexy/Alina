import { serve, Response } from "https://deno.land/std@0.104.0/http/server.ts";

const config = JSON.parse(Deno.readTextFileSync("./config.json"))
const server = serve({hostname: config.hostname, port: config.port });

// all the database
let domainDatabase = [] //just a list of domains
let urlDatabase = [] // little bit more complex, a list of urls
let urlWaiting = []

try{
    domainDatabase = JSON.parse(Deno.readTextFileSync("./db/domains.json"))
} catch(err){}
try {
    urlDatabase = JSON.parse(Deno.readTextFileSync("./db/urls.json"))
} catch(err){
    urlDatabase = ["http://juhanurmihxlp77nkq76byazcldy2hlmovfu2epvl5ankdibsot4csyd.onion/"]
}
try{
    if(urlDatabase == [] || urlDatabase == null || urlDatabase.length == 0){
        urlDatabase = ["http://juhanurmihxlp77nkq76byazcldy2hlmovfu2epvl5ankdibsot4csyd.onion/"]
    }
} catch(err){}

setInterval(() => {
    // save the database
    saveDatabase()
}, 60000)
//save the database
async function saveDatabase(){
    await Deno.writeTextFile("./db/domains.json", JSON.stringify(domainDatabase))
    await Deno.writeTextFile("./db/urls.json", JSON.stringify(urlDatabase))
}

/*
How Alina store the data ?
db/
+-- domains.json
+-- urls.json
+-- data/
|   +-- a/
|   |   +-- a[...].onion/
|   |   |   +-- infos.json // contains the infos about the domain :lastCheck, lastUpdate, all page title, all page url
|   |   |   +-- crypto.json // contains the crypto infos about the domain
|   |   |   +-- content/
|   |   |   |   +-- [urlToken].json // contains title, external links, internal links, paragraphs, meta
|   |   |   +-- images/
|   |   |   |   +-- [urlToken].json // contains all images links and name via URL updater, id="" and name=""
|   |   |   +-- videos/
|   |   |   |   +-- [urlToken].json // contains all videos links and name via URL updater, id="" and name=""
|   +-- b/
|   |   +-- [...]/
|   +-- [...]/
*/

async function main(request:any) {
    let response:Response = {}

    // we need to check if the header auth is valid
    console.log(request.url)
    
    try{
        if(request.headers[config.headers_name] != config.headers_key){
            response = {
                status: 401,
                body: "Unauthorized"
            }
        } else {
            // here is the api code
            // user can push new data, ask for work, ask for status, search, etc

            if(request.url == "/api/v1/indexer/status"){
                response.body = {
                    status: "online"
                }
            } else if(request.url == "/push"){
                // push new data
                let body = await betRequestBody(request)
                if(body != null){
                    //check url is in the waiting list
                    if(urlWaiting.includes(body.url)){
                        response = await addNewUrl(body)
                    } else {
                        response.status = 400
                        response.body = "Url is not in the waiting list"
                    }
                } else {
                    response.status = 400
                }
            } else if(request.url == "/api/ask"){
                // get the first url to crawl, and move it to the urlWaiting list
                // if no url to crawl, return null
                let url = urlDatabase.shift()
                if(url){
                    urlWaiting.push(url)
                    response.body = {
                        url: url
                    }
                } else {
                    // maybe we need to wait for a new url to be added
                    // or create a alert system via API to notify the owner
                    response.body = {
                        url: "none"
                    }
                }
            } else if(request.url.startsWith('/search/')){
                //todo
            } else {
                response.status = 404
            }
        }
    } catch(err){
        console.log(err)
        response.status = 500
    }


    try{
        response.body = JSON.stringify(response.body)
    }catch(err){}

    request.respond(response);
}


async function betRequestBody(request) {
    try{
        let body = await Deno.readAll(request.body)
        return JSON.parse(new TextDecoder().decode(body))
    } catch(err){}
    return null
}

async function addNewUrl(data) {
    let response:Response = {}

    let domain = data.url.split("://")[1].split(".onion")[0]+".onion"

    if(!domainDatabase.includes(domain)){
        domainDatabase.push(domain)
    }

    //create the domain directory
    Deno.mkdirSync("./db/data/"+domain.split('')[0]+"/"+domain, { recursive: true })
    Deno.mkdirSync("./db/data/"+domain.split('')[0]+"/"+domain+"/content", { recursive: true })
    Deno.mkdirSync("./db/data/"+domain.split('')[0]+"/"+domain+"/images", { recursive: true })
    Deno.mkdirSync("./db/data/"+domain.split('')[0]+"/"+domain+"/videos", { recursive: true })

    let urlToken = generateUrlToken()
    let infos = null
    let crypto = null
    let content = null
    let images = null
    let videos = null
    let created = false
    try{
        infos = JSON.parse(Deno.readTextFileSync("./db/data/"+domain.split('')[0]+"/"+domain+"/infos.json"))
        created = true
    } catch(err){}

    if(!created){
        infos = {
            lastCheck: Date.now(),
            lastUpdate: Date.now(),
            title: [],
            url: []
        }
        crypto = []
    } else {
        infos.lastCheck = Date.now()
        infos.lastUpdate = Date.now()
        crypto = JSON.parse(Deno.readTextFileSync("./db/data/"+domain.split('')[0]+"/"+domain+"/crypto.json"))
    }

    if(infos != null){
        // check if the url is already in the database
        let tmp = infos.url.find(url => url.url == data.url)
        if(tmp != null){
            urlToken = tmp.urlToken
        } else {
            infos.url.push({
                url: data.url,
                token: urlToken
            })
        }
    } else {
        infos.url.push({
            url: data.url,
            token: urlToken
        })
    }

    content = {
        title: "",
        titles: [],
        externalLinks: [],
        internalLinks: [],
        paragraphs: [],
        meta: null
    }
    images = data.images
    videos = data.videos
    content.title = data.title
    content.titles = data.content.titles
    content.external = data.content.external_links
    content.internal = data.content.internal_links
    content.meta = data.content.meta
    content.paragraphs = data.content.paragraphs

    Deno.writeTextFile("./db/data/"+domain.split('')[0]+"/"+domain+"/content/"+urlToken+".json", JSON.stringify(content))
    Deno.writeTextFile("./db/data/"+domain.split('')[0]+"/"+domain+"/images/"+urlToken+".json", JSON.stringify(images))
    Deno.writeTextFile("./db/data/"+domain.split('')[0]+"/"+domain+"/videos/"+urlToken+".json", JSON.stringify(videos))

    //update crypto
    for(let i =0; i<data.cryptocurrencies.length; i++){
        if(!crypto.includes(data.cryptocurrencies[i])){
            crypto.push(data.cryptocurrencies[i])
        }
    }

    Deno.writeTextFile("./db/data/"+domain.split('')[0]+"/"+domain+"/crypto.json", JSON.stringify(crypto))
    Deno.writeTextFile("./db/data/"+domain.split('')[0]+"/"+domain+"/infos.json", JSON.stringify(infos))

    //now add all the link to url database
    for(let i =0; i<data.content.internal_links.length; i++){
        if(!urlDatabase.includes(data.content.internal_links[i]) && infos.url.find(x => x.url == data.content.internal_links[i]) == undefined){
            urlDatabase.push(data.content.internal_links[i])
        }
    }
    for(let i =0; i<data.content.external_links.length; i++){
        if(!urlDatabase.includes(data.content.external_links[i])){
            urlDatabase.push(data.content.external_links[i])
        }
    }

    //remove URL from waiting list
    urlWaiting.splice(urlWaiting.indexOf(data.url), 1)

    console.log(urlDatabase.length)

    response.body = "ok"
    return response
}

function generateUrlToken(){
    return randomString(10)+"."+randomString(13)+"."+randomString(8)
}

function randomString(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}


console.log(`Alina server is running on ${config.hostname}:${config.port}`);
for await (const request of server) {
    if(["GET", "POST"].includes(request.method)){
        main(request)
    } else {
        request.respond({ status: 418 })
    }
}