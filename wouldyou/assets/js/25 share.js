(function ($) {
  $('body').on('click', '.share-btn', function (evt) {
    evt.preventDefault();

    var $t = $(this),
        url = $t.data('href');

    FB.ui({
      method: 'share',
      href: url,
      mobile_iframe: true,
    });
  });
})(jQuery);