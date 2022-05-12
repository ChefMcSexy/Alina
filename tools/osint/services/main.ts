import * as ink from 'https://deno.land/x/ink/mod.ts'

import { show } from '../../../utils/show.ts'
import { utils } from '../../../utils/utils.ts'
const _show = new show()
const _utils = new utils()

import { Osint_discord } from "./discord/main.ts"

export class Osint_services {
    //Discord part
    private async main() {
        console.clear()
        //show the main menu
        await _show.show_osint_menu_service()
        let rep = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] your choice"))
        if (rep == "1") {
            await this.DiscordOsint()
        } else if(rep == "@") {
            return
        } else {
            _show.log('Invalid choice')
        }
        await this.main()
    }


    //Discord part
    private async DiscordOsint() {
        //menu
        _show.log('1: Get user infos via id, @: back')
        let rep = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] your choice"))
        if (rep == "1") {
            try{
                let id = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] the id"))
                let discord = new Osint_discord()
                let t = await discord.getUserInfo(id)
                if(t == null){
                    _show.log('User not found')
                } else {
                    _show.log(`Username: ${t.username}#${t.discriminator}`)
                    _show.log(`Avatar: ${t.avatar} && ${t.avatar_decoration}`)
                    _show.log(`Banner: ${t.banner} && ${t.banner_color}\n`)
                }
            } catch(err){}
        } else if(rep == "@") {
            return
        }
        await this.DiscordOsint()
    }

}