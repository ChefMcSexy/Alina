/**
 * Scrapes the nternetchicks.com website for influencers onlyfans
 */

 export async function search(username: string) {
    username = username.toLowerCase().replace(/ /g, "-")
    let test = await getPage(username)
    if(test){
        return [{
            link: `https://internetchicks.com/actress/${username}/`
        }]
    }
}


async function getPage(username){

    let url = `https://internetchicks.com/actress/${username}/`
    let req = await fetch(url)
    let html = await req.text()

    if(html.toLowerCase().includes("OOOPS, SORRY! WE COULDN'T FIND IT".toLowerCase())){
        return false
    }
    return true

}