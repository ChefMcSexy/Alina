let bannedDomain = JSON.parse(Deno.readTextFileSync('./db/clonned_domain.json'))
let urls = JSON.parse(Deno.readTextFileSync('./db/urls.json'))
let newUrls = []
for(let i = 0; i < urls.length; i++){
    let url = urls[i]
    console.log(url)
    try{
        let domain = url.split('//')[1].split('/')[0]
        if(!bannedDomain.includes(domain)){
            newUrls.push(url)
        }
    } catch(err){}
    
}
Deno.writeTextFileSync('./db/urls.json', JSON.stringify(newUrls))
