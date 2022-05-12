import * as ink from 'https://deno.land/x/ink/mod.ts'
import { show } from '../../utils/show.ts'
import { utils } from '../../utils/utils.ts'
const _show = new show()
const _utils = new utils()


import { Osint_general } from "./general/main.ts"

export class Osint {
    public async init(){
        _show.log("Starting osint...")
        await this.main()
    }

    private async main() {
        //show the main menu
        await _show.show_osint_menu()
        let rep = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] your choice"))

        if (rep == "1") {
            await new Osint_general().init()
        } else if(rep == "2") {
            //todo
        } else if(rep == "3") {
            //todo
        } else if(rep == "@") {
            return
        } else {
            _show.log('Invalid choice')
        }
        await this.main()
    }
}