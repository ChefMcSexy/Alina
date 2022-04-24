const ip_regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

export class utils {
    public async listenUserResponse(text_input) {
        const buf = new Uint8Array(1024);
        await Deno.stdout.write(new TextEncoder().encode(text_input + ": "));
        const n = <number>await Deno.stdin.read(buf);
        return new TextDecoder().decode(buf.subarray(0, n)).trim();
    }


    public checkIp(ip){
        return ip_regex.test(ip)
    }

    public checkIps(array){
        for(let ip of array){
            if(ip != ""){
                if(!this.checkIp(ip)){
                    return false
                }
            }
        }
        return true
    }

    public generateAllIps(){
        let ipList = []
        for(let i = 1; i <= 255; i++){
            for(let j = 1; j <= 255; j++){
                for(let k = 1; k <= 255; k++){
                    for(let l = 1; l <= 255; l++){
                        ipList.push(`${i}.${j}.${k}.${l}`)
                    }
                }
            }
        }
        return ipList
    }

    public createDatabaseDir(){
        Deno.mkdirSync("./db", { recursive: true })
    }
}