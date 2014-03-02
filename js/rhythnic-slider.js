// Utility  *for older browsers that don't support Object.create
if (typeof Object.create !== 'function') { Object.create = function (obj) { function F() {} F.prototype = obj; return new F(); }; }

var RhythnicImageSlider = {
    
    init : function(container, options) {
        var self = this;
        this.container = container;   //container with class of slideshow
        this.container.style.overflow = "hidden";
        this.ul   = this.container.getElementsByTagName('ul')[0];
        this.nav  = this.container.querySelector('div.slider-nav');
        this.play = this.nav.querySelector('.play');
        
        //get list of images (note: Array.prototype.splice.call wasn't working)
        this.imgs = [];
        var imgNodes = this.ul.getElementsByTagName('IMG');
        for (var i = 0; i < imgNodes.length; i++) { this.imgs.push(imgNodes[i]); }
        
        //set the images to the width of the container
        this.imgs.forEach(function(img) {
            img.style.width = self.container.clientWidth + "px";
            img.setAttribute("draggable", "false");
        });
        
        this.current = 0;  //current image in the slideshow
        this.timeout = null;  //timeout variable for autoplay timer
        
        this.options = options || {};
        this.overrideOptions(this.defaultOptions, this.options);
                
        //pointerID (key) and starting x coordinate (value)
        this.pointers = {};
        
        this.bindEvents();
        
        //toggle play on if play is set to true in options
        if (this.options.play) {
            this.options.play = false;
            this.togglePlay(this.options.timer);
        }  
    },
    
    bindEvents : function() {
        var self = this,
            orientationEvent = ("onorientationchange" in window) ? "orientationchange" : "resize";
        
        window.addEventListener(orientationEvent,      function(e) { self.onOrientationEvent(); });
        this.nav.addEventListener('click',             function(e) { self.onClickNav(e); });
        this.ul.addEventListener('touchstart',         function(e) { self.onPointerdown(e); });
        this.ul.addEventListener('touchend',           function(e) { self.onPointerup(e); });
        this.ul.addEventListener('touchleave',           function(e) { self.onPointerup(e); });
        this.ul.addEventListener('touchcancel',           function(e) { self.onPointerup(e); });
        this.ul.addEventListener('touchmove',          function(e) { self.onPointermove(e); });
        this.container.addEventListener('keydown',     function(e) { self.onKeydown(e); });
    },
    
    
    /*
    ********** Event Handlers ************
    */
    
    onKeydown : function(e) {
        switch(e.keyCode){
            case 32: e.preventDefault(); this.togglePlay(1); break;
            case 37: e.preventDefault(); this.setCurrent('prev'); this.transition(); break;
            case 39: e.preventDefault(); this.setCurrent('next'); this.transition(); break;
        }
    },
    
    onPointerdown : function(event) {
        event.preventDefault();
        var touchObj = event.changedTouches[0];
        this.pointers[touchObj.identifier] = [touchObj.pageX, touchObj.pageY];
    },
    
    onPointerup : function(event) {
        delete this.pointers[event.changedTouches[0].identifier];
    },
    
    onPointermove : function(event) {
        var touchObj = event.changedTouches[0];
        if (! (touchObj.identifier in this.pointers)) return;
        var xy = this.pointers[touchObj.identifier];
        event.preventDefault();
        window.scrollBy(0, xy[1] - touchObj.pageY);
        xy[1] = touchObj.pageY; 
        var diff = touchObj.pageX - xy[0];
        if (Math.abs(diff) >= this.options.threshold) {
            var dir = (diff <= 0) ? 'next' : 'prev';
            this.setCurrent(dir);
            this.transition();
            delete this.pointers[touchObj.identifier];
        } 
    },
    
    onClickNav : function(event) {
        if (event.target.className.indexOf('play') !== -1) {
            this.togglePlay(1);
        } else if (event.target.className.indexOf('skip') !== -1) {
            this.setCurrent(event.target.dataset.dir);
            this.transition();
        }
    },
    
    onOrientationEvent : function(){
        
        var width = this.container.clientWidth;
        this.imgs.forEach(function(img){ img.style.width = width + "px"; });
    },
    
    /**** end of event handlers ****/
    
    //toggle autoplay, swap icons
    togglePlay: function (length) {
        this.options.play = !this.options.play;
        clearTimeout(this.timeout);
        
        if (this.options.play) {
            this.autoPlay(length);
            this.play.className = this.play.className.replace(this.options.playClass, this.options.pauseClass);
        } else {
            this.play.className = this.play.className.replace(this.options.pauseClass, this.options.playClass);
        }
    },
    
    //autoPlay
    autoPlay: function (length) {
        var self = this;
        
        self.timeout = setTimeout(function () {
            self.setCurrent('next');
            self.transition();
            
            if (self.options.play) {
                self.autoPlay();
            }
        }, length || self.options.timer);
    },

    //set current image
    setCurrent: function(dir) {
        this.current += (~~(dir === 'next') || -1);
        this.current = (this.current < 0) ? this.imgs.length - 1 : this.current % this.imgs.length;
    },
    
    //transition to current image
    transition: function() {
        this.ul.style.marginLeft = -(this.current * this.container.clientWidth) + "px";
    },
    
    overrideOptions : function(defaultOptions, userOptions) {
        for (var key in defaultOptions) {
            if (!(key in userOptions)) userOptions[key] = defaultOptions[key];
        }
    },
    
    defaultOptions : {
        play: false,
        timer: 5000,
        playClass: 'fa-play',
        pauseClass: 'fa-pause',
        hoverClass: 'hover',
        threshold: 75
    }
};