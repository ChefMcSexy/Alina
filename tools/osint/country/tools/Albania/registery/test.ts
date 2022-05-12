try {
    let body = {
        "ufprt": "B8404F97247F117517D2C2E3E8DD20B2DDE6EBF280DDA604525A85AE5B8FEED7A9CBE1BBE270E89E080E9364AA03BCD9C577BFFC4224266F2670011BAAAFAC303E3030E4A8792E179DB3C7FF8F82A5ED8364410982C0A1534F70912EF17ECE7ABB93D9AD3735EC9E2AE63A6DAA3227B1EEF7CC405A10C882475C5D0FAD5FE125B5CF374CEB274257A55E893119687E8A027AEB5FCD69D9284441F510ECDE48F0",
        "SubjectName": "testing",
        "__RequestVerificationToken": "RiQaSzrnjel8K-yFa9Kiq-kvJrwlVkl93C0I9tWXIFdI1TcpxrS38sVNzg3koa3tJvv5uHjAQwxX1KUg-wykL1n4_syd9B-ci-2Z07CTC9E1"
    }
    console.log(body)
    let req = await fetch(`https://thingproxy.freeboard.io/fetch/https://qkb.gov.al/kerko/kerko-ne-regjistrin-tregtar/kerko-per-emer-te-lire/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-data",
            "Cookie": "__RequestVerificationToken="+body.__RequestVerificationToken,
        },
        referrer: "https://qkb.gov.al/kerko/kerko-ne-regjistrin-tregtar/kerko-per-emer-te-lire/",
        body: new URLSearchParams(body)
    })
    let res = await req.text()
    Deno.writeTextFileSync("test.html", res)
    if(res.includes("alert-sucess-custom")){
        console.log("ok")
    } else {
        console.log("no")
    }
} catch(err){
    console.log(err)
}