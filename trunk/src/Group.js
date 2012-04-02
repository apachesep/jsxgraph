/*
    Copyright 2008-2011
        Matthias Ehmann,
        Michael Gerhaeuser,
        Carsten Miller,
        Bianca Valentin,
        Alfred Wassermann,
        Peter Wilfahrt

    This file is part of JSXGraph.

    JSXGraph is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    JSXGraph is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with JSXGraph.  If not, see <http://www.gnu.org/licenses/>.
*/
/** 
 * @fileoverview In this file the class Group is defined, a class for
 * managing grouping of points.
 */
 
/**
 * Creates a new instance of Group.
 * @class In this class all group management is done.
 * @param {String} id Unique identifier for this object.  If null or an empty string is given,
 * an unique id will be generated by Board
 * @param {String} name Not necessarily unique name, displayed on the board.  If null or an
 * empty string is given, an unique name will be generated.
 * @constructor
 */
JXG.Group = function(board, id, name) {
    var number,
        objArray,
        i, obj, el;
        
    this.board = board;
    this.objects = {};
    number = this.board.numObjects;
    this.board.numObjects++;

    if ((id == '') || !JXG.exists(id)) {
        this.id = this.board.id + 'Group' + number;
    } else {
        this.id = id;
    }
    this.board.groups[this.id] = this;
 
    this.type = JXG.OBJECT_TYPE_POINT;
    this.elementClass = JXG.OBJECT_CLASS_POINT;                

    if ((name == '') || !JXG.exists(name)) {
        this.name = 'group_' + this.board.generateName(this);
    } else {
        this.name = name;
    }
    delete(this.type);

    if ( (arguments.length == 4) && (JXG.isArray(arguments[3])) )
        objArray = arguments[3];
    else {
        objArray = [];
        for (i=3; i<arguments.length; i++) {
            objArray.push(arguments[i]);
        }
    }

    for (i=0; i<objArray.length; i++) {
        obj = JXG.getReference(this.board, objArray[i]);
        if( (!obj.visProp.fixed) && ( (obj.type == JXG.OBJECT_TYPE_POINT) || (obj.type == JXG.OBJECT_TYPE_GLIDER) ) ) {
            if (obj.group.length != 0) {
                this.addGroup(obj.group[obj.group.length-1]);
            } else {
                this.addPoint(obj);
            }
        }
    }
    
    for (el in this.objects) {
        this.objects[el].group.push(this);
    }

    this.dX = 0;
    this.dY = 0;
};

JXG.extend(JXG.Group.prototype, /** @lends JXG.Group.prototype */ {
    /**
     * Releases the group added to the points in this group, but only if this group is the last group.
     */
    ungroup: function() {
        var el;
        for (el in this.objects) {
            if (this.objects[el].group[this.objects[el].group.length-1] == this) {
                this.objects[el].group.pop();
            }
            delete(this.objects[el]);
        }
        // Unregister the group from board
        // delete(this.board.groups[this.id]);  // Not sure if we should delete the group
    },

    /**
     * Sends an update to all group members.
     * @param {JXG.Point} point The point that caused the update.
     */
    update: function(point) {
        var obj = null,
            el;
        
        for (el in this.objects) {
            obj = this.objects[el];
            if (obj.id != point.id) {
                obj.coords = new JXG.Coords(JXG.COORDS_BY_SCREEN, [obj.coords.scrCoords[1] + this.dX, 
                                                                   obj.coords.scrCoords[2] + this.dY], obj.board);
            }
        }
        
        for (el in this.objects) {
            /* Wurde das Element vielleicht geloescht? */
            if (JXG.exists(this.board.objects[el])) {
                /* Nein, wurde es nicht, also updaten */
                this.objects[el].update(false);
            } else { /* es wurde geloescht, also aus dem Array entfernen */
                delete(this.objects[el]);
            }
        }
        return this;
    },

    /**
     * Adds an Point to this group.
     * @param {JXG.Point} object The object added to the group.
     */
    addPoint: function(object) {
        this.objects[object.id] = object;
    },

    /**
     * Adds multiple points to this group.
     * @param {Array} objects An array of points to add to the group.
     */
    addPoints: function(objects) {
        var p;
        for (p in objects)
            this.objects[p.id] = p;
    },

    /**
     * Adds an Point to this group.
     * @param {JXG.Point} object The object added to the group.
     */
    addGroup: function(group) {
        var el;
        for (el in group.objects) {
            this.addPoint(group.objects[el]);
        }
    },

    setProperty: function () {
        var el;

        for (el in this.objects) {
            this.objects[el].setProperty.apply(this.objects[el], arguments);
        }
    }
});

/**
 * Groups points.
 * @param {JXG.Board} board The board the points are on.
 * @param {Array} parents Array of points to group.
 * @param {Object} attributes Visual properties.
 * @type JXG.Group
 * @return An object of type JXG.Group.
 */
JXG.createGroup = function(board, parents, attributes) {
    var i, g = new JXG.Group(board, attributes["id"], attributes["name"], parents);

    g.elType = 'group';

    g.parents = [];
    for (i = 0; i < parents.length; i++) {
        g.parents.push(parents[i].id);
    }

    return g;
};

JXG.JSXGraph.registerElement('group', JXG.createGroup);
