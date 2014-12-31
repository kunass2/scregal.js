(function($) {
	'use strict';
	var Scregal = (function() {

		var $scregalBox = $('<div class="scregalBox">');
		var $scregalLeftBox = $('<a href="#" class="scregalWrap scregalLeftBox scregalBesideBox">');
		var $scregalCenterBox = $('<div class="scregalWrap scregalCenterBox">');
		var $scregalRightBox = $('<a href="#" class="scregalWrap scregalRightBox scregalBesideBox">');
		var $scregalLeftImg = $('<img class="scregalLeftImg" />').css('display', 'none');
		var $scregalCenterImg = $('<img class="scregalCenterImg" />').css('display', 'none');
		var $scregalRightImg = $('<img class="scregalRightImg" />').css('display', 'none');
		var $scregalRightNav = $('<div class="scregalNavigation scregalRightNavigation">');
		var $scregalLeftNav = $('<div class="scregalNavigation scregalLeftNavigation">');
		var $scregalFront = $('<div class="scregalFront">').css('display', 'none');

		var defaults = {
			maxWidth : '95%',
			classAfterAdd: 'scregalToAdd',
			animToRemove: { top: '0', opacity: 1 },
			animCenterToAdd: { top: '0%', opacity: 1 },
			animBesideToAdd: { top: '0%', opacity: 1 },
			durationToRemove: 800,
			durationToAdd: 800,
			easingToRemove: 'easeInOutExpo',
			easingToAdd: 'easeInQuad',
			addFront: true,
			isNavigation: true,
			keyboardNavigation : true,
			prev: undefined, //home, beside, center, .query
			next: undefined,
			close: undefined,
			autoGalleryDelay: 3000,
			autoDelay: 2000
		};

		var scregal_datas = [];
		var isInitialized = false;
		var isScregalWorks = false;
		var isAutoGallery = false;
		var recent_scregal_data = undefined;
		var auto_gallery_timeout = null;
		var recent_data_image = {
			scregalCenterImg : {},
			scregalLeftImg : {},
			scregalRightImg : {} };


		var Scregal_Class = function(elems, opts) {
			var that = this;
			var API = {};

			API.next = function() {
				console.log('dupa');
			};
			API.prev = function() {

			};
			API.close = function() {

			}
			this.getAPI = function() {
				return 'mikolaj';
			}

			this.extend_default(opts);
			this.create_scregal_box();
			elems.each(function() {
				that.create_scregal_data_item($(this), opts);
				$(this).addClass('scregal');
				that.set_handler($(this));
			});
		};

		Scregal_Class.prototype.extend_default = function(opts) {
			!isInitialized && opts ? $.extend(defaults, opts) : '';
		};

		Scregal_Class.prototype.prepare_scregal_box = function() {
			$('.scregalWrap > figure:not(:first-of-type)').remove();
		};

		Scregal_Class.prototype.create_navigation = function() {

		};

		Scregal_Class.prototype.create_scregal_box = function() {
			if (!isInitialized) {
				$('body').prepend($scregalBox);
				$scregalBox.append($scregalLeftBox, $scregalCenterBox, $scregalRightBox, $scregalLeftImg, $scregalCenterImg, $scregalRightImg, $scregalLeftNav, $scregalRightNav);
				$scregalCenterBox.append($scregalFront);

				$('.scregalWrap').append('<figure>');

				defaults.addFront ? $scregalFront.show(0) : '';
				!defaults.isNavigation ? $scregalLeftNav.add($scregalRightNav).hide(0) : '';

				this.create_navigation();
				this.set_other_handlers();
				isInitialized = true;
			}
		};

		Scregal_Class.prototype.create_scregal_data_item = function(elems, opts) {
			!scregal_datas[opts.rel] ? scregal_datas[opts.rel] = [] : '';
			var data = { href: elems.attr('href'), rel: opts.rel, id: scregal_datas[opts.rel].length, inFront : opts.inFront() };
			scregal_datas[opts.rel].push(data);
			elems.data('scregal_data', data);
		};

		Scregal_Class.prototype.set_recent_scregal_data = function(data) {
			recent_scregal_data = data;
		};

		Scregal_Class.prototype.auto_gallery_start = function() {
			var that = this;
			isAutoGallery = true;
			auto_gallery_timeout = setInterval(function(e){
				that.gallery_progress(true);
				$scregalRightNav.add($scregalLeftNav).add($scregalFront).fadeOut(300);
			}, defaults.autoDelay);
		};

		Scregal_Class.prototype.auto_gallery_stop = function() {
			isAutoGallery = false;
			clearInterval(auto_gallery_timeout);
			$scregalRightNav.add($scregalLeftNav).add($scregalFront).fadeIn(300);
		};

		Scregal_Class.prototype.set_other_handlers = function() {
			var that = this;
			var i = 3;
			var timer = null;
			$scregalBox.on('mousemove init-auto', function(e){
				clearTimeout(timer);
				console.log('mousemove', isAutoGallery);
				isAutoGallery ? that.auto_gallery_stop() : '';
				timer = setTimeout(function(){
					isScregalWorks ? that.auto_gallery_start() : '';
				}, defaults.autoGalleryDelay);
			});

			$('.scregalCenterImg, .scregalLeftImg, .scregalRightImg').load(function(){
				recent_data_image[$(this).attr('class')]['width'] = $(this).width();
				recent_data_image[$(this).attr('class')]['height'] = $(this).height();
				recent_data_image[$(this).attr('class')]['href'] = $(this).attr('src');

				if (--i == 0) {
					that.update_boxes_content();
					that.update_boxes_size();
					i = 3;
				}
			});

			$(window).resize(function(){
				that.update_boxes_size();
			});

			$('body').on('click', '.scregalRightBox', function(e){
				e.preventDefault();
				that.auto_gallery_stop();
				that.gallery_progress(true);
				$scregalBox.trigger('init-auto');
			});

			$('body').on('click', '.scregalLeftBox', function(e){
				e.preventDefault();
				that.auto_gallery_stop();
				that.gallery_progress();
				$scregalBox.trigger('init-auto');
			});



			$(document).on('keyup', function(e){
				e.preventDefault();
				var which = e.which;
				if (isScregalWorks && defaults.keyboardNavigation) {
					that.auto_gallery_stop();
					switch (which) {
						case 27 : that.close_gallery(); break;
						case 37 : that.gallery_progress(); break;
						case 39 : that.gallery_progress(true); break;
					}
					$scregalBox.trigger('init-auto');
				}
			});
		};

		Scregal_Class.prototype.set_handler = function(elem) {
			var that = this;

			elem.on('click', function(e){
				e.preventDefault();
				$('.scregalBox').fadeIn(300);
				var data = $(this).data('scregal_data');
				that.set_recent_scregal_data(data);
				that.load_gallery_data();
				isScregalWorks = true;
			});
		};

		Scregal_Class.prototype.gallery_progress = function(isNext) {
			this.prepare_scregal_box();
			var id = isNext ? this.get_id_next() : this.get_id_prev();
			var data = scregal_datas[recent_scregal_data.rel][id];
			this.set_recent_scregal_data(data);
			this.load_gallery_data();
		};

		Scregal_Class.prototype.close_gallery = function() {
			$('.scregalBox').fadeOut(300);
			isScregalWorks = false;
			this.auto_gallery_stop();
		};

		Scregal_Class.prototype.get_id_prev = function() {
			var id = recent_scregal_data.id;
			var gallery = scregal_datas[recent_scregal_data.rel];
			var length = gallery.length;
			return id == 0 ? length-1 : id-1;
		};

		Scregal_Class.prototype.get_id_next = function() {
			var id = recent_scregal_data.id;
			var gallery = scregal_datas[recent_scregal_data.rel];
			var length = gallery.length;

			return id == length-1 ? 0 : id+1;
		};

		Scregal_Class.prototype.add_front_to_item = function() {
			$('.scregalFront').html(recent_scregal_data.inFront);
		};

		Scregal_Class.prototype.load_gallery_data = function() {
			var id_prev = this.get_id_prev();
			var id_next = this.get_id_next();

			$scregalCenterImg.attr('src', recent_scregal_data.href);
			$scregalLeftImg.attr('src', scregal_datas[recent_scregal_data.rel][id_prev].href);
			$scregalRightImg.attr('src', scregal_datas[recent_scregal_data.rel][id_next].href);

			defaults.addFront ? this.add_front_to_item() : '';
		};



		Scregal_Class.prototype.update_boxes_size = function(data) {
			var screenWidth = $(window).width();
			var screenHeight = $(window).height();
			var scregalCenterImgWidth = recent_data_image.scregalCenterImg.width;
			var scregalCenterImgHeight = recent_data_image.scregalCenterImg.height;
			var scregalCenterImgNewWidth = Math.floor(scregalCenterImgWidth/(scregalCenterImgHeight/screenHeight));

			var scregalCenterBoxNewWidth = typeof defaults.maxWidth == 'string' ? parseInt(defaults.maxWidth)/100 * screenWidth >= scregalCenterImgNewWidth ? scregalCenterImgNewWidth : parseInt(defaults.maxWidth)/100 * screenWidth : defaults.maxWidth >= scregalCenterImgNewWidth ? scregalCenterImgNewWidth : defaults.maxWidth;

			scregalCenterBoxNewWidth = Math.floor(scregalCenterBoxNewWidth);

			$scregalCenterBox.css({ width: scregalCenterBoxNewWidth });
			$scregalLeftBox.css({ width: (screenWidth - scregalCenterBoxNewWidth)/2 });
			$scregalRightBox.css({ width: (screenWidth - scregalCenterBoxNewWidth)/2 });
		};

		Scregal_Class.prototype.update_boxes_content = function() {

			var $figure = $('<figure class="scregalFigure">');
			var $scregalFigureCenter = $figure.clone().css('background-image', 'url(' + recent_data_image.scregalCenterImg.href + ')');
			var $scregalFigureLeft = $figure.clone().css('background-image', 'url(' + recent_data_image.scregalLeftImg.href + ')');
			var $scregalFigureRight = $figure.clone().css('background-image', 'url(' + recent_data_image.scregalRightImg.href + ')');

			$scregalCenterBox.prepend($scregalFigureCenter);
			$scregalLeftBox.prepend($scregalFigureLeft);
			$scregalRightBox.prepend($scregalFigureRight);

			$('.scregalWrap').find('figure:last-of-type').animate(defaults.animToRemove, defaults.durationToRemove, defaults.easingToRemove, function(){
				$(this).remove();
			});

			$('.scregalBesideBox').find('figure:first-of-type').animate(defaults.animBesideToAdd, defaults.durationToAdd, defaults.easingToAdd, function(){
				$(this).addClass(defaults.classAfterAdd);
			});

			$('.scregalCenterBox').find('figure:first-of-type').animate(defaults.animCenterToAdd, defaults.durationToAdd, defaults.easingToAdd, function(){
				$(this).addClass(defaults.classAfterAdd);
			});


		};

		return Scregal_Class;
	})();

	$.fn.scregal = function(opts) {
		var _scr = new Scregal(this, opts);
	};

}(jQuery));