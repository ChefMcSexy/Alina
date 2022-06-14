import { show } from '../../../../utils/show.ts'
import * as ink from 'https://deno.land/x/ink/mod.ts'
const _show = new show()

export async function onlyfansMain(username:string) {
    console.clear()
    let modules = await loadMods()
    _show.log(`[+] Searching for ${username} with ${modules.length} modules`)

    for(let i = 0; i < modules.length; i++){
        _show.log(`[*] looking on ${ink.colorize("<green>"+modules[i].name+"</green>")}`)
        let result = await modules[i].mods.search(username)
        if(result){
            for(let j = 0; j < result.length; j++){
                _show.log(`[+] ${modules[i].name} found ${ink.colorize("<green>"+result[j].link+"</green>")}`)
            }
        } else {
            _show.log(`[-] ${modules[i].name} found no results`)
        }
    }
}


// Load all the modules
async function loadMods(){
    let list = await exploreDirSimple("./tools/osint/services/onlyfans/mods/")
    let modules:any[] = []
    for(let i = 0; i < list.length; i++){
        modules.push({
            name: list[i].replace(".ts", ""),
            mods: await import(`./mods/${list[i]}`)
        })
    }
    return modules
}

async function exploreDirSimple(dir:string){
    let tmp:string[] = []
    for await (const dirEntry of Deno.readDir(dir)) {
        if(!dirEntry.isDirectory){
            tmp.push(dirEntry.name)
        }
    }
    return tmp
}