import * as ink from 'https://deno.land/x/ink/mod.ts'
import { show } from '../../../../../../utils/show.ts'
import { utils } from '../../../../../../utils/utils.ts'
const _show = new show()
const _utils = new utils()

export async function main(){
    _show.log("Agentina | Comision Nacional de Valores")
    _show.log("available here: https://www.argentina.gob.ar/cnv\n")
    let str = `[${ink.colorize("<yellow>1</yellow>")}] - Get infos on capital market agents \n[${ink.colorize("<yellow>@</yellow>")}] - Exit \n`
    console.log(str)

    let rep = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] your choice"))
    if(rep == "1"){
        await getBusinessInfos()
    } else if(rep == "@"){
        return
    }
    await main()
}

async function getBusinessInfos() {
    //get business name
    let name = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] the name"))
    let t:any[] = []
    try {
        let req = await fetch('https://thingproxy.freeboard.io/fetch/https://www.cnv.gov.ar/SitioWeb/BuscadorGlobal/DataTableBuscadorGlobal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Accept': 'application/json, text/plain, */*',
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36"
            },
            body: JSON.stringify({
                "draw": 5,
                "gRecaptchaResponse": "",
                "length": 1000,
                "search": {
                    "regex": "",
                    "value": name
                }
            })
        })
        let data = await req.json()
        t = data.data
    } catch(err){
        console.log(err)
        _show.log("Error, exiting")
        return
    }

    if(t.length == 0){
        _show.log("No results found")
    } else {
        for(let i = 0; i < t.length; i++){
            _show.log(`${ink.colorize("<yellow>"+t[i].Denominacion+"</yellow>")}`)
            _show.log(`IDFiscal: ${ink.colorize("<green>"+t[i].IDFiscal+"</green>")}`)
            _show.log(`Category: ${t[i].Categoria}`)
            _show.log(`Detail ${ink.colorize("<blue>"+t[i].Url+"</blue>")}\n`)
        }
    }
}