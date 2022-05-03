let letter = await exploreDirSimple('./db/bin/')
let domain = []
for(let i = 0; i < letter.length; i++){
    let tmp = await exploreDirSimple('./db/bin/' + letter[i])
    for(let j = 0; j < tmp.length; j++){
        domain.push(tmp[j])
    }
}

Deno.writeTextFileSync('./db/clonned_domain.json', JSON.stringify(domain))

async function exploreDirSimple(dir){
    let tmp = []
    for await (const dirEntry of Deno.readDir(dir)) {
        if(dirEntry.isDirectory){
            tmp.push(dirEntry.name)
        }
    }
    return tmp
}