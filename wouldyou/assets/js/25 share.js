(function ($) {
  $('body').on('click', '.share-btn', function (evt) {
    evt.preventDefault();

    var $t = $(this);
    var url = $t.data('href') || window.location.toString();

    var button = new LoadingButton($t);

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

    var button = new LoadingButton($t);

    FB.api(
      'me/' + action,
      'post',
      {
        celebrity: celebrity,
        access_token: userAccessToken,
      },
      function(response) {
        console.log(response);

        if (response && !response.hasOwnProperty('error') && response.hasOwnProperty('id')) {
          button.success();
        } else {
          button.reset();
        }
      }
    );


  });
})(jQuery);