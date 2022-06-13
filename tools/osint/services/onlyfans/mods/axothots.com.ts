/**
 * Scrapes the axothots.com website for influencers onlyfans
 * 
 * 	https://axothots.com/Libs/Functions/request.php?mode=autocomplete&e=USERNAME
 */

 export async function search(username: string) {
    username = username.toLowerCase().replace(/ /g, "-")
    let test = await getPage(username)
    if(test){
        return [{
            link: `https://axothots.com/search/${username}`
        }]
    }
}


async function getPage(username){

    let url = `https://axothots.com/search/${username}`
    let req = await fetch(url)
    let html = await req.text()

    if(html.toLowerCase().includes("Nothing found".toLowerCase())){
        return false
    }
    return true

}