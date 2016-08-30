(function ($) {

$('.invite-btn').click(function (evt) {
  evt.preventDefault();

  var btn = $(this),
      url = btn.data('url'),
      message = btn.data('message');
  var invitePage = $('.bg-container');
  var block = new BlockUi(invitePage);

  // See: https://developers.facebook.com/docs/games/services/gamerequests
  FB.ui({
    method: 'apprequests',
    message: message,
  }, function(response){
    if (!response || 'error_code' in response) {
      block.hide();
      return;
    }

    // Fire off Ajax request
    $.post(url, {
      response: response
    }).success({
      // TODO: Behavior after inviting friends
    }).fail(function () {
      // TODO: Figure out front end error handling strategy
    }).always(function () {
      block.hide();
    });
  });
});

})(jQuery);