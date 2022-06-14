/**
 * Scrapes the porntn.com website for influencers onlyfans
 */

 export async function search(username: string) {
    username = username.toLowerCase().replace(/ /g, "-")
    let test = await getPage(username)
    if(test){
        return [{
            link: `https://porntn.com/search/${username}/`
        }]
    }
}


async function getPage(username:string){

    let url = `https://porntn.com/search/${username}/`
    let req = await fetch(url)
    let html = await req.text()
    
    if(html.toLowerCase().split(username.replace(/-/g, " ")).length < 15){
        return false
    }
    return true

}