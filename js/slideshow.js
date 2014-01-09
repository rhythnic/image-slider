// Utility  *for older browsers that don't support Object.create
if ( typeof Object.create !== 'function' ) {
    Object.create = function( obj ) {
        function F(){};
        F.prototype = obj;
        return new F();
    };
}

(function( $, window, document, undefined ) {
    var Slideshow = {
        init: function( options, elem ) {
            var self = this;
            
            self.$elem = $( elem );
            self.elemWidth = self.$elem.css("width");
            self.$ul = self.$elem.css('overflow', 'hidden').children('ul');
            self.$nav = self.$elem.find( 'div.slideshow-nav' );
            self.$play = self.$nav.children('i.play');
            
            self.imgs = self.$ul.find('img').css("width", self.elemWidth);
            self.imgWidth = parseInt(self.elemWidth.substr(0, self.elemWidth.length-2));
            self.imgsLen = self.imgs.length;
            
            self.current = 0;
            self.timeout = null;
            
            self.options = $.extend({}, $.fn.slideshow.options, options);
            
            self.bindEvents();
            
            if ( self.options.play ) self.toggleplay( self.options.timer );
        },
        
        bindEvents: function() {
            var self = this;
            
            self.$elem.on('mouseover', function() {
                self.$nav.fadeIn(200);
            });
            
            self.$elem.on('mouseleave', function() {
                self.$nav.fadeOut(200);
            });
            
            self.$nav.on('click', 'i.skip', function() {
                self.setCurrent( $(this).data('dir') );
                self.transition();
            });
            
            self.$play.on('click', function() {
                self.options.play = !self.options.play;
                self.toggleplay(1);
            });
        },
        
        toggleplay: function(length) {
            clearTimeout(this.timeout);
            
            if ( this.options.play ) {
                this.autoplay(length);
                this.$play.removeClass(this.options.playClass).addClass(this.options.pauseClass);
            } else {
                this.$play.removeClass(this.options.pauseClass).addClass(this.options.playClass);
            } 
        },
        
        autoplay: function(length) {
            var self = this;
            
            self.timeout = setTimeout( function() {
                self.setCurrent( 'next' );
                self.transition();
                
                if (self.options.play) {
                    self.autoplay();
                }  
            }, length || self.options.timer );
        },
        
        setCurrent: function( dir ) {
            this.current += ( ~~( dir === 'next') || -1 );
            this.current = ( this.current < 0) ? this.imgsLen - 1 : this.current % this.imgsLen;
        },
        
        transition: function() {
            this.$ul.animate({
                'margin-left': -( this.current * this.imgWidth )
            }, 100);
        }
    };
    
    $.fn.slideshow = function( options ) {
        return this.each(function() {
            var slideshow = Object.create( Slideshow );
            slideshow.init( options, this );
        });
    };
    
    $.fn.slideshow.options = {
        play: false,
        timer: 5000,
        playClass: 'fa-play',
        pauseClass: 'fa-pause'
    };
    
})( jQuery, window, document );

