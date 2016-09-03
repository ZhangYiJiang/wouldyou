(function ($) {
  $('body').on('click', '.share-btn', function (evt) {
    evt.preventDefault();

    var $t = $(this);
    var url = $t.data('href') || window.location.toString();

    var button = new LoadingButton($t, 'Awesome!', 'check');
    if (!button.start()) return;

    FB.ui({
      method: 'share',
      href: url,
      mobile_iframe: true,
    }, function (response) {
      if (response && !response.hasOwnProperty('error')) {
        button.success();
      } else {
        button.reset();
      }
    });
  })
  .on('click', '.story-btn', function (evt) {
    evt.preventDefault();

    var $t = $(this);
    var action = $t.data('action');
    var celebrity = $t.data('celebrity');

    var button = new LoadingButton($t, 'Awesome!', 'check fa-2x');
    if (!button.start()) return;

    FB.api(
      'me/' + action,
      'post',
      {
        celebrity: celebrity,
        access_token: userAccessToken,
      },
      function(response) {
        if (response && !response.hasOwnProperty('error') && response.hasOwnProperty('id')) {
          button.success();
        } else {
          button.reset();
          AlertManager.add('danger', 'Sorry, something went wrong. Please ' +
            'refresh the page and try again later', 'exclamation-triangle', true);
        }
      }
    );
  });
})(jQuery);