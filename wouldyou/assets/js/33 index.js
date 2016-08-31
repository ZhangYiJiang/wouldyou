(function ($) {
  var indexHeader = $('.index-header .header-content');
  if (!indexHeader.length) return;

  $('.bg-col').hover(function() {
    var $t = $(this),
        pos = $t.prevAll().length;

    indexHeader.addClass($t.data('verb') + '-selected');
  }, function () {
    var $t = $(this),
        pos = $t.prevAll().length;

    indexHeader.removeClass($t.data('verb') + '-selected');
  })
})(jQuery);