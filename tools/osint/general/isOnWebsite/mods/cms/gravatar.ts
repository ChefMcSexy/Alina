/**
 * Check email on website: gravatar.com
 * Using: custom function
 * 
 */

import { createHash } from "https://deno.land/std/hash/mod.ts"

export async function main(email:string){
    let exist = {
        isOn: false,
        message: "website is block"
    }

    try {
        let name = createHash("md5").update(email).toString();
        let req = await fetch(`https://en.gravatar.com/${name}.json`)
        if(req.status == 200){
            exist.isOn = true,
            exist.message = `User data is available here: https://en.gravatar.com/${name}.json`
        } else {
            exist.message = "User do not have gravatar account"
        }
    } catch(err){
        //console.log(err)
    }

    return exist
}



export function getURL(){
    return "gravatar.com"
}
