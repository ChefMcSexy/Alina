// generate email based on the name & lastname
export async function generateEmailSimple(name, lastname) {
    /**
     * All the possible EMAIL
     */
    let tmp = []

    //general email
    tmp.push(name.toLowerCase()+lastname.toLowerCase())
    tmp.push(lastname.toLowerCase()+name.toLowerCase())
    tmp.push(name.toLowerCase()+"."+lastname.toLowerCase())
    tmp.push(lastname.toLowerCase()+"."+name.toLowerCase())

    //only first letter of the name or lastname
    tmp.push(name.charAt(0).toLowerCase()+lastname.toLowerCase())
    tmp.push(lastname.charAt(0).toLowerCase()+"."+name.toLowerCase())
    
    return addPattern(tmp)
}

// generate email based on the username
export async function generateEmailUsername(username){
    let tmp = []
    tmp.push(username.toLowerCase())
    return addPattern(tmp)
}


function addPattern(array){
    let pattern = JSON.parse(Deno.readTextFileSync("./tools/osint/general/email/pattern.json"))
    let email = []
    for(let i = 0; i < array.length; i++){
        for(let j = 0; j < pattern.length; j++){
            email.push(array[i]+pattern[j])
        }
    }
    return email
}
