let errored = []

let configdata = JSON.parse(Deno.readTextFileSync("config.json"));

const master = "http://"+configdata.dbhost+":7536"

async function main(){
    while(true){
        //crawl website
        let _LINK = await getUrlToCrawl();

        console.log(`Fetching: ${_LINK}`)
        //let tmpData = await fetch(_LINK);
        let tmpData = await execute(`node request.js ${_LINK} text/html`);
        try{
            let data = tmpData
            let breaked = false;
            if(data.endsWith("__noctype__") ){
                //this is a media
                breaked = true;
                if(data.includes('<html') && data.includes('<head') && data.includes('<body')){
                    breaked = false;
                }
                ///upload me to media
            } 

            if(!breaked){
                let pictureURL = getAllPictureLinks(data, _LINK);
                let websiteURL = getAllWebsiteLinks(data);
                let videoURL = getVideoData(data, _LINK);
                let pageTitre = getPageTitre(data);
                console.log(`Found ${pictureURL.length} pictures, ${websiteURL.length} websites url and ${videoURL.length} video sources`)
                let json = {
                    link: _LINK,
                    title: pageTitre
                }
                
                //save all data
                addDomainToDatabase(getDomain(_LINK))
                addToDatabase(json)

                //save all new URL
                for(let i = 0; i < websiteURL.length; i++){
                    if(websiteURL[i].isAOnionLink){
                        addLink(websiteURL[i].link);
                    }
                }

                //save all new picture
                for(let i = 0; i < pictureURL.length; i++){
                    let newObj = {
                        link: pictureURL[i],
                        name: genNameFromURL(pictureURL[i]),
                        ext: getExtention(pictureURL[i]),
                        type: "picture"
                    }
                    await addMedia(newObj);
                }

                //save all new video
                for(let i = 0; i < videoURL.length; i++){
                    let newObj = {
                        link: videoURL[i],
                        name: genNameFromURL(videoURL[i]),
                        ext: getExtention(videoURL[i]),
                        type: "video"
                    }
                    await addMedia(newObj);
                }
            }
            
        } catch(err){
            console.log(err)
            errored.push(_LINK)
            //remove from database
        }
    }
}

function genNameFromURL(url){
    let last = url.split('/')[url.split('/').length - 1];
    let name = last.split('.')[0];
    name = name.replace(/[_-]/g, " ")
    return name;
}

function getExtention(url){
    return url.split(".")[url.split(".").length - 1];
}

function getPageTitre(data){
    let regex = /<title>(.*?)<\/title>/g;
    let match = regex.exec(data);
    if(match){
        return match[1];
    }
    return "";
}

function getAllPictureLinks(data, domain){
    let links = [];
    let regex = /<img[^>]+src="([^">]+)"/g;
    let match;
    while(match = regex.exec(data)){
        if(match[1].startsWith("http")){
            links.push(match[1]);
        } else {
            links.push(domain + match[1]);
        }
    }
    return links;
}

function getVideoData(data, domain){
    let array = []
    array = getAllVideoLinks(data, domain);
    let tmp = getAllTheVideoSources(data, domain);
    for(let i = 0; i < tmp.length; i++){
        array.push(tmp[i]);
    }
    return array;
}

function getAllVideoLinks(data, domain){
    let links = [];
    let regex = /<video[^>]+src="([^">]+)"/g;
    let match;
    while(match = regex.exec(data)){
        if(match[1].startsWith("http")){
            links.push(match[1]);
        } else {
            links.push(domain + match[1]);
        }
    }
    return links;
}

function getAllTheVideoSources(data, domain){
    let links = [];
    let regex = /<source[^>]+src="([^">]+)"/g;
    let match;
    while(match = regex.exec(data)){
        if(match[1].startsWith("http")){
            links.push(match[1]);
        } else {
            links.push(domain + match[1]);
        }
    }
    return links;
}

function getAllWebsiteLinks(data){
    let links = [];
    let regex = /<a[^>]+href="([^">]+)"/g;
    let match;
    while(match = regex.exec(data)){
        if(match[1].startsWith("http")){
            links.push({
                link: match[1],
                domain: formatLink(getDomain(match[1])),
                isAOnionLink: isAOnionLink(formatLink(match[1]))
            });
        }
    }
    return links;
}

function formatLink(link){
    if(link.startsWith("http")){
        return link;
    }
    return "http://" + link;
}


function isAOnionLink(link){
    if(link.startsWith("http://") || link.startsWith("https://")){
        let domainString = getDomain(link);
        if(domainString.endsWith("onion")){
            if(domainString.length > 22){
                return true;
            }
        }
    }
    return false
}

function getDomain(link){
    return link.split("://")[1].split("/")[0];
}


async function execute(commande: any) {
    try{
        var content = "";
        var comcmd = commande.split(' ')
        var p = Deno.run({cmd: comcmd,stdout: "piped"});
        var { code } = await p.status();
        if (code === 0) {
            var rawOutput = await p.output();
            content = new TextDecoder().decode(rawOutput);
          } else {
            var rawError = await p.stderrOutput();
            var errorString = new TextDecoder().decode(rawError);
          }
          return content
    } catch(err){
        return "error"
    }
    
}

//SQL PART
async function getUrlToCrawl(){
    try{
        let data = await fetch(master+"/getLastDomain")
        let json = await data.json();
        deleteDomainToFetch(json[0].url)
        return json[0].url;
    } catch(err){
        console.log(err)
    }
    return "nope"
}

async function deleteDomainToFetch(link){
    try{
        await fetch(master+"/delFT", {
            method: "POST",
            body: link
        })
    } catch(err){
        console.log(err)
    }
}


async function addLink(link){
    try{
        let options = {
            method: "POST",
            body: link
        }
        await fetch(master+"/addChecking", options)
    } catch(err){}
}


async function addMedia(media){
    try{
        await fetch(master+"/addMedia", {
            method: "POST",
            body: JSON.stringify({
                link: media.link,
                name: media.name,
                type: media.type,
                ext: media.ext
            })
        })
    } catch(err){
        console.log(err)
    }
}


async function addDomainToDatabase(url){
    try{
        await fetch(master+"/addDomain", {
            method: "POST",
            body: url
        })
    } catch(err){
        console.log(err)
    }
}

async function addToDatabase(data){
    try{
        await fetch(master+"/addLink", {
            method: "POST",
            body: JSON.stringify(data)
        })
    } catch(err){
        console.log(err)
    }
}

setInterval(()=>{
    Deno.writeTextFileSync("errored.json", JSON.stringify(errored))
}, 1000*60)

main()
