(function ($) {

  $('body.game .kiss-verb-button').click(function(){
    var selector = $('.kiss-verb-button').not(this).css('visibility', 'hidden');
    removeOtherOptions(this);
  });

  $('body.game .merry-verb-button').click(function(){
    var selector = $('.merry-verb-button').not(this).css('visibility', 'hidden');
    removeOtherOptions(this);
  });

  $('body.game .kill-verb-button').click(function(){
    var selector = $('.kill-verb-button').not(this).css('visibility', 'hidden');
    removeOtherOptions(this);
  });

  function removeOtherOptions(selectedOption) {
    var selector = $(selectedOption).closest('ul');
    var selector = selector.find('.verb-button').not(selectedOption);
    selector.remove();
  }

})(jQuery);