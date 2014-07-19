/**
 * Rhythnic Image Slider
 * Javascript component for an image slider with touch support
 * author: Nick Baroni
 * license:  MIT
 */

// Utility  *for older browsers that don't support Object.create
if (typeof Object.create !== 'function') { Object.create = function (obj) { function F() {} F.prototype = obj; return new F(); }; }

/**
 * Global object, contains all functionality
 * Create a new instance using new Object(RhythnicImageSlider)
 */
var RhythnicImageSlider = {
    
    /**
     * Init function
     * Retrieves all needed DOM elements and stores them in variables
     * Retrieves images and determines container size
     * Initializes RhythnicImageSlider according to options
     * @param (DOM element) - container for slider
     * @param (object) - configuration options
     */
    init : function(container, options) {
        var self = this;
        this.container = container;   //container with class of rhythnic-slider
        this.container.style.overflow = "hidden";
        this.ul   = this.container.getElementsByTagName('ul')[0];
        this.nav  = this.container.querySelector('div.slider-nav');
        this.play = this.nav.querySelector('.play');
        
        //get list of images
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
        
        //object to keep track of touch event info
        //pointerID (key) and starting x coordinate (value)
        this.pointers = {};
        
        this.bindEvents();
        
        //toggle play on if play is set to true in options
        if (this.options.play) {
            this.options.play = false;
            this.togglePlay(this.options.timer);
        }  
    },
    
    /**
     * Setup event listeners
     */
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
    
    /**
     * onKeydown event handler
     * toggle slideshow play if spacebar pressed
     * transition prev if left arrow pressed, next if right arrow pressed
     * @param (event)
     */
    onKeydown : function(event) {
        switch(event.keyCode){
            case 32: event.preventDefault(); this.togglePlay(1); break;
            case 37: event.preventDefault(); this.setCurrent('prev'); this.transition(); break;
            case 39: event.preventDefault(); this.setCurrent('next'); this.transition(); break;
        }
    },
    
    /**
     * onPointerdown (touchstart) event handler
     * prevent default to prevent double-click delay
     * store x, y info in pointers var, using event identifier as key
     * @param (event)
     */
    onPointerdown : function(event) {
        event.preventDefault();
        var touchObj = event.changedTouches[0];
        this.pointers[touchObj.identifier] = [touchObj.pageX, touchObj.pageY];
    },
    
    /**
     * onPointerup (touchend, touchleave, touchcancel) event handler
     * delete from pointers variable
     * @param (event)
     */
    onPointerup : function(event) {
        delete this.pointers[event.changedTouches[0].identifier];
    },
    
    /**
     * onPointermove handler
     * Because we use preventDefault on pointerdown, we must watch for vertical scrolling
     * trigger browser scroll on vertical scrolling
     * transition slider on horizontal scrolling
     * @param (event)
     */
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
    
    /**
     * navigation menu click handler
     * determin button pressed, and act accordingly
     * @param (event)
     */
    onClickNav : function(event) {
        if (event.target.className.indexOf('play') !== -1) {
            this.togglePlay(1);
        } else if (event.target.className.indexOf('skip') !== -1) {
            this.setCurrent(event.target.dataset.dir);
            this.transition();
        }
    },
    
    /**
     * window resize or orientation event handler
     * get new container width and set image styles to that width
     * @param (event)
     */
    onOrientationEvent : function(){
        var width = this.container.clientWidth;
        this.imgs.forEach(function(img){ img.style.width = width + "px"; });
    },
    
    /**** end of event handlers ****/
    
    
    /**
     * Toggle play
     * Play if paused, pause if playing, and swap icon classes for play/pause
     * @param (number) - milliseconds for time between slides
     */
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
    
    /**
     * Autoplay
     * Advance slider automatically
     * @param (number) - milliseconds for time between slides
     */
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

    /**
     * Increase or decrease current slide index
     * @param (string) - direction (next or prev)
     */
    setCurrent: function(dir) {
        this.current += (~~(dir === 'next') || -1);
        this.current = (this.current < 0) ? this.imgs.length - 1 : this.current % this.imgs.length;
    },
    
    /**
     * Transition slide
     * The slider uses css3 transitions, so this function just adjusts the margin-left property
     */
    transition: function() {
        this.ul.style.marginLeft = -(this.current * this.container.clientWidth) + "px";
    },
    
    /**
     * Override options
     * Extend default options with user options
     */
    overrideOptions : function(defaultOptions, userOptions) {
        for (var key in defaultOptions) {
            if (!(key in userOptions)) userOptions[key] = defaultOptions[key];
        }
    },
    
    /** 
     * Default options
     * play - start autoplay when page is loaded
     * timer - time between slides on autoplay
     * playClass - class for play icon
     * pauseClass - class for pause icon
     * threshold - touch sensitivity, minimum pixels touched before transition
     */
    defaultOptions : {
        play: false,
        timer: 5000,
        playClass: 'fa-play',
        pauseClass: 'fa-pause',
        threshold: 75
    }
};