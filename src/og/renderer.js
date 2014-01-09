goog.provide('og.Renderer');

goog.require('og.math.Vector3');
goog.require('og.input');
goog.require('og.input.Input');
goog.require('og.Camera');

og.Renderer = function (handler) {
    this.handler = handler;
    this._renderNodesArr = [];
    this.renderNodes = {};
    this.cameras = [];
    this.activeCamera;

    this.input = new og.input.Input();
    this.controls = [];

    this.events = {};

    this.mouseLeftButtonDown = false;
    this.mouseRightButtonDown = false;
    this.holdMouseLeftButtonDown = false;
    this.holdMouseRightButtonDown = false;
    this.mouseIsMoving = false;

    this.mouseState = {
        x: 0,
        y: 0,
        mouseDirection: new og.math.Vector3()
    };
};

og.Renderer.eventNames = [
    "ondraw",
    "onmousemove",
    "onmouselbuttonclick",
    "onmouselbuttondown",
    "onmouserbuttonclick",
    "onmouserbuttondown",
    "onresize"
];

og.Renderer.prototype.initEvents = function () {
    for (var i = 0; i < og.Renderer.eventNames.length; i++) {
        this.events[og.Renderer.eventNames[i]] = [];
    }
};

og.Renderer.prototype.addControl = function (control) {
    control.setRenderer(this);
    this.controls.push(control);
};

og.Renderer.prototype.addControls = function (cArr) {
    for (var i = 0; i < cArr.length; i++) {
        cArr[i].setRenderer(this);
        this.controls.push(cArr[i]);
    }
};

og.Renderer.prototype.init = function () {
    var that = this;
    this.handler.drawback = function () {
        that.draw();
    }

    var camera = new og.Camera();
    camera.init(this, { eye: new og.math.Vector3(0, 0, 12000), look: new og.math.Vector3(0, 0, 0), up: new og.math.Vector3(0, 1, 0) });
    this.activeCamera = camera;

    this.handler.onCanvasResize = function (obj) {
        that.handleResizeEvents.call(that, obj);
    }

    this.initMouseHandler();
    this.initEvents();
};

og.Renderer.prototype.initMouseHandler = function () {
    this.input.setEvent("onmouseup", this, canvas, this.onMouseUp);
    this.input.setEvent("onmousemove", this, canvas, this.onMouseMove);
    this.input.setEvent("onmousedown", this, canvas, this.onMouseDown);
};

og.Renderer.prototype.onMouseMove = function (event) {
    this.mouseIsMoving = true;
    this.mouseState.x = event.clientX;
    this.mouseState.y = event.clientY;
};

og.Renderer.prototype.onMouseDown = function (event) {
    if (event.button === og.input.MB_LEFT) {
        this.mouseLeftButtonDown = true;
    } else {
        this.mouseRightButtonDown = true;
    }
};

og.Renderer.prototype.onMouseUp = function (event) {
    if (event.button === og.input.MB_LEFT) {
        this.mouseLeftButtonDown = false;
        this.holdMouseLeftButtonDown = false;
    } else {
        this.mouseRightButtonDown = false;
        this.holdMouseRightButtonDown = false;
    }
};

og.Renderer.prototype.addRenderNode = function (renderNode) {
    if (!this.renderNodes[renderNode.name]) {
        renderNode.assignRenderer(this);
        renderNode.initialization();
        this._renderNodesArr.push(renderNode);
        this.renderNodes[renderNode.name] = renderNode;
    } else {
        alert("Node name: " + renderNode.name + " allready exists.");
    }
};

og.Renderer.prototype.addRenderNodes = function (nodesArr) {
    for (var i = 0; i < nodesArr; i++) {
        this.addRenderNode(nodesArr[i]);
    }
};

og.Renderer.prototype.draw = function () {

    this.input.handleEvents();
    this.handleMouseEvents();

    this.mouseState.mouseDirection = this.activeCamera.unproject(this.mouseState.x, this.mouseState.y);

    for (var i = 0; i < this.events.ondraw.length; i++) {
        var e = this.events.ondraw[i];
        e.callback.call(e.sender);
    }

    for (var i = 0; i < this._renderNodesArr.length; i++) {
        this._renderNodesArr[i].drawNode();
    }

};

og.Renderer.prototype.addEvent = function (name, sender, callback) {
    this.events[name].push({ sender: sender, callback: callback });
};

og.Renderer.prototype._callEvents = function (events, obj) {
    if (events) {
        var i = events.length;
        while (i--) {
            var e = events[i];
            e.callback.call(e.sender, obj);
        }
    }
};

og.Renderer.prototype.handleResizeEvents = function (obj) {
    this.activeCamera.refresh();
    this._callEvents(this.events.onresize, obj);
};

og.Renderer.prototype.handleMouseEvents = function () {
    if (this.mouseLeftButtonDown) {
        if (!this.holdMouseLeftButtonDown) {
            this.holdMouseLeftButtonDown = true;
            this._callEvents(this.events.onmouselbuttonclick, this.mouseState);
        } else {
            this._callEvents(this.events.onmouselbuttondown, this.mouseState);
        }
    }

    if (this.mouseRightButtonDown) {
        if (!this.holdMouseRightButtonDown) {
            this.holdMouseRightButtonDown = true;
            this._callEvents(this.events.onmouserbuttonclick, this.mouseState);
        } else {
            this._callEvents(this.events.onmouserbuttondown, this.mouseState);
        }
    }

    if (this.mouseIsMoving) {
        this._callEvents(this.events.onmousemove, this.mouseState);
        this.mouseIsMoving = false;
    }
};

og.Renderer.prototype.Start = function () {
    this.handler.Start();
};