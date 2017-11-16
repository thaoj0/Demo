/*
#=============================================================================
# Le - Drag & Move Windows
# LeDragAndMoveWindows.js
# By Lecode
# Version 1.0
#-----------------------------------------------------------------------------
# TERMS OF USE
#-----------------------------------------------------------------------------
# - Credit required
# - Keep this header
# - Free for commercial use
#-----------------------------------------------------------------------------
# Version History
#-----------------------------------------------------------------------------
# - 1.0 : Initial release
#=============================================================================
*/
var Imported = Imported || {};
Imported.Lecode_DragAndMoveWindows = true;

var Lecode = Lecode || {};
Lecode.S_DAMWindows = Lecode.S_DAMWindows || {};
/*:
 * @plugindesc Allows the user to drag and move windows
 * @author Lecode
 * @version 1.0
 * 
 * @param Sound When dragged
 * @desc Play a sound when a window is dragged.
 * ['filename',pitch,volume,pan]
 * @default Cursor2,50,90,0
 * 
 * @param Max Windows
 * @desc Max number of windows the user can Drag at the same time.
 * Default: 1
 * @default 1
 * 
 * @param Grid Size
 * @desc Size of the virtual grid cells. 1 = no grid
 * Default: 12
 * @default 12
 * 
 * @param Draggable Windows
 * @desc List of draggable windows. Set Except:win1,win2... to drag all windows expect those in the list. Default: win1,win2
 * @default Window_TitleCommand
 *
 * @help
 * ...
*/
//#=============================================================================

//(function() {
/*-------------------------------------------------------------------------
* Get Parameters
-------------------------------------------------------------------------*/
var param = PluginManager.parameters('LeDragAndMoveWindows');

Lecode.S_DAMWindows.soundData = String(param["Sound When dragged"] || "Cursor2,50,90,0");
Lecode.S_DAMWindows.soundData = LeUtilities.stringSplit(Lecode.S_DAMWindows.soundData,",");
Lecode.S_DAMWindows.maxWindows = Number(param["Max Windows"] ||1);
Lecode.S_DAMWindows.draggableWindows = String(param["Draggable Windows"] || "Window_TitleCommand");
Lecode.S_DAMWindows.gridSize = Number(param["Grid Size"] ||12);

Lecode.S_DAMWindows.draggedWindows = 0;


/*-------------------------------------------------------------------------
* Window_Base
-------------------------------------------------------------------------*/
Lecode.S_DAMWindows.oldWBupdate_method = Window_Base.prototype.update;
Window_Base.prototype.update = function() {
    Lecode.S_DAMWindows.oldWBupdate_method.call(this,arguments);
    this.leUpdateDragAndMove();
};

Window_Base.prototype.leUpdateDragAndMove = function() {
	this.leCheckIfDragged();
	if(this._leDragged)
		this.leUpdatePosWhileDragged();
};

Window_Base.prototype.leCheckIfDragged = function() {
	if(TouchInput.isLongPressed()) {
		if(this.leCanDrag()) {
			var tx = TouchInput.x;
			var ty = TouchInput.y;
			if(tx >= this.x && tx <= (this.x+this.width) && ty >= this.y && ty <= (this.y+this.height)) {
				this.leOnDragged();
			}
		}
	} else {
		if(this._leDragged)
			this.leOnDraggedCanceled();
	}
};

Window_Base.prototype.leCanDrag = function() {
	if(Lecode.S_DAMWindows.draggedWindows >= Lecode.S_DAMWindows.maxWindows) return false;
	if(Lecode.S_DAMWindows.draggableWindows.match(/except[ ]?:[ ]?(.+)/i)) {
		var exceptions = LeUtilities.stringSplit(String(RegExp.$1),",");
		for (var i = 0; i < exceptions.length; i++) {
			if( eval("this instanceof "+exceptions[i].trim()) )
				return false;
		};
		return true;
	} else {
		var draggable = LeUtilities.stringSplit(Lecode.S_DAMWindows.draggableWindows);
		for (var i = 0; i < draggable.length; i++) {
			if( eval("this instanceof "+draggable[i].trim()) )
				return true;
		};
		return false;
	}
};

Window_Base.prototype.leOnDragged = function() {
	this._leDragged = true;
	this._leDragIniPos = [this.x,this.y];
	this._leTouchDragIniPos = [TouchInput.x,TouchInput.y];
	Lecode.S_DAMWindows.draggedWindows++;

    var audio = {};
    audio.name = String(Lecode.S_DAMWindows.soundData[0]);
    audio.pitch = Number(Lecode.S_DAMWindows.soundData[1]);
    audio.volume = Number(Lecode.S_DAMWindows.soundData[2]);
    audio.pan = Number(Lecode.S_DAMWindows.soundData[3]);
    AudioManager.playSe(audio);
};

Window_Base.prototype.leOnDraggedCanceled = function() {
	this._leDragged = false;
	Lecode.S_DAMWindows.draggedWindows--;
	this.leUpdatePosOnGrid();
};

Window_Base.prototype.leUpdatePosWhileDragged = function() {
	var deltaX = TouchInput.x - this._leTouchDragIniPos[0];
	var deltaY = TouchInput.y - this._leTouchDragIniPos[1];
	this.x = this._leDragIniPos[0] + deltaX;
	this.y = this._leDragIniPos[1] + deltaY;
};

Window_Base.prototype.leUpdatePosOnGrid = function() {
	var size = Lecode.S_DAMWindows.gridSize.clamp(1,Lecode.S_DAMWindows.gridSize);
	var maxX = Graphics.width - this.width;
	var maxY = Graphics.height - this.height;
	for (var i = 0; i < Graphics.width; i += size) {
		if ( i > this.x ) {
			this.x = (i-size).clamp(0,maxX);
			break;
		}
	}
	for (var i = 0; i < Graphics.height; i += size) {
		if ( i > this.y ) {
			this.y = (i-size).clamp(0,maxY);
			break;
		}
	}
};