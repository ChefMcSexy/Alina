import { show } from '../../../../utils/show.ts'
import * as ink from 'https://deno.land/x/ink/mod.ts'
const _show = new show()

export async function getUserData(username, sessionid) {
    try {
        let response = await fetch(`https://www.instagram.com/${username}/?__a=1`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Instagram 64.0.0.14.96',
                "cookie": 'sessionid=' + sessionid + ';'
            }
        })
        return await response.json()
    } catch (err) {}
    return null
}

export function renderResult(data) {
    console.log()
    try {
        _show.log(`user ${ink.colorize("<blue>"+data.graphql.user.username+"</blue>")} has ${ink.colorize("<green>"+data.graphql.user.edge_owner_to_timeline_media.count+"</green>")} posts`)
    } catch(err){}
    

    _show.log(`user login page id: ${ink.colorize("<blue>"+data.logging_page_id+"</blue>")}`)
    _show.log(`user id: ${ink.colorize("<blue>"+data.graphql.user.id+"</blue>")}`)

    _show.log(`user full name: ${ink.colorize("<blue>"+data.graphql.user.full_name+"</blue>")}`)
    _show.log(`user biography: ${ink.colorize("<blue>"+data.graphql.user.biography+"</blue>")}`)

    if (data.graphql.user.external_url) {
        _show.log(`user external url: ${ink.colorize("<blue>"+data.graphql.user.external_url+"</blue>")}`)
    }
    if (data.graphql.user.edge_followed_by.count) {
        _show.log(`user follows ${ink.colorize("<blue>"+data.graphql.user.edge_followed_by.count+"</blue>")} people`)
    }
    if (data.graphql.user.edge_follow.count) {
        _show.log(`user is followed by ${ink.colorize("<blue>"+data.graphql.user.edge_follow.count+"</blue>")} people`)
    }

    if (data.graphql.user.is_verified) {
        _show.log(`user is verified`)
    }

    //check if business account
    if (data.graphql.user.is_business_account) {
        _show.log(`user is a  ${ink.colorize("<green>business</green>")} account`)
    }
    //check professional
    if (data.graphql.user.is_professional_account) {
        _show.log(`user is a ${ink.colorize("<green>professional</green>")} account`)
    }

    //b info
    if (data.graphql.user.business_category_name) {
        _show.log(`user business category: ${ink.colorize("<blue>"+data.graphql.user.business_category_name+"</blue>")}`)
    }
    if (data.graphql.user.business_address_json) {
        _show.log(`user business address: ${ink.colorize("<blue>"+data.graphql.user.business_address_json+"</blue>")}`)
    }

    if (data.graphql.user.public_email) {
        _show.log(`user email: ${ink.colorize("<blue>"+data.graphql.user.public_email+"</blue>")}`)
    }
    if (data.graphql.user.public_email) {
        _show.log(`user phone: ${ink.colorize("<blue>"+data.graphql.user.public_email+"</blue>")}`)
    }

    // b email and b phone
    if (data.graphql.user.business_email) {
        _show.log(`user business email: ${ink.colorize("<blue>"+data.graphql.user.business_email+"</blue>")}`)
    }
    if (data.graphql.user.business_phone_number) {
        _show.log(`user business phone: ${ink.colorize("<blue>"+data.graphql.user.business_phone_number+"</blue>")}`)
    }

    //post and collection 
    if (data.graphql.user.edge_owner_to_timeline_media.count.length > 0) {
        _show.log(`user has ${ink.colorize("<blue>"+data.graphql.user.edge_owner_to_timeline_media.count+"</blue>")} posts`)
    }
    if (data.graphql.user.edge_saved_media.count.length > 0) {
        _show.log(`user has ${ink.colorize("<blue>"+data.graphql.user.edge_saved_media.count+"</blue>")} collections`)
    }
}