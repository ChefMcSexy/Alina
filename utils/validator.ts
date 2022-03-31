import * as ink from 'https://deno.land/x/ink/mod.ts'
const enc = (s: string) => new TextEncoder().encode(s);

export class validator{
    private message
    constructor(message){
        this.message = ink.colorize("[<magenta>Alina</magenta>] "+message)
        this.init()
    }
    
    private async init(){
        await Deno.stdout.write(enc(`${this.message}\r`))
    }

    public async validate(){
        await Deno.stdout.write(enc(`${this.message} ${
            ink.colorize(`<green>OK</green>\n`)
        }\r`))
    }

    public async fail(fatal?:boolean){
        await Deno.stdout.write(enc(`${this.message} ${
            ink.colorize(`<red>FAIL</red>\n`)
        }\r`))
        if(fatal){
            Deno.exit(1)
        }
    }


    public async custom_validate(message){
        await Deno.stdout.write(enc(`${this.message} ${
            ink.colorize(`<green>${message}</green>\n`)
        }\r`))
    }
    public async custom_fail(message, fatal?:boolean){
        await Deno.stdout.write(enc(`${this.message} ${
            ink.colorize(`<red>${message}</red>\n`)
        }\r`))
        if(fatal){
            Deno.exit(1)
        }
    }
}
