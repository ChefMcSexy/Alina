import { Client } from "https://deno.land/x/discord_rpc/mod.ts";

export class dr {
    constructor(){
        this.init();
    }

    async init(){
        try{
            const client = new Client({
                id: "525340298050797568",
            });
              
            await client.connect();
              
            await client.setActivity({
                assets: {
                      large_image: "alina",
                      large_text: "Alina"
                },
                details: "Executing Alina safety network on his machine 💗",
                timestamps: {
                      start: Date.now(),
                }
            });
        } catch(err){}
    }
}

