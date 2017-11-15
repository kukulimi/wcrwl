const request = require("request-promise");
const Promise = require('promise');

module.exports = function(app) {
    /**
     * get All competitions, name of each competition can be uses to request matches
     */
    app.get('/tab/competitions', (req, res) => {
        getAllcompetitions().then((body) => {
            res.send(JSON.parse(body).competitions)
        });
    });

    /**
     * request matches for given name of competition
     * example : http://localhost:3000/tab/matches/South%20Korea%20K-League
     */
    app.get('/tab/matches/:competitionName', (req, res) => {
        const requestCompetitionName = req.params.competitionName;

        getMatches(requestCompetitionName).then((body) => {
            res.send(parseMatches(JSON.parse(body)));
        });
    });

    /**
     * Go Crazy iterate through all competitons and get all matches..
     */
    app.get('/tab/getall', (req, res) => {
        let gatheredList = [];
        getAllcompetitions().then((body) => {
            let promises = [];
            JSON.parse(body).competitions.forEach((competition, idx, array) => {

                let requestCompetitionName = competition.name;

                let prom = getMatches(requestCompetitionName).then((matchBody) => {
                    gatheredList.push(parseMatches(JSON.parse(matchBody)));
                });

                promises.push(prom);

                if (idx === array.length -1) {
                    Promise.all(promises).then(() => {
                        res.send(gatheredList);
                    });
                }
            });
        });
    });
};

let getAllcompetitions = () => {
    const compUrl = 'https://api.beta.tab.com.au/v1/tab-info-service/sports/Soccer?jurisdiction=NSW';
    return request(compUrl);
};

let getMatches = (requestCompetition) => {
    const matchUrl = `https://api.beta.tab.com.au/v1/tab-info-service/sports/Soccer/competitions/${requestCompetition}?jurisdiction=NSW&numTopMarkets=5`;
    return request(matchUrl);
};

let parseMatches = (matches) => {
    let returnObj = {
        matches : []
    };

    matches.matches.forEach((match) => {
        returnObj.matches.push({
            id : match.id,
            league : matches.name,
            homeName : !match.contestants || match.contestants.length ===0 ? '' :
                (match.contestants[0].isHome ? match.contestants[0].name : match.contestants[1].name),
            awayName : !match.contestants || match.contestants.length ===0 ? '' :
                (match.contestants[0].isHome ? match.contestants[1].name : match.contestants[0].name),
            bookmakers : getBookmakers(match)
        });
    });
    // returnObj.matches.push(matches.matches);
    return returnObj;
};

let getBookmakers = (match) => {
    let returnObj = {
        bookmaker : 1,
        name : 'tab',
        types : []
    };

    match.markets.forEach((market) => {
        returnObj.types.push({
            name : market.name,
            odds : getOdds(market.propositions),
            move : ''
        });
    });
    return returnObj;
};

let getOdds = (props) => {
    let returnObj = {};
    props.forEach((prop) => {
        let odd = {};
        odd[prop.name] = prop.returnWin;
        Object.assign(returnObj, odd);
    });

    return returnObj;
};