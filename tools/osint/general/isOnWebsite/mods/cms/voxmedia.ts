/**
 * Check email on website: voxmedia.com
 * Using: register
 * 
 */

 export async function main(email:string){
    let exist = {
        isOn: false,
        message: "website is block"
    }

    try {
        const body=new URLSearchParams();
        body.set('email', email);
        let req = await fetch("https://auth.voxmedia.com/chorus_auth/email_valid.json", {
            method: "POST",
            headers: generateHeader(),
            body: body
        })
        let b = await req.json()
        if(b.available){
            exist.message = "user is not registrated"
        } else {
            exist.isOn = true
            exist.message = ""
        }
    } catch(err){
        console.log(err)
    }

    return exist
}


function generateHeader(){
    return {
        'User-Agent': "Mozilla/5.0 (X11; Linux x86_64; rv:100.0) Gecko/20100101 Firefox/100.0",
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en,en-US;q=0.5',
        'Referer': 'https://auth.voxmedia.com/login',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://auth.voxmedia.com',
        'DNT': '1',
        'Connection': 'keep-alive',
        'TE': 'Trailers'
    }
}

export function getURL(){
    return "voxmedia.com"
}