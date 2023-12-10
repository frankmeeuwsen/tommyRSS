const fs = require('fs');
const RSS = require('rss');
const schedule = require('node-schedule');

const entriesFile = './entries.json';
const rssFile = './feed.xml';
const usedEntriesFile = './usedEntries.json';

// Functie om een willekeurige entry te kiezen
function chooseRandomEntry(entries, usedEntries) {
    const availableEntries = entries.filter(entry => !usedEntries.includes(entry));
    const randomIndex = Math.floor(Math.random() * availableEntries.length);
    return availableEntries[randomIndex];
}

// Functie om de RSS-feed bij te werken
function updateRSS(entry) {
    const feed = new RSS({
        title: "Tommy's dagelijkse quote",
        description: "Elke dag zegt Tommy wel iets slims",
        feed_url: "http://frankmeeuwsen.xyz/tommy/feed.xml",
        site_url: "http://frankmeeuwsen.xyz/tommy/",
        language: "nl",
    });

    const uniqueGuid = new Date().getTime(); 

    feed.item({
        title: `Tommy's wijsheid van de dag`,
        description: entry.text,
        date: new Date(),
        guid: uniqueGuid.toString(),
    });

    fs.writeFileSync(rssFile, feed.xml());
}

// Functie om de taak te plannen
function scheduleTask() {
    schedule.scheduleJob('0 6 * * *', () => {
        const entries = JSON.parse(fs.readFileSync(entriesFile, 'utf8'));
        let usedEntries = JSON.parse(fs.readFileSync(usedEntriesFile, 'utf8'));

        const entry = chooseRandomEntry(entries, usedEntries);
        updateRSS(entry);

        usedEntries.push(entry);
        if (usedEntries.length > 30) {
            usedEntries = usedEntries.slice(-30);
        }

        fs.writeFileSync(usedEntriesFile, JSON.stringify(usedEntries));
    });
}

scheduleTask();