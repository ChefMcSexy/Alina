import * as ink from 'https://deno.land/x/ink/mod.ts'
import { show } from './utils/show.ts'
import { dr } from './utils/discordRich.ts'
import { utils } from './utils/utils.ts'
const _show = new show()
const _utils = new utils()
const array = (await import('./utils/mods.ts')).getAllMods()
_show.showWelcome()
new dr()

async function main() {
    _show.showMenu()
    let userChoise = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] your choice"))
    /**
     * on va pas ce mentir, c'est assez classe de faire ça
     * au lieu de faire une foret de if esle et de switch case
     */
    array.find(x => x.id == userChoise) ? array.find(x => x.id == userChoise).mod.init() : console.log(ink.colorize("~ <magenta>Alina ❤️</magenta>"))
}
main()