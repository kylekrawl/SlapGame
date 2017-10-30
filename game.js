var Utilities = function () {
    this.isEmptyObject = function (obj) {
        var empty = true
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                empty = false
            }
        }
        return empty
    }
    this.getRandomNumber = function (min = 0, max = 1) {
        return Math.random() * (max - min) + min
    }
    this.randomArrayChoice = function (arr) {
        return arr[Math.floor(getRandomNumber(0, arr.length))]
    }
    this.capitalize = function(str) {
        return str.replace(str[0], str[0].toUpperCase())
    }
}

//(name, numUses, slot, attackMod = 0, defenseMod = 0, energyCostMod = 0, energyRegenMod = 0, hullRegenMod = 0)
//(name, type, maxHull = 500, baseHullRegen = 0, maxEnergy = 100, baseEnergyRegen = 5, baseAttack = 1, baseDefense = 1)
var Game = function () {
    this.currentTurn = 1
    this.availableItems = {
        plasmaRounds: {
            name: 'Plasma Rounds',
            obj: new Item('Plasma Rounds', 3, 'weapon', 1.5, 0, 3, -0.5),
            id: 'plasma-rounds'
        },
        pulseRounds: {
            name: 'Pulse Rounds',
            obj: new Item('Pulse Rounds', Infinity, 'weapon', 1.2, 0, 1, -0.5),
            id: 'pulse-rounds'
        },
        barrier: {
            name: 'Barrier',
            obj: new Item('Barrier', Infinity, 'utility', 0, 2, 1.5, -1),
            id: 'barrier'
        },
        recharger: {
            name: 'Recharger',
            obj: new Item('Recharger', 5, 'utility', 0, 0, 0, 1.5),
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
            name: 'Overcharge Shot',
            id: 'overcharge',
            baseEnergyCost: 20,
            baseDamage: 25
        },
    }
    this.characters = {
        player: new Character('Test Player', 'player'),
        enemy: new Character('Test Enemy', 'enemy')
    }
    this.drawActionInterface = function () {
        var itemInterfaceHTML = ''
        var attackInterfaceHTML = ''
        for (var item in this.availableItems) {
            itemInterfaceHTML += `<button id='${this.availableItems[item].id}' class='btn-main'
                                  onclick='game.toggleEquippedItem("${item}", player)'>
                                  ${this.availableItems[item].name}</button>`
        }
        for (var attack in this.availableAttacks) {
            attackInterfaceHTML += `<button id='${this.availableAttacks[attack].id}' class='btn-main'
                                    onclick='player.attack("${attack}", enemy)'>
                                    ${this.availableAttacks[attack].name}</button>`
        }
        document.getElementById('item-interface').innerHTML = itemInterfaceHTML
        document.getElementById('attack-interface').innerHTML = attackInterfaceHTML
    }
    this.drawCharacterStatBars = function(character) {
        var statBars = {
            player: {
                hull: {
                    wrapperId: 'player-hull-bar-wrapper',
                    barId: 'player-hull-bar',
                    statId: 'player-hull',
                    styleClass: 'hull-bar',
                    max: 'maxHull'
                },
                energy: {
                    wrapperId: 'player-energy-bar-wrapper',
                    barId: 'player-energy-bar',
                    statId: 'player-energy',
                    styleClass: 'energy-bar',
                    max: 'maxEnergy'
                }
            },
            enemy: {
                hull: {
                    wrapperId: 'enemy-hull-bar-wrapper',
                    barId: `enemy-hull-bar`,
                    statId: 'enemy-hull',
                    styleClass: 'hull-bar',
                    max: 'maxHull'
                },
                energy: {
                    wrapperId: 'enemy-energy-bar-wrapper',
                    barId: `enemy-energy-bar`,
                    statId: 'enemy-energy',
                    styleClass: 'energy-bar',
                    max: 'maxEnergy'
                }
            }
        }
        for (var statType in statBars[character.type]) { 
            var statBarHTML = `<span>${utilities.capitalize(statType)}</span>
                               <div class="stat-bar">
                                    <div id="${statBars[character.type][statType].barId}" class="progress-bar ${statBars[character.type][statType].styleClass}" role="progressbar" 
                                    aria-valuenow="${character[statType]}" aria-valuemin="0" aria-valuemax="${character[statBars[character.type][statType].max]}" style="width: 
                                    ${Math.round(character[statType]/character[statBars[character.type][statType].max]*100)}%">
                                        <span id="${statBars[character.type][statType].statId}">${character[statType]}</span>
                                    </div>
                               </div>`
            document.getElementById(statBars[character.type][statType].wrapperId).innerHTML = statBarHTML
        }
    }
    this.updateActionInterface = function (character) {
        for (var attack in this.availableAttacks) {
            var element = document.getElementById(this.availableAttacks[attack].id)
            if (character.availableActions().includes(attack)) {
                element.disabled = false
                element.classList.remove('btn-disabled')
            } else {
                element.disabled = true
                element.classList.add('btn-disabled')
            }
        }
        for (var item in this.availableItems) {
            var element = document.getElementById(this.availableItems[item].id)
            if (character.equipment[this.availableItems[item].obj.slot] === this.availableItems[item].obj) {
                element.classList.add('btn-equipped')
            } else {
                element.classList.remove('btn-equipped')
            }
            if (character.availableItems().includes(this.availableItems[item].obj)) {
                element.disabled = false
                element.classList.remove('btn-disabled')
            } else {
                element.disabled = true
                element.classList.add('btn-disabled')
                element.classList.remove('btn-equipped')
            }
        }
    }
    this.updateStatusMessages = function () {
        var hullConditionMessage = document.getElementById('hull-condition')
        var powerLevelMessage = document.getElementById('power-level')
        var enemyStatusMessage = document.getElementById('enemy-status')
        if (player.hull > player.maxHull/2) {
            hullConditionMessage.innerText = "Hull Condition Normal"
            hullConditionMessage.classList.add('status-normal')
            hullConditionMessage.classList.remove('status-warning')
            hullConditionMessage.classList.remove('status-critical')
        } else if (player.hull > player.maxHull/10) {
            hullConditionMessage.innerText = "Warning: Significant Hull Damage"
            hullConditionMessage.classList.add('status-warning')
            hullConditionMessage.classList.remove('status-normal')
            hullConditionMessage.classList.remove('status-critical')
        } else {
            hullConditionMessage.innerText = "Warning: Hull Condition Critical"
            hullConditionMessage.classList.add('status-critical')
            hullConditionMessage.classList.remove('status-warning')
            hullConditionMessage.classList.remove('status-normal')
        }
        if (player.energy > player.maxEnergy/2) {
            powerLevelMessage.innerText = "Power Level Normal"
            powerLevelMessage.classList.add('status-normal')
            powerLevelMessage.classList.remove('status-warning')
            powerLevelMessage.classList.remove('status-critical')
        } else if (player.energy > player.maxEnergy/10) {
            powerLevelMessage.innerText = "Warning: Low Power Level"
            powerLevelMessage.classList.add('status-warning')
            powerLevelMessage.classList.remove('status-normal')
            powerLevelMessage.classList.remove('status-critical')
        } else {
            powerLevelMessage.innerText = "Warning: Power Level Critical"
            powerLevelMessage.classList.add('status-critical')
            powerLevelMessage.classList.remove('status-warning')
            powerLevelMessage.classList.remove('status-normal')
        }
        if (enemy.hull > 0) {
            enemyStatusMessage.innerText = "Status: Pilot In Combat"
            enemyStatusMessage.classList.add('status-warning')
            enemyStatusMessage.classList.remove('status-normal')
            enemyStatusMessage.classList.remove('status-critical')
        } else {
            enemyStatusMessage.innerText = "Enemy Combatant Destroyed"
            enemyStatusMessage.classList.add('status-normal')
            enemyStatusMessage.classList.remove('status-warning')
            enemyStatusMessage.classList.remove('status-critical')
        }
        if (player.hull <= 0) {
            enemyStatusMessage.innerText = "Communication Lost"
            enemyStatusMessage.classList.add('status-critical')
            enemyStatusMessage.classList.remove('status-normal')
            enemyStatusMessage.classList.remove('status-warning')
        }
    }
    this.disableInterface = function (id) {
        var interface = document.getElementById(id)
        interface.classList.add('disabled-interface')
    }
    this.enableInterface = function (id) {
        var interface = document.getElementById(id)
        interface.classList.remove('disabled-interface')
    }
    this.updateDisplay = function () {
        var elementsToUpdate = [
            {
                id: 'turn',
                value: this.currentTurn
            },
            {
                id: 'player-name',
                value: this.characters.player.name
            },
            {
                id: 'enemy-name',
                value: this.characters.enemy.name
            },
            {
                id: 'player-energy-regen',
                value: `+${Math.round(player.baseEnergyRegen * player.calculateItemModifier('energyRegenMod'))}`
            },
            {
                id: 'player-defense-mod',
                value: `${Math.round(player.baseDefense * player.calculateItemModifier('defenseMod'))}x`
            },
            {
                id: 'player-attack-mod',
                value: `${Math.round(player.baseAttack * player.calculateItemModifier('attackMod'))}x`
            }
        ]
        for (var i = 0; i < elementsToUpdate.length; i++) {
            var element = elementsToUpdate[i]
            document.getElementById(element.id).innerText = element.value
        }
        this.updateActionInterface(player)
        this.drawCharacterStatBars(player)
        this.drawCharacterStatBars(enemy)
        this.updateStatusMessages()
    }
    this.newGame = function () {
        game = new Game()
        game.setInitialState()
    }
    this.setInitialState = function () {
        player = game.characters.player
        enemy = game.characters.enemy
        game.drawActionInterface()
        this.enableInterface('item-interface')
        this.enableInterface('attack-interface')
        game.updateDisplay()
    }
    this.checkForGameEnd = function () {
        characterDefeated = false
        for (var characterType in this.characters) {
            if (this.characters[characterType].hull <= 0) {
                characterDefeated = true
            }
        }
        if (characterDefeated) {
            this.disableInterface('item-interface')
            this.disableInterface('attack-interface')
            setTimeout(this.newGame, 3000)
        }
    }
    this.toggleEquippedItem = function (item, character) {
        if (character.equipment[this.availableItems[item].obj.slot] === this.availableItems[item].obj) {
            character.equipment[this.availableItems[item].obj.slot] = {}
        } else {
            character.equipment[this.availableItems[item].obj.slot] = this.availableItems[item].obj
        }
        game.updateActionInterface(character)
        game.updateDisplay()
    }
    this.enemyAction = function (enemy = enemy, target = player) {
        if (enemy.availableActions().includes('burstFire')) {
            enemy.attack('burstFire', target)
        } else {
            enemy.attack('singleShot', target)
        }
    }
}

var Character = function (name, type, maxHull = 500, baseHullRegen = 0, maxEnergy = 100,
    baseEnergyRegen = 5, baseAttack = 1, baseDefense = 1) {
    this.name = name
    this.type = type
    this.maxHull = maxHull
    this.hull = this.maxHull
    this.baseHullRegen = baseHullRegen
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
        for (var slot in this.equipment) {
            if (!utilities.isEmptyObject(this.equipment[slot])) {
                out += this.equipment[slot][modType]
            }
        }
        return out
    }
    this.availableActions = function () {
        var out = []
        for (var actionType in game.availableAttacks)
            if (this.energy >= game.availableAttacks[actionType].baseEnergyCost * this.calculateItemModifier('energyCostMod')) {
                out.push(actionType)
            }
        return out
    }
    this.availableItems = function () {
        var out = []
        for (var itemType in game.availableItems) {
            if (game.availableItems[itemType].obj.numUses > 0) {
                out.push(game.availableItems[itemType].obj)
            }
            if (game.availableItems[itemType].obj.numUses <= 0 && this.equipment[game.availableItems[itemType].obj.slot] === game.availableItems[itemType].obj) {
                this.equipment[game.availableItems[itemType].obj.slot] = {}
            }
        }
        return out
    }
    this.regenerateAttribute = function (attribute) {
        var attributeProperties = {
            hull:
            {
                max: 'maxHull',
                base: 'baseHullRegen',
                mod: 'hullRegenMod'
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
        var damage = Math.round(utilities.getRandomNumber(0.6, 1) * (this.baseAttack + game.availableAttacks[type].baseDamage) * this.calculateItemModifier('attackMod'))
        var energyCost = Math.round(game.availableAttacks[type].baseEnergyCost * this.calculateItemModifier('energyCostMod'))
        var enemyDefense = Math.round(target.baseDefense * target.calculateItemModifier('defenseMod'))

        damage -= enemyDefense

        if (enemyDefense > damage) {
            damage = 0
        }
        target.hull -= damage
        if (target.hull < 0) {
            target.hull = 0
        }

        this.energy -= energyCost
        this.regenerateAttribute('energy')
        this.regenerateAttribute('hull')

        for (var slot in this.equipment) {
            if (this.equipment[slot].numUses > 0) {
                this.equipment[slot].numUses -= 1
            }
        }

        game.updateDisplay()
        game.checkForGameEnd()
        if (this === player) {
            game.currentTurn += 1
            game.enemyAction(enemy)
        }
    }
}

var Item = function (name, numUses, slot, attackMod = 0, defenseMod = 0, energyCostMod = 0, energyRegenMod = 0, hullRegenMod = 0) {
    this.name = name
    this.numUses = numUses
    this.slot = slot
    this.attackMod = attackMod
    this.defenseMod = defenseMod
    this.energyCostMod = energyCostMod
    this.energyRegenMod = energyRegenMod
    this.hullRegenMod = hullRegenMod
}

// Initialize Game
var player; var enemy;
var utilities = new Utilities()
var game = new Game()
game.setInitialState()
