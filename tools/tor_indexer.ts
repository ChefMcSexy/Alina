import { Tor } from "https://deno.land/x/tor@0.0.3.9/mod.ts"
//import { Tor } from "../../../tor/mod.ts"
import { show } from '../utils/show.ts'
import { utils } from '../utils/utils.ts'
const _show = new show()
const _utils = new utils()
const _tor = new Tor()

import { check } from './tests/check.ts'
const _check = new check()

export class TorIndexer {
    // this is the tor indexer system
    async main(){
        //first the tor indexer spoiler alert
        _show.showTorDisclamer()
        let disclamerrep = await _utils.listenUserResponse(_show.input("Do you accept the disclaimer? (y/N)"))
        if(disclamerrep.toLowerCase() == "y"){
            await this.initTorIndexer()
        } else {
            console.log("Exiting Tor Indexer...")
        }
    }


    private async initTorIndexer(){
        await _check.check_internet_connection(true)
        await _check.check_torProxy_is_online(true)
        //create the database file
        _utils.createDatabaseDir()

        await this.userConfManagement()
    }

    private async userConfManagement(){
        /*
        Config are stored like this: 
        {
            "hostname": "",
            "port": "",
            "headers_key": "",
            "headers_name": "",
        }
        */

        let data = null
        try{
            data = JSON.parse(Deno.readTextFileSync('./db/indexer.json'))
        } catch(err){}
        console.log(Deno.readTextFileSync('./art/tor.ascii'))
        _show.log("Please note that your alina server must be running for the following tests to work (./server/tor_indexer.ts)")
        
        let askUserConf = true
        if(data != null){
            //ask user if the configuration is correct
            _show.infos('Your local configuration is:')
            _show.infos(`Hostname: ${data.hostname}`)
            _show.infos(`Port: ${data.port}`)
            _show.infos(`Headers name: ${data.headers_name}`)
            _show.infos(`Headers Key: ${data.headers_key}`)
            let userConfValid = await _utils.listenUserResponse("Is this configuration correct? (Y/n)")
            if(userConfValid.toLowerCase() == "y" || userConfValid.toLowerCase() == "yes" || userConfValid.toLowerCase() == ""){
                askUserConf = false
            }
        } else {
            _show.log("No local configuration found, please enter your configuration")
        }

        if(askUserConf){
            data = await this.askUserConf() 
        }

        //save the configuration
        Deno.writeTextFileSync('./db/indexer.json', JSON.stringify(data))

        _show.log('Configuration is saved / launching the indexer')
        let threadCount = await this.selectThread()

        for(let i = 0; i < threadCount-1; i++){
            this.launch(data, i)
        }
        await this.launch(data, threadCount-1)
    }


    private async selectThread(){
        let thread = await _utils.listenUserResponse(_show.input("Enter the thread you want (empty = 1)"))
        if(thread == ""){
            return 1
        } else {
            try{
                let threadCount = parseInt(thread)
                if(threadCount > 0){
                    return threadCount
                } else {
                    return await this.selectThread()
                }
            } catch(err){
                _show.error("Please enter a valid thread number")
                return await this.selectThread()
            }
        }
    }

    private async askUserConf(){
        //need hostname, port, headers_key
        let hostname = await _utils.listenUserResponse(_show.input("Please enter your Alina server hostname"))
        let port = await _utils.listenUserResponse(_show.input("Enter the port of the server (empty for default)"))
        let headers_name = await _utils.listenUserResponse(_show.input("Enter the headers name of the server"))
        let headers_key = await _utils.listenUserResponse(_show.input("Enter the headers key of the server"))
        let conf = {
            "hostname": hostname,
            "port": port,
            "headers_name": headers_name,
            "headers_key": headers_key
        }
        if(!await this.checkUserConf(conf)){
            _show.error("Your configuration is not valid, please try again\n")
            return await this.askUserConf()
        } else {
            return conf
        }
    }

    private async checkUserConf(conf){
        return _check.checkUserIndexerConf(false, conf)
    }

    /////// INDEXER ///////
    
    //todo: thread
    
    private async launch(conf, thread){
        /*
            The indexer client do: 
            1. contact the server for link to scrawl
            2. scrawl the link
            3. return title, meta, description, keywords, internal links, external links, paragraphs and title content, images links
            4. send the data to the server
            5. go to 1.
        */
        let workingURL = await this.getWork(conf, true)
        _show.torindexerlog(`${thread} : Starting : ${workingURL}`)
        let pageContent = await this.getTorPage(workingURL)
        let repport = await this.createPageRepport(pageContent, workingURL)
        await this.sendReport(repport, conf)
        _show.torindexerlog(`${thread} : DONE : ${workingURL}`)
        //wait 5 sec
        await new Promise(resolve => setTimeout(resolve, 2000))
        await this.launch(conf, thread)
    }

    private async sendReport(report, conf){
        try{
            if(!conf.hostname.startsWith("http")){
                conf.hostname = "http://" + conf.hostname
            }
            if(conf.port != "" && !conf.port.startsWith(':')){
                conf.port = ":" + conf.port
            }
            await fetch(`${conf.hostname}${conf.port}/push`, {
                method: 'POST',
                headers: {
                    [conf.headers_name]: conf.headers_key
                },
                body: JSON.stringify(report)
            })
        } catch(err){
            console.log(err)
            await new Promise(resolve => setTimeout(resolve, 30000))
        }
    }

    private async getWork(conf, first){
        let res = null
        try {
            if(first){
                if(!conf.hostname.startsWith("http")){
                    conf.hostname = "http://" + conf.hostname
                }
                if(conf.port != "" && !conf.port.startsWith(':')){
                    conf.port = ":" + conf.port
                }
            }
            res = await fetch(`${conf.hostname}${conf.port}/api/ask`, {
                method: 'GET',
                headers: {
                    [conf.headers_name]: conf.headers_key
                }
            })
            let response = await res.json()
            res = response.url
        } catch(err){
            console.log(err)
        }
        
        if(res == null || res == "none"){
            //wait for a while and try again
            _show.torindexerlog("No work found, waiting for a while")
            await new Promise(r => setTimeout(r, 5000))
            return await this.getWork(conf, false)
        } else {
            return res
        }
    }

    private async getTorPage(url){
        return await _tor.get(url)
    }

    private async createPageRepport(content, url){
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
                    base.content.paragraphs.push(paragraph)
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
    
                        base.images.push({
                            "url": url+image.replace('/', ''),
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
    
                        base.videos.push({
                            "url": url+video.replace('/', ''),
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
        

        // same for email based on ^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$
        try{
            let email = content.match(/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*/g)
            for(let i = 0; i < email.length; i++){
                base.email.push(email[i])
            }
        } catch(err){}

        //create an entry parser for bautiful json
        try{
            for(let i = 0; i < base.content.paragraphs.length; i++){
                base.content.paragraphs[i] = this.cleanString(base.content.paragraphs[i])
            }
            for(let i = 0; i < base.content.title.length; i++){
                base.content.title[i] = this.cleanString(base.content.title[i])
            }
            base.title = this.cleanString(base.title)
        } catch(err){}

        //Done with the page, check JSON
        return base
    }

    private cleanString(string){
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
}