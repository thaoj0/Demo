/*
#=============================================================================
# LeTBS: Encounters
# LeTBS_Encounters.js
# By Lecode
# Version 1.0
#-----------------------------------------------------------------------------
# TERMS OF USE
#-----------------------------------------------------------------------------
# https://github.com/LecodeMV/leTBS/blob/master/LICENSE.txt
#-----------------------------------------------------------------------------
# Version History
#-----------------------------------------------------------------------------
# - 1.0 : Initial release
#=============================================================================
*/
var Imported = Imported || {};
Imported.LeTBS_Encounters = true;

var Lecode = Lecode || {};
Lecode.S_TBS.Encounters = {};
/*:
 * @plugindesc Add encounter settings for LeTBS
 * @author Lecode
 * @version 1.0
 * 
 * @help
 * ...
 */
//#=============================================================================


/*-------------------------------------------------------------------------
* Get Parameters
-------------------------------------------------------------------------*/
var parameters = PluginManager.parameters('LeTBS_Encounters');



Lecode.S_TBS.Encounters.oldSceneMap_updateEncounter = Scene_Map.prototype.updateEncounter;
Scene_Map.prototype.updateEncounter = function () {
    if ($gamePlayer.executeEncounter() && Lecode.S_TBS.commandOn) {
        var mapId = this.getLeTBSEncounterMap();
        if (mapId) {
            Lecode.S_TBS.Encounters.oldMapId = $gameMap.mapId();
            var x = $gamePlayer.x;
            var y = $gamePlayer.y;
            var d = $gamePlayer.direction();
            Lecode.S_TBS.Encounters.oldPos = [x, y, d];
            Lecode.S_TBS.Encounters.requested = true;
            $gamePlayer.reserveTransfer(mapId, 0, 0, 2, 0);
            this.updateTransferPlayer();
        }
    }
    Lecode.S_TBS.Encounters.oldSceneMap_updateEncounter.call(this);
};

Lecode.S_TBS.Encounters.oldSceneMap_updateScene = Scene_Map.prototype.updateScene;
Scene_Map.prototype.updateScene = function () {
    Lecode.S_TBS.Encounters.oldSceneMap_updateScene.call(this);
    if (!SceneManager.isSceneChanging() && Lecode.S_TBS.Encounters.requested) {
        SceneManager.push(Scene_Battle);
    }
};

Lecode.S_TBS.Encounters.oldBattleManagerTBS_stopBattle = BattleManagerTBS.stopBattle;
BattleManagerTBS.stopBattle = function () {
    Lecode.S_TBS.Encounters.oldBattleManagerTBS_stopBattle.call(this);
    if (Lecode.S_TBS.Encounters.requested) {
        var pos = Lecode.S_TBS.Encounters.oldPos;
        var mapId = Lecode.S_TBS.Encounters.oldMapId;
        Lecode.S_TBS.Encounters.requested = false;
        $gamePlayer.reserveTransfer(mapId, pos[0], pos[1], pos[2], 0);
        return;
    }
};

Scene_Map.prototype.getLeTBSEncounterMap = function () {
    var maps = this._leTBSEncounterData[String($gamePlayer.regionId())] || this._leTBSEncounterData.default;
    if (!maps) return 0;
    return Number(LeUtilities.getRandomValueInArray(maps));
};

Lecode.S_TBS.Encounters.oldSceneMap_onMapLoaded = Scene_Map.prototype.onMapLoaded;
Scene_Map.prototype.onMapLoaded = function () {
    Lecode.S_TBS.Encounters.oldSceneMap_onMapLoaded.call(this);
    this.makeLeTBSEncounterData();
    if (Lecode.S_TBS.Encounters.requested) {
        $gameMap.events().forEach(function (event) {
            if (event.event().note.match(/<LeTBS Transfer Pos (\d+)>/i))
                $gamePlayer.locate(event.x, event.y);
                $gamePlayer.setDirection(Number(RegExp.$1));
        }, this);
    }
};

Scene_Map.prototype.makeLeTBSEncounterData = function () {
    this._leTBSEncounterData = {};
    var note = $dataMap.note;
    var notedata = $dataMap.note.split(/[\r\n]+/);
    var letbs = false;
    for (var i = 0; i < notedata.length; i++) {
        var line = notedata[i];
        if (line.match(/<LeTBS Encounter Maps>/i)) {
            letbs = true; continue;
        } else if (line.match(/<\/LeTBS Encounter Maps>/i)) {
            letbs = false;
        }

        if (letbs) {
            if (line.match(/default\s?:\s?(.+)/i)) {
                this._leTBSEncounterData.default = RegExp.$1.split(",");
            } else if (line.match(/area (\d+)\s?:\s?(.+)/)) {
                this._leTBSEncounterData[RegExp.$1] = RegExp.$2.split(",");
            }
        }
    }
};