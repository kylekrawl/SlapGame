var Utilities = function () {
    this.isEmptyObject = function (obj) {
        var empty = true
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                empty = false
            }
        }
        return empty
    }
    this.randomArrayChoice = function(arr) {
        return arr[Math.floor((Math.random() * arr.length))]
    }
}

var Game = function () {
    this.currentTurn = 1
    this.characters = {
        player: new Character('Test Player', 100, 100, 1, 1),
        enemy: new Character('Test Enemy', 100, 100, 1, 1)
    }
    this.availableItems = {
        //items available for player/enemy use
        mainWeapon: new Item('Main Weapon', 5, 'mainWeapon', 2, 1),
        sideWeapon: new Item('Side Weapon', 5, 'sideWeapon', 1.5, 1),
        utilityItem: new Item('Utility Item', 5, 'utilityItem', 1, 1.2)
    }
    this.updateDisplay = function () {
        var elementsToUpdate = [
            {
                id: 'turn',
                value: this.currentTurn
            },
            {
                id: 'player-health',
                value: this.characters.player.health
            },
            {
                id: 'enemy-health',
                value: this.characters.enemy.health
            },
            {
                id: 'player-energy',
                value: this.characters.player.energy
            },
            {
                id: 'enemy-energy',
                value: this.characters.enemy.energy
            },
            {
                id: 'player-name',
                value: this.characters.player.name
            },
            {
                id: 'enemy-name',
                value: this.characters.enemy.name
            }
        ]
        for (var i = 0; i < elementsToUpdate.length; i++) {
            var element = elementsToUpdate[i]
            document.getElementById(element.id).innerText = element.value
            console.log('val:' + element.value)
            console.log(this.characters.enemy.health)
        }
    }
    this.resetInitialState = function() {
        game = new Game
        player = game.characters.player
        enemy = game.characters.enemy
        game.updateDisplay()
    }
    this.checkForGameEnd = function () {
        characterDefeated = false
        for(characterType in this.characters) {
            console.log('char: ', this.characters[characterType].health)
            if (this.characters[characterType].health <= 0) {
                characterDefeated = true
            }
        }
        console.log('defeated: ', characterDefeated)
        if (characterDefeated) {
            this.resetInitialState()
        }
    }
    this.addItemToCharacter = function (item, character) {
        // if item is main weapon or side weapon: 
        // if character has space in equipment slot, add item, else either replace item or alert as invalid action
        // if item is utility, can be freely swapped out at any time (utility weapons do not degrade)
        console.log(item)
        if (item.slot === 'mainWeapon' || item.slot === 'sideWeapon')
            console.log('item slot: ', item.slot)
            console.log('item slot: ', character.equipment[item.slot])
            if (utilities.isEmptyObject(character.equipment[item.slot])) {
                console.log('item slot: ', character.equipment[item.slot])
                character.equipment[item.slot] = item
                console.log('item slot: ', character.equipment[item.slot])
            } else {
                // action cannot be taken. prevents players from swapping out weapons to prevent breakage
            }
        if (item.slot === 'utilityItem') {
            character.equipment[item.slot] = item
        }
        console.log('equipment in addItem: ', character.equipment)
    }
    this.computerAction = function (computerPlayer) {
        //get computer player action based on current state
    }
}

var Character = function (name, health, energy, baseAttack, baseDefense) {
    this.name = name
    this.health = health
    this.maxHealth = this.health
    this.energy = energy
    this.maxEnergy = this.maxEnergy
    this.baseAttack = baseAttack
    this.baseDefense = baseDefense
    this.equipment = {
        mainWeapon: {},
        sideWeapon: {},
        utilityItem: {}
    }
    this.calculateItemModifier = function (mode) {
        console.log('current char: ', this)
        console.log('equipment in Item Mod: ', this.equipment)
        var out = 1
        if (mode === 'attack') {
            // iterate through all items, sum attack modifiers
            for (slot in this.equipment) {
                console.log('item slot: ', this.equipment[slot])
                if (!utilities.isEmptyObject(this.equipment[slot])) { 
                    out += this.equipment[slot].attackMod
                    console.log('slot attack mod: ', this.equipment[slot].attackMod)
                    console.log('out: ' + out)
                }
            }
        }
        if (mode === 'defend') {
            // iterate through all items, sum defense modifiers
            for (slot in this.equipment) {
                if (!utilities.isEmptyObject(this.equipment.slot)) { 
                    out += slot.defenseMod
                }
            }
        }
        console.log('attack mod: ', out)
        return out //return modifier
    }
    this.attack = function (type, target) {
        //link attack type to damage and cost in object
        var attackAttributes = {
            weak: {
                name: 'weak attack',
                energyCost: 0,
                baseDamage: 5
            },
            moderate: {
                name: 'moderate attack',
                energyCost: 10,
                baseDamage: 15
            },
            strong: {
                name: 'strong attack',
                energyCost: 20,
                baseDamage: 25
            }
        }

        console.log('target: ', target)

        //set base damage, energy cost
        var damage = this.baseAttack + attackAttributes[type].baseDamage
        console.log('damage: ' + damage)
        var energyCost = attackAttributes[type].energyCost
        console.log(target)
        var enemyDefense = target.baseDefense * target.calculateItemModifier('defend')
        console.log('target BD: ', target.baseDefense)
        console.log('target IM: ', target.calculateItemModifier('defend'))
        //multiply base damage by return value of calculateItemModifier()
        damage *= this.calculateItemModifier('attack')
        //decrease character energy by energy cost
        console.log('this: ', this)
        this.energy -= energyCost
        if (this.energy < 0) {
            this.energy = 0
        }
        //decrease target character health by difference between attacker attack defender defense
        //if defense modifier greater or equal, attack deals no damage
        damage -= enemyDefense
        console.log('enemy def: ' + enemyDefense)
        console.log('damage: ' + damage)
        if (enemyDefense > damage) {
            damage = 0
        }
        target.health -= damage
        if (target.health < 0) {
            target.health = 0
        }
        game.currentTurn += 1
        game.updateDisplay()
        game.checkForGameEnd()
    }
    //could bundle these two into restoreAttribute
    this.restoreAttribute = function (attribute) {
        //restore health at cost of energy
        //if health exceeds maxHealth after restoration, set to maxHealth
        if (this.hasOwnProperty(attribute)) {
            this.attribute += 10
            if (this.attribute != 'energy') {
                this.energy -= 10
            }
            if (this.health > this.maxHealth) {
                this.health = this.maxHealth
            }
            if (this.energy > this.maxEnergy) {
                this.energy = this.maxEnergy
            }
            if (this.energy < 0) {
                this.energy = 0
            }
        }
    }

    this.actionTypes = [] //action types as functions in array. add method to iterate through 
    //these and disable anything player doesn't have enough energy for
}

var Item = function (name, numUses, slot, attackMod, defenseMod) {
    this.name = name
    this.numUses = numUses
    this.slot = slot
    this.attackMod = attackMod
    this.defenseMod = defenseMod
}

// Initialize Game
var player; var enemy
var utilities = new Utilities()
var game = new Game()
var player = game.characters.player
var enemy = game.characters.enemy
game.updateDisplay()
