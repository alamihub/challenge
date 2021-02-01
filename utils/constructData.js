const EmailList = require('./EmailList')
const path = require('path')
const _ = require('lodash')
const driver = require('./driver')

        async function asyncChunkList(listName, grpPrefixe, chunkSize, emailTest, domain){ 
            let ten = []
            let groups = []
            
            let url = path.join('./uploads/', `${listName}`)
            const emails = new EmailList(url)
            const list = emails.values
            const listCount = list.length
            try {
                const dataChunk = _.chunk(list, chunkSize)
                dataChunk.map((x, i) => {
                    x.push(emailTest)
                    ten =_.chunk(x, 10)//since Google AdminSdk limit request to 10 
                    let chunks = []
                    ten.forEach( (item, j) => { chunks.push({chunk: item}) })
                    
                    let dataSegement = {
                        groupName: `${i}${grpPrefixe}@${domain}`,
                        emails : chunks
                    }
                    return groups.push(dataSegement)
                })
                function compare(a, b) {
                    let comparison = 0;
                    if (a.groupName > b.groupName) { comparison = 1}
                    else if (a.groupName < b.groupName) { comparison = -1 }
                    return comparison;
                }
                groups.sort(compare)
                const grpCount = dataChunk.length
                return await driver.insertList(listName, listCount, domain, grpPrefixe, grpCount, emailTest, groups)
            } catch (error) {
                console.log(error)
            }

        }
        exports.asyncChunkList = asyncChunkList





