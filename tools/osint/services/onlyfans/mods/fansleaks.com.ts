/**
 * Scrapes the fansleaks.com website for influencers onlyfans
 */

 export async function search(username: string) {
    username = username.toLowerCase().replace(/ /g, "-")
    let test = await getPage(username)
    if(test){
        return [{
            link: `https://fansleaks.com/actor/${username}`
        }]
    }
}


async function getPage(username:string){

    let url = `https://fansleaks.com/actor/${username}/`
    let req = await fetch(url)
    let html = await req.text()

    if(html.toLowerCase().includes("Oops! That page can’t be found".toLowerCase())){
        return false
    }
    return true

}