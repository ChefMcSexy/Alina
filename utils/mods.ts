import { TorSherlock } from '../tools/tor_sherlock.ts'
import { TorIndexer } from '../tools/tor_indexer.ts'
import { WebExploit } from '../tools/web_exploit/main.ts'
import { Osint } from "../tools/osint/main.ts"
import { exitClass } from "./exit.ts"

// t'as vue comment main.ts sous-traite les fonctionnalités ?
let a = [
    {
        name: "Tor Indexer",
        id: "1",
        mod: new TorIndexer()
    },
    {
        name: "Tor Sherlock",
        id: "2",
        mod: new TorSherlock()
    },
    {
        name: "Web Exploit",
        id: "3",
        mod: new WebExploit()
    },
    {
        name: "OSINT",
        id: "4",
        mod: new Osint()
    },
    {
        name: "Exit",
        id: "@",
        mod: new exitClass()
    }
]

export function getAllMods(){
    return a
}