import * as ink from 'https://deno.land/x/ink/mod.ts'

export class show {
    showWelcome() {
        console.log(ink.colorize(Deno.readTextFileSync('./utils/text/welcome')))
    }

    showMenu() {
        console.log(ink.colorize(Deno.readTextFileSync("./utils/text/main_menu")))
    }
    show_web_exploit_menu() {
        console.log(ink.colorize(Deno.readTextFileSync("./utils/text/web_exploit_menu")))
    }
    show_osint_menu() {
        console.log(ink.colorize(Deno.readTextFileSync('./utils/text/osint_menu')))
    }

    showTorDisclamer(){
        console.log(ink.colorize(Deno.readTextFileSync("./utils/text/disclaimer")))
    }

    log(message){
        console.log(ink.colorize("[<magenta>Alina</magenta>] "+message))
    }
    torindexerlog(message){
        console.log(ink.colorize("[<magenta>Tor Indexer</magenta>] "+message))
    }
    infos(message){
        console.log(ink.colorize("[<blue>Infos</blue>] "+message))
    }
    error(message){
        console.log(ink.colorize("[<red>Error</red>] "+message))
    }
    input(message){
        return ink.colorize("[<yellow>Input</yellow>] "+message)
    }
}

