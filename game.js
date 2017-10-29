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
    this.availableItems = {
        plasmaRounds: {
            name: 'Plasma Rounds',
            obj: new Item('Plasma Rounds', 10, 'weapon', 1.5, 1, 3, 0.5),
            id: 'plasma-rounds'
        },
        pulseRounds: {
            name: 'Pulse Rounds',
            obj: new Item('Pulse Rounds', Infinity, 'weapon', 1.2, 1, 2, 0.5),
            id: 'pulse-rounds'
        },
        barrier: {
            name: 'Barrier',
            obj: new Item('Barrier', Infinity, 'utility', 1, 2, 1.5, 1, 0),
            id: 'barrier'
        },
        recharger: {
            name: 'Recharger',
            obj: new Item('Recharger', 5, 'utility', 1, 1, 1, 1.5, 0),
            id: 'recharger'
        }
    }
    this.availableAttacks = {
        singleShot: {
            name: 'Single Shot',
            id: 'single-shot',
            baseEnergyCost: 0,
            baseDamage: 5
        },
        burstFire: {
            name: 'Burst Fire',
            id: 'burst-fire',
            baseEnergyCost: 10,
            baseDamage: 15
        },
        overcharge: {
            name: 'Overcharge',
            id: 'overcharge',
            baseEnergyCost: 20,
            baseDamage: 25
        },
    }
    this.characters = {
        player: new Character('Test Player'),
        enemy: new Character('Test Enemy')
    }
    this.drawActionInterface = function () {
        var itemInterfaceHTML = ''
        var attackInterfaceHTML = ''
        for (item in this.availableItems) {
            itemInterfaceHTML += `<button id='${this.availableItems[item].id}' 
                                  onclick='game.toggleEquippedItem("${item}", player)'>
                                  ${this.availableItems[item].name}</button>`
        }
        for (attack in this.availableAttacks) {
            attackInterfaceHTML += `<button id='${this.availableAttacks[attack].id}' 
                                    onclick='player.attack("${attack}", enemy)'>
                                    ${this.availableAttacks[attack].name}</button>`
        }
        document.getElementById('item-interface').innerHTML = itemInterfaceHTML
        document.getElementById('attack-interface').innerHTML = attackInterfaceHTML
    }
    this.updateActionInterface = function (character) {
        for (attack in this.availableAttacks) {
            var element = document.getElementById(this.availableAttacks[attack].id)
            if (character.availableActions().includes(attack)) {
                element.disabled = false
                element.classList.remove('btn-disabled')
            } else {
                element.disabled = true
                element.classList.add('btn-disabled')
            }
        }
        for (item in this.availableItems) {
            var element = document.getElementById(this.availableItems[item].id)
            if (character.availableItems().includes(this.availableItems[item].obj)) {
                element.disabled = false
                element.classList.remove('btn-disabled')
            } else {
                element.disabled = true
                element.classList.add('btn-disabled')
            }
            if (character.equipment[this.availableItems[item].obj.slot] === this.availableItems[item].obj) {
                element.classList.add('btn-equipped')
            } else {
                element.classList.remove('btn-equipped')
            }

        }
        console.log('equipment: ', character.equipment)
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
    this.newGame = function () {
        game = new Game()
        game.setInitialState()
    }
    this.setInitialState = function () {
        player = game.characters.player
        enemy = game.characters.enemy
        game.drawActionInterface()
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
            this.newGame()
        }
    }
    this.toggleEquippedItem = function (item, character) {
        if (character.equipment[this.availableItems[item].obj.slot] === this.availableItems[item].obj) {
            character.equipment[this.availableItems[item].obj.slot] = {}
        } else {
            character.equipment[this.availableItems[item].obj.slot] = this.availableItems[item].obj
        }
        game.updateActionInterface(character)
    }
    this.enemyAction = function (enemy = enemy, target = player) {
        if (enemy.availableActions().includes('burstFire')) {
            enemy.attack('burstFire', target)
        } else {
            enemy.attack('singleShot', target)
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
        for (actionType in game.availableAttacks)
            if (this.energy >= game.availableAttacks[actionType].baseEnergyCost * this.calculateItemModifier('energyCostMod')) {
                out.push(actionType)
            }
        return out
    }
    this.availableItems = function () {
        var out = []
        for (itemType in game.availableItems) {
            console.log(game.availableItems[itemType].obj)
            if (game.availableItems[itemType].obj.numUses > 0) {
                out.push(game.availableItems[itemType].obj)
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
        var damage = Math.round((this.baseAttack + game.availableAttacks[type].baseDamage) * this.calculateItemModifier('attackMod'))
        var energyCost = Math.round(game.availableAttacks[type].baseEnergyCost * this.calculateItemModifier('energyCostMod'))
        var enemyDefense = Math.round(target.baseDefense * target.calculateItemModifier('defenseMod'))

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
        game.updateDisplay()
        game.checkForGameEnd()
        if (this === player) {
            game.currentTurn += 1
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
var player; var enemy;
var utilities = new Utilities()
var game = new Game()
game.setInitialState()
