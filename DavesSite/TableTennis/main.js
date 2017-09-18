var currentMatchId = 0, currentPlayerId = 0, currentSetId = 0;
var menuIdArray = new Array();

var CURRENT_VERSION = "0.0.4";

var CURRENT_RULES = "";

const MATCH_WIN_POINTS = 5;
const SET_WIN_POINTS = 0;

$(document).ready(function () {
    //File checking
    if (!(window.File && window.Blob && window.FileReader && window.FileList)) {
        window.alert("The file API is not available...");
    }

    initControls();

    initMenu();

    initMatchCreator();

    initFileSystem();
});

//Init functions
{
    function initControls() {
        $('#btnAddGame').click(function () {
            addGame(false, {});
        });

        $('#btnAddPlayer').click(function () {
            if ($('#txbAddPlayerName').val() == '') return;
            addPlayer(false, { name: $('#txbAddPlayerName').val(), color: $('#txbAddPlayerColor').val() });
            $('#txbAddPlayerName').val('');
        });

        $('#txbAddPlayerColor').val('#FFFFFF');
    }

    function initMenu() {
        //Menu Handling
        $('.btn[menu]').each(function () {
            menuIdArray.push($(this).attr('menu'));
        }).click(function () {
            $('.btn[menu].selected').removeClass('selected');
            openPage($(this).attr('menu'));
            $(this).addClass('selected');
        });
    }
}

//Misc functions
{
    function openPage(menuId) {
        for (var i = 0; i < menuIdArray.length; i++) {
            $('#' + menuIdArray[i]).hide();
        }
        $('#' + menuId).show();
    }

    function sortRankTable() {
        $('#tblRank tr:not(.permanent)').remove();

        playerArray.sort(function (a, b) {
            return b.points - a.points;
        });

        var tblRank = $('#tblRank');
        for (var i = 0; i < playerArray.length;) {
            tblRank.append(playerArray[i].getRankItem);
            playerArray[i].tdRankNumber.text(++i);
        }

        if (playerArray.length > 0) {
            $('#spnRankChampion').text(playerArray[0].name);
        }
        if (playerArray.length > 1) {
            $('#spnRankDunce').text(playerArray[playerArray.length - 1].name);
        }
    }

    function refreshScores() {
        //reset the player stats
        for (var i = 0; i < playerArray.length; i++) playerArray[i].resetScores();

        //loop through all matches and recalculate them
        for (var i = 0; i < matchArray.length; i++) matchArray[i].executeScoring(matchArray[i].player1Id, matchArray[i].player2Id);

        sortRankTable();
    }

    function validateIntTxb ($txb) {
        if (isNaN(parseInt($txb.val()))) {
            window.alert("Entered a wrong input!");
            $txb.val(0);
        } else {
            $txb.val(parseInt($txb.val()));
        }
    }
}

//Player functions 
{
    var playerArray = new Array();

    function findPlayer(id) {
        for (var i = 0; i < playerArray.length; i++) {
            if (id == playerArray[i].id) return playerArray[i];
        }

        return null;
    }

    //Takes the name of the player, returns the player
    function addPlayer(fromLoad, obj) {
        if (fromLoad) {
            var p = new Player(obj);
            playerArray.push(p);
            $('#ddlPlayer1, #ddlPlayer2').append(new Option(p.name, p.id));
        } else {
            var name = obj.name;
            var p = new Player({ id: currentPlayerId++, name: name, color: obj.color });
            playerArray.push(p);
            $('#ddlPlayer1, #ddlPlayer2').append(new Option(name, p.id));

            p.points = 0;
            p.setsWon = 0;
            p.matchesWon = 0;
            p.setsPlayed = 0;
            p.matchesPlayed = 0;

            sortRankTable();

            return p;
        }
    }

    function Player(obj) {
        var t = this;
        $.extend(t, obj);

        t.getRankItem = function () {
            if (typeof t.rankItem === 'undefined') {
                t.rankItem = $('<tr />');
                t.tdRankNumber = $('<td />').appendTo(t.rankItem);
                t.tdRankName = $('<td />').appendTo(t.rankItem);
                t.tdRankPoints = $('<td />').appendTo(t.rankItem);
				t.tdRankMatchData = $('<td />').appendTo(t.rankItem);
				t.tdRankMatchRatio = $('<td />').appendTo(t.rankItem);
				t.tdRankSetData = $('<td />').appendTo(t.rankItem);
				t.tdRankSetRatio = $('<td />').appendTo(t.rankItem);
				t.tdRankPointsPer = $('<td />').appendTo(t.rankItem);
            }
            t.tdRankName.html(t.name).css('background-color', t.color);
            t.tdRankPoints.html(t.points);
			t.tdRankMatchData.html(t.matchesPlayed.toString() + "/" + t.matchesWon.toString() + "/" + (t.matchesPlayed - t.matchesWon).toString());
			t.tdRankMatchRatio.html((t.matchesWon / (t.matchesPlayed - t.matchesWon)).toFixed(2));
			t.tdRankSetData.html(t.setsPlayed.toString() + "/" + t.setsWon.toString() + "/" + (t.setsPlayed - t.setsWon).toString());
			t.tdRankSetRatio.html((t.setsWon / (t.setsPlayed - t.setsWon)).toFixed(2));
			t.tdRankPointsPer.html((t.points / t.matchesPlayed).toFixed(2) + "/" + (t.points / t.setsPlayed).toFixed(2));
            return t.rankItem;
        }

        t.resetScores = function () {
            t.points = 0;
            t.setsWon = 0;
            t.matchesWon = 0;
            t.setsPlayed = 0;
            t.matchesPlayed = 0;
        }

        t.buildSaveObject = function () {
            return { id: t.id, name: t.name, points: t.points, color: t.color, setsWon: t.setsWon, matchesWon: t.matchesWon, setsPlayed: t.setsPlayed, matchesPlayed: t.matchesPlayed };
        }
    }
}

//Match Functions
{
    var matchArray = new Array();

    var currentSetArray = new Array();

    function startUpdatingMatch() {
        //don't update match if there are no revealed sets
        if (currentSetArray.length <= 0) return;

        $('#btnUpdateMatch').hide();
        $('#btnUpdateMatchSave').css({ 'display': 'inline-block' });

        //start updating all the sets
        for (var i = 0; i < currentSetArray.length; i++) currentSetArray[i].startUpdatingSets();
    }

    function finishUpdatingMatch(isSave, pointsPlayedTo) {
        //don't update match if there are no revealed sets
        if (currentSetArray.length <= 0) return;

        $('#btnUpdateMatch').css({ 'display': 'inline-block'});
        $('#btnUpdateMatchSave').hide();

        //finish updating all the sets
        for (var i = 0; i < currentSetArray.length; i++) currentSetArray[i].finishUpdatingSets(isSave, pointsPlayedTo);

        if (isSave) refreshScores();
    }

    function Match(obj) {
        var t = this;
        $.extend(t, obj);

        t.player1Name = findPlayer(t.player1Id).name;
        t.player2Name = findPlayer(t.player2Id).name;

        t.getListItem = function () {
            if (typeof t.listItem === 'undefined') {
                t.listItem = $('<tr class="matchlistitem" />').click(function () { t.revealSets(); });
                t.tdMatchNumber = $('<td />').appendTo(t.listItem);
                t.tdPlayer1 = $('<td />').appendTo(t.listItem);
                t.tdResult = $('<td />').appendTo(t.listItem);
                t.tdPlayer2 = $('<td />').appendTo(t.listItem);
                t.tdDate = $('<td />').appendTo(t.listItem);
            }
            t.tdMatchNumber.text(t.id);
            t.tdPlayer1.text(t.player1Name);
            t.tdResult.text((t.winner == 1 ? " beat " : (t.winner == 2 ? " lost to " : " tied with ")));
            t.tdPlayer2.text(t.player2Name);
            
            t.tdDate.text(t.date.toUTCString());
            return t.listItem;
        }

        t.revealSets = function () {
            //Remove the list item from the currently revealed sets
            for (var i = 0; i < currentSetArray.length; i++) {
                if (currentSetArray[i].isUpdating) currentSetArray[i].finishUpdatingSets(false, t.pointsPlayedTo);
                currentSetArray[i].removeListItem();
            }

            currentSetArray = new Array();

            //top separator
            var $topSeparator = $('.trTopSetSeparator');
            if ($topSeparator.length == 0) {
                $topSeparator = $('<tr class="trTopSetSeparator" />').append(
                    $('<td colspan="5" style="border-bottom:1px solid #000000;text-align:left">Set Number</td>').append(
                        $('<div class="btn" id="btnUpdateMatch" style="margin-left:10px;width:80px;display:inline-block">UPDATE</div>').click(function () {
                            startUpdatingMatch();
                        })
                    ).append(
                        $('<div class="btn" id="btnUpdateMatchSave" style="margin-left:10px;width:80px;display:inline-block;display:none">SAVE</div>').click(function () {
                            finishUpdatingMatch(true, t.pointsPlayedTo);
                        })
                    )
                );
            }
            $topSeparator.insertAfter(t.listItem);

            //loop through sets and append them
            for (var i = 0; i < t.sets.length; i++) {
                if (i == 0) $(t.sets[i].getListItem(i)).insertAfter($topSeparator);
                else $(t.sets[i].getListItem(i)).insertAfter($(t.sets[i - 1].getListItem(-1)));

                currentSetArray.push(t.sets[i]);
            }

            //bottom separator
            var $botSeparator = $('.trBotSetSeparator');
            if ($botSeparator.length == 0) {
                $botSeparator = $('<tr class="trBotSetSeparator" />').append($('<td colspan="5" style="border-bottom:1px solid #000000">&nbsp;</td>'));
            }
            $botSeparator.insertAfter(t.sets[t.sets.length-1].getListItem(-1));
        }

        t.hideSets = function () {
            //TODO: implement hiding of sets
        }

        t.executeScoring = function (player1Id, player2Id) {
            //Finalise the scoring
            var _player1Sets = 0, _player2Sets = 0; //num sets players have won
            var _player1Points = 0, _player2Points = 0;
            for (var i = 0; i < t.sets.length; i++) {
                if (t.sets[i].isNew) continue;

                t.sets[i].calculateIsDominate(t.pointsPlayedTo);

                //Add points to players
                _player1Points += t.sets[i].player1Points;
                _player2Points += t.sets[i].player2Points;

                if (t.sets[i].player1Points > t.sets[i].player2Points) { //Player 1 won set
                    _player1Sets++;
                    _player1Points += SET_WIN_POINTS;
                    if (t.sets[i].isDominate) _player1Points *= 2;
                } else if (t.sets[i].player1Points < t.sets[i].player2Points) { //Player 2 won set
                    _player2Sets++;
                    _player2Points += SET_WIN_POINTS;
                    if (t.sets[i].isDominate) _player2Points *= 2;
                }
            }

            if (_player1Sets > _player2Sets) { //Player 1 won match
                _player1Points += MATCH_WIN_POINTS;
                t.winner = 1;
            } else if (_player2Sets > _player1Sets) { //Player 2 won match
                _player2Points += MATCH_WIN_POINTS;
                t.winner = 2;
            } else { //Noone wins
                t.winner = 0;
            }

            var setsPlayed = 0;
            for (var i = 0; i < t.sets.length; i++) if (!t.sets[i].isNew) setsPlayed++;

            //Add points to players
            var player1 = findPlayer(player1Id);
            if (t.winner == 1) {
                player1.matchesWon++;
            }
            player1.setsWon += _player1Sets;
            player1.points += _player1Points;
            player1.setsPlayed += setsPlayed;
            player1.matchesPlayed++;

            var player2 = findPlayer(player2Id);
            if (t.winner == 2) {
                player2.matchesWon++;
            }
            player2.setsWon += _player2Sets;
            player2.points += _player2Points;
            player2.setsPlayed += setsPlayed;
            player2.matchesPlayed++;
        }

        t.buildSaveObject = function () {
            var _setsObject = new Array();
            for (var i = 0; i < t.sets.length; i++) {
                _setsObject.push(t.sets[i].buildSaveObject());
            }
            return { id: t.id, setsObject: _setsObject, player1Id: t.player1Id, player2Id: t.player2Id, date: t.date, winner: t.winner, pointsPlayedTo: t.pointsPlayedTo };
        }
    }

    function addMatch(fromLoad, obj) {
        var sArr = new Array();
        for (var i = 0; i < obj.setsObject.length; i++) {
            sArr.push(new Set(obj.setsObject[i]));
        }

        var mObj = { id: obj.id, player1Id: obj.player1Id, player2Id: obj.player2Id, date: new Date(obj.date), winner: obj.winner, pointsPlayedTo: obj.pointsPlayedTo, sets: sArr };
        var m = new Match(mObj);

        matchArray.push(m);
        $('#tblMatches').append(m.getListItem());
    } 
}

//Set Functions
{

    function Set(obj) {
        var t = this;
        $.extend(t, obj);

        t.isUpdating = false;

        t.getListItem = function (setNumber) {
            if (typeof t.listItem === 'undefined') {
                t.listItem = $('<tr class="setlistitem" />');
                t.tdMatchNumber = $('<td style="text-align:left"/>').appendTo(t.listItem);
                t.tdPlayer1Points = $('<td  style="text-align:center"/>').appendTo(t.listItem);
                t.spnPlayer1Points = $('<span />').appendTo(t.tdPlayer1Points);
                t.txbPlayer1Points = $('<input type="text" style="display:none;width:100%" />').appendTo(t.tdPlayer1Points).change(function () { validateIntTxb($(this)); });
                $('<td style="text-align:center">-</td>').appendTo(t.listItem);
                t.tdPlayer2Points = $('<td  style="text-align:center"/>').appendTo(t.listItem);
                t.spnPlayer2Points = $('<span />').appendTo(t.tdPlayer2Points);
                t.txbPlayer2Points = $('<input type="text" style="display:none;width:100%" />').appendTo(t.tdPlayer2Points).change(function () { validateIntTxb($(this)); });
                $('<td >&nbsp;</td>').appendTo(t.listItem);
            }
            if (setNumber != -1) t.tdMatchNumber.text(setNumber);
            t.spnPlayer1Points.text(t.player1Points);
            t.spnPlayer2Points.text(t.player2Points);
            return t.listItem;
        }

        t.startUpdatingSets = function () {
            //if the list item is nothing we can't even see the sets to update them...
            if (typeof t.listItem === 'undefined') return;

            t.isUpdating = true;

            //Replace spans with textboxes
            t.spnPlayer1Points.hide();
            t.spnPlayer2Points.hide();
            t.txbPlayer1Points.show().val(t.player1Points);
            t.txbPlayer2Points.show().val(t.player2Points);
        }

        t.finishUpdatingSets = function (isSave, pointsPlayedTo) {
            //if the list item is nothing we can't even see the sets to update them...
            if (typeof t.listItem === 'undefined') return;

            //TODO: Save and update the match/player data
            if (isSave) {
                t.player1Points = parseInt(t.txbPlayer1Points.val());
                t.player2Points = parseInt(t.txbPlayer2Points.val());
                t.calculateIsDominate(pointsPlayedTo);
            }

            t.isUpdating = true;

            //Replace textboxes with spans
            t.spnPlayer1Points.show().text(t.player1Points);
            t.spnPlayer2Points.show().text(t.player2Points);
            t.txbPlayer1Points.hide();
            t.txbPlayer2Points.hide();

        }

        t.removeListItem = function () {
            t.listItem.remove();
        }

        t.calculateIsDominate = function (pointsPlayedTo) {
            if (t.player1Points == pointsPlayedTo && t.player2Points == 0) {
                t.isDominate = true;
            } else if (t.player2Points == pointsPlayedTo && t.player1Points == 0) {
                t.isDominate = true;
            } else {
                t.isDominate = false;
            }
        }

        t.buildSaveObject = function () {
            return { id: t.id, player1Points: t.player1Points, player2Points: t.player2Points, isDominate: t.isDominate }
        }
    }
}

//Match Creator Functions
{
    var currentMatchCreator = null;

    function initMatchCreator() {
        currentMatchCreator = new MatchCreator();
        $('#divMatchCreator').append(currentMatchCreator.getDiv());
        currentMatchCreator.createNewSet();
    }

    function MatchCreator() {
        //array of sets, player1Id, player2Id, date, winner
        var t = this;

        t.nextSetId = 0;
        t.sets = new Array();

        t.getDiv = function () {
            if (typeof t.mainDiv === 'undefined') {
                t.mainDiv = $('<div />');
                t.btnAdd = $('<div class="btn center" style="width:150px" >ADD MATCH</div>').click(function () { t.addMatch(); }).appendTo(t.mainDiv);

                var div = $('<div style="margin:5px 0px" />');
                t.ddlPlayer1 = $('<select id="ddlPlayer1" size="1" ></select>').appendTo(div);
                $('<span> vs </span>').appendTo(div);
                t.ddlPlayer2 = $('<select id="ddlPlayer2" size="1" ></select>').appendTo(div);
                div.appendTo(t.mainDiv);

                div = $('<div style="margin:5px 0px">Played to </div>');
                t.txbPointsPlayedTo = $('<input type="text" style="width:50px"/>').val('11').appendTo(div);
                $('<span> points.</span>').appendTo(div);
                div.appendTo(t.mainDiv);

                $('<h3 style="width:100%;border-bottom:1px solid black" >SETS</h3>').appendTo(t.mainDiv);

                t.tblSets = $('<table />').appendTo(t.mainDiv);
                t.tblSets.append($('<tr class="permanent" />').append($('<td style="width:50px" />')).append($('<td />')).append($('<td style="width:100px" >Player 1 Points</td>')).append($('<td style="width:100px" >Player 2 Points</td>')));
            }
            return t.mainDiv;
        }

        t.createNewSet = function () {
            var s = new MatchCreatorSet({ id: currentSetId++, pointsPlayedTo: t.txbPointsPlayedTo.val() });
            t.sets.push(s);
            t.tblSets.append(s.getListItem());
        }

        t.addMatch = function () {
            //validate
            try {
                if (t.ddlPlayer1.val() == t.ddlPlayer2.val()) throw new Error('Two players cannot play against eachother.');
                if (t.ddlPlayer1.val() == null || t.ddlPlayer2.val() == null) throw new Error("Must select a player");

                t.createAMatch();

                sortRankTable();
			
                t.clearSets();
            } catch (err) {
                window.alert(err.message);
                return false;
            }
        }
		
        /// DEPRECATED
        /*
        t.finaliseScoring = function () {
            //Finalise the scoring
            var _player1Sets = 0, _player2Sets = 0; //num sets players have won
            var _player1Points = 0, _player2Points = 0;
            for (var i = 0; i < t.sets.length; i++) {
                if (t.sets[i].isNew) continue;

                //Add points to players
                _player1Points += t.sets[i].player1Points;
                _player2Points += t.sets[i].player2Points;

                if (t.sets[i].player1Points > t.sets[i].player2Points) { //Player 1 won set
                    _player1Sets++;
                    _player1Points += SET_WIN_POINTS;
                    if (t.sets[i].isDominate) _player1Points *= 2;
                } else if (t.sets[i].player1Points < t.sets[i].player2Points) { //Player 2 won set
                    _player2Sets++;
                    _player2Points += SET_WIN_POINTS;
                    if (t.sets[i].isDominate) _player2Points *= 2;
                }
            }

            if (_player1Sets > _player2Sets) { //Player 1 won match
                _player1Points += MATCH_WIN_POINTS;
                t.winner = 1;
            } else if (_player2Sets > _player1Sets) { //Player 2 won match
                _player2Points += MATCH_WIN_POINTS;
                t.winner = 2; 
            } else { //Noone wins
                t.winner = 0;
            }

            var setsPlayed = 0;
            for (var i = 0; i < t.sets.length; i++) if (!t.sets[i].isNew) setsPlayed++;

            //Add points to players
            var player1 = findPlayer(t.ddlPlayer1.val());
            if (t.winner == 1) {
                player1.matchesWon++;
            }
            player1.setsWon += _player1Sets;
            player1.points += _player1Points;
            player1.setsPlayed += setsPlayed;
            player1.matchesPlayed++;

            var player2 = findPlayer(t.ddlPlayer2.val());
            if (t.winner == 2) {
                player2.matchesWon++;
            }
            player2.setsWon += _player2Sets;
            player2.points += _player2Points;
            player2.setsPlayed += setsPlayed;
            player2.matchesPlayed++;
        }
        */

        t.makeSetsArray = function (pointsPlayedTo) {
            var _setsObject = new Array();

            //Build the list of sets objects from MatchCreatorSet ready to be made into actual sets
            for (var i = 0; i < t.sets.length; i++) {
                if (t.sets[i].isNew) continue;

                _setsObject.push(t.sets[i].buildAddObject());
            }

            //Make sets array
            var sArr = new Array();
            for (var i = 0; i < _setsObject.length; i++) {
                var s = new Set(_setsObject[i]);
                s.calculateIsDominate(pointsPlayedTo);
                sArr.push(s);
            }
            return sArr;
        }

        t.createAMatch = function () {
            //Create a match
            var mObj = { id: currentMatchId++, player1Id: t.ddlPlayer1.val(), player2Id: t.ddlPlayer2.val(), date: new Date(Date.now()), winner: t.winner, pointsPlayedTo: t.txbPointsPlayedTo.val(), sets: t.makeSetsArray(t.txbPointsPlayedTo.val()) };
            var m = new Match(mObj);

            m.executeScoring(t.ddlPlayer1.val(), t.ddlPlayer2.val());

            //Add it to previous matches table and to previous matches array
            matchArray.push(m);
            $('#tblMatches').append(m.getListItem());
        }

		t.clearSets = function () {
			t.tblSets.empty();
			t.sets = new Array();
			t.tblSets.append($('<tr class="permanent" />').append($('<td style="width:50px" />')).append($('<td />')).append($('<td style="width:100px" >Player 1 Points</td>')).append($('<td style="width:100px" >Player 2 Points</td>')));
			t.createNewSet();
		}
    }

    function MatchCreatorSet(obj) {
        //player1Points, player2Points, isDominate
        var t = this;
        $.extend(t, obj);
        t.isNew = true;

        t.getListItem = function () {
            if (typeof t.listItem === 'undefined') {
                t.listItem = $('<tr class="isNew"/>');
                t.btnDelete = $('<div class="btn" style="width:25px;height:25px">X</div>').click(function () { t.removeSet(); }).hide();
                t.txbPlayer1Points = $('<input type="text" placeholder="P1 Points"/>').change(function () { t.changeToNotNew(); t.validatePointsTxb($(this), 1); });
                t.txbPlayer2Points = $('<input type="text" placeholder="P2 Points"/>').change(function () { t.changeToNotNew(); t.validatePointsTxb($(this), 2); });

                $('<td >&nbsp</td>').append(t.btnDelete).appendTo(t.listItem);
                $('<td />').text('Set:').appendTo(t.listItem);
                $('<td />').append(t.txbPlayer1Points).appendTo(t.listItem);
                $('<td />').append(t.txbPlayer2Points).appendTo(t.listItem);
            }
            return t.listItem;
        }

        t.changeToNotNew = function () {
			t.listItem.removeClass('isNew');
            t.btnDelete.show();
            t.txbPlayer1Points.removeAttr("placeholder").off('change').change(function () { t.validatePointsTxb($(this), 1); });
            t.txbPlayer2Points.removeAttr("placeholder").off('change').change(function () { t.validatePointsTxb($(this), 2); });
            t.isNew = false;
            currentMatchCreator.createNewSet();
        }

        t.validatePointsTxb = function (txb, playerNum) {
            if (isNaN(parseInt(txb.val()))) {
                window.alert("Entered a wrong input!");
                txb.val('0');
            } else {
                if (playerNum == 1) {
                    t.player1Points = parseInt(txb.val());
                } else {
                    t.player2Points = parseInt(txb.val());
                }
            }
        }

        t.removeSet = function () {
            var idx = -1;
            for (var i = 0; i < currentMatchCreator.sets.length && idx == -1; i++) if (currentMatchCreator.sets[i].id == t.id) idx = i;
            currentMatchCreator.sets.splice(idx, 1);
            t.listItem.remove();
        }

        /*
        t.buildAddObject = function () {
            if (t.player1Points == t.pointsPlayedTo && t.player2Points == 0) {
                t.isDominate = true;
            } else if (t.player2Points == t.pointsPlayedTo && t.player1Points == 0) {
                t.isDominate = true;
            }
            return { player1Points: t.player1Points, player2Points: t.player2Points, isDominate: t.isDominate };
        }
        */
        t.buildAddObject = function () {
            return { player1Points: t.player1Points, player2Points: t.player2Points };
        }
    }
}

//Scoring functions //buggy as all heck
{
	function MatchCreatorSet(obj) {
        //player1Points, player2Points, isDominate
        var t = this;
        $.extend(t, obj);
        t.isNew = true;

        t.getListItem = function () {
            if (typeof t.listItem === 'undefined') {
                t.listItem = $('<tr />');
                t.btnDelete = $('<div class="btn" style="width:25px;height:25px">X</div>').click(function () { t.removeSet(); }).hide();
                t.txbPlayer1Points = $('<input type="text" placeholder="P1 Points"/>').change(function () { t.changeToNotNew(); t.validatePointsTxb($(this), 1); });
                t.txbPlayer2Points = $('<input type="text" placeholder="P2 Points"/>').change(function () { t.changeToNotNew(); t.validatePointsTxb($(this), 2); });

                $('<td >&nbsp</td>').append(t.btnDelete).appendTo(t.listItem);
                $('<td />').text('Set:').appendTo(t.listItem);
                $('<td />').append(t.txbPlayer1Points).appendTo(t.listItem);
                $('<td />').append(t.txbPlayer2Points).appendTo(t.listItem);
            }
            return t.listItem;
        }

        t.changeToNotNew = function () {
            t.btnDelete.show();
            t.txbPlayer1Points.removeAttr("placeholder").off('change').change(function () { t.validatePointsTxb($(this), 1); });
            t.txbPlayer2Points.removeAttr("placeholder").off('change').change(function () { t.validatePointsTxb($(this), 2); });
            t.isNew = false;
            currentMatchCreator.createNewSet();
        }

        t.validatePointsTxb = function (txb, playerNum) {
            if (isNaN(parseInt(txb.val()))) {
                window.alert("Entered a wrong input!");
                txb.val('0');
            } else {
                if (playerNum == 1) {
                    t.player1Points = parseInt(txb.val());
                } else {
                    t.player2Points = parseInt(txb.val());
                }
            }
        }

        t.removeSet = function () {
            var idx = -1;
            for (var i = 0; i < currentMatchCreator.sets.length && idx == -1; i++) if (currentMatchCreator.sets[i].id == t.id) idx = i;
            currentMatchCreator.sets.splice(idx, 1);
            t.listItem.remove();
        }

        t.buildAddObject = function () {
            if (t.player1Points == t.pointsPlayedTo && t.player2Points == 0) {
                t.isDominate = true;
            } else if (t.player2Points == t.pointsPlayedTo && t.player1Points == 0) {
                t.isDominate = true;
            }
            return { player1Points: t.player1Points, player2Points: t.player2Points, isDominate: t.isDominate };
        }
    }
}

//File functions
{
    var files;
    var textFile = null;
    var hasCreated = false;

    makeTextFile = function (caller) {
        var text = buildSaveFile();

        var data = new Blob([text], { type: 'text/plain' });

        if (textFile !== null) {
            window.URL.revokeObjectURL(textFile);
        }

        textFile = window.URL.createObjectURL(data);

        return textFile;
    }

    function initFileSystem() {
        $('#fileLoader').change(function (e) {
            files = e.target.files;
            fileAdded(e);
        });

        $('#divLoad').on('dragover', function (e) {
            e.stopPropogation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        $('#divLoad').on('drop', function (e) {
            e.stopPropogation();
            e.preventDefault();

            files = e.dataTransfer.files;
            fileAdded(e);
        });

        $('#btnLoadCreate').click(function () {
            if (!hasCreated) {
                $('#aLoadDownload').attr('href', makeTextFile($('#aLoadDownload'))).show();
                $(this).text('REFRESH');
                hasCreated = true;
            } else {
                $('#aLoadDownload').attr('href', '').hide();
                $(this).text('CREATE NEW FILE');
                hasCreated = false;
            }
        });
    }

    function fileAdded(event) {
        var file = files[0];

        if (file.type != 'text/plain') {
            window.alert('make sure your file has the extension .txt!!');
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            setupFromFile(reader.result);
        }
        reader.readAsText(file);
    }

    function setupFromFile(dataAsString) {
        //READ FROM FILE HERE
        var loadObj = JSON.parse(dataAsString);

        if (loadObj.settings.version != CURRENT_VERSION) {
            window.alert(loadObj.settings.name + " is not compatible with that version.");
            return;
        }

        currentPlayerId = loadObj.settings.currentPlayerId;
        currentMatchId = loadObj.settings.currentMatchId;
        currentSetId = loadObj.settings.currentSetId;

        playerArray = new Array();
        matchArray = new Array();
        $('#tblRank tr:not(.permanent)').remove();
        $('#tblMatches tr:not(.permanent)').remove();
        $('#ddlPlayer1, #ddlPlayer2').empty();

        for (var i = 0; i < loadObj.players.length; i++) {
            addPlayer(true, loadObj.players[i]);
        }

        for (var i = 0; i < loadObj.matches.length; i++) {
            addMatch(true, loadObj.matches[i]);
        }

        sortRankTable();

        $('.btn[menu="divRank"]').click();
    }

    function buildSaveFile() {
        var saveObj = { settings: { name: "Table Tennis", version: CURRENT_VERSION, currentPlayerId: currentPlayerId, currentMatchId: currentMatchId, currentSetId: currentSetId }, players: [], matches: [] };

        for (var i = 0; i < playerArray.length; i++) {
            saveObj.players.push(playerArray[i].buildSaveObject());
        }

        for (var i = 0; i < matchArray.length; i++) {
            saveObj.matches.push(matchArray[i].buildSaveObject());
        }

        return JSON.stringify(saveObj);
    }
}