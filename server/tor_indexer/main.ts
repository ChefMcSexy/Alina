import { serve, Response } from "https://deno.land/std@0.104.0/http/server.ts";
import { loadDatabase } from "./plugs/databaseLoader.ts"

import { search } from "./plugs/search.ts";
const _search = new search();


const config = JSON.parse(Deno.readTextFileSync("./config.json"))
const server = serve({hostname: config.hostname, port: config.port });

// all the database
let domainDatabase = [] //just a list of domains
let urlDatabase = [] // little bit more complex, a list of urls
let urlWaiting = []
let orphenlanIMG = []
let sameURL = []
let db = []
Deno.mkdirSync("./db/data/", { recursive: true })

try{ domainDatabase = JSON.parse(Deno.readTextFileSync("./db/domains.json")) } catch(err){}
try{ orphenlanIMG = JSON.parse(Deno.readTextFileSync("./db/orphenlanIMG.json")) } catch(err){}
try{ sameURL = JSON.parse(Deno.readTextFileSync("./db/sameURL.json")) } catch(err){}
try{ urlDatabase = JSON.parse(Deno.readTextFileSync("./db/urls.json")) } catch(err){}
try{
    if(urlDatabase == [] || urlDatabase == null || urlDatabase.length == 0){
        urlDatabase = ["http://livehackzyr2wwos2ca3ygfan3ngvqytpe5ph74pdko55ohv6lgdshyd.onion/"]
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
    await Deno.writeTextFile("./db/sameURL.json", JSON.stringify(sameURL))
}

setInterval(() => {
    loadAllTheData()
}, 10000)

loadAllTheData()
async function loadAllTheData(){
    try{
        let add = Deno.readTextFileSync("./db/add").split('\n')
        domainDatabase = domainDatabase.concat(add)
        urlDatabase = urlDatabase.concat(add)
        Deno.removeSync("./db/add")
    } catch(err){}
}

let indexingInProgress = false
//data loader
setInterval(() => {
    getDatabase()
}, 12*60*60000)

getDatabase()
async function getDatabase(){
    indexingInProgress = true
    // load the database from plugs databaseLoader.ts
    db = await loadDatabase(urlDatabase)
    indexingInProgress = false
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
|   |   |   |   +-- full.json // contains title, external links, internal links, paragraphs, meta
|   |   |   +-- images/
|   |   |   |   +-- full.json // contains all images links and name via URL updater, id="" and name=""
|   |   |   +-- videos/
|   |   |   |   +-- full.json // contains all videos links and name via URL updater, id="" and name=""
|   +-- b/
|   |   +-- [...]/
|   +-- [...]/
*/

async function main(request:any) {
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
                response.body = {
                    status: "online",
                    waitingLink: urlDatabase.length,
                    domainInDB: domainDatabase.length,
                    availableURL: db.length
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
                if(url && !indexingInProgress){
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
                response = await makeASearch(request)
            } else if(request.url.startsWith('/forceload')){
                getDatabase()
                response.body = {
                    status: "ok",
                }
            } else if(request.url.startsWith('/stats/')){
                if(request.url == "/stats/generate"){
                    generateStatistic()
                    response.body = {
                        status: "ok",
                        message: "generate stats"
                    }
                } else if(request.url == "/stats/value"){
                    let tmp = Deno.readTextFileSync("./db/statistic.json")
                    response.body  = tmp ? JSON.parse(tmp) : []
                } else {
                    response.status = 418
                }
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




async function makeASearch(request:any) {
    let response:Response = {}

    let body = await betRequestBody(request)
    body.title = body.title.toLowerCase()

    if(body.title.length < 3){
        response.body = []
        return response
    }

    if(request.url == '/search/all'){
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

        //filter content with body.filter content
        if(body.filter && body.filter.length > 0){
            response.body = _search.filter(await _search.db_search(body.title, db), body.filter)
        } else {
            response.body = await _search.db_search(body.title, db)
        }
        if(body.only && body.only.length > 0){
            response.body = _search.onlyRes(response.body, body.only)
        }

        //page max
        res.maxPage = Math.ceil(response.body.length/24)
        res.totalRes = response.body.length

        if(res.maxPage == null){ res.maxPage = 1 }
        if(body.page < res.maxPage){ res.next = true }

        if(body.page){
            //24 results per page
            let tmp2 = []
            let max = body.page*24
            let min = max-24
            min = min < 0 ? 0 : min
            for(let i = min; i < max; i++){
                if(response.body[i] != null && response.body[i] != undefined){
                    tmp2.push(response.body[i])
                }
            }
            response.body = tmp2
        }

        res.res = response.body
        res.resLength = response.body.length
        response.body = res

    } else if(request.url == '/search/title'){
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

        //filter content with body.filter content
        if(body.filter && body.filter.length > 0){
            response.body = _search.filter(await _search.db_searchViaTitle(body.title, db), body.filter)
        } else {
            response.body = await _search.db_searchViaTitle(body.title, db)
        }
        if(body.only && body.only.length > 0){
            response.body = _search.onlyRes(response.body, body.only)
        }

        //page max
        res.maxPage = Math.ceil(response.body.length/24)
        res.totalRes = response.body.length

        if(res.maxPage == null){ res.maxPage = 1 }
        if(body.page < res.maxPage){ res.next = true }

        if(body.page){
            //24 results per page
            let tmp2 = []
            let max = body.page*24
            let min = max-24
            min = min < 0 ? 0 : min
            for(let i = min; i < max; i++){
                if(response.body[i] != null && response.body[i] != undefined){
                    tmp2.push(response.body[i])
                }
            }
            response.body = tmp2
        }

        res.res = response.body
        res.resLength = response.body.length
        response.body = res

    } else if(request.url == '/search/content'){
        //get link by title, soo where content.title contains the title
        let tmp = []
        for(let i = 0; i < db.length; i++){
            for(let j = 0; j < db[i].content.length; j++){
                for(let k = 0; k < db[i].content[j].paragraphs.length; k++){
                    if(db[i].content[j].paragraphs[k].toLowerCase().includes(body.title)){
                        tmp.push(db[i].content[j])
                    }
                }
            }
        }
        response.body = tmp
    } else if(request.url == '/search/images'){
        //get image where alt, src, id, name contains the title
        let tmp = []
        for(let i = 0; i < db.length; i++){
            for(let j = 0; j < db[i].images.length; j++){
                try{
                    if(db[i].images[j].url.toLowerCase().includes(body.title) || db[i].images[j].alt.toLowerCase().includes(body.title) || db[i].images[j].id.toLowerCase().includes(body.title) || db[i].images[j].name.toLowerCase().includes(body.title)){
                        tmp.push(db[i].images[j])
                    } 
                } catch(err){}
            }
        }
        response.body = tmp
    } else if(request.url == '/search/videos'){
        //get image where alt, src, id, name contains the title
        let tmp = []
        for(let i = 0; i < db.length; i++){
            for(let j = 0; j < db[i].videos.length; j++){
                if(db[i].videos[j].alt.toLowerCase().includes(body.title) || db[i].videos[j].id.toLowerCase().includes(body.title) || db[i].videos[j].name.toLowerCase().includes(body.title)){
                    tmp.push(db[i].videos[j])
                }
            }
        }
        response.body = tmp
    } else if(request.url == '/search/email'){
        //get all the email that corespond to the search
        let tmp = []
        for(let i = 0; i < db.length; i++){
            for(let j = 0; j < db[i].email.length; j++){
                if(db[i].email[j].toLowerCase().includes(body.title)){
                    if(tmp.indexOf(db[i].email[j]) == -1){
                        tmp.push(db[i].email[j])
                    }
                }
            }
        }
        response.body = tmp
    } else if(request.url == '/search/domainDupli'){
        //respond with the "sameURL" analyse
        if(!body.title.startsWith('http://')){
            body.title = 'http://' + body.title   
        }
        let tmp = {
            url: body.title,
            hasClone: false,
            count: 0,
            clone: []
        }
        let tmp2 = sameURL.filter(x => x.urlIn.includes(body.title))

        if(tmp2.length > 0){
            tmp.hasClone = true
            tmp.count = tmp2.length
            for(let i = 0; i < tmp2.length; i++){
                tmp.clone.push(tmp2[i].urlOut)
            }
        }
        response.body = tmp
    } else {
        response.body = []
    }

    let h = new Headers()
    h.append('Content-Type', 'application/json')
    response.headers = h

    return response
}

async function betRequestBody(request) {
    try{
        let body = await Deno.readAll(request.body)
        return JSON.parse(new TextDecoder().decode(body))
    } catch(err){}
    return null
}


////// STATS //////
async function generateStatistic(){
    console.log("[@] Starting statistic generation")
    let data = {
        dbSize: db.length,
        lastUpdate: new Date().toLocaleString(),
        clonnedLinks: await _stats_countClonnedURL(),
        keyword: [
            {
                "name": "drugs",
                "count": 0
            },
            {
                "name": "gun",
                "count": 0
            },
            {
                "name": "death",
                "count": 0
            },
            {
                "name": "porn",
                "count": 0
            },
            {
                "name": "child",
                "count": 0
            },
        ]
    }

    for(let i = 0; i<data.keyword.length; i++){
        data.keyword[i].count = (await _search.db_search(data.keyword[i].name, db)).length
    }
    Deno.writeTextFileSync('./db/statistic.json', JSON.stringify(data))
    console.log("[@] Statistic generated")
}

async function _stats_countClonnedURL(){
    let tmp = []
    for(let i = 0; i < sameURL.length; i++){
        if(sameURL[i].urlOut.length > 0){
            if(tmp.indexOf(sameURL[i].urlOut) == -1){
                tmp.push(sameURL[i].urlOut)
            }
        }
    }
    return tmp.length
}

////// BIG FUNCTION //////

async function addNewUrl(data) {
    let response:Response = {}

    let domain = data.url.split("://")[1].split(".onion")[0]+".onion"
    if(!domainDatabase.includes(domain)){ domainDatabase.push(domain) }

    //create the domain directory
    Deno.mkdirSync("./db/data/"+domain.split('')[0]+"/"+domain, { recursive: true })
    Deno.mkdirSync("./db/data/"+domain.split('')[0]+"/"+domain+"/content", { recursive: true })
    Deno.mkdirSync("./db/data/"+domain.split('')[0]+"/"+domain+"/images", { recursive: true })
    Deno.mkdirSync("./db/data/"+domain.split('')[0]+"/"+domain+"/videos", { recursive: true })

    let FULL_content = [], FULL_images = [], FULL_videos = []
    try{ FULL_content = JSON.parse(Deno.readTextFileSync("./db/data/"+domain.split('')[0]+"/"+domain+"/content/full.json")) } catch(err){}
    try{ FULL_images = JSON.parse(Deno.readTextFileSync("./db/data/"+domain.split('')[0]+"/"+domain+"/images/full.json")) } catch(err){}
    try{ FULL_videos = JSON.parse(Deno.readTextFileSync("./db/data/"+domain.split('')[0]+"/"+domain+"/videos/full.json")) } catch(err){}

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
            url: [],
            email: []
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
        external: [],
        internal: [],
        paragraphs: [],
        meta: null,
        url: data.url,
        domain: domain
    }
    images = data.images
    videos = data.videos
    content.title = data.title
    content.titles = data.content.titles
    content.external = data.content.external_links
    content.internal = data.content.internal_links
    content.meta = data.content.meta
    content.paragraphs = data.content.paragraphs

    FULL_content.push(content)
    
    if(images.length > 0){
        //parcour image and add them to the database
        for(let i = 0; i < images.length; i++){
            //check if the image is already in the database
            let tmp = FULL_images.find(image => image.url == images[i].url)
            if(tmp != null){
                tmp.urlLIST.push(data.url)
            } else {
                images[i].urlLIST = []
                images[i].urlLIST.push(data.url)
                FULL_images.push(images[i])
            }
        }
    }
    if(videos.length > 0){
        for(let i = 0; i < videos.length; i++){
            //check if the image is already in the database
            let tmp = FULL_videos.find(image => image.url == videos[i].url)
            if(tmp != null){
                tmp.urlLIST.push(data.url)
            } else {
                videos[i].urlLIST = []
                videos[i].urlLIST.push(data.url)
                FULL_videos.push(videos[i])
            }
        }
    }

    //update crypto
    for(let i =0; i<data.cryptocurrencies.length; i++){
        if(!crypto.includes(data.cryptocurrencies[i])){
            crypto.push(data.cryptocurrencies[i])
        }
    }

    Deno.writeTextFile("./db/data/"+domain.split('')[0]+"/"+domain+"/content/full.json", JSON.stringify(FULL_content))
    Deno.writeTextFile("./db/data/"+domain.split('')[0]+"/"+domain+"/images/full.json", JSON.stringify(FULL_images))
    Deno.writeTextFile("./db/data/"+domain.split('')[0]+"/"+domain+"/videos/full.json", JSON.stringify(FULL_videos))
    Deno.writeTextFile("./db/data/"+domain.split('')[0]+"/"+domain+"/crypto.json", JSON.stringify(crypto))

    //now add all the link to url database
    for(let i =0; i<data.content.internal_links.length; i++){
        data.content.internal_links[i] = "http://"+domain+data.content.internal_links[i]
        if(!urlDatabase.includes(data.content.internal_links[i]) && infos.url.find(x => x.url == data.content.internal_links[i]) == undefined && !urlWaiting.includes(data.content.internal_links[i])){
            console.log("add to waiting: "+data.content.internal_links[i])
            urlDatabase.unshift(data.content.internal_links[i])
        }
    }
    for(let i =0; i<data.content.external_links.length; i++){
        try{
            if(data.content_external_links[i].endsWith('.png') || data.content_external_links[i].endsWith('.jpg') || data.content_external_links[i].endsWith('.jpeg') || data.content_external_links[i].endsWith('.gif') || data.content_external_links[i].endsWith('.svg')){
                if(!orphenlanIMG.includes(data.content_external_links[i])){
                    orphenlanIMG.push(data.content_external_links[i])
                }
            } else {
                if(!urlDatabase.includes(data.content.external_links[i])){
                    urlDatabase.push(data.content.external_links[i])
                }
            }
        } catch(err){}
    }

    //adding the email
    for(let i =0; i<data.email.length; i++){
        if(!infos.email.includes(data.email[i])){
            infos.email.push(data.email[i])
        }
    }

    Deno.writeTextFile("./db/data/"+domain.split('')[0]+"/"+domain+"/infos.json", JSON.stringify(infos))
    urlWaiting.splice(urlWaiting.indexOf(data.url), 1)
    console.log("[@] Url in database: "+urlDatabase.length)
    response.body = "ok"
    return response
}

function generateUrlToken(){
    return randomString(10)+"."+randomString(13)+"."+randomString(8)
}

function randomString(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

console.log(`[@] Alina server is running on ${config.hostname}:${config.port}`);
for await (const request of server) {
    if(["GET", "POST"].includes(request.method)){
        main(request)
    } else {
        request.respond({ status: 418 })
    }
}