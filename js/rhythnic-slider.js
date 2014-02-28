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
        
        /* this.hover = new RegExp("(?:^|\\s)" + this.options.hoverClass + "(?!\\S)", "g"); */
        
        //pointerID (key) and starting x coordinate (value)
        this.pointers = {};
        
        this.bindEvents();
        
        if (this.options.play) { this.toggleplay(this.options.timer); }  //toggle play on if play is set to true in options
    },
    
    bindEvents : function() {
        var self = this,
            orientationEvent = ("onorientationchange" in window) ? "orientationchange" : "resize";
        
        window.addEventListener(orientationEvent,      function(e) { self.onOrientationEvent(); });
        this.nav.addEventListener('click',             function(e) { self.onClickNav(e); });
        this.ul.addEventListener('pointerdown', function(e) { self.onPointerdown(e); });
        this.ul.addEventListener('pointerup',   function(e) { self.onPointerup(e); });
        this.ul.addEventListener('pointermove', function(e) { self.onPointermove(e); });
    },
    
    
    /*
    ********** Event Handlers ************
    */
    
    onPointerdown : function(event) {
        this.pointers[event.pointerId] = event.clientX;
    },
    
    onPointerup : function(event) {
        delete this.pointers[event.pointerId];
    },
    
    onPointermove : function(event) {
        var x = this.pointers[event.pointerId];
        if (!x) return;
        
        var diff = event.clientX - x;
        if (Math.abs(diff) >= this.options.threshold) {
            var dir = (diff <= 0) ? 'next' : 'prev';
            this.setCurrent(dir);
            this.transition();
            delete this.pointers[event.pointerId];
        } 
    },
    
    onClickNav : function(event) {
        if (event.target.className.indexOf('play') !== -1) {
            this.options.play = !this.options.play;
            this.toggleplay(1);
        } else if (event.target.className.indexOf('skip') !== -1) {
            this.setCurrent(event.target.dataset.dir);
            this.transition();
        }
    },
    
    onOrientationEvent : function(){
        
        var width = this.container.clientWidth;
        this.imgs.forEach(function(img){ img.style.width = width + "px"; });
    },
    
    /*
    onPointerover : function() {
        if (!this.hover.test(this.container.className))
            this.container.className += ' ' + this.options.hoverClass;
    },
    
    onPointerout : function() {
        if (this.hover.test(this.container.className))
            this.container.className = this.container.className.replace(this.hover , '' );
    },
    */
    
    /**** end of event handlers ****/
    
    //toggle autoplay, swap icons
    toggleplay: function (length) {
        clearTimeout(this.timeout);
        
        if (this.options.play) {
            this.autoplay(length);
            this.play.className = this.play.className.replace(this.options.playClass, this.options.pauseClass);
        } else {
            this.play.className = this.play.className.replace(this.options.pauseClass, this.options.playClass);
        }
    },
    
    //autoplay
    autoplay: function (length) {
        var self = this;
        
        self.timeout = setTimeout(function () {
            self.setCurrent('next');
            self.transition();
            
            if (self.options.play) {
                self.autoplay();
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