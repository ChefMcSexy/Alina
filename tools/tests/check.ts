import { validator } from '../../utils/validator.ts'
import {Tor} from "https://deno.land/x/tor@0.0.3.2/mod.ts"
const _tor = new Tor()

export class check {

    async check_internet_connection(fatal:boolean) {
        let checkInternet = new validator("Checking internet connection...")
        try {
            await fetch("https://live-hack.org/")
            checkInternet.validate()
            return;
        } catch(err){}
        await checkInternet.fail(fatal)
    }

    async check_torProxy_is_online(fatal){
        let checkTorProxy = new validator("Checking Tor proxy is online... ")
        try {
            let testing = await _tor.checkProxyIsOnline(false, false)
            if(testing){
                checkTorProxy.validate()
                return;
            }
        } catch(err){}
        await checkTorProxy.fail(fatal)
    }

    async checkUserIndexerConf(fatal:boolean, data:any){
        let checkConf = new validator("Checking user indexer configuration... ")
        try{
            let req
            let h = new Headers()
            h.set(data.headers_name, data.headers_key)
            if(!data.hostname.startsWith("http")){
                data.hostname = "http://" + data.hostname
            }
            if(data.port == ""){
                req = await fetch(`${data.hostname}/api/v1/indexer/status`, {
                    method: "GET",
                    headers: h
                })
            } else {
                req = await fetch(`${data.hostname}:${data.port}/api/v1/indexer/status`, {
                    method: "GET",
                    headers: h
                })
            }
            let rep = await req.json()
            if(rep.status == "online"){
                checkConf.validate()
                return true;
            }
        } catch(err){}
        await checkConf.fail(fatal)
        return false;
    }

}