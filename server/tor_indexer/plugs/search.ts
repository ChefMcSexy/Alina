export class search {
    // this function will search in the database for the given query
    public async db_searchViaTitle(title, workdb) {
        let tmp = []
        for(let i = 0; i < workdb.length; i++){
            for(let j = 0; j < workdb[i].content.length; j++){
                if(workdb[i].content[j].title.toLowerCase().includes(title.toLowerCase())){
                    let tmpS = tmp.find(x => x.url == workdb[i].content[j].url)
                    if(!tmpS){
                        tmp.push(workdb[i].content[j])
                    }
                }
            }
        }
        return tmp
    }

    public async db_search(content, workdb) {
        let tmp = []
        for(let i = 0; i < workdb.length; i++){
            for(let j = 0; j < workdb[i].content.length; j++){
                if(workdb[i].content[j].title.toLowerCase().includes(content.toLowerCase())){
                    let tmpS = tmp.find(x => x.url == workdb[i].content[j].url)
                    if(!tmpS){
                        tmp.push(workdb[i].content[j])
                    }
                } else if(workdb[i].content[j].paragraphs.length > 0){
                    for(let k = 0; k < workdb[i].content[j].paragraphs.length; k++){
                        if(workdb[i].content[j].paragraphs[k].toLowerCase().includes(content.toLowerCase())){
                            let tmpS = tmp.find(x => x.url == workdb[i].content[j].url)
                            if(!tmpS){
                                tmp.push(workdb[i].content[j])
                            }
                        }
                    }
                }
            }
        }
        return tmp
    }

    public filter(res, keywords){
        let tmp = []
        for(let i = 0; i < res.length; i++){
            //check in the name and all the paragraphs
            let found = false
            for(let j = 0; j < res[i].paragraphs.length; j++){
                for(let k = 0; k < keywords.length; k++){
                    if(res[i].paragraphs[j].toLowerCase().includes(keywords[k].toLowerCase())){
                        found = true
                    }
                }
            }
                //check the title
            for(let k = 0; k < keywords.length; k++){
                if(res[i].title.toLowerCase().includes(keywords[k].toLowerCase())){
                    found = true
                }
            }

            if(!found){
                tmp.push(res[i])
            }
        }
        return tmp
    }

    public onlyRes(res, keywords){
        let tmp = []
        for(let i = 0; i < res.length; i++){
            //check in the name and all the paragraphs
            let found = false
            for(let j = 0; j < res[i].paragraphs.length; j++){
                for(let k = 0; k < keywords.length; k++){
                    if(res[i].paragraphs[j].toLowerCase().includes(keywords[k].toLowerCase())){
                        found = true
                    }
                }
            }
                //check the title
            for(let k = 0; k < keywords.length; k++){
                if(res[i].title.toLowerCase().includes(keywords[k].toLowerCase())){
                    found = true
                }
            }

            if(found){
                tmp.push(res[i])
            }
        }
        return tmp
    }
}