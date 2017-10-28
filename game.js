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
    this.randomArrayChoice = function (arr) {
        return arr[Math.floor((Math.random() * arr.length))]
    }
}

//(name, numUses, slot, attackMod = 1, defenseMod = 1, energyCostMod = 1, energyRegenMod = 1, healthRegenMod = 1)
//(name, maxHealth = 500, baseHealthRegen = 0, maxEnergy = 100, baseEnergyRegen = 5, baseAttack = 1, baseDefense = 1)
var Game = function () {
    this.currentTurn = 1
    this.characters = {
        player: new Character('Test Player'),
        enemy: new Character('Test Enemy')
    }
    this.availableItems = {
        //items available for player/enemy use
        mainWeapon: new Item('Main Weapon', Infinity, 'weapon', 1.5, 1, 3, 0.5),
        sideWeapon: new Item('Side Weapon', Infinity, 'weapon', 1.2, 1, 2, 0.5),
        barrier: new Item('Barrier', 10, 'utility', 1, 2, 1.5, 1, 0),
        recharger: new Item('Recharger', 10, 'utility', 1, 1, 1, 1.5, 0)
    }
    this.updateActionInterface = function (character) {
        //TODO: condense this down into one hash and one loop
        var characterActions = {
            weakAttack: 'weak-attack',
            moderateAttack: 'moderate-attack',
            strongAttack: 'strong-attack',
        }
        var items = {
            mainWeapon: 'main-weapon',
            sideWeapon: 'side-weapon',
            barrier: 'barrier',
            recharger: 'recharger'
        }
        for (action in characterActions) {
            var element = document.getElementById(characterActions[action])
            if (character.availableActions().includes(action)) {
                element.disabled = false
                element.classList.remove('btn-disabled')
            } else {
                element.disabled = true
                element.classList.add('btn-disabled')
            }
        }
        for (item in items) {
            var element = document.getElementById(items[item])
            if (character.availableItems().includes(item)) {
                element.disabled = false
                element.classList.remove('btn-disabled')
            } else {
                element.disabled = true
                element.classList.add('btn-disabled')
            }
        }
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
        }
        this.updateActionInterface(player)
    }
    this.resetInitialState = function () {
        game = new Game
        player = game.characters.player
        enemy = game.characters.enemy
        game.updateDisplay()
    }
    this.checkForGameEnd = function () {
        characterDefeated = false
        for (characterType in this.characters) {
            if (this.characters[characterType].health <= 0) {
                characterDefeated = true
            }
        }
        if (characterDefeated) {
            this.resetInitialState()
        }
    }
    this.toggleEquippedItem = function (item, character) {
        if (character.equipment[item.slot] === item) {
            character.equipment[item.slot] = {}
        } else {
            character.equipment[item.slot] = item
        }
        game.updateActionInterface(character)
    }
    this.enemyAction = function (enemy=enemy, target=player) {
        if (enemy.availableActions().includes('moderateAttack')) {
            enemy.attack('moderateAttack', target)
        } else {
            enemy.attack('weakAttack', target)       
        }
    }
}

var Character = function (name, maxHealth = 500, baseHealthRegen = 0, maxEnergy = 100,
    baseEnergyRegen = 5, baseAttack = 1, baseDefense = 1) {
    this.name = name
    this.maxHealth = maxHealth
    this.health = this.maxHealth
    this.baseHealthRegen = baseHealthRegen
    this.maxEnergy = maxEnergy
    this.energy = this.maxEnergy
    this.baseEnergyRegen = baseEnergyRegen
    this.baseAttack = baseAttack
    this.baseDefense = baseDefense
    this.equipment = {
        weapon: {},
        utility: {}
    }
    this.actionTypes = {
        weakAttack: {
            name: 'weak attack',
            baseEnergyCost: 0,
            baseDamage: 5
        },
        moderateAttack: {
            name: 'moderate attack',
            baseEnergyCost: 10,
            baseDamage: 10
        },
        strongAttack: {
            name: 'strong attack',
            baseEnergyCost: 20,
            baseDamage: 15
        }
    }
    this.calculateItemModifier = function (modType) {
        var out = 1
        for (slot in this.equipment) {
            if (!utilities.isEmptyObject(this.equipment[slot])) {
                out += this.equipment[slot][modType]
            }
        }
        return out
    }
    this.availableActions = function () {
        var out = []
        for (actionType in this.actionTypes)
            if (this.energy >= this.actionTypes[actionType].baseEnergyCost * this.calculateItemModifier('energyCostMod')) {
                out.push(actionType)
            }
        return out
    }
    this.availableItems = function () {
        var out = []
        for (itemType in game.availableItems) {
            if (game.availableItems[itemType].numUses > 0) {
                out.push(itemType)
            }
        }
        return out
    }
    this.regenerateAttribute = function (attribute) {
        var attributeProperties = {
            health:
            {
                max: 'maxHealth',
                base: 'baseHealthRegen',
                mod: 'healthRegenMod'
            },
            energy: {
                max: 'maxEnergy',
                base: 'baseEnergyRegen',
                mod: 'energyRegenMod'
            }
        }
        var max = attributeProperties[attribute].max
        var base = attributeProperties[attribute].base
        var mod = attributeProperties[attribute].mod

        this[attribute] += this[base] * this.calculateItemModifier(mod)
        if (this[attribute] > this[max]) {
            this[attribute] = this[max]
        }
        if (this[attribute] < 0) {
            this[attribute] = 0
        }
    }
    this.attack = function (type, target) {
        console.log(this, target)
        var damage = Math.round((this.baseAttack + this.actionTypes[type].baseDamage) * this.calculateItemModifier('attackMod'))
        var energyCost = Math.round(this.actionTypes[type].baseEnergyCost * this.calculateItemModifier('energyCostMod'))
        var enemyDefense = Math.round(target.baseDefense * target.calculateItemModifier('defenseMod'))

        //decrease target character health by difference between attacker attack defender defense
        //if defense modifier greater or equal, attack deals no damage
        damage -= enemyDefense

        if (enemyDefense > damage) {
            damage = 0
        }
        target.health -= damage
        if (target.health < 0) {
            target.health = 0
        }

        this.energy -= energyCost
        this.regenerateAttribute('energy')
        this.regenerateAttribute('health')
        game.currentTurn += 1
        game.updateDisplay()
        game.checkForGameEnd()
        if (this === player) {
            game.enemyAction(enemy)
        }
    }
}

var Item = function (name, numUses, slot, attackMod = 1, defenseMod = 1, energyCostMod = 1, energyRegenMod = 1, healthRegenMod = 1) {
    this.name = name
    this.numUses = numUses
    this.slot = slot
    this.attackMod = attackMod
    this.defenseMod = defenseMod
    this.energyCostMod = energyCostMod
    this.energyRegenMod = energyRegenMod
    this.healthRegenMod = energyRegenMod
}

// Initialize Game
var player; var enemy
var utilities = new Utilities()
var game = new Game()
var player = game.characters.player
var enemy = game.characters.enemy
game.updateDisplay()
