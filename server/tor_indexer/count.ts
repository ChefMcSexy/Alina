let bannedDomain = JSON.parse(Deno.readTextFileSync('./db/clonned_domain.json'))
console.log(bannedDomain.length)