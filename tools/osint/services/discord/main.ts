export class Osint_discord {
    private token = ""
    constructor(){
        try {
            this.token = Deno.readTextFileSync('./db/conf/discord_token.txt').split('\n')[0]
        } catch(err){
            console.log("Could not read discord token. Create a file named discord_token.txt in db/conf/ with your discord token")
            Deno.exit(1)
        }
    }

    async getUserInfo(id: string){
        const response = await fetch(`https://discord.com/api/v9/users/${id}`, {
            headers: {
              Authorization: `Bot ${this.token}`
            }
        })
        if (!response.ok) {
            return null
        }
        return await response.json()
    }
}