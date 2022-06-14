import * as ink from 'https://deno.land/x/ink/mod.ts'

export class show {
    showWelcome() : void{
        console.log(ink.colorize(Deno.readTextFileSync('./utils/text/welcome')))
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

