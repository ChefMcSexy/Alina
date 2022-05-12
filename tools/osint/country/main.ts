import * as ink from 'https://deno.land/x/ink/mod.ts'
import { show } from '../../../utils/show.ts'
import { utils } from '../../../utils/utils.ts'
const _show = new show()
const _utils = new utils()


export class Osint_country {
    private db = []
    constructor(){
        this.db = JSON.parse(Deno.readTextFileSync("./tools/osint/country/db/list.json"))
    }

    async main(){
        let country = await this.getCountry()
        if(country != null){
            console.clear()
            _show.showWelcome()
            _show.log(`You selected ${ink.colorize("<green>"+country+"</green>")}`)
            let m = await this.loadModulesFromCountry(country)
            _show.log(`${m.length} modules available`)
            let str = ""
            for(let i = 0; i < m.length; i++){
                str += `[${ink.colorize("<yellow>"+i+"</yellow>")}] - ${m[i].name}\n`
            }
            console.log(str)
            _show.log("Enter the number of the module you want or @ for exit")
            let rep = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] your choice"))
            if(rep == "@"){
                return
            } else {
                try{
                    rep = parseInt(rep)
                    let mod = m.find(m => m.i == rep)
                    if(mod != undefined){
                        await mod.mod.main()
                    } else {
                        _show.log("Module not found")
                    }
                } catch(err){
                    _show.log("Fatal error")
                }
            }
        } else {
            _show.log("Exiting...")
            return
        }
        await this.main()
    }


    //general management
    private async getCountry(){
        _show.log("+-------------------------------------------------------+")
        _show.log(`There are ${ink.colorize("<green>"+this.db.length+"</green>")} countries available`)
        _show.log(`Enter the country name or code that you want`)
        let rep = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] search"))
        if(rep == "@"){
            return null
        } else {
            rep = rep.toLowerCase()
            let country = (this.db.filter(c => c.name.toLowerCase().includes(rep) || c.code.toLowerCase() == rep)).slice(0, 10)
            if(country.length > 0){
                let c = await this.selectCountry(country)
                if(c == "none"){
                    return await this.getCountry()
                } else {
                    return c
                }
            } else {
                _show.log("Country not found")
                return await this.getCountry()
            }
        }
    }

    private async selectCountry(list){
        for(let i = 0; i < list.length; i++){
            _show.log(`${ink.colorize("[<blue>"+list[i].code+"</blue>]")} - ${list[i].name}`)
        }
        _show.log("Enter the code of the country you want")
        let rep = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] your choice"))
        if(list.filter(c => c.code.toLowerCase() == rep.toLowerCase()).length == 1){
            return (list.filter(c => c.code.toLowerCase() == rep.toLowerCase()))[0].name
        } else {
            _show.log("Country not found")
            return "none"
        }
    }



    //tools
    private async loadModulesFromCountry(country){
        let m = []
        let list = await this.exploreDirSimple(`./tools/osint/country/tools/${country}/`)
        for(let i = 0; i < list.length; i++){
            try{
                m.push({
                    "country": country,
                    "i": i,
                    "name": Deno.readTextFileSync(`./tools/osint/country/tools/${country}/${list[i]}/name`).split('\n')[0],
                    "mod": await import(`./tools/${country}/${list[i]}/cmain.ts`)
                })
            } catch(err){
                console.log(err)
            }
        }
        return m
    }

    private async exploreDirSimple(dir){
        let tmp = []
        for await (const dirEntry of Deno.readDir(dir)) {
            if(dirEntry.isDirectory){
                tmp.push(dirEntry.name)
            }
        }
        return tmp
    }

}