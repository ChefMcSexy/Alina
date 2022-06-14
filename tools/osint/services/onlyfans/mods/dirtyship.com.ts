/**
 * Scrapes the dirtyship.com website for influencers onlyfans
 */

 export async function search(username: string) {
    username = username.toLowerCase().replace(/ /g, "-")
    let test = await getPage(username)
    if(test){
        return [{
            link: `https://dirtyship.com/performer/${username}/`
        }]
    }
}


async function getPage(username:string){

    let url = `https://dirtyship.com/performer/${username}/`
    let req = await fetch(url)
    let html = await req.text()

    if(html.toLowerCase().includes("404-error.gif".toLowerCase())){
        return false
    }
    return true

}