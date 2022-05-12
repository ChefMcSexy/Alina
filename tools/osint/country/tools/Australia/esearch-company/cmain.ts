import * as ink from 'https://deno.land/x/ink/mod.ts'
import { show } from '../../../../../../utils/show.ts'
import { utils } from '../../../../../../utils/utils.ts'
const _show = new show()
const _utils = new utils()

export async function main(){
    _show.log("Australia | eSearch Pty Ltd")
    _show.log("available here: http://www.esearch.net.au/cgi-bin/eCasual\n")
    let str = `[${ink.colorize("<yellow>1</yellow>")}] - Get Organisation \n[${ink.colorize("<yellow>2</yellow>")}] - Get Organisation detail (VIA ACN)\n[${ink.colorize("<yellow>@</yellow>")}] - Exit \n`
    console.log(str)

    let rep = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] your choice"))
    if(rep == "1"){
        await getOrganisation()
    } else if(rep == "2"){
        await getOrganisationDetail()
    } else if(rep == "@"){
        return
    }
    await main()
}

async function getOrganisation() {
    //get business name
    let name = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] the name"))
    let t = []
    try {
        let req = await fetch('http://www.esearch.net.au/cgi-bin/eCasual', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36"
            },
            body: new URLSearchParams({
                "message": "Organisation Name Search",
                "organisationName": name,
                "scope": "A"
            })
        })
        let data = await req.text()
        t = parsing(data)
    } catch(err){
        console.log(err)
        _show.log("Error, exiting")
        return
    }

    if(t.length == 0){
        _show.log("No results found")
    } else {
        for(let i = 0; i < t.length; i++){
            _show.log(`${ink.colorize("<yellow>"+t[i].name+"</yellow>")}`)
            _show.log(`Number: ${ink.colorize("<green>"+t[i].number+"</green>")}`)
            _show.log(`Type: ${t[i].status}`)
            _show.log(`Status ${ink.colorize("<blue>"+t[i].status+"</blue>")}\n`)
        }
    }
}

async function getOrganisationDetail() {
    //get business name
    let acn = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] the acn"))
    let t = {}
    try {
        let req = await fetch('http://www.esearch.net.au/cgi-bin/eCasual', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36"
            },
            body: new URLSearchParams({
                "message": "Company Document Listing",
                "organisationNumber": acn,
                "startDate": "01/01/1901",
                "endDate": "01/01/2100"
            })
        })
        let data = await req.text()
        t = parsingDetail(data)
    } catch(err){
        console.log(err)
        _show.log("Error, exiting")
        return
    }

    if(t == null){
        _show.log("No results found")
    } else {

        _show.log(`Creation: ${ink.colorize("<green>"+t.registrationDate+"</green>")}`)
        if(t.deregistrationDate != ""){
            _show.log(`Delete: ${ink.colorize("<red>"+t.deregistrationDate+"</red>")}`)
        }
        if(t.reviewDate != ""){
            _show.log(`Delete: ${ink.colorize("<yellow>"+t.reviewDate+"</red>")}`)
        }

        for(let j = 0; j < t.docs.length; j++){
            console.log()
            _show.log(`number: ${t.docs[j].number}`)
            _show.log(`Process: ${ink.colorize("<green>"+t.docs[j].process+"</green>")} | Effective date ${ink.colorize("<green>"+t.docs[j].efDate+"</green>")}`)
            _show.log(`Page Count ${ink.colorize("<blue>"+t.docs[j].pageCount+"</blue>")}`)
            _show.log(`Name: ${t.docs[j].libelle}`)
        }
        console.log()
    }
}

function parsing(data){
    let t = data.split("detailHeading")[1].split('largeButton')[0]
    let a = t.split("<tr>")
    let t2 = []
    for(let i = 2; i < a.length; i++){
        try{
            t2.push({
                number: "ACN "+a[i].split("/td>")[0].split('<a id="')[1].split('"')[0],
                type: a[i].split("/td>")[1].split(">")[1].split("<")[0],
                status: a[i].split("/td>")[2].split(">")[1].split("<")[0],
                name: a[i].split("/td>")[3].split(">")[1].split("<")[0],
            })
        } catch(err){}
        
    }
    return t2
}

function parsingDetail(data){
    let t = {
        registrationDate: data.split("Registration Date")[1].split(`class="answer">`)[1].split("<")[0] ? data.split("Registration Date")[1].split(`class="answer">`)[1].split("<")[0] : "",
        deregistrationDate: "",
        reviewDate: "",
        docs: []
    }

    try{
        if(data.split("Review Date")[1].split(`align="left">`)[1].split("<")[0] != undefined){
            t.reviewDate = data.split("Review Date")[1].split(`align="left">`)[1].split("<")[0]
        }
    } catch(err){}

    try{
        if(data.split("Deregistration Date")[1].split(`class="answer">`)[1].split("<")[0] != undefined){
            t.deregistrationDate = data.split("Deregistration Date")[1].split(`class="answer">`)[1].split("<")[0]
        }
    } catch(err){}
    

    try{
        let a = data.split("Document List Details")[2].split('/tbody>')[0].split("Document Number")
        for(let i = 1; i < a.length; i++){
            t.docs.push({
                number: a[i].split(`align="left"`)[1].split('<')[0].split('>')[1].replace(/\s/g, ''),
                process: a[i].split(`Date Processed</td>`)[1].split('</')[0].split('>')[1].replace(/\s/g, ''),
                efDate: a[i].split(`Effective Date</td>`)[1].split('</')[0].split('>')[1].replace(/\s/g, ''),
                pageCount: a[i].split(`Pages</td>`)[1].split('</')[0].split('>')[1].replace(/\s/g, ''),
                libelle: a[i].split(`colspan="3">`)[2].split('</')[0],
            })
        }
    } catch(err){
        console.log(err)
    }
    
    return t
}