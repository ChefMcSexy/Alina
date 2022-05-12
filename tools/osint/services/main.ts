import * as ink from 'https://deno.land/x/ink/mod.ts'

import { show } from '../../../utils/show.ts'
import { utils } from '../../../utils/utils.ts'
const _show = new show()
const _utils = new utils()

import { Osint_discord } from "./discord/main.ts"

import { getUserData, renderResult} from "./instagram/main.ts"

export class Osint_services {
    //Discord part
    public async main() {
        //console.clear()
        //show the main menu
        await _show.show_osint_menu_service()
        let rep = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] your choice"))
        if (rep == "1") {
            await this.DiscordOsint()
        } else if(rep == "2") {
            await this.initInstgramUser()
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

    //Instragram part
    private async initInstgramUser(){
        _show.log("You can find your session id in your browser's cookie.")
        _show.log("if you need help type 'help' or '?'")
        _show.log("if you want to use sessionid of ./db/instagram_sessionid.txt, type 'me'")
        _show.log("if you want to save sessionid, type 'you_session_id save'")
        await this.instagramUser()
    }
    
    private async instagramUser(){
        let sessionid = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] a valid sessionid"))
        if(sessionid == "help" || sessionid == "?"){
            _show.log("Look at the tutorial: https://github.com/Sn0wAlice/Alina/wiki/Osint#how-to-get-your-sessionid")
            await this.instagramUser()
        } else {

            if(sessionid == "me"){
                try{
                    sessionid = await Deno.readTextFileSync("./db/instagram_sessionid.txt")
                } catch(err){
                    _show.log("Error: file do not exist")
                    return await this.instagramUser()
                }
            } else {
                let sessionidArr = sessionid.split(" ")
                if(sessionidArr.length > 1){
                    if(sessionidArr[1] == "save"){
                        _show.log("Saving sessionid...")
                        await Deno.writeTextFileSync("./db/instagram_sessionid.txt", sessionidArr[0])
                    }
                }
                sessionid = sessionidArr[0]
            }

            let username = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] a instagram username"))
            let data = await getUserData(username, sessionid)
            if(data == null){
                _show.log("Invalid sessionid or username, please try again")
            } else {
                renderResult(data)
            }
        }
    }
}