/**
 * Scrapes the influencersgonewild.com website for influencers onlyfans
 */

export async function search(username: string) {
    let test = await getPage(username)
    if(test){
        return [{
            link: `https://influencersgonewild.com/category/${username}/`
        }]
    }
}


async function getPage(username:string){

    let url = `https://influencersgonewild.com/category/${username}/`
    let req = await fetch(url)
    let html = await req.text()

    if(html.toLowerCase().includes("Ooops, sorry! We couldn't find it".toLowerCase())){
        return false
    }
    return true

}