/**
 * Check email on website: atlassian.com
 * Using: register
 * 
 */

export async function main(email:string){
    let exist = {
        isOn: false,
        message: "module error..."
    }

    try {
        let req = await fetch("https://id.atlassian.com/login", {
            headers: generateHeader()
        })
        //console.log(req)
        //console.log(req.headers.get("Set-Cookie"))
    } catch(err){
        //console.log(err)
    }

    return exist
}


function generateHeader(){
    return {
        'User-Agent': "Mozilla/5.0 (X11; Linux x86_64; rv:100.0) Gecko/20100101 Firefox/100.0",
        'Accept': '*/*',
        'Accept-Language': 'en,en-US;q=0.5',
        'Referer': 'https://id.atlassian.com/',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Origin': 'https://id.atlassian.com',
        'DNT': '1',
        'Connection': 'keep-alive',
    }
}

export function getURL(){
    return "atlassian.com"
}
