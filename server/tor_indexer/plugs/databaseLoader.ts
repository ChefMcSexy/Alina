import { search } from "./search.ts";

const _search = new search();

export async function loadDatabase(urlDatabase) {
    //we need to get all the data from the database
    console.log("[+] Database Start loaded at "+new Date().toLocaleString())
    let letterDispo = await exploreDirSimple('./db/data/')
    let tmpDomainList = []
    let tmpDB = []
    
    //sort the letter
    letterDispo.sort()

    for(let i = 0; i < letterDispo.length; i++){
        let letter = letterDispo[i]
        let letterDir = await exploreDirSimple('./db/data/'+letter+"/")
        console.log("[+] Loading letter "+letter+" ("+i+"/"+letterDispo.length+") with "+letterDir.length+" domains")
        for(let j = 0; j < letterDir.length; j++){
            try{
                let domain = letterDir[j]
                //console.log("[-] Loading: "+domain)
                tmpDomainList.push("./db/data/"+domain.split('')[0]+"/"+domain)
                let dinfo = JSON.parse(Deno.readTextFileSync("./db/data/"+domain.split('')[0]+"/"+domain+"/infos.json"))
                tmpDB.push({
                    domain: domain,
                    crypto: [],//JSON.parse(Deno.readTextFileSync("./db/data/"+domain.split('')[0]+"/"+domain+"/crypto.json")),
                    url: dinfo.url,
                    content: JSON.parse(Deno.readTextFileSync("./db/data/"+domain.split('')[0]+"/"+domain+"/content/full.json")),
                    images: JSON.parse(Deno.readTextFileSync("./db/data/"+domain.split('')[0]+"/"+domain+"/images/full.json")),
                    videos: JSON.parse(Deno.readTextFileSync("./db/data/"+domain.split('')[0]+"/"+domain+"/videos/full.json")),
                    email: dinfo.email
                })
            } catch(err){}
        }
    }
    console.log("[+] Fetching multiples urls")
    //we need to detect the URL duplications
    for(let i = 0; i < tmpDB.length; i++){
        for(let j = 0; j < tmpDB[i].content.length; j++){
            if(tmpDB[i].content[j].title.toLowerCase().includes("")){
                //console.log('got '+tmpDB[i].content[j].title)
                if(tmpDB[i].content[j].title.length > 0){
                    //get all the page with the same title
                    let sameTitle = await _search.db_searchViaTitle(tmpDB[i].content[j].title,tmpDB)
                    
                    //OKAY so now we check if the paragraph are the same
                    //ok we need to delete all the same title where the url domain name is the same
                    let tmpSameTitle = []
                    for(let k = 0; k < sameTitle.length; k++){
                        if(sameTitle[k].domain != undefined && sameTitle[k].domain != tmpDB[i].domain && sameTitle[k].domain.length > 0){
                            tmpSameTitle.push(sameTitle[k])
                        }
                    }
                    sameTitle = tmpSameTitle

                    //console.log("[+] Found "+sameTitle.length+" with title included '"+tmpDB[i].content[j].title+"'")

                    if(tmpDB[i].content[j] != undefined){
                        for(let k = 0; k < sameTitle.length; k++){
                            if(sameTitle[k].bypass){
                                console.log("[+] Bypassing "+sameTitle[k].url + " because it's same that "+tmpDB[i].content[j].url)
                            } else {
                                let same = false
                                if(sameTitle[k].paragraphs.length > 2){
                                    if(sameTitle[k].paragraphs.length == tmpDB[i].content[j].paragraphs.length){
                                        same = true
                                        for(let l = 0; l < sameTitle[k].paragraphs.length; l++){
                                            if(sameTitle[k].paragraphs[l] != tmpDB[i].content[j].paragraphs[l]){
                                                same = false
                                            }
                                        }

                                        //in this case need to check the URL are same.
                                        // for exemple: / = / | /search?q= = /search?q= | /search?q=bhguyhkjbh != /search?q=ijuh
                                        let tmpURL1 = tmpDB[i].content[j].url.split('.onion/')[1]
                                        let tmpURL2 = sameTitle[k].url.split('.onion/')[1]
                                        if(tmpURL1 != tmpURL2){
                                            same = false
                                        }

                                        //check internal and external links array are same
                                        if((tmpDB[i].content[j].external.length == sameTitle[k].external.length) && (tmpDB[i].content[j].internal.length == sameTitle[k].internal.length) && same){
                                            same = false
                                        }

                                        
                                    }
                                }
                                
                                if(sameTitle[k].internal.length > 1){
                                    if(sameTitle[k].title == tmpDB[i].content[j].title && sameTitle[k].url == tmpDB[i].content[j].url){
                                        let n = true
                                        for(let l = 0; l < sameTitle[k].internal.length; l++){
                                            if(sameTitle[k].internal[l] != tmpDB[i].content[j].internal[l] && sameTitle[k].internal[l] != ""){
                                                n = false
                                            }
                                        }
                                        if(n){
                                            same = true
                                        }
                                    }
                                }

                                if(same){
                                    //console.log("[+] Found same url: "+tmpDB[i].content[j].url+" and "+sameTitle[k].url)
                                    try{
                                        sameTitle[k].domain = sameTitle[k].url.split('://')[1].split('.onion')[0]+".onion"
                                        // I need to move the file content in the ./db/bin/
                                        let dir = "./db/bin/"+sameTitle[k].domain.split('')[0]+"/"+sameTitle[k].domain+"/"
                                        Deno.mkdirSync("./db/bin/"+sameTitle[k].domain.split('')[0], { recursive: true })
    
                                        //move the dir
                                        let p = await Deno.run({
                                            cmd: ["mv", "./db/data/"+sameTitle[k].domain.split('')[0]+"/"+sameTitle[k].domain, dir],
                                            stdout: "piped",
                                            stderr: "piped"
                                        })
                                        await p.status()
                                        
                                        Deno.writeTextFileSync(dir+"multiple", tmpDB[i].content[j].url)
                                        
                                        let newURLDATABASE = []
                                        for(let e = 0; e < urlDatabase.length; e++){
                                            if(!urlDatabase[e].startsWith(sameTitle[k].url)){
                                                newURLDATABASE.push(urlDatabase[e])
                                            }
                                        }
                                        urlDatabase = newURLDATABASE
    
                                        //remove tmpDB[i].domain form tmpDB
                                        sameTitle[k].bypass = true
                                    } catch(err){}
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    tmpDB = tmpDB.filter(x => !x.bypass)
    let urlCounter = 0
    let imageCounter = 0
    let videoCounter = 0
    for(let i = 0; i < tmpDB.length; i++){
        urlCounter += tmpDB[i].content.length
        imageCounter += tmpDB[i].images.length
        videoCounter += tmpDB[i].videos.length
    }
    console.log("[@] Domains: "+tmpDB.length)
    console.log("[@] URLs: "+urlCounter)
    console.log("[@] Images: "+imageCounter)
    console.log("[@] Videos: "+videoCounter)
    console.log("[+] Database END loaded at "+new Date().toLocaleString())
    return tmpDB
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