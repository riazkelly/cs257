/*
 * webapp.js
 * Ethan Ash and Riaz Kelly
 */

window.onload = initialize;
var isDraft;
var continueFunc = true;
var continueFunc2 = true;
var continueFunc3 = true;

function initialize() {
    if (location.href.split("/").slice(-1)[0] !== "sandbox") {
        isDraft = true;
        fillInTeamSelector();
        setFormation("4-3-3");
        makeClickable();
    }
    else {
        isDraft = false;
        fillInTeamSelector();
        setFormation("4-3-3");
        fillInPositionSelector();
        searchLeagues();
        searchClubs();
        searchNationalities();
        searchPreferredFeet();
        searchNames();
    }

}

//––––––––––––––––––––––––––– Overlapping Draft/Search Functions –––––––––––––––––––––––––––

function displayPlayerStats(card, player) {
    var displayPlayerStats = card.getElementById('displayPlayerStats')[0];
    stats.innerHTML = player['nationality'] + player['league'] + player['club'] + String(player['weak_foot'])
    + '/5' + String(player['skill_moves']) + '/5' + player['preferred_foot'] + player['age'];
}

function fillInTeamSelector() {
    var mode = 'draft';
    if (!isDraft){
        mode = 'sandbox'
    }
    var url = getAPIBaseURL() + '/accountteams/' + mode;
    console.log(url);
    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then(function(teams) {
        var teamSelector = document.getElementById("teamSelector");
        var innerHTML = '<option selected disabled>Select Team</option>';
        for(var team of teams){
            innerHTML = innerHTML + '<option value="' + team["id"] + '">' + team["name"] + '</option>';
        }
        teamSelector.innerHTML = innerHTML;
        continueFunc2 = true;
    })
}

function fillInPositionSelector(){
    var positionSelector = document.getElementById("positionSelector");
    var playerField = document.getElementsByClassName("player-field")[0];
    var innerHTML = "";
    for (var card of playerField.children) {
        var className = card.getAttribute("class");
        if (className == "inactive-card" || className =='inactive-goalie-card') {
            var position = card.getAttribute("position");
            innerHTML = innerHTML + '<option value="' + position + '">' + position + '</option>';
        }

    }
    positionSelector.innerHTML = innerHTML;
}

function createNewTeam(){
    var formation = document.getElementById("formations").value;
    var mode = 'draft';
    if (!isDraft){
        mode = 'sandbox';
    }
    var url = getAPIBaseURL() + '/createteam/' + mode + '/' + formation;
    console.log(url);
    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then(function(teams) {
        var teamId;
        var teamName;
        for (var team of teams){
            teamId = team["id"];
            teamName = team["name"];
        }
        continueFunc2 = false;
        fillInTeamSelector();
        waitForIt();
        function waitForIt(){
            if (!continueFunc2) {
                setTimeout(function(){waitForIt()},100);
            }else {
                continueFunc3 = false;
                setTeam(teamId, teamName);
                waitForItAgain();
                function waitForItAgain(){
                    if (!continueFunc3) {
                        setTimeout(function(){waitForItAgain()},100);
                    }else {
                        continueFunc = true;
                    }
                }
            }
        }
    })
}

function changeTeam(teamId){
    var teamName;
    var selectOptions = document.getElementById("teamSelector").children;
    for (var option of selectOptions){
        if (option.value == teamId){
            teamName = option.innerHTML;
            break;
        }
    }
    resetField();
    setTeam(teamId, teamName);
    displayTeam();
}

function resetField(){
    var playerField = document.getElementsByClassName("player-field")[0];
    var positions = playerField.children;

    for (var i = 0; i < positions.length; i ++) {
        var position = positions[i];
        position.removeAttribute("onclick");
        position.removeAttribute("class");
        position.innerHTML = "";
    }
}

function changeTeamName(){
    var newNameInput = document.getElementById("new-team-name");
    var newName = newNameInput.value;
    continueFunc = false;
    if (!getTeamId()){
        createNewTeam();
    }else{
        continueFunc = true;
    }
    waitForIt();
    function waitForIt(){
        if (!continueFunc) {
            setTimeout(function(){waitForIt()},100);
        }else {
            var mode = 'draft';
            if (!isDraft){
                mode = 'sandbox';
            }
            var url = getAPIBaseURL() + '/changeteamname/' + mode + '?teamid=' + getTeamId() + '&name=' + newName;
            console.log(url);
            fetch(url, {method: 'get'})

            .then((response) => response.json())

            .then(function(teams) {
                var teamId;
                var teamName;
                for (var team of teams){
                    teamId = team["id"];
                    teamName = team["name"]
                }
                continueFunc2 = false;
                fillInTeamSelector();
                waitForItAgain();
                function waitForItAgain(){
                    if (!continueFunc2) {
                        setTimeout(function(){waitForItAgain()},100);
                    }else {
                        setTeam(teamId, teamName);
                    }
                }
            })
        }
    }

}

function getTeamId(){
    var teamIdForm = document.getElementById("teamId");
    return teamIdForm.getAttribute("value");
}

function setTeam(newId, newName){
    var teamIdForm = document.getElementById("teamId");
    teamIdForm.setAttribute("value", newId);
    teamIdForm.setAttribute("teamname", newName);

    var teamNameInput = document.getElementById("new-team-name");
    teamNameInput.value = newName;

    var newNameForm = document.getElementById("new-team-name");
    newNameForm.setAttribute("value", newName);

    var teamsChoices = document.getElementById("teamSelector").children;
    for (team of teamsChoices){
        if (team.value == newId){
            team.selected = 'selected';
        }
    }
    console.log("done")
    continueFunc3 = true;
}

function resetTeam(){
    var teamIdForm = document.getElementById("teamId");
    teamIdForm.setAttribute("value", "");
    teamIdForm.setAttribute("teamname", "");

    var newNameForm = document.getElementById("new-team-name");
    newNameForm.setAttribute("value", "New Draft");

    var ratingDiv = document.getElementById("team-average-rating");
    ratingDiv.innerHTML = "";
}

function addPlayerToTeam(playerId, playerLocation){
    var url;
    if (playerLocation == 17 || playerLocation == "17") {
        goalieId = playerId;
        var mode = 'draft';
        if (!isDraft){
            mode = 'sandbox';
        }
        url = getAPIBaseURL() + '/addgoalie/' + mode + '?goalieid=' + goalieId + '&teamid=' + getTeamId();

    }
    else {
        var mode = 'draft';
        if (!isDraft){
            mode = 'sandbox';
        }
        url = getAPIBaseURL() + '/addplayer/' + mode + '?playerid=' + playerId + '&teamid=' + getTeamId() + '&playerlocation=' + playerLocation;
    }
    console.log(url);
    fetch(url, {method: 'get'});
}

function displayTeam(){
    var rating = document.getElementById('team-average-rating');
    rating.innerHTML='';
    var playerField = document.getElementsByClassName("player-field")[0];

    var mode = 'draft';
    if (!isDraft){
        mode = 'sandbox';
    }
    var url = getAPIBaseURL() + '/teamplayers/' + mode + '?teamid=' + getTeamId();
    console.log(url);
    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then(function(players) {
        var sum = 0;
        var total = 0;
        for (var player of players){
            if (player['formation']){
                setFormation(player['formation']);
                continue;
            }
            var query = '[positionindex="' + player["location"] + '"]'
            console.log(playerField)
            console.log(player["location"])
            var fieldLocation = playerField.querySelectorAll(query)[0];
            var position = fieldLocation.getAttribute("position");

            if(fieldLocation.getAttribute("class") == "inactive-card"){
                fieldLocation.setAttribute("class", "active-card");
                var positionDiv = fieldLocation.getElementsByClassName("player-position")[0];
                var overallRatingDiv = fieldLocation.getElementsByClassName("player-overall-rating")[0];
                var nameDiv = fieldLocation.getElementsByClassName("player-name")[0];
                var paceDiv = fieldLocation.getElementsByClassName("player-pace")[0];
                var shootingDiv = fieldLocation.getElementsByClassName("player-shooting")[0];
                var passingDiv = fieldLocation.getElementsByClassName("player-passing")[0];
                var dribblingDiv = fieldLocation.getElementsByClassName("player-dribbling")[0];
                var defenseDiv = fieldLocation.getElementsByClassName("player-defense")[0];
                var physicalDiv = fieldLocation.getElementsByClassName("player-physical")[0];
                var playerImage = fieldLocation.getElementsByClassName("player-image")[0];
                var popup = fieldLocation.getElementsByClassName("popup")[0];

                var popupName = popup.getElementsByClassName("popupName")[0];
                popupName.innerHTML = player['name'];
                var popupNationality = popup.getElementsByClassName("popupCountry")[0];
                popupNationality.innerHTML = "Nationality: " + player['nationality'];
                var popupLeague = popup.getElementsByClassName("popupLeague")[0];
                popupLeague.innerHTML = "League: " + player['league'];
                var popupClub = popup.getElementsByClassName("popupClub")[0];
                popupClub.innerHTML = "Club: " + player['club'];
                var popupPreferredFoot = popup.getElementsByClassName("popupPreferredFoot")[0];
                popupPreferredFoot.innerHTML = "Preferred Foot: " + player['preferred_foot'];
                var popupWeakFoot = popup.getElementsByClassName("popupWeakFoot")[0];
                popupWeakFoot.innerHTML = "Weak Foot Ability: " + player['weak_foot'] + '/5';
                var popupSkillMoves = popup.getElementsByClassName("popupSkillMoves")[0];
                popupSkillMoves.innerHTML = "Skill Moves: " + player['skill_moves'] + '/5';

                positionDiv.innerHTML = position;
                overallRatingDiv.innerHTML = player['overall'];
                nameDiv.innerHTML = player['name'];
                paceDiv.innerHTML = player['pace'];
                shootingDiv.innerHTML = player['shooting'];
                passingDiv.innerHTML = player['passing'];
                dribblingDiv.innerHTML = player['dribbling'];
                defenseDiv.innerHTML = player['defense'];
                physicalDiv.innerHTML = player['physicality'];

                sum = sum + player["overall"];
                total = total + 1;
                var teamAverageRating = document.getElementById("team-average-rating");
                teamAverageRating.innerHTML = sum/total;

                var sofifa_id = player["sofifa_id"].toString();
                while (sofifa_id.length < 6) {
                    sofifa_id = "0" + sofifa_id;
                }
                var idFirstHalf = sofifa_id.substring(0,3);
                var idSecondHalf = sofifa_id.substring(3,6);
                playerImage.src = "https://cdn.sofifa.com/players/" + idFirstHalf + "/" + idSecondHalf + "/21_240.png";
                playerImage.setAttribute("onerror", "this.src='https://cdn.sofifa.com/players/notfound_0_240.png';");

                fieldLocation.setAttribute("playerid", player["player_id"]);
            }
            else{
                sum = sum + player["overall"];
                total = total + 1;
                var teamAverageRating = document.getElementById("team-average-rating");
                teamAverageRating.innerHTML = Math.round(sum/total);
            }
        }
        var mode = 'draft';
        if (!isDraft){
            mode = 'sandbox';
        }
        var url = getAPIBaseURL() + '/teamgoalies/' + mode + '?teamid=' + getTeamId();
        console.log(url);
        fetch(url, {method: 'get'})

        .then((response) => response.json())

        .then(function(goalies) {
            for (var goalie of goalies){
                var query = '[positionindex="' + 17 + '"]'
                var fieldLocation = playerField.querySelectorAll(query)[0];

                if(fieldLocation.getAttribute("class") == "inactive-goalie-card"){
                    fieldLocation.setAttribute("class", "active-goalie-card");
                    var positionDiv = fieldLocation.getElementsByClassName("player-position")[0];
                    var overallRatingDiv = fieldLocation.getElementsByClassName("player-overall-rating")[0];
                    // var nationalityDiv = fieldLocation.getElementsByClassName("player-nationality")[0];
                    // var clubDiv = fieldLocation.getElementsByClassName("player-position")[0];
                    var nameDiv = fieldLocation.getElementsByClassName("goalie-name")[0];
                    var divingDiv = fieldLocation.getElementsByClassName("goalie-diving")[0];
                    var handlingDiv = fieldLocation.getElementsByClassName("goalie-handling")[0];
                    var kickingDiv = fieldLocation.getElementsByClassName("goalie-kicking")[0];
                    var reflexesDiv = fieldLocation.getElementsByClassName("goalie-reflexes")[0];
                    var speedDiv = fieldLocation.getElementsByClassName("goalie-speed")[0];
                    var positioningDiv = fieldLocation.getElementsByClassName("goalie-positioning")[0];
                    var playerImage = fieldLocation.getElementsByClassName("goalie-image")[0];
                    var popup = fieldLocation.getElementsByClassName("popup")[0];

                    var popupName = popup.getElementsByClassName("popupName")[0];
                    popupName.innerHTML = goalie['name'];
                    var popupNationality = popup.getElementsByClassName("popupCountry")[0];
                    popupNationality.innerHTML = "Nationality: " + goalie['nationality'];
                    var popupLeague = popup.getElementsByClassName("popupLeague")[0];
                    popupLeague.innerHTML = "League: " + goalie['league'];
                    var popupClub = popup.getElementsByClassName("popupClub")[0];
                    popupClub.innerHTML = "Club: " + goalie['club'];
                    var popupPreferredFoot = popup.getElementsByClassName("popupPreferredFoot")[0];
                    popupPreferredFoot.innerHTML = "Preferred Foot: " + goalie['preferred_foot'];
                    var popupWeakFoot = popup.getElementsByClassName("popupWeakFoot")[0];
                    popupWeakFoot.innerHTML = "Weak Foot Ability: " + goalie['weak_foot'];
                    // var leagueDiv = fieldLocation.getElementsByClassName("player-position")[0];

                    positionDiv.innerHTML = "GK";
                    overallRatingDiv.innerHTML = goalie['overall'];
                    nameDiv.innerHTML = goalie['name'];
                    divingDiv.innerHTML = goalie['diving'];
                    handlingDiv.innerHTML = goalie['handling'];
                    kickingDiv.innerHTML = goalie['kicking'];
                    reflexesDiv.innerHTML = goalie['reflexes'];
                    speedDiv.innerHTML = goalie['speed'];
                    positioningDiv.innerHTML = goalie['positioning'];

                    sum = sum + goalie["overall"];
                    total = total + 1;
                    var teamAverageRating = document.getElementById("team-average-rating");
                    teamAverageRating.innerHTML = sum/total;

                    var sofifa_id = goalie["sofifa_id"].toString();
                    while (sofifa_id.length < 6) {
                        sofifa_id = "0" + sofifa_id;
                    }
                    var idFirstHalf = sofifa_id.substring(0,3);
                    var idSecondHalf = sofifa_id.substring(3,6);
                    playerImage.src = "https://cdn.sofifa.com/players/" + idFirstHalf + "/" + idSecondHalf + "/21_240.png";
                    playerImage.setAttribute("onerror", "this.src='https://cdn.sofifa.com/players/notfound_0_240.png';");

                    fieldLocation.setAttribute("goalieid", goalie["goalie_id"]);
                }
                else{
                    sum = sum + goalie["overall"];
                    total = total + 1;
                    var teamAverageRating = document.getElementById("team-average-rating");
                    teamAverageRating.innerHTML = Math.round(sum/total);
                }
            }
        })
        if (isDraft){
            var playerListElement = document.getElementById('draft-selections');
            playerListElement.innerHTML = "<div></div><div></div><div></div><div></div><div></div><div></div>";
        }
        makeActiveNotClickable();
        if(isDraft){
            makeClickable();
        }
    })
}

function deleteTeam(){
    var rating = document.getElementById('team-average-rating');
    rating.innerHTML='';

    var mode = 'draft';
    if (!isDraft){
        mode = 'sandbox';
    }
    var url = getAPIBaseURL() + '/deleteteam/' + mode + '?teamid=' + getTeamId();
    console.log(url);
    fetch(url, {method: 'get'})

    resetTeam()

    fillInTeamSelector();
    setFormation("4-3-3");
    if(isDraft){
        makeClickable()
    }
}

function makeClickable() {
    var inactiveGoalieCard = document.getElementsByClassName("inactive-goalie-card")[0];
    inactiveGoalieCard.setAttribute("onclick", "onPositionDraft(this)");
    var inactiveCards = document.getElementsByClassName("inactive-card");
    for (var card of inactiveCards) {
        card.setAttribute("onclick", "onPositionDraft(this)");
    }
}

function makeNotClickable() {
    var inactiveCards = document.getElementsByClassName("inactive-card");
    for (var card of inactiveCards) {
        card.removeAttribute("onclick");
    }
    var inactiveCardsGoalie = document.getElementsByClassName("inactive-goalie-card");
    for (var card of inactiveCardsGoalie) {
        card.removeAttribute("onclick");
    }
}

function makeActiveNotClickable() {
    var playerField = document.getElementsByClassName("player-field")[0];
    for (var card of playerField.children) {
        if (card.getAttribute("class") == "active-card") {
            card.removeAttribute("onclick")
        }
    }
}

function getAPIBaseURL() {
    var baseURL = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/api';
    return baseURL;
}

function setInactiveCard(card){
    card.setAttribute("class", "inactive-card");
    htmlContents = "<span class='popup'>" +
                        "<div class='popupName'></div>" +
                        "<div class='popupCountry'></div>" +
                        "<div class='popupLeague'></div>" +
                        "<div class='popupClub'></div>" +
                        "<div class='popupPreferredFoot'></div>" +
                        "<div class='popupWeakFoot'></div>" +
                        "<div class='popupSkillMoves'></div>" +
                    "</span>" +
                    "<div class='player-overall-rating'></div>" +
                    "<div class='player-position'></div>" +
                    "<div class='player-nationality'></div>" +
                    "<div class='player-club'></div>" +
                    "<div class='player-name'></div>" +
                    "<div class='player-pace'></div>" +
                    "<div class='player-shooting'></div>" +
                    "<div class='player-passing'></div>" +
                    "<div class='player-dribbling'></div>" +
                    "<div class='player-defense'></div>" +
                    "<div class='player-physical'></div>" +
                    "<div class='player-league'></div>" +
                    "<img class='player-image' src='https://www.freeiconspng.com/uploads/plus-sign-icon-31.png'>" +
                    "<div class='hide' id='displayPlayerStats'></div>";
    card.innerHTML = htmlContents;
}

function setInactiveCardSelection(card){
    card.setAttribute("class", "inactive-card");
    htmlContents = "<span class='popup'>" +
                        "<div class='popupName'></div>" +
                        "<div class='popupCountry'></div>" +
                        "<div class='popupLeague'></div>" +
                        "<div class='popupClub'></div>" +
                        "<div class='popupPreferredFoot'></div>" +
                        "<div class='popupWeakFoot'></div>" +
                        "<div class='popupSkillMoves'></div>" +
                    "</span>" +
                    "<div class='player-overall-rating'></div>" +
                    "<div class='player-position'></div>" +
                    "<div class='player-nationality'></div>" +
                    "<div class='player-club'></div>" +
                    "<div class='player-name'></div>" +
                    "<div class='player-pace'></div>" +
                    "<div class='player-shooting'></div>" +
                    "<div class='player-passing'></div>" +
                    "<div class='player-dribbling'></div>" +
                    "<div class='player-defense'></div>" +
                    "<div class='player-physical'></div>" +
                    "<div class='player-league'></div>" +
                    "<img class='player-image' src=''>";
    card.innerHTML = htmlContents;
}

function setInactiveGoalieCard(card){
    card.setAttribute("class", "inactive-goalie-card");
    htmlContents = "<span class='popup'>" +
                        "<div class='popupName'></div>" +
                        "<div class='popupCountry'></div>" +
                        "<div class='popupLeague'></div>" +
                        "<div class='popupClub'></div>" +
                        "<div class='popupPreferredFoot'></div>" +
                        "<div class='popupWeakFoot'></div>" +
                    "</span>" +
                    "<div class='player-overall-rating'></div>" +
                    "<div class='player-position'></div>" +
                    "<div class='player-nationality'></div>" +
                    "<div class='player-club'></div>" +
                    "<div class='goalie-name'></div>" +
                    "<div class='goalie-diving'></div>" +
                    "<div class='goalie-handling'></div>" +
                    "<div class='goalie-kicking'></div>" +
                    "<div class='goalie-reflexes'></div>" +
                    "<div class='goalie-speed'></div>" +
                    "<div class='goalie-positioning'></div>" +
                    "<div class='player-league'></div>" +
                    "<img class='goalie-image' src='https://www.freeiconspng.com/uploads/plus-sign-icon-31.png'>";
    card.innerHTML = htmlContents;
}

function setFormation(newFormation){
    var playerField = document.getElementsByClassName("player-field")[0];
    var positions = playerField.children;

    if (newFormation == "4-4-2") {
        for (var i = 0; i < positions.length; i ++) {
            var position = positions[i];
            var formationPositions = [1,3,5,6,8,9,10,11,13,14,17];
            position.removeAttribute("onclick");
            position.removeAttribute("class");
            position.innerHTML = "";
            if(formationPositions.includes(i)){
                if (i != 17) {
                    setInactiveCard(position);
                }
                else {
                    setInactiveGoalieCard(position);
                }
            }
        }
    }
    else if (newFormation == "4-3-3") {
        for (var i = 0; i < positions.length; i ++) {
            var position = positions[i];
            var formationPositions = [0,2,4,6,7,8,10,11,13,14,17];
            position.removeAttribute("onclick");
            position.removeAttribute("class");
            position.innerHTML = "";
            if(formationPositions.includes(i)){
                if (i != 17) {
                    setInactiveCard(position);
                }
                else {
                    setInactiveGoalieCard(position);
                }
            }
        }
    }
    else if (newFormation == "4-5-1") {
        for (var i = 0; i < positions.length; i ++) {
            var position = positions[i];
            var formationPositions = [2,5,6,7,8,9,10,11,13,14,17];
            position.removeAttribute("onclick");
            position.removeAttribute("class");
            position.innerHTML = "";
            if(formationPositions.includes(i)){
                if (i != 17) {
                    setInactiveCard(position);
                }
                else {
                    setInactiveGoalieCard(position);
                }
            }
        }
    }
    if (!isDraft) {
        fillInPositionSelector();
    }
}

//––––––––––––––––––––––––––– Draft Functions –––––––––––––––––––––––––––

function onPositionDraft(obj) {
    var position = obj.getAttribute("position");
    var positionIndex = obj.getAttribute("positionindex")
    if (positionIndex == 17) {
        goalieDraft(position, positionIndex);
    }
    else {
        draft(position, positionIndex);
    }
}

function createDraftCards(position){
    var draftSelections = document.getElementById("draft-selections");
    if (!(draftSelections.firstChild.firstChild)) {
        var cardSlots = draftSelections.children;
        for (card of cardSlots){
            if (position != 'GK'){
                setInactiveCardSelection(card);
            }
            else {
                setInactiveGoalieCard(card);
            }
        }
    }
}

function draft(position, positionIndex) {

    createDraftCards(position);

    var url = getAPIBaseURL() + '/players?position=' + position;
    console.log(url);
    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then(function(players) {
        var playerListElement = document.getElementById('draft-selections');
        if(playerListElement){
            for (var i = 0; i < 6; i++) {
                var card = playerListElement.children[i];
                var player = players[i];
                card.setAttribute("class", "active-card");

                var positionDiv = card.getElementsByClassName("player-position")[0];
                var overallRatingDiv = card.getElementsByClassName("player-overall-rating")[0];
                var nameDiv = card.getElementsByClassName("player-name")[0];
                var paceDiv = card.getElementsByClassName("player-pace")[0];
                var shootingDiv = card.getElementsByClassName("player-shooting")[0];
                var passingDiv = card.getElementsByClassName("player-passing")[0];
                var dribblingDiv = card.getElementsByClassName("player-dribbling")[0];
                var defenseDiv = card.getElementsByClassName("player-defense")[0];
                var physicalDiv = card.getElementsByClassName("player-physical")[0];
                var playerImage = card.getElementsByClassName("player-image")[0];
                var popup = card.getElementsByClassName("popup")[0];

                var popupName = popup.getElementsByClassName("popupName")[0];
                popupName.innerHTML = player['name'];
                var popupNationality = popup.getElementsByClassName("popupCountry")[0];
                popupNationality.innerHTML = "Nationality: " + player['nationality'];
                var popupLeague = popup.getElementsByClassName("popupLeague")[0];
                popupLeague.innerHTML = "League: " + player['league'];
                var popupClub = popup.getElementsByClassName("popupClub")[0];
                popupClub.innerHTML = "Club: " + player['club'];
                var popupPreferredFoot = popup.getElementsByClassName("popupPreferredFoot")[0];
                popupPreferredFoot.innerHTML = "Preferred Foot: " + player['preferred_foot'];
                var popupWeakFoot = popup.getElementsByClassName("popupWeakFoot")[0];
                popupWeakFoot.innerHTML = "Weak Foot Ability: " + player['weak_foot'];
                var popupSkillMoves = popup.getElementsByClassName("popupSkillMoves")[0];
                popupSkillMoves.innerHTML = "Skill Moves: " + player['skill_moves'];

                positionDiv.innerHTML = position;
                overallRatingDiv.innerHTML = player['overall'];
                nameDiv.innerHTML = player['name'];
                paceDiv.innerHTML = player['pace'];
                shootingDiv.innerHTML = player['shooting'];
                passingDiv.innerHTML = player['passing'];
                dribblingDiv.innerHTML = player['dribbling'];
                defenseDiv.innerHTML = player['defense'];
                physicalDiv.innerHTML = player['physicality'];


                var sofifa_id = player["sofifa_id"].toString();
                while (sofifa_id.length < 6) {
                    sofifa_id = "0" + sofifa_id;
                }
                var idFirstHalf = sofifa_id.substring(0,3);
                var idSecondHalf = sofifa_id.substring(3,6);
                playerImage.src = "https://cdn.sofifa.com/players/" + idFirstHalf + "/" + idSecondHalf + "/21_240.png";
                playerImage.setAttribute("onerror", "this.src='https://cdn.sofifa.com/players/notfound_0_240.png';");

                card.setAttribute("playerid", player["player_id"]);
                card.setAttribute("positionindex", positionIndex);
            }
            makeNotClickable();
            makeSelectionsClickable();
        }
    })

    .catch(function(error) {
        console.log(error);
    });
}

function goalieDraft(position, positionIndex) {

    createDraftCards(position);

    var url = getAPIBaseURL() + '/goalies';
    console.log(url);
    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then(function(goalies) {
        var goalieListElement = document.getElementById('draft-selections');
        if(goalieListElement){
            for (var i = 0; i < 6; i++) {
                var card = goalieListElement.children[i];
                card.setAttribute("class", "active-goalie-card");
                var goalie = goalies[i];

                var overallRatingDiv = card.getElementsByClassName("player-overall-rating")[0];
                var positionDiv = card.getElementsByClassName("player-position")[0];
                var nameDiv = card.getElementsByClassName("goalie-name")[0];
                var divingDiv = card.getElementsByClassName("goalie-diving")[0];
                var reflexesDiv = card.getElementsByClassName("goalie-reflexes")[0];
                var handlingDiv = card.getElementsByClassName("goalie-handling")[0];
                var kickingDiv = card.getElementsByClassName("goalie-kicking")[0];
                var speedDiv = card.getElementsByClassName("goalie-speed")[0];
                var positioningDiv = card.getElementsByClassName("goalie-positioning")[0];
                var goalieImage = card.getElementsByClassName("goalie-image")[0];
                var popup = card.getElementsByClassName("popup")[0];

                var popupName = popup.getElementsByClassName("popupName")[0];
                popupName.innerHTML = goalie['name'];
                var popupNationality = popup.getElementsByClassName("popupCountry")[0];
                popupNationality.innerHTML = "Nationality: " + goalie['nationality'];
                var popupLeague = popup.getElementsByClassName("popupLeague")[0];
                popupLeague.innerHTML = "League: " + goalie['league'];
                var popupClub = popup.getElementsByClassName("popupClub")[0];
                popupClub.innerHTML = "Club: " + goalie['club'];
                var popupPreferredFoot = popup.getElementsByClassName("popupPreferredFoot")[0];
                popupPreferredFoot.innerHTML = "Preferred Foot: " + goalie['preferred_foot'];
                var popupWeakFoot = popup.getElementsByClassName("popupWeakFoot")[0];
                popupWeakFoot.innerHTML = "Weak Foot Ability: " + goalie['weak_foot'];

                positionDiv.innerHTML = 'GK';
                overallRatingDiv.innerHTML = goalie['overall'];
                nameDiv.innerHTML = goalie['name'];
                divingDiv.innerHTML = goalie['diving'];
                reflexesDiv.innerHTML = goalie['reflexes'];
                handlingDiv.innerHTML = goalie['handling'];
                kickingDiv.innerHTML = goalie['kicking'];
                speedDiv.innerHTML = goalie['speed'];
                positioningDiv.innerHTML = goalie['positioning'];

                var sofifa_id = goalie["sofifa_id"].toString();
                while (sofifa_id.length < 6) {
                    sofifa_id = "0" + sofifa_id;
                }
                var idFirstHalf = sofifa_id.substring(0,3);
                var idSecondHalf = sofifa_id.substring(3,6);
                goalieImage.src = "https://cdn.sofifa.com/players/" + idFirstHalf + "/" + idSecondHalf + "/21_240.png";
                goalieImage.setAttribute("onerror", "this.src='https://cdn.sofifa.com/players/notfound_0_240.png';");

                card.setAttribute("playerid", goalie['goalie_id']);
                card.setAttribute("positionindex", positionIndex);
            }
            makeNotClickable();
            makeSelectionsClickable();
        }
    })

    .catch(function(error) {
        console.log(error);
    });
}

function makeSelectionsClickable() {
    var playerListElement = document.getElementById('draft-selections');
    selections = playerListElement.children;
    for (var selection of selections) {
        selection.setAttribute("onclick", "onDraftSelection(this)");
    }
}

function makeSelectionsClickableSandbox() {
    var playerListElement = document.getElementById('searched-players');
    selections = playerListElement.children;
    for (var selection of selections) {
        selection.setAttribute("onclick", "onPlayerSelection(this)");
    }
}

function onDraftSelection(obj){
    var playerId = obj.getAttribute("playerid");
    var positionIndex = obj.getAttribute("positionindex");

    continueFunc = false;
    if (!getTeamId()){
        createNewTeam();
    }else{
        continueFunc = true;
    }
    waitForIt();
    function waitForIt(){
        if (!continueFunc) {
            setTimeout(function(){waitForIt()},100);
        }else {
            addPlayerToTeam(playerId, positionIndex);
            displayTeam();
        }
    }
}

function onPlayerSelection(obj){
    var playerId = obj.getAttribute("playerid");
    var positionIndex = obj.getAttribute("positionindex");

    continueFunc = false;
    if (!getTeamId()){
        createNewTeam();
    }else{
        continueFunc = true;
    }
    waitForIt();
    function waitForIt(){
        if (!continueFunc) {
            setTimeout(function(){waitForIt()},100);
        }else {
            addPlayerToTeam(playerId, positionIndex);
            displayTeam();
        }
    }
}

//'''––––––––––––––––––––––––––– Search Functions –––––––––––––––––––––––––––'''

function playerSearch(event){
    event.preventDefault();
    var position = event.target.elements.position.value;
    var name = event.target.elements.name.value;
    var league = event.target.elements.league.value;
    var club = event.target.elements.club.value;
    var nationality = event.target.elements.nationality.value;
    var preferredFoot = event.target.elements.preferredFoot.value;
    var paceLow = event.target.elements.firstLow.value;
    var paceHigh = event.target.elements.firstHigh.value;
    var shootingLow = event.target.elements.secondLow.value;
    var shootingHigh = event.target.elements.secondHigh.value;
    var passingLow = event.target.elements.thirdLow.value;
    var passingHigh = event.target.elements.thirdHigh.value;
    var dribblingLow = event.target.elements.fourthLow.value;
    var dribblingHigh = event.target.elements.fourthHigh.value;
    var defenseLow = event.target.elements.fifthLow.value;
    var defenseHigh = event.target.elements.fifthHigh.value;
    var physicalityLow = event.target.elements.sixthLow.value;
    var physicalityHigh = event.target.elements.sixthHigh.value;
    var ratingLow = event.target.elements.ratingLow.value;
    var ratingHigh = event.target.elements.ratingHigh.value;

    if(position == 'GK'){
        goalieSearch(event);
    }

    else {
        createSearchCards(position);

        var url = getAPIBaseURL() + '/players?draftmodeon=False' + '&name=' + name + '&club=' + club + '&position=' + position
        + '&league=' + league + '&nationality=' + nationality + '&preferredfoot=' + preferredFoot + '&pacelow=' + paceLow
        + '&pacehigh=' + paceHigh + '&shootinglow=' + shootingLow + '&shootinghigh=' + shootingHigh + '&passinglow=' + passingLow
        + '&passinghigh=' + passingHigh + '&dribblinglow=' + dribblingLow + '&dribblinghigh=' + dribblingHigh
        + '&defenselow=' + defenseLow + '&defensehigh=' + defenseHigh + '&physicalitylow=' + physicalityLow
        + '&physicalityhigh=' + physicalityHigh + '&overallratinglow=' + ratingLow + '&overallratinghigh=' + ratingHigh;
        console.log(url);
        fetch(url, {method: 'get'})

        .then((response) => response.json())

        .then(function(players) {
            var playerListElement = document.getElementById('searched-players');
            if(playerListElement){
                for (var i = 0; i < 6 & i < players.length; i++) {
                    var card = playerListElement.children[i];
                    card.setAttribute("class", "active-card");
                    var player = players[i];

                    var positionDiv = card.getElementsByClassName("player-position")[0];
                    var overallRatingDiv = card.getElementsByClassName("player-overall-rating")[0];

                    var nameDiv = card.getElementsByClassName("player-name")[0];
                    var paceDiv = card.getElementsByClassName("player-pace")[0];
                    var shootingDiv = card.getElementsByClassName("player-shooting")[0];
                    var passingDiv = card.getElementsByClassName("player-passing")[0];
                    var dribblingDiv = card.getElementsByClassName("player-dribbling")[0];
                    var defenseDiv = card.getElementsByClassName("player-defense")[0];
                    var physicalDiv = card.getElementsByClassName("player-physical")[0];
                    var playerImage = card.getElementsByClassName("player-image")[0];
                    var popup = card.getElementsByClassName("popup")[0];

                    var popupName = popup.getElementsByClassName("popupName")[0];
                    popupName.innerHTML = player['name'];
                    var popupNationality = popup.getElementsByClassName("popupCountry")[0];
                    popupNationality.innerHTML = "Nationality: " + player['nationality'];
                    var popupLeague = popup.getElementsByClassName("popupLeague")[0];
                    popupLeague.innerHTML = "League: " + player['league'];
                    var popupClub = popup.getElementsByClassName("popupClub")[0];
                    popupClub.innerHTML = "Club: " + player['club'];
                    var popupPreferredFoot = popup.getElementsByClassName("popupPreferredFoot")[0];
                    popupPreferredFoot.innerHTML = "Preferred Foot: " + player['preferred_foot'];
                    var popupWeakFoot = popup.getElementsByClassName("popupWeakFoot")[0];
                    popupWeakFoot.innerHTML = "Weak Foot Ability: " + player['weak_foot'] + '/5';
                    var popupSkillMoves = popup.getElementsByClassName("popupSkillMoves")[0];
                    popupSkillMoves.innerHTML = "Skill Moves: " + player['skill_moves'] + '/5';

                    var positionsPlayed = player['position'].split(",");
                    var relevantPosition = positionsPlayed[0];
                    for (var pos of positionsPlayed) {
                        if (pos.replace(/\s/g, '') == position.replace(/\s/g, '')) {
                            relevantPosition = pos;
                        }
                    }
                    positionDiv.innerHTML = relevantPosition;
                    overallRatingDiv.innerHTML = player['overall'];
                    nameDiv.innerHTML = player['name'];
                    paceDiv.innerHTML = player['pace'];
                    shootingDiv.innerHTML = player['shooting'];
                    passingDiv.innerHTML = player['passing'];
                    dribblingDiv.innerHTML = player['dribbling'];
                    defenseDiv.innerHTML = player['defense'];
                    physicalDiv.innerHTML = player['physicality'];

                    var sofifa_id = player["sofifa_id"].toString();
                    while (sofifa_id.length < 6) {
                        sofifa_id = "0" + sofifa_id;
                    }
                    var idFirstHalf = sofifa_id.substring(0,3);
                    var idSecondHalf = sofifa_id.substring(3,6);
                    playerImage.src = "https://cdn.sofifa.com/players/" + idFirstHalf + "/" + idSecondHalf + "/21_240.png";
                    playerImage.setAttribute("onerror", "this.src='https://cdn.sofifa.com/players/notfound_0_240.png';");

                    card.setAttribute("playerid", player["player_id"]);
                    card.setAttribute("id", "draft-selections");
                    makeSelectionsClickableSandbox()
                }
            }
        })

        .catch(function(error) {
            console.log(error);
        });
    }

}

function goalieSearch(event){
    event.preventDefault();
    var position = event.target.elements.position.value;
    var name = event.target.elements.name.value;
    var club = event.target.elements.club.value;
    var nationality = event.target.elements.nationality.value;
    var league = event.target.elements.league.value;
    var preferredFoot = event.target.elements.preferredFoot.value;
    var divingLow = event.target.elements.firstLow.value;
    var divingHigh = event.target.elements.firstHigh.value;
    var handlingLow = event.target.elements.secondLow.value;
    var handlingHigh = event.target.elements.secondHigh.value;
    var kickingLow = event.target.elements.thirdLow.value;
    var kickingHigh = event.target.elements.thirdHigh.value;
    var reflexesLow = event.target.elements.fourthLow.value;
    var reflexesHigh = event.target.elements.fourthHigh.value;
    var speedLow = event.target.elements.fifthLow.value;
    var speedHigh = event.target.elements.fifthHigh.value;
    var positioningLow = event.target.elements.sixthLow.value;
    var positioningHigh = event.target.elements.sixthHigh.value;
    var ratingLow = event.target.elements.ratingLow.value;
    var ratingHigh = event.target.elements.ratingHigh.value;


    createSearchCards(position);

    var url = getAPIBaseURL() + '/goalies?draftmodeon=False' + '&name=' + name + '&club=' + club + '&league=' + league
    + '&nationality=' + nationality + '&preferredfoot=' + preferredFoot + '&divinglow=' + divingLow
    + '&divinghigh=' + divingHigh + '&handlinglow=' + handlingLow + '&handlinghigh=' + handlingHigh + '&kickinglow=' + kickingLow
    + '&kickinghigh=' + kickingHigh + '&reflexeslow=' + reflexesLow + '&reflexeshigh=' + reflexesHigh
    + '&speedlow=' + speedLow + '&speedhigh=' + speedHigh + '&positioninglow=' + positioningLow
    + '&positioninghigh=' + positioningHigh + '&overallratinglow=' + ratingLow + '&overallratinghigh=' + ratingHigh;
    console.log(url);
    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then(function(goalies) {
        var goalieListElement = document.getElementById('searched-players');
        if(goalieListElement){
            for (var i = 0; i < 6 & i < goalies.length; i++) {
                var card = goalieListElement.children[i];
                card.setAttribute("class", "active-goalie-card");
                var goalie = goalies[i];

                var overallRatingDiv = card.getElementsByClassName("player-overall-rating")[0];
                var positionDiv = card.getElementsByClassName("player-position")[0];
                var nameDiv = card.getElementsByClassName("goalie-name")[0];
                var divingDiv = card.getElementsByClassName("goalie-diving")[0];
                var reflexesDiv = card.getElementsByClassName("goalie-reflexes")[0];
                var handlingDiv = card.getElementsByClassName("goalie-handling")[0];
                var kickingDiv = card.getElementsByClassName("goalie-kicking")[0];
                var speedDiv = card.getElementsByClassName("goalie-speed")[0];
                var positioningDiv = card.getElementsByClassName("goalie-positioning")[0];
                var goalieImage = card.getElementsByClassName("goalie-image")[0];
                var popup = card.getElementsByClassName("popup")[0];

                var popupName = popup.getElementsByClassName("popupName")[0];
                popupName.innerHTML = goalie['name'];
                var popupNationality = popup.getElementsByClassName("popupCountry")[0];
                popupNationality.innerHTML = "Nationality: " + goalie['nationality'];
                var popupLeague = popup.getElementsByClassName("popupLeague")[0];
                popupLeague.innerHTML = "League: " + goalie['league'];
                var popupClub = popup.getElementsByClassName("popupClub")[0];
                popupClub.innerHTML = "Club: " + goalie['club'];
                var popupPreferredFoot = popup.getElementsByClassName("popupPreferredFoot")[0];
                popupPreferredFoot.innerHTML = "Preferred Foot: " + goalie['preferred_foot'];
                var popupWeakFoot = popup.getElementsByClassName("popupWeakFoot")[0];
                popupWeakFoot.innerHTML = "Weak Foot Ability: " + goalie['weak_foot'];

                positionDiv.innerHTML = goalie['position'];
                overallRatingDiv.innerHTML = goalie['overall'];
                nameDiv.innerHTML = goalie['name'];
                divingDiv.innerHTML = goalie['diving'];
                reflexesDiv.innerHTML = goalie['reflexes'];
                handlingDiv.innerHTML = goalie['handling'];
                kickingDiv.innerHTML = goalie['kicking'];
                speedDiv.innerHTML = goalie['speed'];
                positioningDiv.innerHTML = goalie['positioning'];

                var sofifa_id = goalie["sofifa_id"].toString();
                while (sofifa_id.length < 6) {
                    sofifa_id = "0" + sofifa_id;
                }
                var idFirstHalf = sofifa_id.substring(0,3);
                var idSecondHalf = sofifa_id.substring(3,6);
                goalieImage.src = "https://cdn.sofifa.com/players/" + idFirstHalf + "/" + idSecondHalf + "/21_240.png";
                goalieImage.setAttribute("onerror", "this.src='https://cdn.sofifa.com/players/notfound_0_240.png';");

                card.setAttribute("playerid", sofifa_id);

                makeSelectionsClickableSandbox()
            }
        }
    })

    .catch(function(error) {
        console.log(error);
    });

}

function createSearchCards(position){
    var searchSelections = document.getElementById("searched-players");
    if (!(searchSelections.firstChild.firstChild)) {
        var cardSlots = searchSelections.children;
        for (card of cardSlots){
            if (position != 'GK'){
                setInactiveCardSelection(card);
            }
            else {
                setInactiveGoalieCard(card);
            }
        }
    }
}

function changeFilters(position) {
    if (position == "GK") {
        var firstStatMin = document.getElementById("minPace");
        firstStatMin.innerHTML = "Min Diving:";
        firstStatMin.setAttribute("id", "minDiving");
        var firstStatMax = document.getElementById("maxPace");
        firstStatMax.innerHTML = "Max Diving:";
        firstStatMax.setAttribute("id", "maxDiving");

        var secondStatMin = document.getElementById("minShooting");
        secondStatMin.innerHTML = "Min Handling:";
        secondStatMin.setAttribute("id", "minHandling");
        var secondStatMax = document.getElementById("maxShooting");
        secondStatMax.innerHTML = "Max Handling:";
        secondStatMax.setAttribute("id", "maxHandling");

        var thirdStatMin = document.getElementById("minPassing");
        thirdStatMin.innerHTML = "Min Kicking:";
        thirdStatMin.setAttribute("id", "minKicking");
        var thirdStatMax = document.getElementById("maxPassing");
        thirdStatMax.innerHTML = "Max Kicking:";
        thirdStatMax.setAttribute("id", "maxKicking");

        var fourthStatMin = document.getElementById("minDribbling");
        fourthStatMin.innerHTML = "Min Reflexes:";
        fourthStatMin.setAttribute("id", "minReflexes");
        var fourthStatMax = document.getElementById("maxDribbling");
        fourthStatMax.innerHTML = "Max Reflexes:";
        fourthStatMax.setAttribute("id", "maxReflexes");

        var fifthStatMin = document.getElementById("minDefense");
        fifthStatMin.innerHTML = "Min Speed:";
        fifthStatMin.setAttribute("id", "minSpeed");
        var fifthStatMax = document.getElementById("maxDefense");
        fifthStatMax.innerHTML = "Max Speed:";
        fifthStatMax.setAttribute("id", "maxSpeed");

        var sixthStatMin = document.getElementById("minPhysicality");
        sixthStatMin.innerHTML = "Min Positioning:";
        sixthStatMin.setAttribute("id", "minPositioning");
        var sixthStatMax = document.getElementById("maxPhysicality");
        sixthStatMax.innerHTML = "Max Positioning:";
        sixthStatMax.setAttribute("id", "maxPositioning");
    }

    else if (position != "GK") {
        var firstStatMin = document.getElementById("minDiving");
        firstStatMin.innerHTML = "Min Pace:";
        firstStatMin.setAttribute("id", "minPace");
        var firstStatMax = document.getElementById("maxDiving");
        firstStatMax.innerHTML = "Max Pace:";
        firstStatMax.setAttribute("id", "maxPace");

        var secondStatMin = document.getElementById("minHandling");
        secondStatMin.innerHTML = "Min Shooting:";
        secondStatMin.setAttribute("id", "minShooting");
        var secondStatMax = document.getElementById("maxHandling");
        secondStatMax.innerHTML = "Max Shooting:";
        secondStatMax.setAttribute("id", "maxShooting");

        var thirdStatMin = document.getElementById("minKicking");
        thirdStatMin.innerHTML = "Min Passing:";
        thirdStatMin.setAttribute("id", "minPassing");
        var thirdStatMax = document.getElementById("maxKicking");
        thirdStatMax.innerHTML = "Max Passing:";
        thirdStatMax.setAttribute("id", "maxPassing");

        var fourthStatMin = document.getElementById("minReflexes");
        fourthStatMin.innerHTML = "Min Dribbling:";
        fourthStatMin.setAttribute("id", "minDribbling");
        var fourthStatMax = document.getElementById("maxReflexes");
        fourthStatMax.innerHTML = "Max Dribbling:";
        fourthStatMax.setAttribute("id", "maxDribbling");

        var fifthStatMin = document.getElementById("minSpeed");
        fifthStatMin.innerHTML = "Min Defense:";
        fifthStatMin.setAttribute("id", "minDefense");
        var fifthStatMax = document.getElementById("maxSpeed");
        fifthStatMax.innerHTML = "Max Defense:";
        fifthStatMax.setAttribute("id", "maxDefense");

        var sixthStatMin = document.getElementById("minPositioning");
        sixthStatMin.innerHTML = "Min Physicality:";
        sixthStatMin.setAttribute("id", "minPhysicality");
        var sixthStatMax = document.getElementById("maxPositioning");
        sixthStatMax.innerHTML = "Max Physicality:";
        sixthStatMax.setAttribute("id", "maxPhysicality");
    }
}

function searchPreferredFeet() {
    var feet = ["Right", "Left"];
    for (var foot in feet) {
        var optionElement = document.createElement("option");
        optionElement.value = feet[foot];
        document.getElementById("feet").appendChild(optionElement);
  }
}

function searchNames() {
    var name_array = [];

    var url = getAPIBaseURL() + '/names';
    console.log(url);
    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then(function(names) {
        for (var name of names) {
            var player_name = name['name'];
            name_array.push(player_name);
        }
        for (var name in name_array) {
            var optionElement = document.createElement("option");
            optionElement.value = name_array[name];
            document.getElementById("names").appendChild(optionElement);
        }
    })
    .catch(function(error) {
    console.log(error);
    });
}

function searchLeagues() {
    var league_array = [];

    var url = getAPIBaseURL() + '/leagues';
    console.log(url);
    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then(function(leagues) {
        for (var league of leagues) {
            var league_name = league['league'];
            league_array.push(league_name);
        }
        for (var league in league_array) {
            var optionElement = document.createElement("option");
            optionElement.value = league_array[league];
            document.getElementById("leagues").appendChild(optionElement);
        }
    })
    .catch(function(error) {
    console.log(error);
    });
}

function searchClubs() {
    var club_array = [];

    var url = getAPIBaseURL() + '/clubs';
    console.log(url);
    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then(function(clubs) {
        for (var club of clubs) {
            var club_name = club['club'];
            club_array.push(club_name);
        }
        for (var club in club_array) {
            var optionElement = document.createElement("option");
            optionElement.value = club_array[club];
            document.getElementById("clubs").appendChild(optionElement);
        }
    })
    .catch(function(error) {
    console.log(error);
    });
}

function searchNationalities() {
    var nationality_array = [];

    var url = getAPIBaseURL() + '/nationalities';
    console.log(url);
    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then(function(nationalities) {
        for (var nationality of nationalities) {
            var nationality_name = nationality['nationality'];
            nationality_array.push(nationality_name);
        }
        for (var nationality in nationality_array) {
            var optionElement = document.createElement("option");
            optionElement.value = nationality_array[nationality];
            document.getElementById("nationalities").appendChild(optionElement);
        }
    })
    .catch(function(error) {
    console.log(error);
    });
}
