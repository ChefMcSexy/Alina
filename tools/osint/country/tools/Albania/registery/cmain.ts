import * as ink from 'https://deno.land/x/ink/mod.ts'
import { show } from '../../../../../../utils/show.ts'
import { utils } from '../../../../../../utils/utils.ts'
const _show = new show()
const _utils = new utils()

export async function main(){
    _show.log("National Business Center (Qendra Kombetare e Biznesit) Albanisch, Englisch kostenlos Search for subject, Search for available name")
    _show.log("available here: https://qkb.gov.al/\n")
    let str = `[${ink.colorize("<yellow>1</yellow>")}] - Check name availability \n`
    console.log(str)

    let rep = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] your choice"))
    if(rep == "1"){
        console.log("Errored for the moment")
        //await checkNameAvailability()
    }

}

async function checkNameAvailability(){
    _show.log("Check name availability")
    let name = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] the business name"))
    let ufprt = "", tk = ""

    _show.log("Start stealing hidden data...")
    try {
        let req = await fetch(`https://thingproxy.freeboard.io/fetch/https://qkb.gov.al/kerko/kerko-ne-regjistrin-tregtar/kerko-per-emer-te-lire/`, {
            method: "GET",
            "headers": {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "en-US,en;q=0.9",
                "Cache-Control": "max-age=0",
                "Connection": "keep-alive",
                "Content-Length": "0",
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:100.0) Gecko/20100101 Firefox/100.0",
                "rejectUnauthorized": "false"
            },
            "referrer": "https://qkb.gov.al/kerko/kerko-ne-regjistrin-tregtar/kerko-per-emer-te-lire/",
            "referrerPolicy": "no-referrer-when-downgrade",
            "body": null,
            "credentials": "include"
        })
        let res = await req.text()
        tk = req.headers.get("set-cookie").split("__RequestVerificationToken=")[1].split(";")[0]
        ufprt = res.split(`ufprt`)[2].split(`value='`)[1].split(`'`)[0];
    } catch(err){
        console.log(err)
        _show.log("Error, exiting")
        return
    }
    _show.log("Done, start searching...")
    try {
        let body = {
            "ufprt": ufprt,
            "SubjectName": name,
            "__RequestVerificationToken": tk
        }
        console.log(body)
        let req = await fetch(`https://thingproxy.freeboard.io/fetch/https://qkb.gov.al/kerko/kerko-ne-regjistrin-tregtar/kerko-per-emer-te-lire/`, {
            method: "POST",
            headers: {
                "Content-Type": "multipart/www-form-data",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "en-US,en;q=0.9",
                "Host": "qkb.gov.al",
                "Origin": "https://qkb.gov.al",
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:100.0) Gecko/20100101 Firefox/100.0",
            },
            body: new URLSearchParams(body)
        })
        let res = await req.text()
        Deno.writeTextFileSync("test.html", res)
        if(res.includes("alert-sucess-custom")){
            _show.log(`Name is ${ink.colorize("<green>available</green>")}`)
        } else {
            _show.log(`Name is ${ink.colorize("<red>not available</red>")}`)
        }
    } catch(err){
        _show.log("Error, exiting")
    }

}

checkNameAvailability()