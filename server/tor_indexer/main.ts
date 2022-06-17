import { serve, Response } from "https://deno.land/std@0.104.0/http/server.ts";
import { databaseManager } from "./plugs/mysql.ts"
const _db = new databaseManager()

//http://livehackzyr2wwos2ca3ygfan3ngvqytpe5ph74pdko55ohv6lgdshyd.onion/


const config = JSON.parse(Deno.readTextFileSync("./config.json"))
const server = serve({hostname: config.hostname, port: config.port });

///////////////////: MAIN :////////////////////////////
async function main(request:any) : Promise<void> {
    let response:Response = {}

    // we need to check if the header auth is valid
    console.log("- "+request.url)
    
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
                //todo
                
            } else if(request.url == "/push"){
                // push new data
                let body:any = await betRequestBody(request)
                if(body != null){
                    if(_db.checkURL(body.url)){
                        response = await addNewUrl(body)
                    } else {
                        response.status = 400
                        response.body = "Url is not onion link"
                    }
                    _db.deleteFromMaking(body.url)
                } else {
                    response.status = 400
                }
            } else if(request.url == "/api/ask"){
                let url = await _db.getWaitingUrl()
                response.body = {
                    url: url
                }
            } else if(request.url.startsWith('/search/')){
                response = await makeASearch(request)
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

///////////////////: SEARCH :////////////////////////////
async function makeASearch(request:any) {
    let response:Response = {}

    let body = await betRequestBody(request)
    body.title = body.title.toLowerCase()

    if(body.title.length < 3){
        response.body = []
        return response
    }

    //get link by title, soo where content.title contains the title
    if(body.page == null || body.page < 1 || body.page == undefined){
        body.page = 1
    } else {
        try{
            body.page = parseInt(body.page)
        } catch(err){
            body.page = 1
        }
    }

    let res = {
        page: body.page,
        title: body.title,
        resLength: 0,
        next: false,
        maxPage: 0,
        totalRes: 0,
        res: []
    }

    if(request.url == '/search/all'){
        //todo

    } else if(request.url == '/search/title'){
        //todo

    } else if(request.url == '/search/content'){
        //todo

    } else if(request.url == '/search/images'){
        //todo

    } else if(request.url == '/search/videos'){
        //todo

    } else if(request.url == '/search/email'){
        //todo

    } else if(request.url == '/search/domainDupli'){
        //todo

    } else {
        response.body = []
    }

    let h = new Headers()
    h.append('Content-Type', 'application/json')
    response.headers = h

    return response
}

async function betRequestBody(request:any) {
    try{
        let body = await Deno.readAll(request.body)
        return JSON.parse(new TextDecoder().decode(body))
    } catch(err){}
    return null
}


///////////////////: PUSH :////////////////////////////

async function addNewUrl(data) {
    let response:Response = {}

    let domain = data.url.split("://")[1].split(".onion")[0]+".onion"
    await _db.createDomainIfNotExist(domain)

    let images = data.images
    let videos = data.videos
    
    if(images.length > 0){
        //parcour image and add them to the database
        for(let i = 0; i < images.length; i++){
            await _db.addImageIfNotExist(images[i])
        }
    }
    if(videos.length > 0){
        for(let i = 0; i < videos.length; i++){
            await _db.addVideoIfNotExist(videos[i])
        }
    }

    //adding the email
    for(let i =0; i<data.email.length; i++){
        await _db.addEmailIfNotExist(domain, data.email[i])
    }

    //adding the page content
    await _db.addPageContentIfNotExist(domain, data.url, data.title, data.content.paragraphs)

    //update crypto
    /*
    for(let i =0; i<data.cryptocurrencies.length; i++){
        if(!crypto.includes(data.cryptocurrencies[i])){
            crypto.push(data.cryptocurrencies[i])
        }
    }*/

    //internal links
    for(let i =0; i<data.content.internal_links.length; i++){
        await _db.addInternalLinkIfNotExist("http://"+domain+data.content.internal_links[i])
    }

    //external link
    for(let i =0; i<data.content.external_links.length; i++){
        try {
            if(data.content.external_links[i].endsWith('.png') || data.content.external_links[i].endsWith('.jpg') || data.content.external_links[i].endsWith('.jpeg') || data.content.external_links[i].endsWith('.gif') || data.content.external_links[i].endsWith('.svg')){
                //add image
                await _db.addImageIfNotExist(data.content.external_links[i])
            } else {
                //add link
                await _db.addExternalLinkIfNotExist(data.content.external_links[i])
            }
        } catch (error) {
            
        }
    }

    response.body = "ok"
    return response
}


///////////////////: WEB :////////////////////////////
console.log(`[@] Alina server is running on ${config.hostname}:${config.port}`);
for await (const request of server) {
    if(["GET", "POST"].includes(request.method)){
        main(request)
    } else {
        request.respond({ status: 418 })
    }
}