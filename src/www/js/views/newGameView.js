
/**
 * The new game view API
 */
var newGameView = {

    setup: function(downloadedBooks) {

        // Set current language
        $('#newgame-language').val( state.language );

        // Add supported books
        var html = '';
        for( var i=0; i<downloadedBooks.length; i++) {
            html += '<option value="' + downloadedBooks[i].bookNumber + '" >' + 
                downloadedBooks[i].bookNumber + '. ' + 
                downloadedBooks[i].title + '</option>';
        }
        $('#newgame-book').html( html );

        // Form submit
        $('#newgame-form').submit(function(e) {
            e.preventDefault();
            if( !$('#newgame-license').prop('checked') ) {
                alert( translations.text('youMustAgree') );
                return;
            }
            newGameController.startNewGame( $('#newgame-book').val() , 
                $('#newgame-language').val() );
        });

        // Book change
        $('#newgame-book').change(function() {
            newGameController.selectedBookChanged( $('#newgame-book').val() );
        });

        // Set the first book as selected:
        if( downloadedBooks.length > 0 )
            newGameController.selectedBookChanged( downloadedBooks[0].bookNumber );
    },

    setCoverImage: function(url) {
        $('#newgame-cover').attr('src', url);
    }
};
