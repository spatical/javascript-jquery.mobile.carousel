/*
 * jQuery Mobile Carousel plugin
 * Copyright (c) Kazuhiro Osawa
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
(function($) {
	var name_space = 'mobile_carousel';

	$.fn[name_space] = function(carouselOptions) {
		if (this.data("__attached") === "true") {
			return;
		}
		
		// change style
		this.addClass("ui-mobile-carousel");

		var carousel_padding = ('padding' in carouselOptions) ? carouselOptions.padding : 10;
		var window_width  = $(window).width();
		var window_height = $(window).height();
		var carousel_width  = ('width' in carouselOptions) ? carouselOptions.width : window_width;
		var carousel_height = ('height' in carouselOptions) ? carouselOptions.height : carousel_height;
		
		var paging_left  = ('pagingLeft' in carouselOptions) ? carouselOptions.pagingLeft : "&lt;";
		var paging_right = ('pagingRight' in carouselOptions) ? carouselOptions.pagingRight : "&gt;";
		var paging_bullet  = ('pagingBullet' in carouselOptions) ? carouselOptions.pagingBullet : "&ordm;";
		var paging_current = ('pagingCurrent' in carouselOptions) ? carouselOptions.pagingCurrent : "&bull;";
		
		var margin_width  = ('marginWidth' in carouselOptions) ? carouselOptions.marginWidth : Math.abs(window_width / 3);
		var content_width = ('contentWidth' in carouselOptions) ? carouselOptions.contentWidth : window_width - margin_width;
		var left_base     = -15 + (margin_width / 2);

		this.each(function(){
			var content_paging = $("<DIV/>")
				.addClass("ui-mobile-carousel-content-paging");

			// wrapping contents div
			var content = $("<DIV/>")
				.addClass("ui-mobile-carousel-content");
			var ul = $(this)
				.before(content);
			ul.appendTo(content);
			content.append(content_paging);

			ul.height(carousel_height);

			var elements = ul.find("li");
										   
			var initialize_cb = function(){
				var li_left = 0;
				elements.each(function(){
					var li = $(this);
					var img = li.find("img");

					// fixed width, height
					var image_width = content_width - carousel_padding;
					if (image_width < img.width()) {
						img.width(image_width);
					}
					if (carousel_height - carousel_padding < img.height()) {
						img.height(carousel_height - carousel_padding);
					}
					li.width(content_width).height(carousel_height);

					// fixed img position
					li_left += carousel_height;
					var left = (li.width() / 2) - (img.width() / 2);
					var top  = (li.height() / 2) - (img.height() / 2);
					img.css({ left: left + "px", top: top + "px" });
				});

				var ul_width = elements.length * (window_width + 5) - (4 - elements.length) ;
				ul.width(ul_width).css("left", left_base + "px");
            };

			// wait to all image load
			var images = ul.find("img");
			var loaded_count = 0;
			var count_cb = function(){
				loaded_count++;
				if (images.length === loaded_count) {
					initialize_cb();
				}
			};
			images.each(function(){
				if ($(this).width() > 0) {
					loaded_count++;
				}
			});
			if (images.length === loaded_count) {
				initialize_cb();
			} else {
				images.load(count_cb).error(count_cb);
			}

			// paging setting
			var currentIndex = 1;
			var update_paging = function(idx) {
				// set page marker
				content_paging.empty();
				var page_width = 0;
				
				// paging left
				var page = $("<SPAN/>");
				page.html(paging_left)
					.addClass("ui-mobile-carousel-content-paging-left");
				content_paging.append(page);
				page_width += page.width();
				// paging items
				for (var i = 1; i < elements.length + 1; i++) {
					var page = $("<SPAN/>");
					if (i === currentIndex) {
						page.html(paging_current)
							.addClass("ui-mobile-carousel-content-paging-hide");
					} else {
						page.html(paging_bullet)
							.addClass("ui-mobile-carousel-content-paging-show");
					}
					content_paging.append(page);
					page_width += page.width();
				}
				// paging right
				var page = $("<SPAN/>");
				page.html(paging_right)
					.addClass("ui-mobile-carousel-content-paging-right");
				content_paging.append(page);
				page_width += page.width();

				// fixed position
				content_paging.width(page_width);
				var left = (window_width / 2) - (content_paging.width() / 2) - 15;
				content_paging.css("left", left + "px");
				content_paging.css("top", "-10px");
			};
			update_paging(currentIndex);

			// touch events
			var startX = 0,
				startY = 0,
				lastX  = 0,
				ulX    = 0,
				isScroll = null,
				touching = false,
				moved    = true,
				lastCurrentX = 0,
				startMoveAt = 0,
				lastMoveAt = 0;

			var count = 0;
			ul.touchstart(function(e){
				if (touching) {
					return;
				}
				var data = e.originalEvent.touches ?
					e.originalEvent.touches[ 0 ] :
					e;
				startX = data.pageX;
				startY = data.pageY;
				touching = true;
				moved    = false;
				if (currentIndex > 1) {
					isScroll = true;
				} else {
					isScroll = null;
				}
				lastCurrentX = 0;
				count = 0;
				startMoveAt = lastMoveAt = (new Date).getTime();
			});
			ul.touchend(function(e){
				if (touching === false) {
					return;
				}
				var now = (new Date).getTime();

				var after_index_fixup = function(){
					update_paging(currentIndex);

					var currentX = (content_width * (currentIndex - 1));
					ul.animate({
						"left": (left_base + (currentX * -1)) + "px"
					}, 200, "swing", function(){
						touching = false;
						moved    = true;
						isScroll = null;
					});

					startMoveAt = lastMoveAt = 0;
				};

				if ((now - startMoveAt) < 300) {
					var over = margin_width / 3 * -1;
					if (lastX > 0 && elements.length > currentIndex) {
						currentIndex++;
					} else if (lastX < 0 && currentIndex > 1) {
						currentIndex--;
						over = over * -1;
					}
					var currentX = (content_width * (currentIndex - 1));
					ul.animate({
						"left": (left_base + (currentX * -1) + over) + "px"
					}, 200, "swing", after_index_fixup);

				} else {
					if (Math.abs(lastX) > (window_width / 2)) {
						if (lastX > 0 && elements.length > currentIndex) {
							currentIndex++;
						} else if (lastX < 0 && currentIndex > 1) {
							currentIndex--;
						}
					}
					after_index_fixup();
				}
			});
			ul.touchmove(function(e){
				if (moved) {
					return;
				}
				var data = e.originalEvent.touches ?
					e.originalEvent.touches[ 0 ] :
					e;
				if (isScroll === null) {
					if (Math.abs(data.pageX - startX) > Math.abs(data.pageY - startY) * 1) {
						isScroll = true;
					} else {
						isScroll = false;
					}
				}
				if (isScroll === false) {
					return;
				}

				touching = true;
				e.preventDefault();
				var now = (new Date).getTime();
				/*
				if (lastMoveAt > now - 10) {
					return;
				}
				*/
				lastMoveAt = now;
				
				var scroll_to_top = ('scrollToTop' in carouselOptions) ? carouselOptions.scrollToTop : true;
				if(scroll_to_top === true) $.mobile.silentScroll(ul.offset().top);

				lastX = startX - data.pageX;
				var currentX = lastCurrentX = (content_width * (currentIndex - 1)) + lastX;
				ul.css("left", (left_base + (currentX * -1)) + "px");
			});
		});

		this.data("__attached", "true");
		return this;
	};

})(jQuery);
