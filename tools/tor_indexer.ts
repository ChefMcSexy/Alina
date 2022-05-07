import { Tor } from "https://deno.land/x/tor@0.0.3.9/mod.ts"
//import { Tor } from "../../../tor/mod.ts"
import { show } from '../utils/show.ts'
import { utils } from '../utils/utils.ts'
const _show = new show()
const _utils = new utils()
const _tor = new Tor()

import { createPageRepport } from './tor_indexer/pageReport.ts'

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
        let repport = await createPageRepport(pageContent, workingURL)
        await this.sendReport(repport, conf)
        _show.torindexerlog(`${thread} : DONE : ${workingURL}`)
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
}