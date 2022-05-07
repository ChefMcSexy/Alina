export async function createPageRepport(content, url){
    let domain
    try{
        domain = url.split("://")[1].split("/")[0]
    } catch(err) {
        return null
    }

    
    let base = {
        "url": url,
        "title": "",
        "meta": {
            "description": "",
            "keywords": "",
            "author": "",
            "robots": "",
            "referrer": ""
        },
        "content": {
            "paragraphs": [],
            "title": [],
            "internal_links": [],
            "external_links": []
        },
        "images": [],
        "videos": [],
        "email": [],
        "cryptocurrencies": []
    }
    /**
        Images and videos format: 
        {
            "url": "",
            "title": "",
            "alt": "",
            "id": "",
            "name": ""
            "type": ""
        }

        Cryptocurrencies format:
        {
            "name": "",
            "addr": "",
        }
    */

    // Step 1: get the title
    if(content.includes("<title>")){
        base.title = content.split("<title>")[1].split("</title>")[0]
    }


    // Step 2: get the meta
    try{
        if(content.includes("<meta name=\'description\'")){
            base.meta.description = content.split("<meta name=\'description\'")[1].split("content=")[1].replace('/>', ">").split(">")[0].replace(/\"/g, "").replace(/\'/g, "")
        } else if(content.includes("<meta name=\"description\"")){
            base.meta.description = content.split("<meta name=\"description\"")[1].split("content=")[1].replace('/>', ">").split(">")[0].replace(/\"/g, "").replace(/\'/g, "")
        }

        if(content.includes("<meta name=\'keywords\'")){
            base.meta.keywords = content.split("<meta name=\'keywords\'")[1].split("content=")[1].replace('/>', ">").split(">")[0].replace(/\"/g, "").replace(/\'/g, "")
        } else if(content.includes("<meta name=\"keywords\"")){
            base.meta.keywords = content.split("<meta name=\"keywords\"")[1].split("content=")[1].replace('/>', ">").split(">")[0].replace(/\"/g, "").replace(/\'/g, "")
        }

        if(content.includes("<meta name=\'author\'")){
            base.meta.author = content.split("<meta name=\'author\'")[1].split("content=")[1].replace('/>', ">").split(">")[0].replace(/\"/g, "").replace(/\'/g, "")
        } else if(content.includes("<meta name=\"author\"")){
            base.meta.author = content.split("<meta name=\"author\"")[1].split("content=")[1].replace('/>', ">").split(">")[0].replace(/\"/g, "").replace(/\'/g, "")
        }

        if(content.includes("<meta name=\'robots\'")){
            base.meta.robots = content.split("<meta name=\'robots\'")[1].split("content=")[1].replace('/>', ">").split(">")[0].replace(/\"/g, "").replace(/\'/g, "")
        } else if(content.includes("<meta name=\"robots\"")){
            base.meta.robots = content.split("<meta name=\"robots\"")[1].split("content=")[1].replace('/>', ">").split(">")[0].replace(/\"/g, "").replace(/\'/g, "")
        }

        if(content.includes("<meta name=\'referrer\'")){
            base.meta.referrer = content.split("<meta name=\'referrer\'")[1].split("content=")[1].replace('/>', ">").split(">")[0].replace(/\"/g, "").replace(/\'/g, "")
        } else if(content.includes("<meta name=\"referrer\"")){
            base.meta.referrer = content.split("<meta name=\"referrer\"")[1].split("content=")[1].replace('/>', ">").split(">")[0].replace(/\"/g, "").replace(/\'/g, "")
        }
    } catch(err){}
    

    // Step 3: get the content
    try{
        if(content.includes("<p")){
            let paragraphs = content.split("<p")
            for(let i = 1; i < paragraphs.length; i++){
                let paragraph = paragraphs[i].split(">")[1].split("</p")[0]
                //we need to clean the paragraph
                paragraph = paragraph.replace(/\n/g, "")
                if(paragraph !== ""){
                    base.content.paragraphs.push(paragraph)
                }
            }
        }
    } catch(err){}
    

    // Step 3.2: get the title
    try{
        if(content.includes("<h1>")){
            let titles = content.split("<h1>")
            for(let i = 1; i < titles.length; i++){
                let title = titles[i].split("</h1>")[0]
                base.content.title.push(title)
            }
        }
        if(content.includes("<h2>")){
            let titles = content.split("<h2>")
            for(let i = 1; i < titles.length; i++){
                let title = titles[i].split("</h2>")[0]
                base.content.title.push(title)
            }
        }
        if(content.includes("<h3>")){
            let titles = content.split("<h3>")
            for(let i = 1; i < titles.length; i++){
                let title = titles[i].split("</h3>")[0]
                base.content.title.push(title)
            }
        }
        if(content.includes("<h4>")){
            let titles = content.split("<h4>")
            for(let i = 1; i < titles.length; i++){
                let title = titles[i].split("</h4>")[0]
                base.content.title.push(title)
            }
        }
        if(content.includes("<h5>")){
            let titles = content.split("<h5>")
            for(let i = 1; i < titles.length; i++){
                let title = titles[i].split("</h5>")[0]
                base.content.title.push(title)
            }
        }
        if(content.includes("<h6>")){
            let titles = content.split("<h6>")
            for(let i = 1; i < titles.length; i++){
                let title = titles[i].split("</h6>")[0]
                base.content.title.push(title)
            }
        }
    } catch(err){}
    

    // Step 3.3: get the internal links ./ / or URL/
    try{
        if(content.includes("href=")){
            let links = content.split("href=")
            for(let i = 1; i < links.length; i++){
                let link = links[i].split("\"")[1]
                if(link.startsWith('#')){
                    //NOTHING LOL
                } else if(link.includes(domain)){
                    base.content.internal_links.push(link)
                } else if(link.startsWith("//")){
                    //link = link.replace("//", "http://")
                    if(link.split('//')[1].includes(domain)){
                        base.content.internal_links.push("http:"+link)
                    } else {
                        if(link.split('//')[1].split('/')[0].includes(".onion")){
                            base.content.external_links.push("http:"+link)
                        } 
                    }
                } else if(link.startsWith("/")){
                    base.content.internal_links.push("http://"+domain + link)
                } else if(link.startsWith("./")){
                    base.content.internal_links.push("http://"+domain + link.replace("./", "/"))
                } else if(link.includes("../")){
                    let url = base.url.split("/")
                    url.pop()
                    url.pop()
                    url.push(link.replace("../", ""))
                    base.content.internal_links.push(url.join("/"))
                }
            }
        }
        // we need to filter the link and remove the duplicates
        let tmp = []
        for(let i = 0; i < base.content.internal_links.length; i++){
            if(!tmp.includes(base.content.internal_links[i].split('\n')[0])){
                tmp.push(base.content.internal_links[i].split('\n')[0])
            }
        }
        base.content.internal_links = tmp

        //we need to remove the http://domain.onion
        for(let i = 0; i < base.content.internal_links.length; i++){
            if(base.content.internal_links[i].includes(".onion")){
                base.content.internal_links[i] = base.content.internal_links[i].replace("http://"+domain, "")
            }
        }

        // we need to remove .css .js .ttf .ico links
        base.content.internal_links = base.content.internal_links.filter((v) => !v.includes(".css") && !v.includes(".js") && !v.includes(".ttf") && !v.includes(".ico") && !v.includes(".png") && !v.includes(".jpg") && !v.includes(".ico") && !v.includes(".webp"))

        // Step 3.4: get the external links
        if(content.includes("href=")){
            let links = content.split("href=")
            for(let i = 1; i < links.length; i++){
                let link = links[i].split("\"")[1]
                if(link.startsWith("http") && !link.includes(base.url)){
                    base.content.external_links.push(link)
                }
            }
        }
        // we need to filter the link and remove the duplicates
        tmp = []
        for(let i = 0; i < base.content.external_links.length; i++){
            if(!tmp.includes(base.content.external_links[i].split('\n')[0])){
                tmp.push(base.content.external_links[i].split('\n')[0])
            }
        }
        base.content.external_links = tmp
        // we need to remove .css .js .ttf .ico links
        base.content.external_links = base.content.external_links.filter((v) => !v.includes(".css") && !v.includes(".js") && !v.includes(".ttf") && !v.includes(".ico") && !v.includes(".png") && !v.includes(".jpg") && !v.includes(".ico") && !v.includes(".webp"))
        // only keep .onion links
        base.content.external_links = base.content.external_links.filter((v) => v.includes(".onion"))

    } catch(err){}
    
    // Step 4: get the images .jpg .png .gif .jpeg .webp
    try{
        if(content.includes("src=")){
            let images = content.split("src=")
            for(let i = 1; i < images.length; i++){
                let image = images[i].split("\"")[1]
                if(image.includes(".jpg") || image.includes(".png") || image.includes(".gif") || image.includes(".jpeg") || image.includes(".webp")){

                    let imageData = content.split("src=")[i].split(">")[0]

                    //get the alt text, the id and the name
                    let alt = ""
                    let id = ""
                    let name = ""
                    if(imageData.includes("alt=")){
                        let alts = imageData.split("alt=")
                        if(alts[1].includes("\"")){
                            alt = alts[1].split("\"")[1]
                        } else {
                            alt = alts[1]
                        }
                    }
                    if(imageData.includes("id=")){
                        let ids = imageData.split("id=")
                        if(ids[1].includes("\"")){
                            id = ids[1].split("\"")[1]
                        } else {
                            id = ids[1]
                        }
                    }
                    if(imageData.includes("name=")){
                        let names = imageData.split("id=")
                        if(names[1].includes("\"")){
                            name = names[1].split("\"")[1]
                        } else {
                            name = names[1]
                        }
                    }
                    if(!image.startsWith('http://') && !image.startsWith('https://')){
                        image = "http://"+domain + image
                    }
                    base.images.push({
                        "url": image,
                        "alt": alt,
                        "id": id,
                        "name": name,
                        "type": image.split(".")[image.split(".").length - 1]
                    })
                }
            }
        }
    } catch(err){}
    
    // Step 5: get the videos (same code that image) .mp4 .webm .ogg .ogv .avi .mov .wmv .flv .mkv
    try{
        if(content.includes("src=")){
            let videos = content.split("src=")
            for(let i = 1; i < videos.length; i++){
                let video = videos[i].split("\"")[1]
                if(video.includes(".mp4") || video.includes(".webm") || video.includes(".ogg") || video.includes(".ogv") || video.includes(".avi") || video.includes(".mov") || video.includes(".wmv") || video.includes(".flv") || video.includes(".mkv")){

                    let videoData = content.split("src=")[i].split(">")[0]

                    //get the alt text, the id and the name
                    let alt = ""
                    let id = ""
                    let name = ""
                    if(videoData.includes("alt=")){
                        let alts = videoData.split("alt=")
                        if(alts[1].includes("\"")){
                            alt = alts[1].split("\"")[1]
                        } else {
                            alt = alts[1]
                        }
                    }
                    if(videoData.includes("id=")){
                        let ids = videoData.split("id=")
                        if(ids[1].includes("\"")){
                            id = ids[1].split("\"")[1]
                        } else {
                            id = ids[1]
                        }
                    }
                    if(videoData.includes("name=")){
                        let names = videoData.split("id=")
                        if(names[1].includes("\"")){
                            name = names[1].split("\"")[1]
                        } else {
                            name = names[1]
                        }
                    }
                    if(!video.startsWith('http://') && !video.startsWith('https://')){
                        video = "http://"+domain + video
                    }
                    base.videos.push({
                        "url": video,
                        "alt": alt,
                        "id": id,
                        "name": name,
                        "type": video.split(".")[video.split(".").length - 1]
                    })
                }
            }
        }  
    } catch(err){}
       
    // Step 6: get all crypto currencies wallet
    // Step 6.1: get the bitcoin wallet based on ^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$
    try{
        let btcWallets = content.match(/[13][a-km-zA-HJ-NP-Z1-9]{25,34}/g)
        for(let i = 0; i < btcWallets.length; i++){
            let pass = false
            //check if string is not a base64
            if(content.includes('base64')){
                let base64 = content.split('base64')

                for(let j = 0; j < base64.length; j++){
                    base64[j] = base64[j].split('"')[0].split('\'')[0]
                }
                for(let j = 0; j < base64.length; j++){
                    if(base64[j].includes(btcWallets[i])){
                        pass = false
                        break
                    } else {
                        pass = true
                    }
                }
            } else {
                pass = true
            }
            if(pass){
                base.cryptocurrencies.push({
                    "name": "bitcoin",
                    "wallet": btcWallets[i]
                })
            }
        }
    } catch(err){}
    

    // Step 6.2: get the ethereum wallet based on ^0x[a-fA-F0-9]{40}$ (same code that bitcoin)
    try{
        let ethWallets = content.match(/0x[a-fA-F0-9]{40}/g)
        for(let i = 0; i < ethWallets.length; i++){
            let pass = false
            //check if string is not a base64
            if(content.includes('base64')){
                let base64 = content.split('base64')

                for(let j = 0; j < base64.length; j++){
                    base64[j] = base64[j].split('"')[0].split('\'')[0]
                }
                for(let j = 0; j < base64.length; j++){
                    if(base64[j].includes(ethWallets[i])){
                        pass = false
                        break
                    } else {
                        pass = true
                    }
                }
            } else {
                pass = true
            }
            if(pass){
                base.cryptocurrencies.push({
                    "name": "ethereum",
                    "wallet": ethWallets[i]
                })
            }
        }
    } catch(err){}
    

    //same for ripple based on ^r[rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz]{27,34}$
    try{
        let xrpWallets = content.match(/r[rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz]{27,34}/g)
        for(let i = 0; i < xrpWallets.length; i++){
            let pass = false
            //check if string is not a base64
            if(content.includes('base64')){
                let base64 = content.split('base64')

                for(let j = 0; j < base64.length; j++){
                    base64[j] = base64[j].split('"')[0].split('\'')[0]
                }
                for(let j = 0; j < base64.length; j++){
                    if(base64[j].includes(xrpWallets[i])){
                        pass = false
                        break
                    } else {
                        pass = true
                    }
                }
            } else {
                pass = true
            }
            if(pass){
                base.cryptocurrencies.push({
                    "name": "ripple",
                    "wallet": xrpWallets[i]
                })
            }
        }
    } catch(err){}
    

    //same for litecoin based on ^[LM3T4Z][a-km-zA-HJ-NP-Z1-9]{25,34}$
    try{
        let ltc = content.match(/r[rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz]{27,34}/g)
        for(let i = 0; i < ltc.length; i++){
            let pass = false
            //check if string is not a base64
            if(content.includes('base64')){
                let base64 = content.split('base64')

                for(let j = 0; j < base64.length; j++){
                    base64[j] = base64[j].split('"')[0].split('\'')[0]
                }
                for(let j = 0; j < base64.length; j++){
                    if(base64[j].includes(ltc[i])){
                        pass = false
                        break
                    } else {
                        pass = true
                    }
                }
            } else {
                pass = true
            }
            if(pass){
                base.cryptocurrencies.push({
                    "name": "litecoin",
                    "wallet": ltc[i]
                })
            }
        }

    } catch(err){}
    
    // same for monero based on ^4[0-9AB][a-km-zA-HJ-NP-Z1-9]{25,34}$
    try{
        let xmr = content.match(/r[rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz]{27,34}/g)
        for(let i = 0; i < xmr.length; i++){
            let pass = false
            //check if string is not a base64
            if(content.includes('base64')){
                let base64 = content.split('base64')

                for(let j = 0; j < base64.length; j++){
                    base64[j] = base64[j].split('"')[0].split('\'')[0]
                }
                for(let j = 0; j < base64.length; j++){
                    if(base64[j].includes(xmr[i])){
                        pass = false
                        break
                    } else {
                        pass = true
                    }
                }
            } else {
                pass = true
            }
            if(pass){
                base.cryptocurrencies.push({
                    "name": "litecoin",
                    "wallet": xmr[i]
                })
            }
        }
    } catch(err){}
    

    // same for email based on [0-9A-Za-z]{0,61}@[0-9A-Za-z-]{2,61}\.[0-9A-Za-z]{2,6}
    try{
        let email = content.match(/[0-9A-Za-z]{0,61}@[0-9A-Za-z-]{2,61}\.[0-9A-Za-z]{2,6}/g)
        for(let i = 0; i < email.length; i++){
            base.email.push(email[i])
        }
    } catch(err){}

    //create an entry parser for bautiful json
    try{
        let tmpParagraph = []
        for(let i = 0; i < base.content.paragraphs.length; i++){
            let tmp = cleanString(base.content.paragraphs[i])
            if(tmp != ""){
                tmpParagraph.push(tmp)
            }
        }
        base.content.paragraphs = tmpParagraph
        for(let i = 0; i < base.content.title.length; i++){
            base.content.title[i] = cleanString(base.content.title[i])
        }
        base.title = cleanString(base.title)
    } catch(err){}

    //Done with the page, check JSON
    return base
}

function cleanString(string){
    //remove all the spaces
    while(string.includes("  ")){
        string = string.replace("  ", " ")
    }
    while(string.includes("\n")){
        string = string.replace("\n", "")
    }
    while(string.includes("\t")){
        string = string.replace("\t", "")
    }
    while(string.includes("\r")){
        string = string.replace("\r", "")
    }
    while(string.startsWith(' ')){
        string = string.substring(1)
    }
    while(string.endsWith(' ')){
        string = string.substring(0, string.length - 1)
    }
    while(string.includes('<') && string.includes('>')){
        string = string.split('<')[0]+string.split('>')[1]
    }
    while(string.includes('<') ){
        string = string.split('<')[0]
        if(string.split('>')[1] != undefined){
            string = string.split('>')[1]
        }
    }
    while(string.includes('<') ){
        string = string.split('>')[0]
    }
    return string
}