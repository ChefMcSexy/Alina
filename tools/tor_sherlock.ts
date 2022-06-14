import { show } from '../utils/show.ts'
import { utils } from '../utils/utils.ts'
const _utils = new utils()
const _show = new show()

import * as ink from 'https://deno.land/x/ink/mod.ts'
import { check } from './tests/check.ts'
const _check = new check()

import { tor_sherlock__functions } from './tor_sherlock/functions.ts'
import { validator } from '../utils/validator.ts'
const _me = new tor_sherlock__functions()

export class TorSherlock {
    // this is the tor sherlock system

    async init(){
        console.log()
        _show.log("Initializing Tor🧄 Sherlock...")
        await this.testCompatibility()
        this.main()
    }

    async main(){
        _me.showMenu()
        console.log("This part is currently under construction, please wait for the next update.")
        let choice = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] your choice"))

        if (choice == "1") {
            _show.log("Starting solo mode...")
            this.solo()
        } else if(choice == "2"){

        } else if(choice == "@"){
            console.log("Bye 👋")
            Deno.exit(0);
        } else if(choice == "?"){
            _me.showHelp()
            this.main()
        }
    }


    async testCompatibility(){
        //check if user as the required software and access
        await _check.check_internet_connection(true)
    }


    private async solo(){
        //ask user for custom IPs list
        _show.log("Please enter the path to your custom IPs list")
        let custom_ips = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] path"))

        let ips:any[] = []
        if(custom_ips != ""){
            try{
                let tmpList = Deno.readTextFileSync(custom_ips).split('\n')
                if(_utils.checkIps(tmpList)){
                    ips = tmpList
                } else {
                    _show.log("The file you provided is contian invalid IPs, please check it and try again.")
                    this.solo()
                }
            } catch(e){
                _show.log("Error while reading the file, please check the path and try again.")
                this.main()
            }
        } else {
            _show.log("Please enter the file path")
            this.solo()
            return;
        }
        console.log()
        _show.log('Ips list contains ' + ips.length + ' IPs.')
        
        let onionURL = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] onion URL"))
        let verboseAsk = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] verbose mode (Y/n)"))
        //the verbose question
        let verbose = true
        if(verboseAsk.toLowerCase() == "n"){
            verbose = false
        }

        let homeContent = await _me.getPageContent(onionURL);

        if(onionURL.startsWith("http://") || onionURL.startsWith("https://")){
            onionURL = onionURL.replace("http://", "").replace("https://", "")
        }
        

        this.scan(ips, onionURL, homeContent, verbose)
    }


    private async scan(ips:string[], hostname:string, homeContent:string, verbose:boolean){
        homeContent = homeContent.toLowerCase().split('<title>')[1].split('</title>')[0]
        for(let i = 0; i<ips.length; i++){
            if(ips[i] != ""){
                let requestVal
                if(verbose){
                    requestVal = new validator("Checking " + ips[i] + "... ")
                }
                try{

                    let content = await _me.getPage(ips[i], hostname)
                    content = content?.toLowerCase().split('<title>')[1].split('</title>')[0] || ""
                    
                    //console.log(content)
                    if(content == homeContent){
                        console.log()
                        _show.log(`[<red>+ALERT+</red>] ${ips[i]} is hosting the website !`)
                    } else {
                        if(verbose && requestVal != undefined){
                            requestVal.custom_validate("[SAFE]")
                        }
                    }
                } catch(err){
                    if(verbose && requestVal != undefined){
                        requestVal.custom_fail("[ERROR]")
                    }
                }
            }
        }
        _show.log("Scan finished.\n")
        setTimeout(() => {
            this.main()
        }, 1000)
    }

}