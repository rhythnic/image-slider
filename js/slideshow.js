// Utility  *for older browsers that don't support Object.create
if (typeof Object.create !== 'function') {
    Object.create = function (obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}


(function ($, window, document, undefined) {
    "use strict";
    var Slideshow = {
        init: function (options, elem) {
            var self = this;
            
            self.$elem = $(elem);   //container with class of slideshow
            self.elemWidth = self.$elem.css("width");   //width of slideshow container
            self.$ul = self.$elem.children('ul');
            self.$nav = self.$elem.find('div.slideshow-nav');
            self.$play = self.$nav.children('i.play');
            
            self.imgs = self.$ul.find('img').css("width", self.elemWidth);  //images, set width to container width
            self.imgWidth = parseInt(self.elemWidth.substr(0, self.elemWidth.length - 2), 10);  //integer variable for image width
            self.imgsLen = self.imgs.length;  //number of images in the list
            
            self.current = 0;  //current image in the slideshow
            self.timeout = null;  //timeout variable for autoplay timer
            
            self.options = $.extend({}, $.fn.slideshow.options, options);  //options array
            
            self.orientationEvent = ("onorientationchange" in window) ? "orientationchange" : "resize";
            
            self.bindEvents();
            
            if (self.options.play) { self.toggleplay(self.options.timer); }  //toggle play on if play is set to true in options
        },
        
        //event handlers
        bindEvents: function () {
            var self = this;
            
            window.addEventListener("orientationchange", function(){
                self.elemWidth = self.$elem.css("width");
                self.imgs.css("width", self.elemWidth);
                self.imgWidth = parseInt(self.elemWidth.substr(0, self.elemWidth.length - 2), 10);
            }, false);
            
            window.addEventListener("resize", function(){
                self.elemWidth = self.$elem.css("width");
                self.imgs.css("width", self.elemWidth);
                self.imgWidth = parseInt(self.elemWidth.substr(0, self.elemWidth.length - 2), 10);
            }, false);
            
            self.$elem.on('mouseover', function () {
                self.$elem.addClass("hover");
            });
            
            self.$elem.on('mouseleave', function () {
                self.$elem.removeClass("hover");
            });
            
            //touch screen event handlers
            if ((typeof (Modernizr) !== 'undefined') && Modernizr.touch) {
                self.$ul.swipe({
                    swipe: function (event,  direction, distance, duration, fingerCount) {
                        var swipeDir = direction === "left" ? "next" : "prev";
                        self.setCurrent(swipeDir);
                        self.transition();
                        self.$elem.addClass("hover");
                    },
                    threshold: 75,   //the higher, the more they have to swipe
                    triggerOnTouchEnd: false,
                    allowPageScroll: "vertical"
                });
            }
            
            self.$nav.on('click', 'i.skip', function () {
                self.setCurrent($(this).data('dir'));
                self.transition();
            });
            
            self.$play.on('click', function () {
                self.options.play = !self.options.play;
                self.toggleplay(1);
            });
        },
        
        //toggle autoplay, swap icons
        toggleplay: function (length) {
            clearTimeout(this.timeout);
            
            if (this.options.play) {
                this.autoplay(length);
                this.$play.removeClass(this.options.playClass).addClass(this.options.pauseClass);
            } else {
                this.$play.removeClass(this.options.pauseClass).addClass(this.options.playClass);
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
        setCurrent: function (dir) {
            this.current += (~~(dir === 'next') || -1);
            this.current = (this.current < 0) ? this.imgsLen - 1 : this.current % this.imgsLen;
        },
        
        //transition to current image
        transition: function () {
            this.$ul.animate({
                'margin-left': -(this.current * this.imgWidth)
            }, 100);
        }
    };
    
    //create jquery method definition for creating slideshow object
    $.fn.slideshow = function (options) {
        return this.each(function () {
            var slideshow = Object.create(Slideshow);
            slideshow.init(options, this);
        });
    };
    
    //default options
    $.fn.slideshow.options = {
        play: false,
        timer: 5000,
        playClass: 'fa-play',
        pauseClass: 'fa-pause'
    };
    
})(jQuery, window, document);