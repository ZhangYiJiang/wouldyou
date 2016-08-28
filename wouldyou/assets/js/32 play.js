(function ($) {
  var verbBtn = $('body.game .verb-button');
  var gameArea = $('body.game .game-area');
  var gameAction = $('body.game .game-action');
  var url = gameArea.data('url'),
      setId = gameArea.data('set'),
      model = gameArea.data('model');
  var count = 0;

  verbBtn.click(function(evt){
    evt.preventDefault();

    // Make sure the button can't be clicked more than once
    var $t = $(this);
    if ($t.data('clicked'))
      return;
    $t.data('clicked', true);
    count++;

    // Remove the same option from all other profile
    var verb = $t.data('verb');
    verbBtn.not(this).filter(function () {
      return $(this).data('verb') == verb;
    }).css('visibility', 'hidden');

    // Remove all other option on the same profile
    $t.closest('li')
      .siblings()
      .find('button')
      .remove();

    // Mark the game card as selected
    $t.closest('.game-card-unselected')
      .removeClass('game-card-unselected');

    // Save action using Ajax
    var subject = $t.closest('.game-card')
      .data('subject');
    $.post(url, {
      set: setId,
      model: model,
      verb: verb,
      subject: subject
    }).fail(function () {
      // TODO: Figure out what to do in case of failures
    });

    if (count == 3) {
      $('body.game .game-result')
        .removeClass('hidden');
      verbBtn.closest('li')
        .siblings()
        .remove();
      gameAction.css('justify-content', 'flex-start');
    }
  });

})(jQuery);