const fastCSV = require('fast-csv');
const fs = require('fs')

const INPUT_FOLDER_PATH = './input-folder/';
const OUTPUT_FOLDER_PATH = './output-folder/';


function writeToFile(file, newList) {
    console.log('start to writeToFile', file)

    var csvStream = fastCSV.format({ headers: true }),
        writableStream = fs.createWriteStream(`./${OUTPUT_FOLDER_PATH}/${file}.csv`);

    writableStream.on("finish", function () {
        console.log("DONE!");
    });
    csvStream.pipe(writableStream);
    newList.forEach((item) => {
        csvStream.write(item);
    })
    csvStream.end();
}

function convertToCSVFile(file) {
    console.log('start to convertToCSVFile', file)
    const trelloJson = require(`./${INPUT_FOLDER_PATH}/${file}`);
    var cards = trelloJson.cards;
    var lists = trelloJson.lists;
    var members = trelloJson.members;
    var comments = trelloJson.actions.filter(a => a.type === "commentCard");
    var maxComments = cards.reduce((acc,card) => card.badges.comments > acc ? card.badges.comments : 0, 0);
    const newList = [];
    cards.forEach(card => {
        const listName = lists.find(list => list.id === card.idList).name;
        let member = null;
        if (card.idMembers[0]) {
            member = members.find(member => member.id === card.idMembers[0]).fullName;
        }
        const cardData = {
            listName: listName,
            title: card.name,
            desc: card.desc,
            shortUrl: card.shortUrl,
            url: card.url,
            member: member,
        }
        const cardComments = comments.filter(c => c.data.card.id === card.id);
        for (let i = 0; i < maxComments; i++) {
			cardData['comment' + i.toString()] = cardComments[i] ? cardComments[i].data.text : '';
		}
        newList.push(cardData);
    });
    writeToFile(file, newList)
}
function getFilesList() {
    console.log('-------getFilesList()');
    const fs = require('fs');
    return fs.readdirSync(INPUT_FOLDER_PATH);
}
(function main() {
    console.log('-------app starting ----------');
    const files = getFilesList();
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        convertToCSVFile(file);
    }
    console.log('-------app finishing ----------');
})();
