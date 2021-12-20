let config = JSON.parse(Deno.readTextFileSync("config.json"))
let report = JSON.parse(Deno.readTextFileSync("report.json"))

async function linuxExecute(commande: any) {
    var content = "";
    var comcmd = commande.split(' ')
    var p = Deno.run({
        cmd: comcmd,
        stdout: "piped",
        stderr: "piped"
    });

    var {
        code
    } = await p.status();
    if (code === 0) {
        var rawOutput = await p.output();
        content = new TextDecoder().decode(rawOutput);
    } else {
        var rawError = await p.stderrOutput();
        var errorString = new TextDecoder().decode(rawError);
        console.log('[Error] - ' + errorString);
    }
    return content
}

async function getPicture() {
    // ask to the api to get the picture
    let tmp = await fetch(`http://${config.dbhost}:7536/getPictures`)
    let data = await tmp.json()

    let pictureURL = data[0].link
    console.log(`Checking picture ${pictureURL}`)
    //get the picture ;-;
    await linuxExecute(`torsocks wget ${pictureURL} -O out.${data[0].ext}`)
    //now we have the picture in out.jpg
    return ['./out.'+data[0].ext]
}


setInterval(() => {
    Deno.writeTextFileSync("report.json", JSON.stringify(report))
}, 60000)


//get a picture

async function main(){
    let data = await getPicture()
    console.log("Testing on " + data.length + " files")
    for (let i = 0; i < data.length; i++) {
        let finalOutput = JSON.parse(await linuxExecute("python3 analyse.py " + data[i]))
        if (finalOutput.unsafe >= 0.95) {
            console.log(`${data[i]} => SURE ${finalOutput.unsafe}`)
            report.push(data)
        } else if (finalOutput.unsafe >= 0.8) {
            console.log(`${data[i]} => COULD ${finalOutput.unsafe}`)
            report.push(data)
        }
    }
    main()
}

main()