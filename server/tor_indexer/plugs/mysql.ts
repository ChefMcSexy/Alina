import { Client } from "https://deno.land/x/mysql/mod.ts";
const conf = JSON.parse(Deno.readTextFileSync('./plugs/config.json'));
const client = await new Client().connect(conf);

let waiting:string[] = []
let making:string[] = []
try {
    waiting = JSON.parse(deno.readTextFileSync('./db/waiting.json'))
} catch (error) {}

if(waiting.length == 0){
    waiting = ['http://livehackzyr2wwos2ca3ygfan3ngvqytpe5ph74pdko55ohv6lgdshyd.onion/']
}


setInterval(async () => {
    Deno.writeTextFileSync('./db/waiting.json', JSON.stringify(waiting))
    try {
        let add = (Deno.readTextFileSync('./add')).split('\n')
        waiting = waiting.concat(add)
        Deno.removeSync('./add')
    } catch (error) {}
}, 10000)

export class databaseManager {

    public async createDomainIfNotExist(domain: string): Promise<void> {
        //check if domain exist
        const result = await client.query(`SELECT * FROM domain WHERE domain = '${domain}'`);
        if (result.length === 0) {
            //create domain
            await client.query(`INSERT INTO domain (domain) VALUES ('${domain}')`);
        }
    }

    public async addImageIfNotExist(image: any): Promise<void> {
        //check if path exist
        const result = await client.query(`SELECT * FROM images WHERE url = '${image.url}'`);
        if (result.length === 0) {
            //create path
            await client.query(`INSERT INTO images (url, alt, id, name, type) VALUES (?, ?, ?, ?, ?)`, [image.url, image.alt, image.id, image.name, image.type]);
        } else {
            //update alt, id, name
            await client.query(`UPDATE images SET alt = ?, id = ?, name = ? WHERE url = ?`, [image.alt, image.id, image.name, image.url]);
        }
    }

    public async addVideoIfNotExist(video: any): Promise<void> {
        //check if path exist
        const result = await client.query(`SELECT * FROM videos WHERE url = '${video.url}'`);
        if (result.length === 0) {
            //create path
            await client.query(`INSERT INTO videos (url, alt, id, name, type) VALUES (?, ?, ?, ?, ?)`, [video.url, video.alt, video.id, video.name, video.type]);
        } else {
            //update alt, id, name
            await client.query(`UPDATE videos SET alt = ?, id = ?, name = ? WHERE url = ?`, [video.alt, video.id, video.name, video.url]);
        }
    }

    public async addEmailIfNotExist(domain:string, email:string) : Promise<void> {
        //check if email exist
        const result = await client.query(`SELECT * FROM email, domain WHERE email.email = '${email}' AND domain.domain = '${domain}' AND domain.id = email.domainID`);
        if (result.length === 0) {
            //Get the domain ID
            const domainID = await client.query(`SELECT id FROM domain WHERE domain = '${domain}'`);

            //create email
            await client.query(`INSERT INTO email (email, domainID) VALUES ('${email}', '${domainID[0].id}')`);
        }
    }

    public async addPageContentIfNotExist(domain:string, url:string, title:string, p:string[]) : Promise<void> {
        title = title.replace(/'/g, "\'");
        //check if the pages exist
        const result = await client.query(`SELECT * FROM pages WHERE url = '${url}'`);
        if (result.length === 0) {
            //create the new page
            await client.query(`INSERT INTO pages (url, title) VALUES ('${url}', '${title}')`);
        } else {
            // update pages title
            await client.query(`UPDATE pages SET title = '${title}' WHERE url = '${url}'`);
            // delete all paragraphs
            await client.query(`DELETE FROM paragraphs WHERE pageid = (SELECT pageid FROM pages WHERE url = '${url}')`);
        }
        
        for(let i = 0; i<p.length; i++) {
            try {
                await client.query(`INSERT INTO paragraphs (pageid, content) VALUES ((SELECT pageid FROM pages WHERE url = ?), ?)`, [url, p[i]]);
            } catch (error) {}
        }
    }

    public async addInternalLinkIfNotExist(link:string) : Promise<void> {
        //check if the link exist
        const result = await client.query(`SELECT * FROM pages WHERE url = '${link}'`);
        if (result.length === 0) {
            //create the new link
            await client.query(`INSERT INTO pages (url, title) VALUES ('${link}', 'none')`);
            // add to waiting
            waiting.push(link);
        }
    }

    public async addExternalLinkIfNotExist(link:string) : Promise<void> {
        //check if the link exist
        const result = await client.query(`SELECT * FROM pages WHERE url = '${link}'`);
        if (result.length === 0) {
            //create the new link
            await client.query(`INSERT INTO pages (url, title) VALUES ('${link}', 'none')`);
            // add to waiting
            waiting.push(link);
        }
    }

    public getWaitingUrl(): Promise<string> {
        //get the first url and delete it from waiting
        if(waiting.length == 0){
            this.neverDie()
            return "none"
        }
        let url = waiting.shift();
        making.push(url);
        console.log(`Size: ${waiting.length}`)
        return url;
    }

    public checkURL(url:string) : boolean {
        //return true si l'url est dans making
        if(making.includes(url)){
            return true
        }
        return false
    }

    public deleteFromMaking(url:string) : void {
        //delete the url from making
        making.splice(making.indexOf(url), 1)
    }

    private async neverDie(){
        let list:string[] = []
        //select all domain with no page
        let result = await client.query(`SELECT domain FROM domain`);
        for(let i = 0; i<result.length; i++){
            list.push("http://"+result[i].domain)
        }
        waiting = waiting.concat(list)
    }


    ///// SEARCH ////
    public async searchAll(keyword:string, page:number){
        let min = (page-1)*20
        let max = page*20
        //select from pages.titre paragraphs.content
        let res = await client.query(`SELECT pages.url, pages.title, paragraphs.content FROM pages, paragraphs WHERE paragraphs.pageid = pages.pageid AND paragraphs.content LIKE '%${keyword}%' LIMIT ${min}, ${max}`);
    
        return res
    }

    public async searchByTitle(keyword:string, page:number){
        let min = (page-1)*20
        let max = page*20
        //select from pages.titre paragraphs.content
        let res = await client.query(`SELECT url, title FROM pages WHERE pages.title LIKE '%${keyword}%' LIMIT ${min}, ${max}`);
        return res
    }

    public async searchImage(keyword:string, page:number){
        let min = (page-1)*20
        let max = page*20
        //select from pages.titre paragraphs.content
        let res = await client.query(`SELECT DISTINCT url, alt, name FROM images WHERE images.alt LIKE '%${keyword}%' OR images.name LIKE '%${keyword}%' LIMIT ${min}, ${max}`);
        return res
    }

    public async searchVideo(keyword:string, page:number){
        let min = (page-1)*20
        let max = page*20
        //select from pages.titre paragraphs.content
        let res = await client.query(`SELECT DISTINCT url, alt, name FROM videos WHERE videos.alt LIKE '%${keyword}%' OR videos.name LIKE '%${keyword}%' LIMIT ${min}, ${max}`);
        return res
    }

}