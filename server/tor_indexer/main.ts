import { serve, Response } from "https://deno.land/std@0.104.0/http/server.ts";

const config = JSON.parse(Deno.readTextFileSync("./config.json"))
const server = serve({hostname: config.hostname, port: config.port });

// all the database
let domainDatabase = [] //just a list of domains
let urlDatabase = [] // little bit more complex, a list of urls
let urlWaiting = []
let orphenlanIMG = []
let sameURL = []
let db

try{
    domainDatabase = JSON.parse(Deno.readTextFileSync("./db/domains.json"))
} catch(err){}
try{
    orphenlanIMG = JSON.parse(Deno.readTextFileSync("./db/orphenlanIMG.json"))
} catch(err){}
try{
    sameURL = JSON.parse(Deno.readTextFileSync("./db/sameURL.json"))
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


//data loader
setInterval(() => {
    loadDatabase()
}, 23*60000)

loadDatabase()
async function loadDatabase() {
    //we need to get all the data from the database
    console.log("[+] Database Start loaded at "+new Date().toLocaleString())
    let letterDispo = await exploreDirSimple('./db/data/')
    let tmpDomainList = []
    let tmpDB = []
    for(let i = 0; i < letterDispo.length; i++){
        let letter = letterDispo[i]
        let letterDir = await exploreDirSimple('./db/data/'+letter+"/")
        for(let j = 0; j < letterDir.length; j++){
            try{
                let domain = letterDir[j]
                tmpDomainList.push("./db/data/"+domain.split('')[0]+"/"+domain)
                let dinfo = JSON.parse(Deno.readTextFileSync("./db/data/"+domain.split('')[0]+"/"+domain+"/infos.json"))
                tmpDB.push({
                    domain: domain,
                    crypto: JSON.parse(Deno.readTextFileSync("./db/data/"+domain.split('')[0]+"/"+domain+"/crypto.json")),
                    url: dinfo.url,
                    content: await getAllFileContent("./db/data/"+domain.split('')[0]+"/"+domain+"/content"),
                    images: await getAllFileContent("./db/data/"+domain.split('')[0]+"/"+domain+"/images"),
                    videos: await getAllFileContent("./db/data/"+domain.split('')[0]+"/"+domain+"/videos"),
                    email: dinfo.email
                })
            } catch(err){}
        }
    }
    
    //cool but we need to remove the data dupluction in images/videos/crypto
    for(let i = 0; i < tmpDB.length; i++){
        let img = []
        for(let j = 0; j < tmpDB[i].images.length; j++){
            let tmp = tmpDB[i].images[j]
            //console.log(tmp)
            for(let k = 0; k < tmp.length; k++){
                if(!img.includes(tmp[k])){
                    img.push(tmp[k])
                }
            }
        }
        tmpDB[i].images = img
    }
    //same for videos
    for(let i = 0; i < tmpDB.length; i++){
        let vid = []
        for(let j = 0; j < tmpDB[i].videos.length; j++){
            let tmp = tmpDB[i].videos[j]
            for(let k = 0; k < tmp.length; k++){
                if(!vid.includes(tmp[k])){
                    vid.push(tmp[k])
                }
            }
        }
        tmpDB[i].videos = vid
    }
    //same for crypto
    for(let i = 0; i < tmpDB.length; i++){
        let cry = []
        for(let j = 0; j < tmpDB[i].crypto.length; j++){
            let tmp = tmpDB[i].crypto[j]
            for(let k = 0; k < tmp.length; k++){
                if(!cry.includes(tmp[k])){
                    cry.push(tmp[k])
                }
            }
        }
        tmpDB[i].crypto = cry
    }

    //console.log(tmpDB)
    console.log("[+] Database END loaded at "+new Date().toLocaleString())
    console.log("[+] Database size: "+tmpDB.length)
    console.log("[+] Fetching multiples urls")
    let sameArray = []
    //we need to detect the URL duplications
    for(let i = 0; i < tmpDB.length; i++){
        for(let j = 0; j < tmpDB[i].content.length; j++){
            if(tmpDB[i].content[j].title.toLowerCase().includes("")){
                //console.log('got '+tmpDB[i].content[j].title)
                if(tmpDB[i].content[j].title.length > 0){
                    //get all the page with the same title
                    let sameTitle = await db_searchViaTitle(tmpDB[i].content[j].title,tmpDB)
                    //OKAY so now we check if the paragraph are the same
                    for(let k = 0; k < sameTitle.length; k++){
                        if(sameTitle[k].paragraphs.length != 0){
                            if(sameTitle[k].paragraphs.length == tmpDB[i].content[j].paragraphs.length){
                                //console.log("Innnnnnnn")
                                let same = true
                                for(let l = 0; l < sameTitle[k].paragraphs.length; l++){
                                    //console.log(sameTitle[k].paragraphs[l])
                                    //console.log(tmpDB[i].content[j].paragraphs[l])
                                    if(sameTitle[k].paragraphs[l] != tmpDB[i].content[j].paragraphs[l]){
                                        same = false
                                    }
                                }
                                if(same){
                                    if(tmpDB[i].content[j].url != sameTitle[k].url){
                                        sameArray.push({
                                            urlIn: tmpDB[i].content[j].url,
                                            urlOut: sameTitle[k].url
                                        })
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    console.log("[+] Same site: "+sameArray.length)
    sameURL = sameArray
    db = tmpDB

    //generateStatistic()
}

async function getAllFileContent(path) {
    let fileList = await exploreFileSimple(path)
    let tmp = []
    for(let i = 0; i < fileList.length; i++){
        try{
            tmp.push(JSON.parse(Deno.readTextFileSync(path+"/"+fileList[i])))
        } catch(err){}
    }
    return tmp
}

async function exploreDirSimple(dir){
    let tmp = []
    for await (const dirEntry of Deno.readDir(dir)) {
        if(dirEntry.isDirectory){
            tmp.push(dirEntry.name)
        }
    }
    return tmp
}
async function exploreFileSimple(dir){
    let tmp = []
    for await (const dirEntry of Deno.readDir(dir)) {
        if(!dirEntry.isDirectory){
            tmp.push(dirEntry.name)
        }
    }
    return tmp
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
                response = await search(request)
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


async function db_searchViaTitle(title, workdb?) {
    let filter = false
    if(!workdb){
        filter = true
        workdb = db
    }
    let tmp = []
    for(let i = 0; i < workdb.length; i++){
        for(let j = 0; j < workdb[i].content.length; j++){
            if(workdb[i].content[j].title.toLowerCase().includes(title.toLowerCase())){
                tmp.push(workdb[i].content[j])
            }
        }
    }

    if(filter){
        //filter content with sameURL array
        let tmp2 = []
        let bannedURL = []
        for(let i = 0; i < tmp.length; i++){
            let tmpData = sameURL.filter(x => x.urlIn == tmp[i].url)
            if(tmpData.length > 0){
                for(let j = 0; j < tmpData.length; j++){
                    bannedURL.push(tmpData[j].urlOut)
                }
            }
            if(!bannedURL.includes(tmp[i].url)){
                tmp2.push(tmp[i])
            }
        }

        tmp = tmp2
    }

    return tmp
}

async function search(request:any) {
    let response:Response = {}

    let body = await betRequestBody(request)
    body.title = body.title.toLowerCase()

    if(body.title.length < 3){
        response.body = []
        return response
    }

    if(request.url == '/search/title'){
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

        response.body = await db_searchViaTitle(body.title)
        //filter content with body.filter content
        if(body.filter && body.filter.length > 0){
            //for earch element in body.filter, we need to filter the response.body
            let tmp = []
            for(let i = 0; i < response.body.length; i++){
                //check in the name and all the paragraphs
                let found = false
                for(let j = 0; j < response.body[i].paragraphs.length; j++){
                    for(let k = 0; k < body.filter.length; k++){
                        if(response.body[i].paragraphs[j].toLowerCase().includes(body.filter[k].toLowerCase())){
                            found = true
                        }
                    }
                }
                //check the title
                for(let k = 0; k < body.filter.length; k++){
                    if(response.body[i].title.toLowerCase().includes(body.filter[k].toLowerCase())){
                        found = true
                    }
                }

                if(!found){
                    tmp.push(response.body[i])
                }
            }
            response.body = tmp
        }

        if(body.only && body.only.length > 0){
            //for earch element in body.filter, we need to filter the response.body
            let tmp = []
            for(let i = 0; i < response.body.length; i++){
                //check in the name and all the paragraphs
                let found = false
                for(let j = 0; j < response.body[i].paragraphs.length; j++){
                    for(let k = 0; k < body.only.length; k++){
                        if(response.body[i].paragraphs[j].toLowerCase().includes(body.only[k].toLowerCase())){
                            found = true
                        }
                    }
                }
                //check the title
                for(let k = 0; k < body.only.length; k++){
                    if(response.body[i].title.toLowerCase().includes(body.only[k].toLowerCase())){
                        found = true
                    }
                }

                if(found){
                    tmp.push(response.body[i])
                }
            }
            response.body = tmp
        }

        //page max

        res.maxPage = Math.ceil(response.body.length/24)
        res.totalRes = response.body.length

        if(res.maxPage == null){
            res.maxPage = 1
        }

        if(body.page < res.maxPage){
            res.next = true
        }

        if(body.page){
            //24 results per page
            let tmp2 = []
            let max = body.page*24
            let min = max-24
            if(min < 0){
                min = 0
            }
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
                if(db[i].images[j].alt.toLowerCase().includes(body.title) || db[i].images[j].id.toLowerCase().includes(body.title) || db[i].images[j].name.toLowerCase().includes(body.title)){
                    tmp.push(db[i].images[j])
                }
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
    console.log("Starting statistic generation")
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
        data.keyword[i].count = (await db_searchViaTitle(data.keyword[i].name)).length
    }
    
    Deno.writeTextFileSync('./db/statistic.json', JSON.stringify(data))
    console.log("Statistic generated")
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
        externalLinks: [],
        internalLinks: [],
        paragraphs: [],
        meta: null,
        url: data.url
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

    //now add all the link to url database
    for(let i =0; i<data.content.internal_links.length; i++){
        if(!urlDatabase.includes(data.content.internal_links[i]) && infos.url.find(x => x.url == data.content.internal_links[i]) == undefined && !urlWaiting.includes(data.content.internal_links[i])){
            urlDatabase.push(data.content.internal_links[i])
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
    //remove URL from waiting list
    urlWaiting.splice(urlWaiting.indexOf(data.url), 1)
    console.log("[@] Url in database: "+urlDatabase.length)
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