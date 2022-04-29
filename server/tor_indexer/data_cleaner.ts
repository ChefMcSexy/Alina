// this code is used to clean up the data who are in the database


/*
Helper function to clean up the data: 
--text           : clean the paragraphs

*/




async function clean__TEXT() {
    // paragraphs are stored in the file: /content/[urlToken].json

    // get all the domain
    let letterDispo = await exploreDirSimple('./db/data/')
    for(let i = 0; i < letterDispo.length; i++){
        console.log('Working on: ' + letterDispo[i])
        // explore dir and get all the domain
        let domainList = await exploreDirSimple('./db/data/' + letterDispo[i])
        for(let j = 0; j < domainList.length; j++){
            //get the infos.json file
            console.log('Working on: ' + domainList[j])
            try{
                let urlList = await exploreFileSimple('./db/data/' + letterDispo[i] + '/' + domainList[j]+ '/content/')
                for(let k = 0; k < urlList.length; k++){
                    console.log('Working on: ' + urlList[k])
                    //read the file and clean "paragraphs" section
                    try{
                        let fileContent = JSON.parse(Deno.readTextFileSync('./db/data/' + letterDispo[i] + '/' + domainList[j]+ '/content/' + urlList[k]))
                        let newParagraphs = []
                        for(let l = 0; l < fileContent.paragraphs.length; l++){
                            if(fileContent.paragraphs[l] != ""){
                                newParagraphs.push(fileContent.paragraphs[l])
                            }
                        }
                        fileContent.paragraphs = newParagraphs
                        //write the file
                        Deno.writeTextFileSync('./db/data/' + letterDispo[i] + '/' + domainList[j]+ '/content/' + urlList[k], JSON.stringify(fileContent))
                    } catch(err){
                        console.log(err)
                    }
                }
            } catch(err){
                console.log(err)
            }
            
        }
    }
}

async function clean__EMAIL() {
    // paragraphs are stored in the file: /content/[urlToken].json

    // get all the domain
    let letterDispo = await exploreDirSimple('./db/data/')
    for(let i = 0; i < letterDispo.length; i++){
        console.log('Working on: ' + letterDispo[i])
        // explore dir and get all the domain
        let domainList = await exploreDirSimple('./db/data/' + letterDispo[i])
        for(let j = 0; j < domainList.length; j++){
            //get the infos.json file
            console.log('Working on: ' + domainList[j])
            try{
                try{
                    let fileContent = JSON.parse(Deno.readTextFileSync('./db/data/' + letterDispo[i] + '/' + domainList[j]+ '/infos.json'))
                    let newEmail = []
                    for(let l = 0; l < fileContent.email.length; l++){
                        let tmpIEmail = fileContent.email[l]
                        if(tmpIEmail != ""){
                            tmpIEmail = tmpIEmail.replace(/\s/g, '').replace(/\|/g, "")
                            if(!tmpIEmail.includes("}") && !tmpIEmail.includes("{")){
                                newEmail.push(tmpIEmail)
                            }
                        }
                    }
                    fileContent.email = newEmail
                    //write the file
                    Deno.writeTextFileSync('./db/data/' + letterDispo[i] + '/' + domainList[j]+ '/infos.json', JSON.stringify(fileContent))
                } catch(err){
                    console.log(err)
                }
            } catch(err){
                console.log(err)
            }
            
        }
    }
}


async function exploreDirSimple(dir){
    let tmp = []
    for await (const dirEntry of Deno.readDir(dir)) {
        if(dirEntry.isDirectory){
            tmp.push(dirEntry.name)
        }
    }
    return tmp
}
async function exploreFileSimple(dir){
    let tmp = []
    for await (const dirEntry of Deno.readDir(dir)) {
        if(!dirEntry.isDirectory){
            tmp.push(dirEntry.name)
        }
    }
    return tmp
}


async function launch() {
    if(Deno.args.includes("--text")){
        console.log("Cleaning up the text")
        await clean__TEXT()
    }
    if(Deno.args.includes("--email")){
        console.log("Cleaning up the email")
        await clean__EMAIL()
    }
    console.log("End of the cleaning "+ new Date())
    setTimeout(() => {
        launch()
    }, 30*60000)
}
launch()