/*-------------------------------------------------------------------------------------------------------------------------------------------------*/
/*A small JSON Database Driver Based on Lowdb/lodash
/* Lowdb support all lodash functionalities ex: to use get(src, ...args) we jsut need to call get(...args) and so on for funtions with predicats
/* since lowdb require the src at the top of chainning process...
/*-------------------------------------------------------------------------------------------------------------------------------------------------*/      
const        
    low = require('lowdb'),
    FileAsync = require('lowdb/adapters/FileAsync'),
    adapter = new FileAsync('./data/db.json')
let db
async function initdb() {
    db = await low(adapter)
    db.defaults({ lists: [] }).write()
}
initdb()
//  insert Email lists to db
async function insertList(listName, listCount, domain, grpPrefixe, grpCount, emailTest, groups){
    const list = {
        listName: listName,
        listCount: listCount,
        domain: domain,
        grpPrefixe: grpPrefixe,
        grpCount: grpCount,
        emailTest: emailTest,
        groups: groups
    }
    return await db.get('lists').push(list).write()
}
exports.insertList = insertList

// Get Email lists from db
async function getList(name){
    const list = await db.get('lists').filter({listName: name}).value()
    console.log(list)
    return list
}
exports.getList = getList

// Get grpEmails from db
async function getGrpEmails(name){
    const list = await db.get('lists').find({listName: name}).get('groups').map(x => x.groupName).value()
                            
    return list
}
exports.getGrpEmails = getGrpEmails

// get mbrEmails from db
async function getSegements(name){
    const list = await db.get('lists')
                        .find({listName: name})
                        .get('groups')
                        .value()
    return list
}
exports.getSegements = getSegements


// get 10 mbrEmails from db since Google AdminSdk limit request to 10 
async function getEmailsTen(name, Id, chunkId){
    const list = await db.get('lists')
                        .find({listName: name})
                        .get(`groups[${Id}].emails[${chunkId}].chunk`)
                        .value()
    return list
}
exports.getEmailsTen = getEmailsTen

// get 1grpname from db
async function getGrpName(name, Id){
    const nm = await db.get('lists')
                        .find({listName: name})
                        .get(`groups[${Id}].groupName`)
                        .value()
    return nm
}
exports.getGrpName = getGrpName


// get listDetails from db
async function listDetails(){
    const list = await db.get('lists')
                        .map(x => {
                                let res = {
                                    listName: x.listName,
                                    Counts: x.listCount,
                                    prefixe: x.grpPrefixe,
                                    gsize: x.grpCount,
                                    testEmail: x.emailTest,
                                    domain: x.domain
                            }
                            return res
                        })
                        .value()
    return list
}
exports.listDetails = listDetails

// Get All email lists
async function getAllList(){
    const list = await db.get('lists').map('listName').value()
    console.log(list)
    return list
}
exports.getAllList = getAllList

// Update list in db
async function updateList(listName, newName){
    return await db.get('lists').find({listName: listName}).assign({listName: newName}).write()
}
exports.updateList = updateList

// Delete list in db
async function deleteList(listName){
    return await db.get('lists').remove({listName: listName}).write()
}
exports.deleteList = deleteList