var timerSaveTextAreas;
var lastTextAreaText = '';

function checkForSessionDeath(html) {
  if( $(html).find('#login').length > 0 ) {
    window.location = '/login';
    return false;
  }
}

function addSpinner(target_selector) {
  $(target_selector).append('<img class="spinner" src="/images/spinner.gif"/>');
}
function removeSpinner(target_selector) {
  $('.spinner', target_selector).remove();
}

function hideWindows() {
    $('.window').hide();
}

function updateAges() {
  $('.age').each( function(i) {
    if( $(this).text().match(/^seconds ago$/) ) {
      $(this).text('1 minute ago');
    } else {
      var m = $(this).text().match(/^(\d+) minutes? ago$/);
      if( m ) {
        $(this).text( (parseInt(m[1]) + 1) + ' minutes ago');
      }
    }
  } );
}

function saveTextAreaText() {
  $('textarea').each( function(i) {
    var text = $(this).val()
    if( text != '' && text != lastTextAreaText ) {
      lastTextAreaText = text;
      $.post(
        '/textarea_save',
        {
          text: text,
          id: $(this).attr('id')
        }
      );
      return false;
    }
  } );
}

/* ---------------------------------------------------- */

$(document).ready( function() {

  /* TODO: This looks refactorable */
  $('#menu-account').click( function() {
    if( $('#account-window').is(':visible') ) {
      hideWindows();
      return false;
    }

    hideWindows();
    $('#account-window').toggle();
    return false;
  } );

  $(document).click( function(event) {
    if( $(event.target).closest('.window').length == 0 ) {
      hideWindows();
    }
  } );

  $('input.preview').live( 'click', function() {
    var unrendered = $(this).closest('form').find('textarea[name="text"]').val();
    if( $('input[name="hashtags"]').length > 0 ) {
      unrendered = unrendered + "\n\n" + $('input[name="hashtags"]').val();
    }

    var target = $(this).closest('form.comment, #post-new form, form#post-edit');
    var type = $(this).data('type');
    var textType = null;
    if( type == 'post' ) { textType = 'post-text'; }

    $.post(
      '/_render',
      { s: unrendered },
      function(html) {
        checkForSessionDeath(html);
        if( target.length > 0 ) {
          $('.preview-box').remove();
          target.append( $('<div class="preview-box" class="'+type+'"><h3 class="preview">Preview</h3><div class="text typed-text '+textType+'">' + html + '</div></div>') );
          target.closest('div.comments').scrollTop(99999);
        }
      }
    );
  } );

  $('.input-and-filler input').live( 'focus', function() {
    $(this).closest('.input-and-filler').find('.filler').hide();
  } );
  $('.input-and-filler input').live( 'blur', function() {
    if( $(this).val() == '' ) {
      $(this).closest('.input-and-filler').find('.filler').show();
    }
  } );
  $('.input-and-filler .filler').live( 'click', function() {
    $(this).closest('.input-and-filler').find('input').focus();
  } );

  $('.hashtag').live( 'click', function() {
    window.location = '/rivers/ensure_exists/%23' + $(this).data('hashtag');
  } );

  $('.textarea-clear').live( 'click', function() {
    var id = $(this).data('textarea-id');
    $('#'+id).val('');
    $.get( '/textarea_clear/' + id );
  } );

  $('.post-excerpt').live( {
    mouseover: function() {
      $(this).find('.post-tools').show();
    },
    mouseout: function() {
      $(this).find('.post-tools').hide();
    }
  } );

  $('.mark-read').live( 'click', function() {
    markPostRead( $(this).closest('div.post, div.post-excerpt').data('post-id') );
    return false;
  } );

  /* ---------------------------------------------------- */

  setInterval( updateAges, 60 * 1000 );
  timerSaveTextAreas = setInterval( saveTextAreaText, 15 * 1000 );
  $('textarea').expandable();

  if( layout == 'narrow' ) {
    $('*').mouseover();
  }
} );
