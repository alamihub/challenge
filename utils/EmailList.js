const fs = require('fs')

class EmailList {

    constructor(path) {
        this.data = fs.readFileSync(path, 'utf8')
        this.values = this.toArray()
    }

    toArray() {
        // should regex split...
        const re = /(?<=\s|^)^\w+[\.\w]+@\w+[\.\w]+\w{2,}$/mg ;
        // const reg =  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/ ;
        const uniqueEmails = this.removeDuplicates(this.data.match(re))
        return (uniqueEmails.length > 0 ) ? uniqueEmails : null;
    }

    removeDuplicates(arrOfEmails) {
        return [...new Set(arrOfEmails)];
    }

}

module.exports = EmailList;