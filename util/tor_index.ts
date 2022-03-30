//parcour all the IP of the world
let ips = [];
ips = generateIpList();
const torUrl = "https://XXXX.onion"
const indexWebPage = Deno.readTextFileSync('./utils/base_page.html');



//let's play
for(let i = 0; i < ips.length; i++){
    let pageContent = await make_the_request(ips[i], torUrl);
    if(checkContentMatch(pageContent, indexWebPage)){
        console.log(`${ips[i]} is a tor hosting server`);
        break
    }
}
console.log('No more IP to check ....')


async function checkContentMatch(string1, string2) {
    if(string1 == string2){
        return true
    }
    return false;
}


async function make_the_request(ip, url){
    let page = "";
    try{
        let req = await fetch('http://'+ip, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; rv:31.0) Gecko/20100101 Firefox/31.0',
                "Host": url
            }
        });
        page = await req.text();
    } catch(err){
        console.log(`Error with ${ip}`);
    }
    return page;
}




//update ip list
function generateIpList(){
    let ipList = [];
    for (let i = 0; i < 256; i++) {
        for (let j = 0; j < 256; j++) {
            for (let k = 0; k < 256; k++) {
                for (let l = 0; l < 256; l++) {
                    ipList.push(`${i}.${j}.${k}.${l}`);
                }
            }
        }
    }
    return ipList;
}


