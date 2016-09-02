(function ($) {

$('.invite-btn').click(function (evt) {
  evt.preventDefault();

  var btn = $(this),
      url = btn.data('url'),
      message = btn.data('message');

  var invitePage = $('.bg-container'),
      block = new BlockUi(invitePage);


  // See: https://developers.facebook.com/docs/games/services/gamerequests
  FB.ui({
    method: 'apprequests',
    message: message,
    filters: ['app_non_users'],
  }, function(response){
    if (!response || 'error_code' in response ||
        (Array.isArray(response) && !response.length)) {
      block.hide();
      return;
    }

    // Fire off Ajax request
    $.post(url, {
      response: response
    }).done(function(json) {
      // Sanity check - this shouldn't happen
      if (!json.success) console.error(json);

      var data = json.data;
      if (data.hasOwnProperty('redirect')) {
        if (btn.data('no-redirect')) {
          AlertManager.clear();
          AlertManager.add('info', 'Your friends have been successfully added!', 'info-circle');
        } else {
          window.location.href = data.redirect;
        }
      } else if (data.hasOwnProperty('required_count')) {
        var count = data.required_count;

        // Update the count in the help message below the button
        $('.invite-count').text(count);

        // Hide existing error messages
        AlertManager.clear('danger');

        // And add the new one
        var message = "Sorry, you didn't invite enough friends. Please invite " +
            count + " or more friends to continue playing.";
        AlertManager.add('danger', message, 'exclamation-triangle');
      }
    }).fail(function () {
      // TODO: Figure out front end error handling strategy
    }).always(function () {
      block.hide();
    });
  });
});

})(jQuery);