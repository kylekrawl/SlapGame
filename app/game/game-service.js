function GameService() {

    // PRIVATE

    var utility; var game;

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

    function GameInstance() {
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

        this.characterDefeated = function characterDefeated() {
            defeated = false
            for (var characterType in this.characters) {
                if (this.characters[characterType].attributes.hull.current <= 0) {
                    defeated = true
                }
            }
            return defeated
        }

        this.toggleEquippedItem = function toggleEquippedItem(item, character) {
            if (character.equipment[this.items[item].obj.slot] === this.items[item].obj) {
                character.equipment[this.items[item].obj.slot] = {}
            } else {
                character.equipment[this.items[item].obj.slot] = this.items[item].obj
            }
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

    // PUBLIC

    this.initializeFirstGame = function initializeFirstGame() {
        utility = new Utility()
        game = new GameInstance()
        game.setInitialState()
    }

    this.getCurrentGameInstance = function getCurrentGameInstance() {
        return JSON.parse(JSON.stringify(game))
    }

    this.getCharacter = function getCharacter(type) {
        var game = this.getCurrentGameInstance()
        console.log(type, game.characters[type])
        if (game.characters.hasOwnProperty(type)) {
            return game.characters[type]
        }
    }

    this.getGameDict = function getGameDict(dict) {
        var game = this.getCurrentGameInstance()
        if (game.hasOwnProperty(dict)) {
            return game[dict]
        }
    }

    this.getCharacterName = function getCharacterName(type) {
        return this.getCharacter(type).name
    }

    this.getCharacterAttribute = function getCharacterAttribute(type, attribute) {
        var character = this.getCharacter(type)
        if (character.attributes.hasOwnProperty(attribute)) {
            return character.attributes[attribute]
        }
    }

    this.getCharacterItemModifier = function getCharacterItemModifier(charType, attribute, attributeType) {
        var character = this.getCharacter(charType)
        console.log(character)
        return character.calculateItemModifier(attribute, attributeType)
    }

    this.getCurrentTurn = function getCurrentTurn() {
        return this.getCurrentGameInstance().currentTurn
    }

    this.incrementTurn = function incrementTurn() {
        game.currentTurn++
    }

    this.newGame = function newGame() {
        game = new GameInstance()
    }
}