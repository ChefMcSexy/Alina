//All the imports
import { show } from './utils/show.ts'
import { utils } from './utils/utils.ts'
const _show = new show()
const _utils = new utils()

import * as ink from 'https://deno.land/x/ink/mod.ts'
import { TorSherlock } from './tools/tor_sherlock.ts'
import { TorIndexer } from './tools/tor_indexer.ts'

//show the welcome message
_show.showWelcome()

async function main() {
    _show.showMenu()
    let userChoise = await _utils.listenUserResponse(ink.colorize("[<red>You</red>] your choice"))

    if (userChoise == "1") {
        await new TorIndexer().main()
    } else if (userChoise == "2") {
        new TorSherlock().init()
    } else if (userChoise == "@") {
        console.log("Bye 👋")
        Deno.exit(0);
    } else {
        console.clear()
        console.log(ink.colorize("~ <magenta>Alina ❤️</magenta>"))
        main()
    }

    main()
}


main()