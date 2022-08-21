import * as ink from 'https://deno.land/x/ink/mod.ts'
let { columns, rows } = Deno.consoleSize(Deno.stdout.rid);

export class show {
    showWelcome() : void{

        if(columns < 80 || rows < 25){
            console.log("terminal too small")
            Deno.exit(1)
        }

        let margin = ""
        let max = (columns/2) - 38
        margin = " ".repeat(max)
        console.log(ink.colorize(Deno.readTextFileSync('./utils/text/welcome').replace(/__MARGIN__/g, margin)))
    }

    showMenu() : void {
        console.log(ink.colorize(Deno.readTextFileSync("./utils/text/main_menu")))
    }
    show_web_exploit_menu() : void {
        console.log(ink.colorize(Deno.readTextFileSync("./utils/text/web_exploit_menu")))
    }
    show_osint_menu_general() : void {
        console.log(ink.colorize(Deno.readTextFileSync('./utils/text/osint_menu_general')))
    }
    show_osint_menu_service() : void {
        console.log(ink.colorize(Deno.readTextFileSync('./utils/text/osint_services')))
    }
    show_osint_menu() : void {
        console.log(ink.colorize(Deno.readTextFileSync('./utils/text/osint_menu')))
    }

    showTorDisclamer() : void {
        console.log(ink.colorize(Deno.readTextFileSync("./utils/text/disclaimer")))
    }

    log(message:string) : void{
        console.log(ink.colorize("[<magenta>Alina</magenta>] "+message))
    }
    torindexerlog(message:string) : void{
        console.log(ink.colorize("[<magenta>Tor Indexer</magenta>] "+message))
    }
    infos(message:string) : void{
        console.log(ink.colorize("[<blue>Infos</blue>] "+message))
    }
    error(message:string) : void{
        console.log(ink.colorize("[<red>Error</red>] "+message))
    }
    input(message:string) : string {
        return ink.colorize("[<yellow>Input</yellow>] "+message)
    }
}

