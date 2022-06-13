/**
 * Scrapes the dirtyship.com website for influencers onlyfans
 */

 export async function search(username: string) {
    username = username.toLowerCase().replace(/ /g, "-")
    let test = await getPage(username)
    if(test){
        return [{
            link: `https://prothots.com/category/onlyfans-23/${username}/`
        }]
    }
}


async function getPage(username){

    let url = `https://prothots.com/category/onlyfans-23/${username}/`
    let req = await fetch(url)
    let html = await req.text()

    if(html.toLowerCase().includes("Ooops, sorry! We couldn't find it".toLowerCase())){
        return false
    }
    return true

}