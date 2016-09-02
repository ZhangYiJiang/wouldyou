(function ($) {
  function launchShareDialog(dataCallback) {
    return function (evt) {
      evt.preventDefault();
      var $t = $(this);
      var shareOptions = dataCallback($t);

      // TODO: Add a spinner for this
      FB.ui(shareOptions);
    };
  }

  $('body').on('click', '.share-btn', launchShareDialog(function(btn) {
    return {
      method: 'share',
      href: btn.data('href') || window.location.toString(),
      mobile_iframe: true,
    };
  }))
  .on('click', '.story-btn', launchShareDialog(function(btn) {
    return {
      method: 'share_open_graph',
      action_type: btn.data('action'),
      action_properties: JSON.stringify({
        celebrity: btn.data('celebrity'),
      }),
    };
  }));
})(jQuery);