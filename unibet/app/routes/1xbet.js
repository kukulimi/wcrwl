const request = require("request-promise");
const Promise = require('promise');

module.exports = function(app) {
    /**
     * Live bet section
     */
    app.get('/1xbet/livebets', (req, res) => {
        getLiveBets().then((body) => {
            res.send(getMatches(body));
        });
    });

    /**
     * sports book section
     */
    app.get('/1xbet/sportsbook', (req, res) => {
        getLineFeeds().then((body) => {
            res.send(getMatches(body));
        });
    });
};

let getLiveBets = () => {
    const liveBetUrl = 'https://1xbet.com/LiveFeed/Get1x2_Zip?sports=1&count=30&lng=au&mode=4&country=4';
    return request(liveBetUrl);
};

let getLineFeeds = () => {
    const lineFeedUrl = 'https://1xbet.com/LineFeed/Get1x2_Zip?sports=1&count=30&lng=au&mode=4&country=4';
    return request(lineFeedUrl);
};


let getMatches = (body) => {
    let matches = [];
    let parsedList = JSON.parse(body).Value;
    parsedList.forEach((match) => {
        matches = matches.concat({
            id : match.I, // or N is game id
            date : match.S, // This seems to be match start time but don't know the timezone.
            url : null,
            timestamp : Date.now(),
            league : match.LE,
            country : null,
            homeName: match['O1E'],
            awayName: match['02E'],
            bookmakers: getBookmakers(match.E)
        });
    });

    return matches;
};

let getBookmakers = (odds) => {
    // Group 1 : Type 1,2,3 = 1 X 2
    // Group 2 : Type 7, 8 = Handicap : 1 ,2
    // Group 8 : Type 4, 5, 6 = 1X 12 2X
    // Group 15 : Type 11, 12 = team1over team1under
    // Group 17 : Type 9, 10 = over under
    // Group 62 : Type 13, 14 = team2over team1under
    let bookmaker = {
        bookmaker : 2,
        name : '1xbet',
        types : []
    };
    odds.forEach((odd) => {
        let type = {
            move : null,
            odds : {}
        };
        switch(odd.G) {
            case 1 :
                type.name = '1x2';
                type.odds = odd.T === 1 ? {'1':odd.C} : (odd.T === 2 ? {'X':odd.C} : {'2':odd.C});
                break;
            case 8 :
                type.name = 'Double Chance';
                type.odds = odd.T === 4 ? {'1X':odd.C} : (odd.T === 5 ? {'12':odd.C} : {'2X':odd.C});
                break;
            case 17 :
                type.name = 'Total';
                type.odds = odd.T === 9 ? {'over':odd.C,'parameter':odd.P} : {'under':odd.C,'parameter':odd.P};
                break;
            case 2 :
                type.name = 'Handicap';
                type.odds = odd.T === 7 ? {'1':odd.C,'parameter':odd.P} : {'2':odd.C,'parameter':odd.P};
                break;
            case 15 :
                type.name = 'IT1';
                type.odds = odd.T === 11 ? {'over':odd.C,'parameter':odd.P} : {'under':odd.C,'parameter':odd.P};
                break;
            case 62 :
                type.name = 'IT2';
                type.odds = odd.T === 13 ? {'over':odd.C,'parameter':odd.P} : {'under':odd.C,'parameter':odd.P};
                break;
        }

        var done = false;
        bookmaker.types.forEach((tp) => {
            if (tp.name === type.name) {
                done = true;
                Object.assign(tp.odds, type.odds);
            }
        });

        if (!done) {
            bookmaker.types.push(type);
        }
    });

    return bookmaker;
};