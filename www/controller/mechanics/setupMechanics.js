/** 
 * Game setup mechanics
 */
var setupMechanics = {

    /**
     * Choose player skills UI
     */
    setSkills: function() {
        // If the skills are already set, do nothing
        if( state.actionChart.combatSkill != 0 && state.actionChart.endurance != 0 )
            return;

        // Add HTML to do the choose
        gameView.appendToSection( 
            mechanicsEngine.$mechanicsUI.find('#mechanics-setSkills').clone() );

        // Disable next link
        gameView.enableNextLink(false);

        // Combat skill
        if( state.actionChart.combatSkill != 0 )
            $('#mechanics-detWeapon').hide();
        else {
            var $w = $('#mechanics-chooseWeapon');
            randomMechanics.bindTableRandomLink( $w , function(value) {
                state.actionChart.combatSkill = value + 10;
                $w.parent().append("<b>Your Combat Skill is " + state.actionChart.combatSkill + 
                    ".</b>" );
                template.updateStatistics();
                if( state.actionChart.combatSkill != 0 && state.actionChart.endurance != 0 )
                    gameView.enableNextLink(true);
            }, true);
        }
        
        // Endurance points
        if( state.actionChart.endurance != 0 )
            $('#mechanics-detEndurance').hide();
        else {
            var $e = $('#mechanics-chooseEndurance');
            randomMechanics.bindTableRandomLink( $e , function(value) {
                state.actionChart.endurance = value + 20;
                state.actionChart.currentEndurance = state.actionChart.endurance;
                $e.parent().append("<b>Your Endurance Points are " + state.actionChart.endurance + 
                    ".</b>" );
                template.updateStatistics();
                if( state.actionChart.combatSkill != 0 && state.actionChart.endurance != 0 )
                    gameView.enableNextLink(true);
            }, true);
        }

    },

    /**
     * Choose the kai disciplines UI
     */
    setDisciplines: function() {

        // Number of disciplines to choose (previous book disciplines + 1, or 5):
        var expectedNDisciplines = 5;
        var previousActionChart = state.getPreviousBookActionChart( state.book.bookNumber - 1);
        if( previousActionChart )
            expectedNDisciplines = previousActionChart.disciplines.length + 1;

        // All disciplines selected?
        var allSelected = function() { 
            return state.actionChart.disciplines.length >= expectedNDisciplines;
        };

        // Weapon skill choose
        var setWeaponSkillName = function() {
            var o = state.mechanics.getObject( state.actionChart.weaponSkill );
            $('#wepnskll .mechanics-wName').text('(' + o.name + ')');
        };
        var chooseWeaponFunction = function() {
            if( state.actionChart.weaponSkill )
                return state.actionChart.weaponSkill;
            var wTable = [ 'dagger' , 'spear' , 'mace' , 'shortsword' , 'warhammer', 'sword',
                'axe' , 'sword' , 'quarterstaff' , 'broadsword' ];
            var value = randomTable.getRandomValue();
            state.actionChart.weaponSkill = wTable[ value ];
            setWeaponSkillName();
            $('#wepnskll .well').append('<div><i><small>Random table value: ' + value + 
                '</small></i></div>')
            return state.actionChart.weaponSkill;
        };

        // Add the warning about the number of disciplines:
        gameView.appendToSection( 
            mechanicsEngine.$mechanicsUI.find('#mechanics-setDisciplines-NDis').clone() );
        $('#mechanics-nDisciplines').text( expectedNDisciplines );
        if( allSelected() ) {
            $('#mechanics-setDisciplines-NDis').hide();
            gameView.enableNextLink(true);
        }
        else
            gameView.enableNextLink(false);

        // Add checkbox for each discipline:
        $('.subsection').append( 
            mechanicsEngine.$mechanicsUI.find('#mechanics-setDisciplines').clone() 
        )
        .each(function(index, $disciplineSection) {
            // Set the discipline name on the checkbox
            var $title = $(this).find( '.subsectionTitle' );
            $(this).find( '.mechanics-dName' ).text( $title.text() );

            // Set checkbox initial value
            var disciplineId = $(this).attr('id');
            var $check = $(this).find( 'input[type=checkbox]' ); 
            $check.attr('checked' , state.actionChart.disciplines.contains(disciplineId) );

            // If the player had this discipline on the previous book, disable the check
            // On debug mode, always enabled
            if( !window.getUrlParameter('debug') && previousActionChart && 
                previousActionChart.disciplines.contains(disciplineId) )
                $check.prop( 'disabled' , true );

        })
        // Set events when checkboxes are clicked
        .find('input[type=checkbox]')
        .click(function(e) {

            // Limit the number of disciplines
            var selected = $(this).prop( 'checked' );
            if( selected && allSelected() ) {
                e.preventDefault();
                alert( 'You can choose only ' + expectedNDisciplines + ' disciplines');
                return;
            }
            // Add / remove the discipline
            var disciplineId = $(this).closest('.subsection').attr('id');
            if( selected ) {
                state.actionChart.disciplines.push( disciplineId );
                if( disciplineId == 'wepnskll')
                    // Choose the weapon
                    chooseWeaponFunction();
            }
            else
                state.actionChart.disciplines.removeValue( disciplineId );
            // Update the UI
            if( allSelected() ) {
                $('#mechanics-setDisciplines-NDis').hide();
                gameView.enableNextLink(true);
            }
            else {
                $('#mechanics-setDisciplines-NDis').show();
                gameView.enableNextLink(false);
            }
            template.updateStatistics();
        });

        // Set the already choosen weapon for the skill
        if( state.actionChart.weaponSkill )
            setWeaponSkillName();

    },

    /** 
     * Choose equipment UI 
     */
    chooseEquipment: function(rule) {
        
        // Add warning:
        gameView.appendToSection( 
            mechanicsEngine.$mechanicsUI.find('#mechanics-chooseEquipment').clone() );
        gameView.enableNextLink(false);

        // Function to test all links were clicked
        var textAllClicked = function() {
            if( $('.action').not('.disabled').length == 0 ) {
                $('#mechanics-chooseEquipment').hide();
                gameView.enableNextLink(true);
            }
        };

        // Initial test
        textAllClicked();
        // Test when some link is clicked
        $('.action').click(function() { textAllClicked(); });
    }

};