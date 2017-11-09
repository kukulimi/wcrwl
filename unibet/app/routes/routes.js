//const request = require("request");
const request = require("request-promise");

let groups;

module.exports = function(app) {
    /**
     * get All sports (football, basketball, baseball ... etc.)
     */
    app.get('/group/all', (req, res) => {
        // Get all groups
        getSportList().then((body) => res.send(JSON.parse(body).group.groups));
    });

    /**
     * get :requestSport(ex.football) from all groups
     * pass termKey for :requestSport
     */
    app.get('/group/:requestSport', (req, res) => {
        const requestSport = req.params.requestSport;

        // Get all groups
        getSportList()
            .then((body) => res.send(getSport(body, requestSport))); // filter selected sport
    });

    /**
     * get :requestGroup(ex.Europa_League, Australia) from :requestSport(ex.football)
     * pass termKey for :requestSport or :requestGroup
     */
    app.get('/group/:requestSport/:requestGroup', (req, res) => {
        const requestSport = req.params.requestSport;
        const requestGroup = req.params.requestGroup;

        // Get all groups
        getSportList()
            .then((body) => res.send(getGroup(body, requestSport, requestGroup))); // filter selected group
    });

    /**
     * get :requestLeague(ex.A-League etc) :requestGroup(ex.Europa_League, Australia) from :requestSport(ex.football)
     * Note : champions_league, Europa_League, World_Cup_Qualification_Play_Off in football will return empty
     * pass termKey for :requestSport or :requestGroup or :requestLeague
     */
    app.get('/group/:requestSport/:requestGroup/:requestLeague', (req, res) => {
        const requestSport = req.params.requestSport;
        const requestGroup = req.params.requestGroup;
        const requestLeague = req.params.requestLeague;

        // Get all groups
        getSportList()
            .then((body) => res.send(getLeague(body, requestSport, requestGroup, requestLeague))); // filter selected league
    });

    /**
     * get all Match(Live & Upcoming) Events for selected sport
     */
    app.get('/match/:requestSport', (req, res) => {
        const requestSport = req.params.requestSport;

        getEvents(requestSport, null, null, 'match')
            .then((body) => {
                res.send(JSON.parse(body).events)
            });
    });

    app.get('/match/:requestSport/:requestGroup', (req, res) => {
        const requestSport = req.params.requestSport;
        const requestGroup = req.params.requestGroup;
        getEvents(requestSport, requestGroup, null, 'match')
            .then((body) => {
                res.send(JSON.parse(body).events)
            });
    });

    app.get('/match/:requestSport/:requestGroup/:requestLeague', (req, res) => {
        const requestSport = req.params.requestSport;
        const requestGroup = req.params.requestGroup;
        const requestLeague = req.params.requestLeague;
        getEvents(requestSport, requestGroup, requestLeague, 'match')
            .then((body) => {
                res.send(JSON.parse(body).events)
            });
    });

    /**
     * get all Competition(Outrights) Events for selected sport
     */
    app.get('/competition/:requestSport', (req, res) => {
        const requestSport = req.params.requestSport;

        getEvents(requestSport, null, null, 'competition')
            .then((body) => {
                res.send(JSON.parse(body).events)
            });
    });

    app.get('/competition/:requestSport/:requestGroup', (req, res) => {
        const requestSport = req.params.requestSport;
        const requestGroup = req.params.requestGroup;
        getEvents(requestSport, requestGroup, null, 'competition')
            .then((body) => {
                res.send(JSON.parse(body).events)
            });
    });

    app.get('/competition/:requestSport/:requestGroup/:requestLeague', (req, res) => {
        const requestSport = req.params.requestSport;
        const requestGroup = req.params.requestGroup;
        const requestLeague = req.params.requestLeague;
        getEvents(requestSport, requestGroup, requestLeague, 'competition')
            .then((body) => {
                res.send(JSON.parse(body).events)
            });
    });
};

let getSportList = () => {
    const groupUrl = 'https://o1-api.aws.kambicdn.com/offering/api/v2/ubau/group.json?lang=en_AU&market=AU';
    return request(groupUrl);
};

let getSport = (body, requestGroup) => {
    let resBody = JSON.parse(body);
    groups = resBody.group.groups;

    // filter out selected group from group list
    let group = groups.filter((group) => {
        return group.termKey.toLowerCase() === requestGroup.toLowerCase();
    });

    return group ? group[0] : {};
};


let getGroup = (body, requestSport, requestGroup) => {
    let groups = getSport(body, requestSport).groups;
    // filter out selected group from group list
    let group = groups.filter((group) => {
        return group.termKey.toLowerCase() === requestGroup.toLowerCase();
    });

    return group ? group[0] : {};
};

let getLeague = (body, requestSport, requestGroup, requestLeague) => {
    let groups = getGroup(body, requestSport, requestGroup).groups;
    // filter out selected group from group list
    let group = groups.filter((group) => {
        return group.termKey.toLowerCase() === requestLeague.toLowerCase();
    });

    return group ? group[0] : {};
};

let getEvents = (selectedGroup, selectedSubGroup, selectedLeague, category) => {
    selectedGroup = selectedGroup ? selectedGroup : 'all';
    selectedSubGroup = selectedSubGroup ? selectedSubGroup : 'all';
    selectedLeague = selectedLeague ? selectedLeague : 'all';
    category = category ? category : 'match';
    let eventType = category === 'match' ? 'matches' : 'competitions';
    let categoryGroup = category !== 'match' ? 'BET_OFFER_CATEGORY_SELECTION' : 'COMBINED';
    let subGroupAllMatchesUrl = `https://o1-api.aws.kambicdn.com/offering/api/v3/ubau/listView/${selectedGroup}/${selectedSubGroup}/${selectedLeague}/all/${eventType}.json?lang=en_AU&market=AU&client_id=2&categoryGroup=${categoryGroup}&displayDefault=true&category=${category}`;

    return request(subGroupAllMatchesUrl);
};
