/*
#=============================================================================
# LeTBS: Timeline Control
# LeTBS_TimelineControl.js
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
Imported.LeTBS_TimelineControl = true;

var Lecode = Lecode || {};
Lecode.S_TBS.TimelineControl = {};
/*:
 * @plugindesc Add features related to the timeline
 * @author Lecode
 * @version 1.0
 **
* @param Interrupt Chance
* @desc Default % to interrupt a target who's charging
* @default 15
*
* @param -- Extra Turn --
* @desc ...
* @default 
*
* @param Extra Turn Text
* @desc ...
* @default Extra Turn
*
* @param Extra Turn Font Size
* @desc ...
* @default 32
*
* @param Extra Turn Color
* @desc ...
* @default #CC2EFA
*
* @param -- Instant Turn --
* @desc ...
* @default 
*
* @param Instant Turn Text
* @desc ...
* @default Instant Turn
*
* @param Instant Turn Font Size
* @desc ...
* @default 32
*
* @param Instant Turn Color
* @desc ...
* @default #CC2EFA
*
* @param -- Interrupt --
* @desc ...
* @default 
*
* @param Interrupt Text
* @desc ...
* @default Interrupted
*
* @param Interrupt Font Size
* @desc ...
* @default 32
*
* @param Interrupt Color
* @desc ...
* @default #CC2EFA
*
* @param -- Acceleration --
* @desc ...
* @default 
*
* @param Acceleration Text
* @desc ...
* @default Acceleration
*
* @param Acceleration Font Size
* @desc ...
* @default 32
*
* @param Acceleration Color
* @desc ...
* @default #CC2EFA
*
* @param -- Deceleration --
* @desc ...
* @default 
*
* @param Deceleration Text
* @desc ...
* @default Acceleration
*
* @param Deceleration Font Size
* @desc ...
* @default 32
*
* @param Deceleration Color
* @desc ...
* @default #CC2EFA
*
* @param -- Turn Number --
* @desc ...
* @default 
*
* @param Accelerated Turn Font Size
* @desc ...
* @default 18
*
* @param Accelerated Turn Color
* @desc ...
* @default #FF4000
*
 * @help
 * See the documentation
 */
//#=============================================================================


/*-------------------------------------------------------------------------
* Get Parameters
-------------------------------------------------------------------------*/
var parameters = PluginManager.parameters('LeTBS_TimelineControl');

Lecode.S_TBS.TimelineControl.interruptChance = Number(parameters["Interrupt Chance"] || 15);	//	(): Default % to interrupt a target who's charging
// Divider: -- Extra Turn --
Lecode.S_TBS.TimelineControl.extraTurnText = String(parameters["Extra Turn Text"] || "Extra Turn");
Lecode.S_TBS.TimelineControl.extraTurnFontSize = Number(parameters["Extra Turn Font Size"] || 32);
Lecode.S_TBS.TimelineControl.extraTurnColor = String(parameters["Extra Turn Color"] || "#CC2EFA");
// Divider: -- Instant Turn --
Lecode.S_TBS.TimelineControl.instantTurnText = String(parameters["Instant Turn Text"] || "Instant Turn");
Lecode.S_TBS.TimelineControl.instantTurnFontSize = Number(parameters["Instant Turn Font Size"] || 32);
Lecode.S_TBS.TimelineControl.instantTurnColor = String(parameters["Instant Turn Color"] || "#CC2EFA");
// Divider: -- Interrupt --
Lecode.S_TBS.TimelineControl.interruptText = String(parameters["Interrupt Text"] || "Interrupted");
Lecode.S_TBS.TimelineControl.interruptFontSize = Number(parameters["Interrupt Font Size"] || 32);
Lecode.S_TBS.TimelineControl.interruptColor = String(parameters["Interrupt Color"] || "#CC2EFA");
// Divider: -- Acceleration --
Lecode.S_TBS.TimelineControl.accelerationText = String(parameters["Acceleration Text"] || "Acceleration");
Lecode.S_TBS.TimelineControl.accelerationFontSize = Number(parameters["Acceleration Font Size"] || 32);
Lecode.S_TBS.TimelineControl.accelerationColor = String(parameters["Acceleration Color"] || "#CC2EFA");
// Divider: -- Deceleration --
Lecode.S_TBS.TimelineControl.decelerationText = String(parameters["Deceleration Text"] || "Acceleration");
Lecode.S_TBS.TimelineControl.decelerationFontSize = Number(parameters["Deceleration Font Size"] || 32);
Lecode.S_TBS.TimelineControl.decelerationColor = String(parameters["Deceleration Color"] || "#CC2EFA");
// Divider: -- Turn Number --
Lecode.S_TBS.TimelineControl.acceleratedTurnFontSize = Number(parameters["Accelerated Turn Font Size"] || 18);
Lecode.S_TBS.TimelineControl.acceleratedTurnColor = String(parameters["Accelerated Turn Color"] || "#FF4000");





/*-------------------------------------------------------------------------
* TBSEntity
-------------------------------------------------------------------------*/
Lecode.S_TBS.TimelineControl.oldTBSEntity_initialize = TBSEntity.prototype.initialize;
TBSEntity.prototype.initialize = function (battler, layer) {
    Lecode.S_TBS.TimelineControl.oldTBSEntity_initialize.call(this, battler, layer);
    this._gotExtraTurn = false;
    this._chargingData = null;
};

TBSEntity.prototype.getExtraTurnRate = function () {
    var value = 0;
    value += this.rpgObject().leTbs_extraTurn;
    this.battler().states().forEach(function (state) {
        if (state) {
            value += state.leTbs_extraTurn;
        }
    });
    if (this.battler().isActor()) {
        this.battler().equips().forEach(function (equip) {
            if (equip) {
                value += equip.leTbs_extraTurn;
            }
        });
    }
    return value * 0.01;
};

TBSEntity.prototype.getInterruptChargeRate = function () {
    var value = Lecode.S_TBS.TimelineControl.interruptChance;
    value += this.rpgObject().leTbs_interruptCharge;
    this.battler().states().forEach(function (state) {
        if (state) {
            value += state.leTbs_interruptCharge;
        }
    });
    if (this.battler().isActor()) {
        this.battler().equips().forEach(function (equip) {
            if (equip) {
                value += equip.leTbs_interruptCharge;
            }
        });
    }
    return value * 0.01;
};

TBSEntity.prototype.getInterruptChargeDefenseRate = function () {
    var value = 0;
    value += this.rpgObject().leTbs_interruptChargeDefense;
    this.battler().states().forEach(function (state) {
        if (state) {
            value += state.leTbs_interruptChargeDefense;
        }
    });
    if (this.battler().isActor()) {
        this.battler().equips().forEach(function (equip) {
            if (equip) {
                value += equip.leTbs_interruptChargeDefense;
            }
        });
    }
    return value * 0.01;
};

Lecode.S_TBS.TimelineControl.oldTBSEntity_onTurnEnd = TBSEntity.prototype.onTurnEnd;
TBSEntity.prototype.onTurnEnd = function () {
    Lecode.S_TBS.TimelineControl.oldTBSEntity_onTurnEnd.call(this);
    if (!this._gotExtraTurn && Math.random() < this.getExtraTurnRate()) {
        BattleManagerTBS.addExtraTurn(this);
    }
    if (this.isCharging() && this._chargingData.turns === 0) {
        this._chargingData = null;
        this.setPose("idle");
        this._sprite.checkLoopAnimations();
    }
};

Lecode.S_TBS.TimelineControl.oldTBSEntity_onDamage = TBSEntity.prototype.onDamage;
TBSEntity.prototype.onDamage = function (user) {
    var chance = user.getInterruptChargeRate() - this.getInterruptChargeDefenseRate();
    if (Math.random() < chance)
        this.interruptCharging();
    Lecode.S_TBS.TimelineControl.oldTBSEntity_onDamage.call(this, user);
};

Lecode.S_TBS.TimelineControl.oldTBSEntity_getLoopAnimations = TBSEntity.prototype.getLoopAnimations;
TBSEntity.prototype.getLoopAnimations = function () {
    var anims = Lecode.S_TBS.TimelineControl.oldTBSEntity_getLoopAnimations.call(this);
    if (this.isCharging()) {
        anims.push(this._chargingData.anim);
    }
    return anims;
};

Lecode.S_TBS.TimelineControl.oldTBSEntity_playableByAI = TBSEntity.prototype.playableByAI;
TBSEntity.prototype.playableByAI = function () {
    return Lecode.S_TBS.TimelineControl.oldTBSEntity_playableByAI.call(this)
        || this.isCharging();
};

TBSEntity.prototype.isCharging = function () {
    return !!this._chargingData;
};

TBSEntity.prototype.interruptCharging = function () {
    if (!this.isCharging()) return;
    this._chargingData = null;
    var text = Lecode.S_TBS.TimelineControl.interruptText;
    var fs = Lecode.S_TBS.TimelineControl.interruptFontSize;
    var color = Lecode.S_TBS.TimelineControl.interruptColor;
    this.addTextPopup(text, fs, color);
    this.callSequence("damaged");
};

Lecode.S_TBS.TimelineControl.oldTBSEntity_defaultPose = TBSEntity.prototype.defaultPose;
TBSEntity.prototype.defaultPose = function () {
    if (this.isCharging() && this._sprite.isValidPose("charge"))
        return "charge";
    return Lecode.S_TBS.TimelineControl.oldTBSEntity_defaultPose.call(this);
};

Lecode.S_TBS.TimelineControl.oldTBSEntity_setPose = TBSEntity.prototype.setPose;
TBSEntity.prototype.setPose = function (pose, afterPose) {
    if (this.isCharging()) {
        if (pose === "turn_start" || pose === "hit")
            return;
        afterPose = this.defaultPose();
    }
    Lecode.S_TBS.TimelineControl.oldTBSEntity_setPose.call(this, pose, afterPose);
};

Lecode.S_TBS.TimelineControl.oldTBSEntity_setFixedPose = TBSEntity.prototype.setFixedPose;
TBSEntity.prototype.setFixedPose = function (pose, frame) {
    if (this.isCharging()) {
        if (pose === "turn_start" || pose === "hit")
            return;
    }
    Lecode.S_TBS.TimelineControl.oldTBSEntity_setFixedPose.call(this, pose, frame);
};


/*-------------------------------------------------------------------------
* BattleManagerTBS
-------------------------------------------------------------------------*/
Lecode.S_TBS.TimelineControl.oldBattleManagerTBS_processAction = BattleManagerTBS.processAction;
BattleManagerTBS.processAction = function () {
    var action = this.activeAction();
    var item = action.item();
    var entity = this.activeEntity();
    var chargeTurns = item.leTbs_charge.turns;
    if (!entity.isCharging() && chargeTurns) {
        var x = this.cursor().cellX;
        var y = this.cursor().cellY;
        var cursorCell = this.getCellAt(x, y);
        entity.setPose("charge", "charge");
        entity._chargingData = {
            turns: chargeTurns,
            anim: item.leTbs_charge.anim,
            cell: cursorCell,
            actionScope: this._actionScope,
            actionAoE: this._actionAoE,
            item: item
        };
        entity.lookAt(this._activeCell);
        this.processCommandPass();
        return;
    }
    Lecode.S_TBS.TimelineControl.oldBattleManagerTBS_processAction.call(this);
};

Lecode.S_TBS.TimelineControl.oldBattleManagerTBS_startAiTurn = BattleManagerTBS.startAiTurn;
BattleManagerTBS.startAiTurn = function (entity, battler) {
    if (entity.isCharging()) {
        entity._chargingData.turns--;
        if (entity._chargingData.turns === 0) {
            var cell = entity._chargingData.cell;
            this.activeAction().setItemObject(entity._chargingData.item);
            this.setCursorCell(cell);
            this._actionAoE = entity._chargingData.actionAoE;
            this._actionScope = entity._chargingData.actionScope;
            this.processAction();
            this.checkScopeVisibility([cell], entity.getCell());
            console.log("cell._scopeVisible:", cell._scopeVisible);
        } else {
            this.processCommandPass();
        }
        return;
    }
    Lecode.S_TBS.TimelineControl.oldBattleManagerTBS_startAiTurn.call(this, entity, battler);
};

BattleManagerTBS.addExtraTurn = function (entity) {
    var indexToInsert = null;
    for (var i = 0; i < this._turnOrder.length; i++) {
        var e = this._turnOrder[i];
        if (entity === e)
            indexToInsert = i;
    }
    if (indexToInsert >= 0) {
        var text = Lecode.S_TBS.TimelineControl.extraTurnText;
        var fs = Lecode.S_TBS.TimelineControl.extraTurnFontSize;
        var color = Lecode.S_TBS.TimelineControl.extraTurnColor;
        entity.addTextPopup(text, fs, color);
        if (entity.battler().isActor())
            this.wait(40);
        entity._gotExtraTurn = true;
        this._turnOrder.splice(indexToInsert + 1, 0, entity);
        this._turnOrderVisual.updateOnExtraTurn(this._turnOrder, this._activeIndex);
    }
};

Lecode.S_TBS.TimelineControl.oldBattleManagerTBS_onTurnOrderEnd = BattleManagerTBS.onTurnOrderEnd;
BattleManagerTBS.onTurnOrderEnd = function () {
    this.removeExtraTurns();
    this.reverseAcceleratedTurnEffects();
    this._turnOrderVisual.updateOnExtraTurn(this._turnOrder, this._activeIndex);
    Lecode.S_TBS.TimelineControl.oldBattleManagerTBS_onTurnOrderEnd.call(this);
};

BattleManagerTBS.removeExtraTurns = function () {
    this._turnOrder = LeUtilities.uniqArray(this._turnOrder);
    this.allEntities().forEach(function (entity) {
        entity._gotExtraTurn = false;
    });
};

BattleManagerTBS.reverseAcceleratedTurnEffects = function () {
    this.allEntities().forEach(function (entity) {
        this._turnOrder[entity._oldTurnOrderIndex] = entity;
        entity._turnAccelerated = false;
    }.bind(this));
};

Lecode.S_TBS.TimelineControl.oldBattleManagerTBS_onActionEnd = BattleManagerTBS.onActionEnd;
BattleManagerTBS.onActionEnd = function () {
    var entity = this.activeEntity();
    if (entity.isCharging()) {
        this.processCommandPass();
        return;
    }
    Lecode.S_TBS.TimelineControl.oldBattleManagerTBS_onActionEnd.call(this);
};

Lecode.S_TBS.TimelineControl.oldBattleManagerTBS_onPrimarySequenceEnd = BattleManagerTBS.onPrimarySequenceEnd;
BattleManagerTBS.onPrimarySequenceEnd = function (seqMng) {
    Lecode.S_TBS.TimelineControl.oldBattleManagerTBS_onPrimarySequenceEnd.call(this, seqMng);
    var entities = LeUtilities.uniqArray(seqMng._affectedTargets);
    if (seqMng._action) {
        var item = seqMng._action.item();
        if (item) {
            entities.forEach(function (target) {
                BattleManagerTBS.applyTimelineControlEffects(seqMng.getUser(), item, target);
            });
        }
    }
};

BattleManagerTBS.applyTimelineControlEffects = function (user, item, target) {
    if (Math.random() < item.leTbs_extraTurn) {
        this.addExtraTurn(target);
    } else if (Math.random() < item.leTbs_accelerateTurn) {
        this.accelerateTurn(user, target, 1);
    } else if (Math.random() < item.leTbs_deccelerateTurn) {
        this.accelerateTurn(user, target, -1);
    } else if (Math.random() < item.leTbs_instantTurn) {
        this.setInstantTurn(user, target);
    } else if (Math.random() < item.leTbs_extraInstantTurn) {
        this.setInstantTurn(user, target, true);
    }
};

BattleManagerTBS.accelerateTurn = function (user, target, value) {
    var userIndex = this._turnOrderVisual.getEntityIndex(user);
    var targetIndex = this._turnOrderVisual.getEntityIndex(target);
    var newIndex = targetIndex - value;
    if (newIndex >= this._turnOrder.length || newIndex < 0 || newIndex === userIndex) return;

    this.allEntities().forEach(function (entity) {
        entity._oldTurnOrderIndex = this._turnOrderVisual.getEntityIndex(entity);
        console.log(entity.battler().name(), " ", entity._oldTurnOrderIndex);
    }.bind(this));

    var e = this._turnOrder[newIndex];
    this._turnOrder[targetIndex] = e;
    this._turnOrder[newIndex] = target;
    var text = value > 0 ? Lecode.S_TBS.TimelineControl.accelerationText : Lecode.S_TBS.TimelineControl.decelerationText;
    var fs = value > 0 ? Lecode.S_TBS.TimelineControl.accelerationFontSize : Lecode.S_TBS.TimelineControl.decelerationFontSize;
    var color = value > 0 ? Lecode.S_TBS.TimelineControl.accelerationColor : Lecode.S_TBS.TimelineControl.decelerationColor;
    target.addTextPopup(text, fs, color);
    target._turnAccelerated = true;
    this._turnOrderVisual.updateOnExtraTurn(this._turnOrder, this._activeIndex);
};

BattleManagerTBS.setInstantTurn = function (user, target, extra) {
    var userIndex = this._turnOrderVisual.getEntityIndex(user);
    var targetIndex = this._turnOrderVisual.getEntityIndex(target);
    var newIndex = userIndex + 1;
    if ((!extra && targetIndex < userIndex) || newIndex >= this._turnOrder.length) return;

    this.allEntities().forEach(function (entity) {
        entity._oldTurnOrderIndex = this._turnOrderVisual.getEntityIndex(entity);
        console.log(entity.battler().name(), " ", entity._oldTurnOrderIndex);
    }.bind(this));

    var text = Lecode.S_TBS.TimelineControl.instantTurnText;
    var fs = Lecode.S_TBS.TimelineControl.instantTurnFontSize;
    var color = Lecode.S_TBS.TimelineControl.instantTurnColor;
    target.addTextPopup(text, fs, color);
    target._gotExtraTurn = true;
    target._turnAccelerated = true;
    if (!extra)
        LeUtilities.removeInArray(this._turnOrder, target);
    this._turnOrder.splice(newIndex, 0, target);
    this._turnOrderVisual.updateOnExtraTurn(this._turnOrder, this._activeIndex);
};


/*-------------------------------------------------------------------------
* TBSTurnOrderVisual
-------------------------------------------------------------------------*/
TBSTurnOrderVisual.prototype.updateOnExtraTurn = function (newOrder, oldIndex) {
    this.set(newOrder);
    this._activeIndex = oldIndex;
    this.setPositions();
    this.updateOrderState();
};


/*-------------------------------------------------------------------------
* Window_TBSEntityTurn
-------------------------------------------------------------------------*/
Lecode.S_TBS.TimelineControl.WindowTBSEntityTurn_refreshText = Window_TBSEntityTurn.prototype.refreshText;
Window_TBSEntityTurn.prototype.refreshText = function (index) {
    if (this._entity._turnAccelerated) {
        this.contents.clear();
        this.resetFontSettings();
        this.contents.fontSize = Lecode.S_TBS.TimelineControl.acceleratedTurnFontSize;
        this.contents.textColor = Lecode.S_TBS.TimelineControl.acceleratedTurnColor;
        this.leU_drawText(index + 1, 4, 0);
        return;
    }
    Lecode.S_TBS.TimelineControl.WindowTBSEntityTurn_refreshText.call(this, index);
};


/*-------------------------------------------------------------------------
* DataManager
-------------------------------------------------------------------------*/
Lecode.S_TBS.TimelineControl.oldDataManager_processLeTBSTags = DataManager.processLeTBSTags;
DataManager.processLeTBSTags = function () {
    Lecode.S_TBS.TimelineControl.oldDataManager_processLeTBSTags.call(this);
    this.processLeTBS_TimelineControlTagsForBattlers();
    this.processLeTBS_TimelineControlTagsForEquipmentsAndStates();
    this.processLeTBS_TimelineControlTagsForObjects();
};


DataManager.processLeTBS_TimelineControlTagsForBattlers = function () {
    var groups = [$dataActors, $dataEnemies, $dataClasses];
    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        for (var j = 1; j < group.length; j++) {
            var obj = group[j];
            var notedata = obj.note.split(/[\r\n]+/);
            var letbs = false;

            obj.leTbs_extraTurn = 0;
            obj.leTbs_interruptCharge = 0;
            obj.leTbs_interruptChargeDefense = 0;

            for (var k = 0; k < notedata.length; k++) {
                var line = notedata[k];
                if (line.match(/<letbs>/i))
                    letbs = true;
                else if (line.match(/<\/letbs>/i))
                    letbs = false;

                if (letbs) {
                    if (line.match(/extra_turn\s?:\s?(.+)\%/i)) {
                        obj.leTbs_extraTurn = Number(RegExp.$1);
                    } else if (line.match(/interrupt_charge\s?:\s?(.+)\%/i)) {
                        obj.leTbs_interruptCharge = Number(RegExp.$1);
                    } else if (line.match(/interrupt_charge_defense\s?:\s?(.+)\%/i)) {
                        obj.leTbs_interruptChargeDefense = Number(RegExp.$1);
                    }
                }
            }
        }
    }
};

DataManager.processLeTBS_TimelineControlTagsForEquipmentsAndStates = function () {
    var groups = [$dataWeapons, $dataArmors, $dataStates];
    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        for (var j = 1; j < group.length; j++) {
            var obj = group[j];
            var notedata = obj.note.split(/[\r\n]+/);
            var letbs = false;

            obj.leTbs_extraTurn = 0;
            obj.leTbs_interruptCharge = 0;
            obj.leTbs_interruptChargeDefense = 0;

            for (var k = 0; k < notedata.length; k++) {
                var line = notedata[k];
                if (line.match(/<letbs>/i))
                    letbs = true;
                else if (line.match(/<\/letbs>/i))
                    letbs = false;

                if (letbs) {
                    if (line.match(/extra_turn\s?:\s?(.+)\%/i)) {
                        obj.leTbs_extraTurn = Number(RegExp.$1);
                    } else if (line.match(/interrupt_charge\s?:\s?(.+)\%/i)) {
                        obj.leTbs_interruptCharge = Number(RegExp.$1);
                    } else if (line.match(/interrupt_charge_defense\s?:\s?(.+)\%/i)) {
                        obj.leTbs_interruptChargeDefense = Number(RegExp.$1);
                    }
                }
            }
        }
    }
};

DataManager.processLeTBS_TimelineControlTagsForObjects = function () {
    var groups = [$dataSkills, $dataItems, $dataWeapons];
    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        for (var j = 1; j < group.length; j++) {
            var obj = group[j];
            var notedata = obj.note.split(/[\r\n]+/);
            var letbs = false;

            obj.leTbs_charge = {
                turns: null,
                anim: 0
            };
            obj.leTbs_extraTurn = 0;
            obj.leTbs_accelerateTurn = 0;
            obj.leTbs_deccelerateTurn = 0;
            obj.leTbs_instantTurn = 0;
            obj.leTbs_extraInstantTurn = 0;

            for (var k = 0; k < notedata.length; k++) {
                var line = notedata[k];
                if (line.match(/<letbs>/i))
                    letbs = true;
                else if (line.match(/<\/letbs>/i))
                    letbs = false;

                if (letbs) {
                    if (line.match(/charge\s?:\s?(.+)/i)) {
                        var strs = RegExp.$1.split(",");
                        obj.leTbs_charge.turns = Number(strs[0].trim());
                        obj.leTbs_charge.anim = Number(strs[1].trim());
                    } else if (line.match(/extra_turn\s?:\s?(.+)\%/i)) {
                        obj.leTbs_extraTurn = Number(RegExp.$1);
                    } else if (line.match(/accelerate_turn\s?:\s?(.+)\%/i)) {
                        obj.leTbs_accelerateTurn = Number(RegExp.$1);
                    } else if (line.match(/deccelerate_turn\s?:\s?(.+)\%/i)) {
                        obj.leTbs_deccelerateTurn = Number(RegExp.$1);
                    } else if (line.match(/extra_instant_turn\s?:\s?(.+)\%/i)) {
                        obj.leTbs_extraInstantTurn = Number(RegExp.$1);
                    } else if (line.match(/instant_turn\s?:\s?(.+)\%/i)) {
                        obj.leTbs_instantTurn = Number(RegExp.$1);
                    }
                }
            }
        }
    }
};