/*
#=============================================================================
# LeTBS: RTP Use
# LeTBS_RTPUse.js
# By Lecode
# Version 1.2
#-----------------------------------------------------------------------------
# TERMS OF USE
#-----------------------------------------------------------------------------
# https://github.com/LecodeMV/leTBS/blob/master/LICENSE.txt
#-----------------------------------------------------------------------------
# Version History
#-----------------------------------------------------------------------------
# - 1.0 : Initial release
# - 1.1 : Status sprites are now correctly setup
# - 1.2 : Support sprite's name and character name changes
#=============================================================================
*/
var Lecode = Lecode || {};
Lecode.S_TBS.RTPUse = {};
/*:
 * @plugindesc Automatically uses RPT ressources for LeTBS
 * @author Lecode
 * @version 1.2
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin adds various tags to use RTP graphics automatically for entities
 * and some displays.
 * 
 * ============================================================================
 * Use Characters For Entities
 * ============================================================================
 *
 * In order for your actors or enemies to use a character as a graphic, use the
 * following instructions inside LeTBS tag:
 * 
 * use_character
 * character_name: [Name]
 * character_index: [Index]
 * 
 * The last two instructions are only to be used for enemies, as the characters
 * for actors are already knew.
 * 
 * ============================================================================
 * Auto Graphic Use
 * ============================================================================
 *
 * Some tags allow to automatically use an entity's graphic on the huds:
 * 
 * auto_turn_order_face     Uses the 'idle' graphic on the turn order hud
 * auto_status_sprite       Uses the 'idle' graphic in the status window
 */
//#=============================================================================

/*-------------------------------------------------------------------------
* Get Parameters
-------------------------------------------------------------------------*/
var parameters = PluginManager.parameters('LeTBS_RTPUse');


/*-------------------------------------------------------------------------
* TBSEntity
-------------------------------------------------------------------------*/
TBSEntity.prototype.getCharacterName = function () {
    if (!this.battler().hasLeTBSTag("useCharacter")) return null;
    if (this.hasBlankSprite()) return null;
    if (this.battler().isActor())
        return this.battler().getLeTBSTagStringValue("characterName", this.battler().characterName());
    return this.battler().getLeTBSTagStringValue("characterName");
};

TBSEntity.prototype.getCharacterIndex = function () {
    if (!this.battler().hasLeTBSTag("useCharacter")) return null;
    if (this.hasBlankSprite()) return null;
    if (this.battler().isActor())
        return this.battler().getLeTBSTagStringValue("characterIndex", this.battler().characterIndex());
    return this.battler().getLeTBSTagStringValue("characterIndex");
};

Lecode.S_TBS.RTPUse.oldTBSEntity_checkFilenameChange = TBSEntity.prototype.checkFilenameChange;
TBSEntity.prototype.checkFilenameChange = function (state) {
    var needChange = !!state.TagsLetbs.characterName || !!state.TagsLetbs.characterIndex;
    if (needChange) {
        this.applyFilenameChange();
        return;
    }
    Lecode.S_TBS.RTPUse.oldTBSEntity_checkFilenameChange.call(this, state);
};


/*-------------------------------------------------------------------------
* TBSEntity_Sprite
-------------------------------------------------------------------------*/
Lecode.S_TBS.RTPUse.oldTBSEntitySprite_initialize = TBSEntity_Sprite.prototype.initialize;
TBSEntity_Sprite.prototype.initialize = function (battler, entity) {
    Lecode.S_TBS.RTPUse.oldTBSEntitySprite_initialize.call(this, battler, entity);
    this._characterName = null;
    this._charaIndex = null;
    this._frameOrder = [0, 1, 2, 1];
    this._frameOrderIndex = 0;
};

Lecode.S_TBS.RTPUse.oldTBSEntitySprite_updateFrameCount = TBSEntity_Sprite.prototype.updateFrameCount;
TBSEntity_Sprite.prototype.updateFrameCount = function () {
    var charaName = this._entity.getCharacterName();
    if (charaName && this._pose === "idle") {
        this._frameOrderIndex++;
        if (this._frameOrderIndex > this._frameOrder.length) {
            this._frameOrderIndex = 0;
            this.onPosePlayed();
        }
        this._frameCount = this._frameOrder[this._frameOrderIndex];
        return;
    }
    Lecode.S_TBS.RTPUse.oldTBSEntitySprite_updateFrameCount.call(this);
};

Lecode.S_TBS.RTPUse.oldTBSEntitySprite_processBitmapsConfig = TBSEntity_Sprite.prototype.processBitmapsConfig;
TBSEntity_Sprite.prototype.processBitmapsConfig = function (info, hue) {
    var charaName = this._entity.getCharacterName();
    var pose = info[0];
    if (charaName && pose === "idle") {
        this._poses.push(pose);
        var fullBitmap = ImageManager.loadCharacter(charaName, hue);
        fullBitmap.addLoadListener(this.createCharaBitmap.bind(this, fullBitmap));
        return;
    }
    Lecode.S_TBS.RTPUse.oldTBSEntitySprite_processBitmapsConfig.call(this, info, hue);
};

TBSEntity_Sprite.prototype.createCharaBitmap = function (fbitmap) {
    var charaName = this._entity.getCharacterName();
    var charaIndex = this._entity.getCharacterIndex();
    this._characterName = charaName;
    this._charaIndex = charaIndex;
    var big = ImageManager.isBigCharacter(charaName);
    if (big) {
        throw new Error("LeTBS_RTPUse: Doesn't handle big characters for now");
    }
    var bitmap = new Bitmap(48 * 3, 48 * 4);
    var pw = fbitmap.width / 4;
    var ph = fbitmap.height / 2;
    var n = charaIndex;
    var sx = (n % 4) * pw;
    var sy = Math.floor(n / 4) * ph;
    bitmap.blt(fbitmap, sx, sy, pw, ph, 0, 0);
    this._maxFrame["idle"] = 2;
    this._bitmaps["idle"] = bitmap;
    this._frameLoaded++;
};


/*-------------------------------------------------------------------------
* TBSTurnOrderVisual
-------------------------------------------------------------------------*/
Lecode.S_TBS.RTPUse.oldTBSTurnOrderVisual_getSpriteBitmap = TBSTurnOrderVisual.prototype.getSpriteBitmap;
TBSTurnOrderVisual.prototype.getSpriteBitmap = function (entity) {
    var auto = entity.battler().hasLeTBSTag("autoTurnOrderFace");
    if (auto) {
        var sprite = entity._sprite;
        var fbitmap = sprite._bitmaps["idle"];
        var bitmap = new Bitmap(40, 40);
        var pw = fbitmap.width / (sprite._maxFrame["idle"] + 1);
        var ph = fbitmap.height / 4;
        var y = ph <= 40 ? 0 : 6;
        bitmap.blt(fbitmap, pw / 2 - 20, y, 40, 40, 0, 0);
        return bitmap;
    }
    return Lecode.S_TBS.RTPUse.oldTBSTurnOrderVisual_getSpriteBitmap.call(this, entity);
};


/*-------------------------------------------------------------------------
* Window_TBSStatus
-------------------------------------------------------------------------*/
Lecode.S_TBS.RTPUse.oldWindowTBSStatus_drawSprite = Window_TBSStatus.prototype.drawSprite;
Window_TBSStatus.prototype.drawSprite = function (x, y) {
    var auto = this._entity.battler().hasLeTBSTag("autoStatusSprite");
    if (auto) {
        var sprite = this._entity._sprite;
        var fbitmap = sprite._bitmaps["idle"];
        var pw = fbitmap.width / (sprite._maxFrame["idle"] + 1);
        var ph = fbitmap.height / 4;
        var window = this;
        var dx = eval(Lecode.S_TBS.Windows.statusWindowSpriteBoxW) / 2 - pw / 2;
        var dy = 20 + eval(Lecode.S_TBS.Windows.statusWindowSpriteBoxH) / 2 - ph / 2;
        this.contents.blt(fbitmap, 0, 0, pw, ph, dx, dy);
        return;
    }
    Lecode.S_TBS.RTPUse.oldWindowTBSStatus_drawSprite.call(this, x, y);
};