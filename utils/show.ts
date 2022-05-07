import * as ink from 'https://deno.land/x/ink/mod.ts'

let text_welcome = ink.colorize(`
          <red>git</red> <blue>clone</blue> <u>https://github.com/Sn0wAlice/Alina</u> <blue>&&</blue> <red>cd</red> <magenta>Alina</magenta>
                      <red>~ ./start</red>         <magenta>Alina</magenta> allow you to
            [<magenta>Alina</magenta>] - <blue>staring</blue>            contribute to the
        <blue>http://127.0.0.1:798</blue>               alina <blue>safety network</blue>
        [<magenta>Alina</magenta>] <blue>Tor indexer</blue>      <b><magenta>Alina❤️</magenta></b>     projet with the possibility
        [<magenta>Alina</magenta>] <blue>Tor sherlock</blue>               to <red>contribute</red> to the 
               <yellow>start indexing</yellow>            child abuse repport
                  <yellow>~ ./report.sh</yellow>         on mirror: <i>Tor</i> 🧄`)

let text_menu = ink.colorize(`
[<yellow>1</yellow>] - <blue>Tor indexer (beta)</blue>
[<yellow>2</yellow>] - <blue>Tor sherlock (soon)</blue>
[<yellow>3</yellow>] - <blue>Web exploit</blue>
[<yellow>4</yellow>] - <blue>Osint</blue>
[<yellow>@</yellow>] - <blue>Exit</blue>`)


let text_disclaimer = ink.colorize(`
⚠️<red> Disclaimer</red>
<blue>Alina</blue> is a <red>safety network</red> for the <blue>Tor</blue> network.
The Tor🧄 indexer can index extremely large amount of data and this data can be illegal 🔞
`)

let web_exploit_menu = ink.colorize(`
[<yellow>1</yellow>] - <blue>Find subdomain</blue>
[<yellow>@</yellow>] - <blue>Exit</blue>`)

let osint_menu = ink.colorize(`
[<yellow>1</yellow>] - <blue>Generate email</blue>
[<yellow>2</yellow>] - <blue>Check email on website</blue>
[<yellow>@</yellow>] - <blue>Exit</blue>`)


export class show {
    public showWelcome() {
        console.log(text_welcome)
    }


    public showHelp() {
        // ahaha maybe one day
    }

    public showMenu() {
        console.log(text_menu)
    }
    public show_web_exploit_menu() {
        console.log(web_exploit_menu)
    }
    public show_osint_menu() {
        console.log(osint_menu)
    }

    public showTorDisclamer(){
        console.log(text_disclaimer)
    }

    public log(message){
        console.log(ink.colorize("[<magenta>Alina</magenta>] "+message))
    }
    public torindexerlog(message){
        console.log(ink.colorize("[<magenta>Tor Indexer</magenta>] "+message))
    }
    public infos(message){
        console.log(ink.colorize("[<blue>Infos</blue>] "+message))
    }
    public error(message){
        console.log(ink.colorize("[<red>Error</red>] "+message))
    }
    public input(message){
        return ink.colorize("[<yellow>Input</yellow>] "+message)
    }
}

