// Initialize Globals

var utilities; var game;

// Constructors

function Utility() {
    this.isEmptyObject = function isEmptyObject(obj) {
        var empty = true
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                empty = false
            }
        }
        return empty
    }
    this.getRandomNumber = function getRandomNumber(min = 0, max = 1) {
        return Math.random() * (max - min) + min
    }
    this.randomArrayChoice = function randomArrayChoice(arr) {
        return arr[Math.floor(getRandomNumber(0, arr.length))]
    }
    this.capitalize = function capitalize(str) {
        return str.replace(str[0], str[0].toUpperCase())
    }
}

function Game() {
    this.currentTurn = 1
    this.characters = {
        player: new Character('Seraph mk5', 'player'),
        enemy: new Character('Space Pirate', 'enemy')
    }
    this.items = {
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
            obj: new Item('Barrier', 5, 'utility', 0, 2, 1.5, -1),
            id: 'barrier'
        },
        recharger: {
            name: 'Recharger',
            obj: new Item('Recharger', 5, 'utility', 0, 0, 0, 1.5),
            id: 'recharger'
        }
    }
    this.attacks = {
        singleShot: {
            name: 'Single Shot',
            id: 'single-shot',
            baseCost: {
                energy: 0
            },
            baseDamage: {
                hull: 5
            }
        },
        burstFire: {
            name: 'Burst Fire',
            id: 'burst-fire',
            baseCost: {
                energy: 10
            },
            baseDamage: {
                hull: 15
            }
        },
        overcharge: {
            name: 'Overcharge Shot',
            id: 'overcharge',
            baseCost: {
                energy: 20
            },
            baseDamage: {
                hull: 25
            }
        },
    }
    this.statusInfo = {
        styleClasses: {
            normal: 'status-normal',
            warning: 'status-warning',
            critical: 'status-critical'
        },
        targets: {
            hullCondition: {
                id: 'hull-condition',
                messages: {
                    normal: "Hull Condition Normal",
                    warning: "Warning: Significant Hull Damage",
                    critical: "DANGER: Hull Condition Critical"
                }
            },
            powerLevel: {
                id: 'power-level',
                messages: {
                    normal: "Power Level Normal",
                    warning: "Warning: Low Power Level",
                    critical: "Warning: Power Level Critical"
                }
            },
            combatStatus: {
                id: 'combat-status',
                messages: {
                    normal: "Enemy Combatant Destroyed",
                    warning: "Status: Pilot In Combat",
                    critical: "COMMUNICATION LOST"
                }
            }
        }
    }
    this.statBarInfo = {
        player: {
            hull: {
                wrapperId: 'player-hull-bar-wrapper',
                barId: 'player-hull-bar',
                statId: 'player-hull',
                styleClass: 'hull-bar',
            },
            energy: {
                wrapperId: 'player-energy-bar-wrapper',
                barId: 'player-energy-bar',
                statId: 'player-energy',
                styleClass: 'energy-bar',
            }
        },
        enemy: {
            hull: {
                wrapperId: 'enemy-hull-bar-wrapper',
                barId: `enemy-hull-bar`,
                statId: 'enemy-hull',
                styleClass: 'hull-bar',
            },
            energy: {
                wrapperId: 'enemy-energy-bar-wrapper',
                barId: `enemy-energy-bar`,
                statId: 'enemy-energy',
                styleClass: 'energy-bar',
            }
        }
    }
    this.imageInfo = {
        player: {
            wrapperId: 'player-image-wrapper',
            default: {
                idle: 'images/player-default-idle.png',
                attack: 'images/player-default-attack.png'
            },
            pulse: {
                idle: 'images/player-pulse-idle.png',
                attack: 'images/player-pulse-attack.png'
            },
            plasma: {
                idle: 'images/player-plasma-idle.png',
                attack: 'images/player-plasma-attack.png'
            }
        },
        enemy: {
            wrapperId: 'enemy-image-wrapper',
            default: {
                idle: 'images/enemy-default-idle.png',
                attack: 'images/enemy-default-attack.png'
            }
        }
    }
    this.disableInterface = function disableInterface(id) {
        var interface = document.getElementById(id)
        interface.classList.add('disabled-interface')
    }
    this.enableInterface = function enableInterface(id) {
        var interface = document.getElementById(id)
        interface.classList.remove('disabled-interface')
    }
    this.drawActionInterface = function drawActionInterface() {
        var itemInterfaceHTML = ''
        var attackInterfaceHTML = ''
        for (var item in game.items) {
            itemInterfaceHTML += `<button id='${this.items[item].id}' class='btn-main'
                                      onclick='game.toggleEquippedItem("${item}", game.characters.player)'>
                                      ${this.items[item].name}<br>${this.items[item].obj.numUses === Infinity ? '∞' :
                    game.items[item].obj.numUses}</button>`
        }
        for (var attack in game.attacks) {
            attackInterfaceHTML += `<button id='${game.attacks[attack].id}' class='btn-main'
                                        onclick='game.characters.player.attackEvent("${attack}", game.characters.enemy)'>
                                        ${game.attacks[attack].name}</button>`
        }
        document.getElementById('item-interface').innerHTML = itemInterfaceHTML
        document.getElementById('attack-interface').innerHTML = attackInterfaceHTML
    }
    this.updateActionInterface = function updateActionInterface(character) {
        this.drawActionInterface()
        for (var attack in game.attacks) {
            var element = document.getElementById(game.attacks[attack].id)
            if (character.availableActions().includes(attack)) {
                element.disabled = false
                element.classList.remove('btn-disabled')
            } else {
                element.disabled = true
                element.classList.add('btn-disabled')
            }
        }
        for (var item in game.items) {
            var element = document.getElementById(game.items[item].id)
            if (character.equipment[game.items[item].obj.slot] === game.items[item].obj) {
                element.classList.add('btn-equipped')
            } else {
                element.classList.remove('btn-equipped')
            }
            if (character.availableItems().includes(game.items[item].obj)) {
                element.disabled = false
                element.classList.remove('btn-disabled')
            } else {
                element.disabled = true
                element.classList.add('btn-disabled')
                element.classList.remove('btn-equipped')
            }
        }
    }
    this.applyStatusStyles = function applyStatusStyles(target, status) {
        var element = document.getElementById(this.statusInfo.targets[target].id)
        var styleClasses = this.statusInfo.styleClasses
        for (var statusType in styleClasses) {
            if (statusType === status) {
                element.classList.add(styleClasses[statusType])
            } else {
                element.classList.remove(styleClasses[statusType])
            }
        }
    }

    this.setStatusMessage = function setStatusMessage(target, status) {
        var element = document.getElementById(this.statusInfo.targets[target].id)
        var statusMessages = this.statusInfo.targets[target].messages
        for (var statusType in statusMessages) {
            if (statusType === status) {
                element.innerText = statusMessages[status]
            }
        }
    }
    this.updateStatusMessages = function updateStatusMessages() {
        var player = this.characters.player
        var enemy = this.characters.enemy
        if (player.attributes.hull.current > player.attributes.hull.base / 2) {
            this.setStatusMessage('hullCondition', 'normal')
            this.applyStatusStyles('hullCondition', 'normal')
        } else if (player.attributes.hull.current > player.attributes.hull.base / 10) {
            this.setStatusMessage('hullCondition', 'warning')
            this.applyStatusStyles('hullCondition', 'warning')
        } else {
            this.setStatusMessage('hullCondition', 'critical')
            this.applyStatusStyles('hullCondition', 'critical')
        }
        if (player.attributes.energy.current > player.attributes.energy.base / 2) {
            this.setStatusMessage('powerLevel', 'normal')
            this.applyStatusStyles('powerLevel', 'normal')
        } else if (player.attributes.energy.current > player.attributes.energy.base / 10) {
            this.setStatusMessage('powerLevel', 'warning')
            this.applyStatusStyles('powerLevel', 'warning')
        } else {
            this.setStatusMessage('powerLevel', 'critical')
            this.applyStatusStyles('powerLevel', 'critical')
        }
        if (enemy.attributes.hull.current > 0) {
            this.setStatusMessage('combatStatus', 'warning')
            this.applyStatusStyles('combatStatus', 'warning')
        } else {
            this.setStatusMessage('combatStatus', 'normal')
            this.applyStatusStyles('combatStatus', 'normal')
        }
        if (player.attributes.hull.current <= 0) {
            this.setStatusMessage('combatStatus', 'critical')
            this.applyStatusStyles('combatStatus', 'critical')
        }
    }

    this.drawCharacterStatBars = function drawCharacterStatBars(character) {
        var statBars = this.statBarInfo[character.type]
        for (var statType in statBars) {
            var statBarHTML = `<span>${utility.capitalize(statType)}</span>
                                   <div class="stat-bar">
                                        <div id="${statBars[statType].barId}" class="progress-bar ${statBars[statType].styleClass}" role="progressbar" 
                                        aria-valuenow="${character[statType]}" aria-valuemin="0" aria-valuemax="${character[statBars[statType].base]}" style="width: 
                                        ${Math.round(character.attributes[statType].current / character.attributes[statType].base * 100)}%">
                                            <span id="${statBars[statType].statId}">${character.attributes[statType].current}</span>
                                        </div>
                                   </div>`
            document.getElementById(statBars[statType].wrapperId).innerHTML = statBarHTML
        }
    }
    this.updateCharacterImage = function updateCharacterImage(character, imageType) {

        var imageObj = this.imageInfo[character.type]
        var imageWrapper = document.getElementById(imageObj.wrapperId)
        var equippedItemType
        if (character.equipment.weapon === game.items['pulseRounds'].obj) {
            equippedItemType = 'pulse'
        } else if (character.equipment.weapon === game.items['plasmaRounds'].obj) {
            equippedItemType = 'plasma'
        } else {
            equippedItemType = 'default'
        }
        imageWrapper.innerHTML = `<img src="${imageObj[equippedItemType][imageType]}" class="character-image">`
    }
    this.drawOverlay = function drawOverlay(duration = 2000, mode = 'default') {
        var overlay = document.getElementById('overlay')
        if (mode === 'defeat') {
            overlay.classList.add('defeat-screen')
        }
        if (mode === 'victory') {
            overlay.classList.add('victory-screen')
        }
        overlay.classList.remove('hidden')
        setTimeout(function () {
            overlay.classList.add('hidden')
            if (mode === 'defeat') {
                overlay.classList.remove('defeat-screen')
            }
            if (mode === 'victory') {
                overlay.classList.remove('victory-screen')
            }
        }, duration)
    }
    this.drawDisplay = function drawDisplay(mode = 'update') {
        var attributeInfo = {
            initialize: [
                {
                    id: 'player-name',
                    value: `- ${this.characters.player.name} -`
                },
                {
                    id: 'enemy-name',
                    value: `- ${this.characters.enemy.name} -`
                },
    
            ],
            update: [
                {
                    id: 'turn',
                    value: this.currentTurn
                },
                {
                    id: 'player-energy-regen',
                    value: `${Math.round(this.characters.player.attributes.energy.baseRegen * this.characters.player.calculateItemModifier('energy', 'regen'))}`
                },
                {
                    id: 'player-defense-mod',
                    value: `${Math.round(this.characters.player.attributes.defenseRating.base * this.characters.player.calculateItemModifier('defenseRating', 'base'))}x`
                },
                {
                    id: 'player-attack-mod',
                    value: `${Math.round(this.characters.player.attributes.attackRating.base * this.characters.player.calculateItemModifier('attackRating', 'base'))}x`
                }
            ]
        }
        var player = this.characters.player
        var enemy = this.characters.enemy
        var statArray = attributeInfo[mode]
        for (var i = 0; i < statArray.length; i++) {
            var stat = statArray[i]
            document.getElementById(stat.id).innerText = stat.value
        }
        this.updateActionInterface(player)
        this.drawCharacterStatBars(player)
        this.drawCharacterStatBars(enemy)
        this.updateStatusMessages()
    }
    this.newGame = function newGame() {
        game = new Game()
        game.drawOverlay()
        game.setInitialState()
    }
    this.setInitialState = function setInitialState() {
        var player = this.characters.player
        var enemy = this.characters.enemy
        document.getElementById('player-wrapper').classList.remove('defeated')
        document.getElementById('enemy-wrapper').classList.remove('defeated')
        this.updateCharacterImage(player, 'idle')
        this.updateCharacterImage(enemy, 'idle')
        this.drawActionInterface()
        this.enableInterface('item-interface')
        this.enableInterface('attack-interface')
        this.drawDisplay('initialize')
        this.drawDisplay()
    }
    this.checkForGameEnd = function checkForGameEnd() {
        var player = this.characters.player
        var enemy = this.characters.enemy
        characterDefeated = false
        for (var characterType in this.characters) {
            if (this.characters[characterType].attributes.hull.current <= 0) {
                characterDefeated = true
            }
        }
        if (characterDefeated) {
            this.disableInterface('item-interface')
            this.disableInterface('attack-interface')
            if (player.attributes.hull.current <= 0) {
                player.attributes.energy.current = 0
                this.updateStatusMessages()
                document.getElementById('player-wrapper').classList.add('defeated')
                this.drawOverlay(3000, 'defeat')
            } else {
                document.getElementById('enemy-wrapper').classList.add('defeated')
                this.drawOverlay(3000, 'victory')
            }
            setTimeout(this.newGame, 3000)
        }
    }
    this.toggleEquippedItem = function toggleEquippedItem(item, character) {
        if (character.equipment[this.items[item].obj.slot] === this.items[item].obj) {
            character.equipment[this.items[item].obj.slot] = {}
        } else {
            character.equipment[this.items[item].obj.slot] = this.items[item].obj
        }
        this.updateActionInterface(character)
        this.updateCharacterImage(character, 'idle')
        this.drawDisplay()
    }
    this.enemyAction = function enemyAction(enemy = this.characters.enemy, target = this.characters.player) {
        //TODO: Add greater range of enemy behaviors
        if (enemy.availableActions().includes('burstFire')) {
            enemy.attackEvent('burstFire', target)
        } else {
            enemy.attackEvent('singleShot', target)
        }
    }
}

function Character(name, type, baseHull = 200, baseHullRegen = 0, baseEnergy = 100,
    baseEnergyRegen = 5, baseAttackRating = 1, baseDefenseRating = 1) {
    this.name = name
    this.type = type
    this.attributes = {
        hull: {
            name: "Hull",
            base: baseHull,
            current: baseHull,
            baseRegen: baseHullRegen
        },
        energy: {
            name: "Energy",
            base: baseEnergy,
            current: baseEnergy,
            baseRegen: baseEnergyRegen
        },
        attackRating: {
            name: "Attack Rating",
            base: baseAttackRating,
            current: baseAttackRating,
            baseRegen: 0
        },
        defenseRating: {
            name: "Defense Rating",
            base: baseDefenseRating,
            current: baseDefenseRating,
            baseRegen: 0
        }
    }
    this.equipment = {
        weapon: {},
        utility: {}
    }
    this.calculateItemModifier = function calculateItemModifier(attribute, type) {
        var out = 1
        for (var slot in this.equipment) {
            if (!utility.isEmptyObject(this.equipment[slot])) {
                out += this.equipment[slot].mods[attribute][type]
            }
        }
        return out
    }

    this.availableActions = function availableActions() {
        var out = []
        for (var attack in game.attacks) {
            out.push(attack)
            var attributeCosts = game.attacks[attack].baseCost
            for (var attribute in attributeCosts) {
                if (!(this.attributes[attribute].current >= attributeCosts[attribute] * this.calculateItemModifier(attribute, 'base'))) {
                    out.splice(out.indexOf(attack), 1)
                }
            }
        }
        return out
    }
    this.availableItems = function availableItems() {
        var out = []
        for (var itemType in game.items) {
            if (game.items[itemType].obj.numUses > 0) {
                out.push(game.items[itemType].obj)
            }
            if (game.items[itemType].obj.numUses <= 0 && this.equipment[game.items[itemType].obj.slot] === game.items[itemType].obj) {
                this.equipment[game.items[itemType].obj.slot] = {}
            }
        }
        return out
    }
    this.regenerateAttribute = function regenerateAttribute(attribute) {
        var baseAttribute = this.attributes[attribute]
        var baseRegen = baseAttribute.baseRegen
        baseAttribute.current += baseRegen * this.calculateItemModifier(attribute, 'base')
        if (baseAttribute.current > baseAttribute.base) {
            this.attributes[attribute].current = baseAttribute.base
        }
        if (baseAttribute.current < 0) {
            this.attributes[attribute].current = 0
        }
    }
    this.attack = function attack(type, target) {
        //TODO: implement functionality for damage and costs for stats other than hull and energy (respectively)
        var damage = Math.round(utility.getRandomNumber(0.6, 1) * (this.attributes.attackRating.base + game.attacks[type].baseDamage.hull) * 
        this.calculateItemModifier('attackRating', 'base'))
        var energyCost = Math.round(game.attacks[type].baseCost.energy * this.calculateItemModifier('energy', 'base'))
        var enemyDefense = Math.round(target.attributes.defenseRating.base * target.calculateItemModifier('defenseRating', 'base'))

        damage -= enemyDefense

        if (enemyDefense > damage) {
            damage = 0
        }
        target.attributes.hull.current -= damage
        if (target.attributes.hull.current < 0) {
            target.attributes.hull.current = 0
        }

        this.attributes.energy.current -= energyCost
        this.regenerateAttribute('energy')
        this.regenerateAttribute('hull')

        for (var slot in this.equipment) {
            if (this.equipment[slot].numUses > 0) {
                this.equipment[slot].numUses -= 1
            }
        }
        game.drawDisplay()
        game.checkForGameEnd()
    }
    this.attackEvent = function attackEvent(type, target) {
        var player = game.characters.player
        var enemy = game.characters.enemy
        var character = this
        game.updateCharacterImage(this, 'attack')
        character.attack(type, target)
        game.disableInterface('attack-interface')
        game.disableInterface('item-interface')
        setTimeout(function () {
            game.updateCharacterImage(character, 'idle')
            if (character === player) {
                game.currentTurn += 1
                game.enemyAction(enemy)
            }
        }, 500)
        setTimeout(function () {
            game.enableInterface('attack-interface')
            game.enableInterface('item-interface')
        }, 1000)
    }
}

function Item(name, numUses, slot, baseAttackMod = 0, baseDefenseMod = 0, energyCostMod = 0,
    energyRegenMod = 0, hullCostMod = 0, hullRegenMod = 0) {
    this.name = name
    this.numUses = numUses
    this.slot = slot
    this.mods = {
        hull: {
            base: hullCostMod,
            regen: hullRegenMod
        },
        energy: {
            base: energyCostMod,
            regen: energyRegenMod
        },
        attackRating: {
            base: baseAttackMod,
            regen: 0
        },
        defenseRating: {
            base: baseDefenseMod,
            regen: 0
        }
    }
}

// Initialize Game
var utility = new Utility()
var game = new Game()
game.setInitialState()
