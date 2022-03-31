import * as ink from 'https://deno.land/x/ink/mod.ts'

let text_menu_tor_sherlock = ink.colorize(`[<yellow>1</yellow>] - <blue>Solo sherlock</blue>
[<yellow>2</yellow>] - <blue>Pool sherlock</blue>
[<yellow>?</yellow>] - <blue>Help</blue>
[<yellow>@</yellow>] - <blue>Exit</blue>`)

let text_help_tor_sherlock = ink.colorize(`
<b>What is Tor sherlock?</b> <u>easy</u> question: this is a tool that helps you to investigate IPs and possibly detect onion websites hosted on them.\n
<b>How it's works ?</b> based on server configuration we use some kind of request usurpation to make beleive that the server need to respond to the request of the Tor url. (for more detailled solutions, just explore the code)\n
<b>Solo or Pool ?</b> based on what you want: 
- Solo: you can use this option to scan yourslef IPs addresses. (may be slow if you have lot's of IPs to scan)
- Pool: contribute to the pool of IPs scanning. (SOON / Read the doc before)`)


export class tor_sherlock__functions{

    public showHelp() {
        console.log(text_help_tor_sherlock)
    }

    public showMenu() {
        console.log(text_menu_tor_sherlock)
    }

    public log(message){
        console.log(ink.colorize("[<magenta>Alina</magenta>] "+message))
    }

    public async getPage(url: string, hostname:string) {
        
        const p = Deno.run({
            cmd: ["node", "./tools/tor_sherlock/scripts/get.js", url, hostname ],
            stdout: "piped",
            stderr: "piped",
        });
        
        const { code } = await p.status();
        
        // Reading the outputs closes their pipes
        const rawOutput = await p.output();
        const rawError = await p.stderrOutput();
        
        if (code === 0) {
            return new TextDecoder().decode(rawOutput);
        } else {
            const errorString = new TextDecoder().decode(rawError);
            console.log(errorString);
        }
    }

    public async getPageContent(url){
        let req = await fetch(url)
        return await req.text()
    }
}

