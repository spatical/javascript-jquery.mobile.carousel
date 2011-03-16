jQuery Mobile Carousel
======================

This is currently a rough draft version of a carousel widget.

### Optional Settings

* padding
* width
* height
* pagingLeft
* pagingRight
* pagingBullet
* pagingCurrent
* marginWidth
* contentWidth
* scrollToTop

TODO: Document the functionality of each of those settings

### Example usage with optional settings

	$(function(){
		$(".mobile-carousel").mobile_carousel({
			marginWidth: 0,
			height: 200,
			padding: 0,
			scrollToTop: false
		});
	});
