
/**
 * Class to store book sections states
 * TODO: Remove all members thata call to this.getSectionState(). They should be
 * TODO: called directly from SectionState
 */
function BookSectionStates() {

    /** {string} The current section id */
    this.currentSection = null;

    /** 
     * Visited section states. The key is the section id (string), and the value
     * is a SectionState instance 
     */
    this.sectionStates = {};

    /**
     * Hunting discipline enabled?
     */
    this.huntEnabled = true;
}

/**
 * Get the current section state. If it does not exists, it will be created
 * @return {SectionState} The section state
 */
BookSectionStates.prototype.getSectionState = function() {
    var sectionState = this.sectionStates[ this.currentSection ];
    if( !sectionState ) {
        sectionState = new SectionState();
        this.sectionStates[ this.currentSection ] = sectionState;
    }
    return sectionState;
};

/**
 * Add an object to the current section
 * @param {string} objectId Object id to add
 * @param {number} price The object price
 * @param {bool} unlimited True if there are an infinite number of this kind of object on the section
 */
BookSectionStates.prototype.addObjectToSection = function(objectId, price, unlimited) {
    var sectionState = this.getSectionState();
    sectionState.addObjectToSection( objectId, price, unlimited );
};

/**
 * Remove an object from the current section
 * @param {string} objectId Object id to remove
 */
BookSectionStates.prototype.removeObjectFromSection = function(objectId) {
    var sectionState = this.getSectionState();
    sectionState.removeObjectFromSection( objectId );
};

/**
 * Clear the current section state
 */
BookSectionStates.prototype.resetCurrentSectionState = function() {
    this.sectionStates[ this.currentSection ] = null;
};

/**
 * Add a combat skill bonus to the current section combats by an object usage.
 * @param {number} combatSkillModifier The combat skill increase
 */
BookSectionStates.prototype.combatSkillUsageModifier = function(combatSkillModifier) {
    var sectionState = this.getSectionState();
    // Apply the modifier to current combats:
    $.each(sectionState.combats, function(index, combat) {
        combat.objectsUsageModifier += combatSkillModifier;
    });
};

/**
 * Check if a rule has been executed on the current section
 * @param rule Rule to check
 * @return The object associated with the execution. true if there was no result stored
 */
BookSectionStates.prototype.ruleHasBeenExecuted = function(rule) {
    return this.getSectionState().ruleHasBeenExecuted(rule);
};

/**
 * Mark a rule as executed on the current section
 * @param rule The executed rule
 * @param executionState The state to associate with the execution. If it's null,
 * if will be set to true
 */
BookSectionStates.prototype.markRuleAsExecuted = function( rule, executionState ) {
    this.getSectionState().markRuleAsExecuted( rule, executionState );
};

// 
/**
 * Setup combat states on the current section
 * @param {Section} section The current section info 
 */
BookSectionStates.prototype.setupCombats = function( section ) {
    var sectionState = this.getSectionState();
    if( sectionState.combats.length == 0 ) {
        var combats = section.getCombats();
        if( combats.length > 0 )
            sectionState.combats = combats;
    }
};

BookSectionStates.prototype.fromStateObject = function(stateObject) {

    this.currentSection = stateObject.currentSection;
    this.sectionStates = {};
    var self = this;

    // Replace generic objects by the needed objects
    $.each( stateObject.sectionStates , function( sectionId , s ) {
        var sectionState = $.extend( new SectionState() , s );
        self.sectionStates[ sectionId ] = sectionState; 

        // Restore combats
        var combats = [];
        $.each( sectionState.combats , function( index , combat ) {
            var rightCombat = $.extend( new Combat(), combat );
            combats.push( rightCombat );
            
            // Restore combat turns
            var turns = [];
            $.each( rightCombat.turns , function( index , turn ) {
                turns.push( $.extend( new CombatTurn(), turn ) );
            });
            rightCombat.turns = turns;
        });
        sectionState.combats = combats;
    });
};

BookSectionStates.prototype.sectionIsVisited = function(sectionId) {
    return this.sectionStates[sectionId] ? true : false;
};