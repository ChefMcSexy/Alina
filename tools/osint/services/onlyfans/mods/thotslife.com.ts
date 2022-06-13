/**
 * Scrapes the dirtyship.com website for influencers onlyfans
 * 
 */

 export async function search(username: string) {
    username = username.toLowerCase()
    let test = await getPage(username)
    if(test){
        return [{
            link: test
        }]
    }
}


async function getPage(username){

    let url = `https://thotslife.com/category/onlyfans-17/`
    let req = await fetch(url)
    let html = await req.text()

    if(!html.toLowerCase().includes(username.toLowerCase())){
        return false
    }

    let page = html.toLocaleLowerCase().split("g1-archive-filter")[0].split('<body')[1].split(username)[0]

    let path = page.split("href=")[page.split("href=").length - 1]

    path = path.replace(/"/g, "")
    path = path.replace(/>/g, "")

    if(path.length > 60)
        return false

    return path

}