/**
 * Component rendering peer: WindowPane
 */
EchoRender.ComponentSync.WindowPane = function() {
};

EchoRender.ComponentSync.WindowPane.prototype = EchoCore.derive(EchoRender.ComponentSync);

EchoRender.ComponentSync.WindowPane.DEFAULT_TITLE_BACKGROUND = new EchoApp.Property.Color("#abcdef");
EchoRender.ComponentSync.WindowPane.DEFAULT_TITLE_INSETS = new EchoApp.Property.Insets("5px", "10px");
EchoRender.ComponentSync.WindowPane.ADJUSTMENT_OPACITY = 0.75;

EchoRender.ComponentSync.WindowPane.adjustOpacity = false;

EchoRender.ComponentSync.WindowPane.prototype._loadContainerSize = function() {
    //FIXME. the "parentnode.parentnode" business needs to go.
    this._containerSize = new EchoWebCore.Render.Measure(this._windowPaneDivElement.parentNode.parentNode);
};

EchoRender.ComponentSync.WindowPane.prototype.processBorderMouseDown = function(e) {
    if (!this.component.isActive()) {
        return;
    }

    // Prevent selections.
    EchoWebCore.dragInProgress = true;
    EchoWebCore.DOM.preventEventDefault(e);

    this._loadContainerSize();
    this._dragInitX = this._windowX;
    this._dragInitY = this._windowY;
    this._dragInitWidth = this._windowWidth;
    this._dragInitHeight = this._windowHeight;
    this._dragOriginX = e.clientX;
    this._dragOriginY = e.clientY;

    switch (e.target) {
    case this._borderDivElements[0]: this._resizeX = -1; this._resizeY = -1; break;
    case this._borderDivElements[1]:  this._resizeX =  0; this._resizeY = -1; break;
    case this._borderDivElements[2]: this._resizeX =  1; this._resizeY = -1; break;
    case this._borderDivElements[3]:  this._resizeX = -1; this._resizeY =  0; break;
    case this._borderDivElements[4]:  this._resizeX =  1; this._resizeY =  0; break;
    case this._borderDivElements[5]: this._resizeX = -1; this._resizeY =  1; break;
    case this._borderDivElements[6]:  this._resizeX =  0; this._resizeY =  1; break;
    case this._borderDivElements[7]: this._resizeX =  1; this._resizeY =  1; break;
    }
    
    var bodyElement = document.getElementsByTagName("body")[0];

    EchoWebCore.EventProcessor.add(bodyElement, "mousemove", new EchoCore.MethodRef(this, this.processBorderMouseMove), true);
    EchoWebCore.EventProcessor.add(bodyElement, "mouseup", new EchoCore.MethodRef(this, this.processBorderMouseUp), true);

    // Reduce opacity.   
    if (EchoRender.ComponentSync.WindowPane.adjustOpacity) {
        this._windowPaneDivElement.style.opacity = EchoRender.ComponentSync.WindowPane.ADJUSTMENT_OPACITY;
    }
};

EchoRender.ComponentSync.WindowPane.prototype.processBorderMouseMove = function(e) {
    var x, y, width, height;
    
    if (this._resizeX == -1) {
        width = this._dragInitWidth - (e.clientX - this._dragOriginX);
        x = this._dragInitX + this._dragInitWidth - width;
    } else if (this._resizeX ==1 ) {
        width = this._dragInitWidth + e.clientX - this._dragOriginX;
    }
    if (this._resizeY == -1) {
        height = this._dragInitHeight - (e.clientY - this._dragOriginY);
        y = this._dragInitY + this._dragInitHeight - height;
    } else if (this._resizeY ==1) {
        height = this._dragInitHeight + e.clientY - this._dragOriginY;
    }
    
    this.setPosition(x, y, width, height);
};

EchoRender.ComponentSync.WindowPane.prototype.processBorderMouseUp = function(e) {
    EchoWebCore.DOM.preventEventDefault(e);
    
    EchoWebCore.dragInProgress = false;

    // Set opaque.
    this._windowPaneDivElement.style.opacity = 1;

    this._removeBorderListeners();
    
	this.component.setProperty("positionX", new EchoApp.Property.Extent(this._windowX, "px"));
	this.component.setProperty("positionY", new EchoApp.Property.Extent(this._windowY, "px"));
	this.component.setProperty("width", new EchoApp.Property.Extent(this._windowWidth, "px"));
	this.component.setProperty("height", new EchoApp.Property.Extent(this._windowHeight, "px"));
	
	this._userWindowX = this._windowX;
	this._userWindowY = this._windowY;
	this._userWindowWidth = this._windowWidth;
	this._userWindowHeight = this._windowHeight;
    
    EchoWebCore.VirtualPosition.redraw(this._contentDivElement);
    EchoRender.notifyResize(this.component);
};

EchoRender.ComponentSync.WindowPane.prototype.processKeyDown = function(e) { 
    switch (e.keyCode) {
    case 27:
        this.component.doWindowClosing();
        break;
    }
};

EchoRender.ComponentSync.WindowPane.prototype._processCloseClick = function(e) { 
    if (!this.component.isActive()) {
        return;
    }
    this.component.doWindowClosing();
};

EchoRender.ComponentSync.WindowPane.prototype.processTitleBarMouseDown = function(e) {
    if (!this.component.isActive()) {
        return;
    }

    // Prevent selections.
    EchoWebCore.dragInProgress = true;
    EchoWebCore.DOM.preventEventDefault(e);

    this._loadContainerSize();
    this._dragInitX = this._windowX;
    this._dragInitY = this._windowY;
    this._dragOriginX = e.clientX;
    this._dragOriginY = e.clientY;

    // Reduce opacity.   
    if (EchoRender.ComponentSync.WindowPane.adjustOpacity) {
        this._windowPaneDivElement.style.opacity = EchoRender.ComponentSync.WindowPane.ADJUSTMENT_OPACITY;
    }
    
    var bodyElement = document.getElementsByTagName("body")[0];
    EchoWebCore.EventProcessor.add(bodyElement, "mousemove", new EchoCore.MethodRef(this, this.processTitleBarMouseMove), true);
    EchoWebCore.EventProcessor.add(bodyElement, "mouseup", new EchoCore.MethodRef(this, this.processTitleBarMouseUp), true);
};

EchoRender.ComponentSync.WindowPane.prototype.processTitleBarMouseMove = function(e) {
    var x = this._dragInitX + e.clientX - this._dragOriginX;
    var y = this._dragInitY + e.clientY - this._dragOriginY;
    this.setPosition(x, y);
};

EchoRender.ComponentSync.WindowPane.prototype.processTitleBarMouseUp = function(e) {
    EchoWebCore.dragInProgress = false;

    // Set opaque.
    this._windowPaneDivElement.style.opacity = 1;
    
    this._removeTitleBarListeners();
	this.component.setProperty("positionX", new EchoApp.Property.Extent(this._windowX, "px"));
	this.component.setProperty("positionY", new EchoApp.Property.Extent(this._windowY, "px"));

	this._userWindowX = this._windowX;
	this._userWindowY = this._windowY;
};

EchoRender.ComponentSync.WindowPane.prototype.setPosition = function(x, y, width, height) {
    if (width != null) {
        if (width < this._minimumWidth) {
            if (x != null) {
                x += (width - this._minimumWidth);
            }
            width = this._minimumWidth;
        }
        this._windowWidth = width;
    }
    
    if (height != null) {
        if (height < this._minimumHeight) {
            if (y != null) {
                y += (height - this._minimumHeight);
            }
            height = this._minimumHeight;
        }
        this._windowHeight = height;
    }

    if (x != null) {
        if (this._containerSize.width > 0 && x > this._containerSize.width - this._windowWidth) {
            x = this._containerSize.width - this._windowWidth;
        }

        if (x < 0) {
            x = 0;
        }
        this._windowX = x;
    }

    if (y != null) {
        if (this._containerSize.height > 0 && y > this._containerSize.height - this._windowHeight) {
            y = this._containerSize.height - this._windowHeight;
        }

        if (y < 0) {
            y = 0;
        }
        this._windowY = y;
    }
    
    this.redraw();
};

EchoRender.ComponentSync.WindowPane.prototype.redraw = function() {
    var borderSideWidth = this._windowWidth - this._borderInsets.left - this._borderInsets.right;
    var borderSideHeight = this._windowHeight - this._borderInsets.top - this._borderInsets.bottom;

    this._windowPaneDivElement.style.left = this._windowX + "px";
    this._windowPaneDivElement.style.top = this._windowY + "px";
    this._windowPaneDivElement.style.width = this._windowWidth + "px";
    this._windowPaneDivElement.style.height = this._windowHeight + "px";

    this._titleBarDivElement.style.width = (this._windowWidth - this._contentInsets.left - this._contentInsets.right) + "px";
    
    this._borderDivElements[1].style.width = borderSideWidth + "px";
    this._borderDivElements[6].style.width = borderSideWidth + "px";
    this._borderDivElements[3].style.height = borderSideHeight + "px";
    this._borderDivElements[4].style.height = borderSideHeight + "px";   
    
    EchoWebCore.VirtualPosition.redraw(this._contentDivElement);
};

EchoRender.ComponentSync.WindowPane.prototype._removeBorderListeners = function() {
    var bodyElement = document.getElementsByTagName("body")[0];
    EchoWebCore.EventProcessor.remove(bodyElement, "mousemove", new EchoCore.MethodRef(this, this.processBorderMouseMove), true);
    EchoWebCore.EventProcessor.remove(bodyElement, "mouseup", new EchoCore.MethodRef(this, this.processBorderMouseUp), true);
};

EchoRender.ComponentSync.WindowPane.prototype._removeTitleBarListeners = function() {
    var bodyElement = document.getElementsByTagName("body")[0];
    EchoWebCore.EventProcessor.remove(bodyElement, "mousemove",
            new EchoCore.MethodRef(this, this.processTitleBarMouseMove), true);
    EchoWebCore.EventProcessor.remove(bodyElement, "mouseup", 
            new EchoCore.MethodRef(this, this.processTitleBarMouseUp), true);
};

EchoRender.ComponentSync.WindowPane.prototype.renderAdd = function(update, parentElement) {
    this._userWindowX = this._windowX = EchoRender.Property.Extent.toPixels(
            this.component.getRenderProperty("positionX", EchoApp.WindowPane.DEFAULT_X), true);
    this._userWindowY = this._windowY = EchoRender.Property.Extent.toPixels(
            this.component.getRenderProperty("positionY", EchoApp.WindowPane.DEFAULT_Y), false);
    this._userWindowWidth = this._windowWidth = EchoRender.Property.Extent.toPixels(
            this.component.getRenderProperty("width", EchoApp.WindowPane.DEFAULT_WIDTH), true);
    this._userWindowHeight = this._windowHeight = EchoRender.Property.Extent.toPixels(
            this.component.getRenderProperty("height", EchoApp.WindowPane.DEFAULT_HEIGHT), false);
            
    this._minimumWidth = EchoRender.Property.Extent.toPixels(
            this.component.getRenderProperty("minimumWidth", EchoApp.WindowPane.DEFAULT_MINIMUM_WIDTH), true);
    this._minimumHeight = EchoRender.Property.Extent.toPixels(
            this.component.getRenderProperty("minimumHeight", EchoApp.WindowPane.DEFAULT_MINIMUM_HEIGHT), false);
            
            
    var border = this.component.getRenderProperty("border", EchoApp.WindowPane.DEFAULT_BORDER);
    this._borderInsets = EchoRender.Property.Insets.toPixels(border.borderInsets);
    this._contentInsets = EchoRender.Property.Insets.toPixels(border.contentInsets);

    var movable = this.component.getRenderProperty("movable", true);
    var resizable = this.component.getRenderProperty("resizable", true);
    var closable = this.component.getRenderProperty("closable", true);

    this._windowPaneDivElement = document.createElement("div");
    this._windowPaneDivElement.tabIndex = "0";

    this._windowPaneDivElement.style.outlineStyle = "none";

    this._windowPaneDivElement.style.position = "absolute";
    this._windowPaneDivElement.style.zIndex = 1;
    
    this._windowPaneDivElement.style.overflow = "hidden";
    
    this._windowPaneDivElement.style.left = this._windowX + "px";
    this._windowPaneDivElement.style.top = this._windowY + "px";
    this._windowPaneDivElement.style.width = this._windowWidth + "px";
    this._windowPaneDivElement.style.height = this._windowHeight + "px";
    
    var borderSideWidth = this._windowWidth - this._borderInsets.left - this._borderInsets.right;
    var borderSideHeight = this._windowHeight - this._borderInsets.top - this._borderInsets.bottom;
    
    this._borderDivElements = new Array(8);
    
    var fillImageFlags = this.component.getRenderProperty("ieAlphaRenderBorder") 
            ? EchoRender.Property.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER : 0;
    
    // Render top row
    if (this._borderInsets.top > 0) {
        // Render top left corner
        if (this._borderInsets.left > 0) {
            this._borderDivElements[0] = document.createElement("div");
            this._borderDivElements[0].style.position = "absolute";
            this._borderDivElements[0].style.left = "0px";
            this._borderDivElements[0].style.top = "0px";
            this._borderDivElements[0].style.width = this._borderInsets.left + "px";
            this._borderDivElements[0].style.height = this._borderInsets.top + "px";
            if (border.color != null) {
                this._borderDivElements[0].style.backgroundColor = border.color.value;
            }
            if (resizable) {
                this._borderDivElements[0].style.cursor = "nw-resize";
            }
            if (border.fillImages[0]) {
                EchoRender.Property.FillImage.render(border.fillImages[0], this._borderDivElements[0], fillImageFlags);
            }
            this._windowPaneDivElement.appendChild(this._borderDivElements[0]);
        }
        
        // Render top side
        this._borderDivElements[1] = document.createElement("div");
        this._borderDivElements[1].style.position = "absolute";
        this._borderDivElements[1].style.left = this._borderInsets.left + "px";
        this._borderDivElements[1].style.top = "0px";
        this._borderDivElements[1].style.width = borderSideWidth + "px";
        this._borderDivElements[1].style.height = this._borderInsets.top + "px";
        if (border.color != null) {
            this._borderDivElements[1].style.backgroundColor = border.color.value;
        }
        if (resizable) {
            this._borderDivElements[1].style.cursor = "n-resize";
        }
        if (border.fillImages[1]) {
            EchoRender.Property.FillImage.render(border.fillImages[1], this._borderDivElements[1], fillImageFlags);
        }
        this._windowPaneDivElement.appendChild(this._borderDivElements[1]);

        // Render top right corner
        if (this._borderInsets.right > 0) {
            this._borderDivElements[2] = document.createElement("div");
            this._borderDivElements[2].style.position = "absolute";
            this._borderDivElements[2].style.right = "0px";
            this._borderDivElements[2].style.top = "0px";
            this._borderDivElements[2].style.width = this._borderInsets.right + "px";
            this._borderDivElements[2].style.height = this._borderInsets.top + "px";
            if (border.color != null) {
                this._borderDivElements[2].style.backgroundColor = border.color.value;
            }
            if (resizable) {
                this._borderDivElements[2].style.cursor = "ne-resize";
            }
            if (border.fillImages[2]) {
                EchoRender.Property.FillImage.render(border.fillImages[2], this._borderDivElements[2], fillImageFlags);
            }
            this._windowPaneDivElement.appendChild(this._borderDivElements[2]);
        }
    }

    // Render left side
    if (this._borderInsets.left > 0) {
        this._borderDivElements[3] = document.createElement("div");
        this._borderDivElements[3].style.position = "absolute";
        this._borderDivElements[3].style.left = "0px";
        this._borderDivElements[3].style.top = this._borderInsets.top + "px";
        this._borderDivElements[3].style.width = this._borderInsets.left + "px";
        this._borderDivElements[3].style.height = borderSideHeight + "px";
        if (border.color != null) {
            this._borderDivElements[3].style.backgroundColor = border.color.value;
        }
        if (resizable) {
            this._borderDivElements[3].style.cursor = "w-resize";
        }
        if (border.fillImages[3]) {
            EchoRender.Property.FillImage.render(border.fillImages[3], this._borderDivElements[3], fillImageFlags);
        }
        this._windowPaneDivElement.appendChild(this._borderDivElements[3]);
    }
    
    // Render right side
    if (this._borderInsets.right > 0) {
        this._borderDivElements[4] = document.createElement("div");
        this._borderDivElements[4].style.position = "absolute";
        this._borderDivElements[4].style.right = "0px";
        this._borderDivElements[4].style.top = this._borderInsets.top + "px";
        this._borderDivElements[4].style.width = this._borderInsets.right + "px";
        this._borderDivElements[4].style.height = borderSideHeight + "px";
        if (border.color != null) {
            this._borderDivElements[4].style.backgroundColor = border.color.value;
        }
        if (resizable) {
            this._borderDivElements[4].style.cursor = "e-resize";
        }
        if (border.fillImages[4]) {
            EchoRender.Property.FillImage.render(border.fillImages[4], this._borderDivElements[4], fillImageFlags);
        }
        this._windowPaneDivElement.appendChild(this._borderDivElements[4]);
    }
    
    // Render bottom row
    if (this._borderInsets.bottom > 0) {
        // Render bottom left corner
        if (this._borderInsets.left > 0) {
            this._borderDivElements[5] = document.createElement("div");
            this._borderDivElements[5].style.position = "absolute";
            this._borderDivElements[5].style.left = "0px";
            this._borderDivElements[5].style.bottom = "0px";
            this._borderDivElements[5].style.width = this._borderInsets.left + "px";
            this._borderDivElements[5].style.height = this._borderInsets.bottom + "px";
            if (border.color != null) {
                this._borderDivElements[5].style.backgroundColor = border.color.value;
            }
            if (resizable) {
                this._borderDivElements[5].style.cursor = "sw-resize";
            }
            if (border.fillImages[5]) {
                EchoRender.Property.FillImage.render(border.fillImages[5], this._borderDivElements[5], fillImageFlags);
            }
            this._windowPaneDivElement.appendChild(this._borderDivElements[5]);
        }
        
        // Render bottom side
        this._borderDivElements[6] = document.createElement("div");
        this._borderDivElements[6].style.position = "absolute";
        this._borderDivElements[6].style.left = this._borderInsets.left + "px";
        this._borderDivElements[6].style.bottom = "0px";
        this._borderDivElements[6].style.width = borderSideWidth + "px";
        this._borderDivElements[6].style.height = this._borderInsets.bottom + "px";
        if (border.color != null) {
            this._borderDivElements[6].style.backgroundColor = border.color.value;
        }
        if (resizable) {
            this._borderDivElements[6].style.cursor = "s-resize";
        }
        if (border.fillImages[6]) {
            EchoRender.Property.FillImage.render(border.fillImages[6], this._borderDivElements[6], fillImageFlags);
        }
        this._windowPaneDivElement.appendChild(this._borderDivElements[6]);

        // Render bottom right corner
        if (this._borderInsets.right > 0) {
            this._borderDivElements[7] = document.createElement("div");
            this._borderDivElements[7].style.position = "absolute";
            this._borderDivElements[7].style.right = "0px";
            this._borderDivElements[7].style.bottom = "0px";
            this._borderDivElements[7].style.width = this._borderInsets.right + "px";
            this._borderDivElements[7].style.height = this._borderInsets.bottom + "px";
            if (border.color != null) {
                this._borderDivElements[7].style.backgroundColor = border.color.value;
            }
            if (resizable) {
                this._borderDivElements[7].style.cursor = "se-resize";
            }
            if (border.fillImages[7]) {
                EchoRender.Property.FillImage.render(border.fillImages[7], this._borderDivElements[7], fillImageFlags);
            }
            this._windowPaneDivElement.appendChild(this._borderDivElements[7]);
        }
    }
    
    // Render Title Bar
    
    this._titleBarDivElement = document.createElement("div");
    this._titleBarDivElement.style.position = "absolute";
    this._titleBarDivElement.style.zIndex = 3;
    
    var icon = this.component.getRenderProperty("icon");
    if (icon) {
        var titleIconDivElement = document.createElement("div");
        titleIconDivElement.style[EchoWebCore.Environment.CSS_FLOAT] = "left";
        EchoRender.Property.Insets.renderComponentProperty(this.component, "iconInsets", null, titleIconDivElement, "padding");
        this._titleBarDivElement.appendChild(titleIconDivElement);
        
        var imgElement = document.createElement("img");
        imgElement.src = icon.url;
        titleIconDivElement.appendChild(imgElement);
    }

    var title = this.component.getRenderProperty("title");
    if (title) {
        var titleTextDivElement = document.createElement("div");
        if (icon) {
            titleTextDivElement.style[EchoWebCore.Environment.CSS_FLOAT] = "left";
        }
        titleTextDivElement.style.whiteSpace = "nowrap";
        EchoRender.Property.Font.renderComponentProperty(this.component, "titleFont", null, titleTextDivElement);
        EchoRender.Property.Insets.renderComponentProperty(this.component, "titleInsets", EchoRender.ComponentSync.WindowPane.DEFAULT_TITLE_INSETS, titleTextDivElement, "padding");
        titleTextDivElement.appendChild(document.createTextNode(title));
        this._titleBarDivElement.appendChild(titleTextDivElement);
    }
    
    var titleBarHeight = this.component.getRenderProperty("titleHeight");
    if (titleBarHeight) {
        this._titleBarHeight = EchoRender.Property.Extent.toPixels(titleBarHeight);
    } else {
        var titleMeasure = new EchoWebCore.Render.Measure(this._titleBarDivElement);
        if (titleMeasure.height) {
            this._titleBarHeight = titleMeasure.height;
        } else {
            this._titleBarHeight = EchoRender.Property.Extent.toPixels(EchoApp.WindowPane.DEFAULT_TITLE_HEIGHT);
        }
    }

    this._titleBarDivElement.style.top = this._contentInsets.top + "px";
    this._titleBarDivElement.style.left = this._contentInsets.left + "px";
    this._titleBarDivElement.style.width = (this._windowWidth - this._contentInsets.left - this._contentInsets.right) + "px";
    this._titleBarDivElement.style.height = this._titleBarHeight + "px";
    this._titleBarDivElement.style.overflow = "hidden";
    if (movable) {
        this._titleBarDivElement.style.cursor = "move";
    }

    EchoRender.Property.Color.renderComponentProperty(this.component, "titleForeground", null, this._titleBarDivElement, "color");

    var titleBackground = this.component.getRenderProperty("titleBackground");
    var titleBackgroundImage = this.component.getRenderProperty("titleBackgroundImage");

    if (titleBackground) {
        this._titleBarDivElement.style.backgroundColor = titleBackground.value;
    }
    if (titleBackgroundImage) {
        EchoRender.Property.FillImage.render(titleBackgroundImage, this._titleBarDivElement);
    }

    if (!titleBackground && !titleBackgroundImage) {
        this._titleBarDivElement.style.backgroundColor = EchoRender.ComponentSync.WindowPane.DEFAULT_TITLE_BACKGROUND.value;
    }
    
    // Close Button
  
    if (closable) {
        this._closeDivElement = document.createElement("div");
        this._closeDivElement.style.position = "absolute";
        this._closeDivElement.style.right = "0px";
        this._closeDivElement.style.top = "0px";
        this._closeDivElement.style.cursor = "pointer";
        EchoRender.Property.Insets.renderComponentProperty(this.component, "closeIconInsets", null, 
                this._closeDivElement, "padding");
        var closeIcon = this.component.getRenderProperty("closeIcon"); 
        if (closeIcon) {
            var imgElement = document.createElement("img");
            imgElement.src = closeIcon.url;
            this._closeDivElement.appendChild(imgElement);
        } else {
            this._closeDivElement.appendChild(document.createTextNode("[X]"));
        }
        this._titleBarDivElement.appendChild(this._closeDivElement);
    }
    
    this._windowPaneDivElement.appendChild(this._titleBarDivElement);
    
    // Render Content Area
    
    this._contentDivElement = document.createElement("div");
    
    this._contentDivElement.style.position = "absolute";
    this._contentDivElement.style.zIndex = 2;
    this._contentDivElement.style.overflow = "auto";
    
    EchoRender.Property.Color.renderComponentProperty(this.component, "background", EchoApp.WindowPane.DEFAULT_BACKGROUND,
            this._contentDivElement, "backgroundColor");
    EchoRender.Property.Color.renderComponentProperty(this.component, "foreground", EchoApp.WindowPane.DEFAULT_FOREGROUND,
            this._contentDivElement, "color");

    this._contentDivElement.style.top = (this._contentInsets.top + this._titleBarHeight) + "px";
    this._contentDivElement.style.left = this._contentInsets.left + "px";
    this._contentDivElement.style.right = this._contentInsets.right + "px";
    this._contentDivElement.style.bottom = this._contentInsets.bottom + "px";
    
    this._windowPaneDivElement.appendChild(this._contentDivElement);

    var componentCount = this.component.getComponentCount();
    if (componentCount == 1) {
        this.renderAddChild(update, this.component.getComponent(0), this._contentDivElement);
    } else if (componentCount > 1) {
        throw new Error("Too many children: " + componentCount);
    }

    parentElement.appendChild(this._windowPaneDivElement);
    
    // Register event listeners.
    
    if (closable) {
	    EchoWebCore.EventProcessor.add(this._windowPaneDivElement, "keydown", 
	            new EchoCore.MethodRef(this, this.processKeyDown), false);
	    EchoWebCore.EventProcessor.add(this._closeDivElement, "click", 
	            new EchoCore.MethodRef(this, this._processCloseClick), false);
    }
    if (movable) {
	    EchoWebCore.EventProcessor.add(this._titleBarDivElement, "mousedown", 
	            new EchoCore.MethodRef(this, this.processTitleBarMouseDown), true);
    }
    if (resizable) {
	    for (var i = 0; i < this._borderDivElements.length; ++i) {
	        EchoWebCore.EventProcessor.add(this._borderDivElements[i], "mousedown", 
	                new EchoCore.MethodRef(this, this.processBorderMouseDown), true);
	    }
    }
};

EchoRender.ComponentSync.WindowPane.prototype.renderAddChild = function(update, child, parentElement) {
    EchoRender.renderComponentAdd(update, child, parentElement);
};

EchoRender.ComponentSync.WindowPane.prototype.renderDispose = function(update) { 
    for (var i = 0; i < this._borderDivElements.length; ++i) {
        EchoWebCore.EventProcessor.removeAll(this._borderDivElements[i]);
        this._borderDivElements[i] = null;
    }

    EchoWebCore.EventProcessor.removeAll(this._titleBarDivElement);
    this._titleBarDivElement = null;
    
    if (this._closeDivElement) {
        EchoWebCore.EventProcessor.removeAll(this._closeDivElement);
        this._closeDivElement = null;
    }
    
    this._contentDivElement = null;

    EchoWebCore.EventProcessor.removeAll(this._windowPaneDivElement);
    this._windowPaneDivElement = null;
};

EchoRender.ComponentSync.WindowPane.prototype.renderSizeUpdate = function() {
    this._loadContainerSize();
    this.setPosition(this._userWindowX, this._userWindowY, this._userWindowWidth, this._userWindowHeight);
    EchoWebCore.VirtualPosition.redraw(this._contentDivElement);
};

EchoRender.ComponentSync.WindowPane.prototype.renderUpdate = function(update) {
    var element = this._windowPaneDivElement;
    var containerElement = element.parentNode;
    EchoRender.renderComponentDispose(update, update.parent);
    containerElement.removeChild(element);
    this.renderAdd(update, containerElement);
    return true;
};

EchoRender.registerPeer("WindowPane", EchoRender.ComponentSync.WindowPane);
