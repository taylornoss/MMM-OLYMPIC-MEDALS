const cheerio = require('cheerio');
const LOG = require('logger');

function getURL(type, year) {
    return `https://www.espn.com/olympics/${type}/${year}/medals`;
}

async function getMedalData(type, year, limit) {
    var url = getURL(type, year);

    var response = await fetch(url);

    if (!response.ok) {
        LOG.log("Error fetching data from ESPN");
    }

    var body = await response.text();
    const $ = cheerio.load(body);
    var medalContainer = $('.medal-container');
    var medalTable = medalContainer.next();
    if (medalTable[0].name !== 'table') {
        return {
            header: 'No Medals Data',
            rows: 'No Medals data available yet'
        }
    }
    var header = medalTable.find('caption').first().text();
    var rows = medalTable.find('tbody');
    let countries = [];
    rows.find('tr').each((index, row) => {
        if(index >= limit){
            return false;
        }
        let data = {
            abbreviation: $(row).find('.country_name--abbrev').first().text(),
            country: $(row).find('.country_name--long').first().text(),
            img: $(row).find('.team-logo').attr('src'),
            gold: $(row).find('td').eq(1).text(),
            silver: $(row).find('td').eq(2).text(),
            bronze: $(row).find('td').eq(3).text(),
            total: $(row).find('td').eq(4).text(),
        }
        countries.push(data);
    });
    return {
        header: header,
        rows: countries
    }
}

module.exports = { getMedalData };