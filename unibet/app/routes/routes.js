//const request = require("request");
const request = require("request-promise");

let groups;

module.exports = function(app) {
    app.get('/group/all', (req, res) => {
        // Get all groups
        getGroupList().then((body) => res.send(JSON.parse(body)));
    });

    /**
     * get :requestGroup(ex.football) from all groups
     */
    app.get('/group/:requestGroup', (req, res) => {
        const requestGroup = req.params.requestGroup;
        console.log('englishName_PathVar',req.params.requestGroup);

        // Get all groups
        getGroupList()
            .then((body) => res.send(getGroup(body, requestGroup))); // filter selected group
    });

    app.get('/group/:requestGroup/all', (req, res) => {
        const requestGroup = req.params.requestGroup;

        getAllMatches(requestGroup)
            .then((body) => {
                res.send(JSON.parse(body).events)
            });
    });

    app.get('/group/:requestGroup/:events', (req, res) => {
        const requestGroup = req.params.requestGroup;

        getAllMatches(requestGroup)
            .then((body) => {
                res.send(JSON.parse(body))
            });
    });

    app.get('/group/:requestGroup/:requestSubGroup', (req, res) => {

    });
};

let getGroupList = () => {
    const groupUrl = 'https://o1-api.aws.kambicdn.com/offering/api/v2/ubau/group.json?lang=en_AU&market=AU';
    return request(groupUrl);
};

let getGroup = (body, requestGroup) => {
    let resBody = JSON.parse(body);
    groups = resBody.group.groups;

    // filter out selected group from group list
    let group = groups.filter((group) => {
        return group.englishName.toLowerCase().replace(' ', '_') === requestGroup.toLowerCase();
    });

    return group ? group[0] : {};
};

let getAllMatches = (selectedGroup, category) => {
    let categoryGroup = category !== 'match' ? 'BET_OFFER_CATEGORY_SELECTION' : 'COMBINED';
    let subGroupAllMatchesUrl = `https://o1-api.aws.kambicdn.com/offering/api/v3/ubau/listView/${selectedGroup}/australia/ffa_cup/all/matches.json?lang=en_AU&market=AU&client_id=2&categoryGroup=${categoryGroup}&displayDefault=true&category=${category}`;

    return request(subGroupAllMatchesUrl);
};