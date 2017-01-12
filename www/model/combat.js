
/**
 * Create a combat
 * @param {string} enemy Enemy name
 * @param {number} combatSkill Enemy combat skill
 * @param {number} endurance Enemy endurance points 
 */
function Combat(enemy, combatSkill, endurance) {
    this.enemy = enemy;
    this.combatSkill = combatSkill;
    this.endurance = endurance;
    /** Combat turns (type = CombatTurn) */
    this.turns = [];
    /** Increment of combat skill of Lone Wolf in this combat  */
    this.combatModifier = 0;
    /** Increment of combat skill by objects usage  */
    this.objectsUsageModifier = 0;
    /** The enemy is immune to Mindblast? */
    this.noMindblast = false;
    /** The player cannot use weapons on this combat */
    this.noWeapon = false;
    /** Turn beyond which the combat can be eluded. -1 = no elude */
    this.eludeTurn = -1;
    /** Combat has been disabled? */
    this.disabled = false;
    /** Player dammage multiplier */
    this.dammageMultiplier = 1.0;
    /** Enemy dammage multiplier */
    this.enemyMultiplier = 1.0;

    /** Mindforce negative bonus by enemy mindforce attack */
    this.mindforceCS = 0;
    /** 
     * Player extra endurance points lost each turn by enemy mindforce attack.
     * It must to be negative.
     */
    this.mindforceEP = 0;

    /** Book 2 / sect276: True if the combat is not a combat to death */
    this.fakeCombat = false;
    /** The original endurance of the player before the combat (for fake combats) */
    this.originalPlayerEndurance = state.actionChart.currentEndurance;
    /** Combat has been finished? */
    this.combatFinished = false;
}

/**
 * Get the player combat skill for this combat
 * @return {number} The current combat skill
 */
Combat.prototype.getCurrentCombatSkill = function() {
    var cs = state.actionChart.getCurrentCombatSkill(this.noMindblast, this.noWeapon) + 
        this.combatModifier + this.objectsUsageModifier;

    // Check enemy mindforce attack
    if( this.mindforceCS < 0 && !state.actionChart.disciplines.contains( 'mindshld' ) )
        cs += this.mindforceCS;

    return cs;
}

/**
 * Returns the combat ratio for this combat
 */
Combat.prototype.getCombatRatio = function() {
    return this.getCurrentCombatSkill() - this.combatSkill;
}

/**
 * Get a turn result from the combat table
 * @param {boolean} elude True if the player is eluding the combat
 * @return The combat turn info
 */
Combat.prototype.getTurnResult = function(elude) {
    
    var turnResult = new CombatTurn(this.turns.length + 1, 
        this.getCombatRatio(), this.dammageMultiplier, this.enemyMultiplier, 
        this.mindforceEP , elude );
    return turnResult;
}

/**
 * Apply the next combat turn
 * @param {boolean} elude True if the player is eluding the combat
 * @return {CombatTurn} The combat turn
 */
Combat.prototype.nextTurn = function( elude ) {

    // Calculate the turn
    var turn = this.getTurnResult(elude);
    this.turns.push( turn );

    // Apply player damages:
    if( turn.loneWolf == combatTable_DEATH )
        state.actionChart.currentEndurance = 0;
    else
        state.actionChart.increaseEndurance( -turn.loneWolf );
    
    // Apply enemy damages:
    if( turn.enemy == combatTable_DEATH )
        this.endurance = 0;
    else {
        this.endurance -= turn.enemy;
        if( this.endurance < 0 )
            this.endurance = 0;
    }

    // Check if the combat has been finished
    if( elude || this.endurance == 0 || state.actionChart.currentEndurance == 0 ) {
        this.combatFinished = true;
        if( this.fakeCombat ) {
            // Restore player endurance to original :
            state.actionChart.increaseEndurance( this.originalPlayerEndurance
                - state.actionChart.currentEndurance );
        }
    }

    return turn;
}

/**
 * Returns true if the combat is finished?
 */
Combat.prototype.isFinished = function() {
    //return this.endurance == 0 || state.actionChart.currentEndurance == 0;
    return this.combatFinished;
}

/**
 * Returns true if the combat can be eluded right now
 */
Combat.prototype.canBeEluded = function() {
    if( this.eludeTurn < 0 || this.isFinished() )
        return false;
    return this.turns.length >= this.eludeTurn;
}

/**
 * Returns the number on endurance points lost by the player on this combat 
 */
Combat.prototype.playerEnduranceLost = function() {
    var lost = 0;
    for( var i=0, len = this.turns.length; i< len; i++) {
        var turn = this.turns[i];
        if( turn.loneWolf == combatTable_DEATH )
            lost += state.actionChart.getMaxEndurance();
        else
            lost += turn.loneWolf;
    }
    return lost;
};