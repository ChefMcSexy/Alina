import * as ink from 'https://deno.land/x/ink/mod.ts'
import { show } from '../../../../../../utils/show.ts'
import { utils } from '../../../../../../utils/utils.ts'
const _show = new show()
const _utils = new utils()

export async function main(){
    _show.log("Antigua and Barbuda Intellectual Property & Commerce | ABIPCO")
    _show.log("available here: https://abipco.gov.ag/about-us/\n")
    let str = `[${ink.colorize("<yellow>1</yellow>")}] - Get business infos \n[${ink.colorize("<yellow>@</yellow>")}] - Exit \n`
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
    let name = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] the business name"))
    let t:any[] = []
    try {
        let req = await fetch('https://thingproxy.freeboard.io/fetch/https://abipco.gov.ag/api/1.0/services/loadInfoProc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Accept': 'application/json, text/plain, */*',
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36"
            },
            body: JSON.stringify({
                "input":"key=0,query="+name,
                "name":"EntitySearch"
            })
        })
        let data = await req.json()
        t = data.rows
    } catch(err){
        console.log(err)
        _show.log("Error, exiting")
        return
    }

    if(t.length == 0){
        _show.log("No results found")
    } else {
        for(let i = 0; i < t.length; i++){
            _show.log(`${ink.colorize("<yellow>["+t[i].EntityID+"]</yellow>")} - ${t[i].EntityName} | ${t[i].EntityNumber}`)
            _show.log(`Creation date ${ink.colorize("<green>"+t[i].DateOfIncorporation+"</green>")} | Active ${t[i].StatusName == "Active" ? ink.colorize("<green>Yes</green>") : ink.colorize("<red>No</red>")}`)
            _show.log(`Entreprise Type ${t[i].TypeName.split("\n")[0]}`)
            _show.log(`Entreprise address ${ink.colorize("<blue>"+t[i].PrincipalOfficeAddress+"</blue>")}\n`)
        }
    }
}