import * as ink from 'https://deno.land/x/ink/mod.ts'
import { show } from './utils/show.ts'
import { dr } from './utils/discordRich.ts'
import { utils } from './utils/utils.ts'
const _show = new show()
const _utils = new utils()
const array = (await import('./utils/mods.ts')).getAllMods()
new dr()

async function main() {
    console.clear()
    _show.showWelcome()
    _show.showMenu()
    let userChoise = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] your choice"))
    /**
     * on va pas ce mentir, c'est assez classe de faire ça
     * au lieu de faire une foret de if esle et de switch case
     */
    await array.find(x => x.id == userChoise) ? await array.find(x => x.id == userChoise)?.mod?.init() : console.log(ink.colorize("~ <magenta>Alina ❤️</magenta>"))
    main()
}
Deno.mkdirSync('./db', { recursive: true });
main()