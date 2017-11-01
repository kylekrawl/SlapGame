function GameController() {

    // PRIVATE

    var gameService = new GameService()
   
    function disableInterface(id) {
        var interface = document.getElementById(id)
        interface.classList.add('disabled-interface')
    }

    function enableInterface(id) {
        var interface = document.getElementById(id)
        interface.classList.remove('disabled-interface')
    }
    
    function drawActionInterface() {
        var itemInterfaceHTML = ''
        var attackInterfaceHTML = ''
        var items = gameService.getGameDict('items')
        var attacks = gameService.getGameDict('attacks')
        for (var item in items) {
            itemInterfaceHTML += `<button id='${items[item].id}' class='btn-main'
                                      onclick='app.controllers.gameController.toggleEquippedItem("${item}", app.controllers.gameController.gameService.getCharacter('player')'>
                                      ${items[item].name}<br>${items[item].obj.numUses === Infinity ? '∞' :
                                      items[item].obj.numUses}</button>`
        }
        for (var attack in attacks) {
            attackInterfaceHTML += `<button id='${attacks[attack].id}' class='btn-main'
                                        onclick='app.controllers.gameController.attackEvent("${attack}", app.controllers.gameController.gameService.getCharacter('player'),
                                        app.controllers.gameController.gameService.getCharacter('enemy')'>
                                        ${attacks[attack].name}</button>`
        }
        document.getElementById('item-interface').innerHTML = itemInterfaceHTML
        document.getElementById('attack-interface').innerHTML = attackInterfaceHTML
    }
    function updateActionInterface(character) {
        this.drawActionInterface()
        var attacks = gameService.getGameDict('attacks')
        var items = gameService.getGameDict('items')
        for (var attack in attacks) {
            var element = document.getElementById(attacks[attack].id)
            if (character.availableActions().includes(attack)) {
                element.disabled = false
                element.classList.remove('btn-disabled')
            } else {
                element.disabled = true
                element.classList.add('btn-disabled')
            }
        }
        for (var item in items) {
            var element = document.getElementById(items[item].id)
            if (character.equipment[items[item].obj.slot] === items[item].obj) {
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
    function applyStatusStyles(target, status) {
        var statusInfo = gameService.getGameDict('statusInfo')
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

    function setStatusMessage(target, status) {
        var statusInfo = gameService.getGameDict('statusInfo')
        var element = document.getElementById(statusInfo.targets[target].id)
        var statusMessages = statusInfo.targets[target].messages
        for (var statusType in statusMessages) {
            if (statusType === status) {
                element.innerText = statusMessages[status]
            }
        }
    }

    function updateStatusMessages() {
        var player = gameService.getCharacter('player')
        var enemy = gameService.getCharacter('enemy')
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

    function drawCharacterStatBars(character) {
        var statBarInfo = gameService.getGameDict('statBarInfo')
        var statBars = statBarInfo[character.type]
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

    function updateCharacterImage(character, imageType) {
        var imageInfo = gameService.getGameDict('imageInfo')
        var items = gameService.getGameDict('items')
        var imageObj = imageInfo[character.type]
        var imageWrapper = document.getElementById(imageObj.wrapperId)
        var equippedItemType
        if (character.equipment.weapon === items['pulseRounds'].obj) {
            equippedItemType = 'pulse'
        } else if (character.equipment.weapon === items['plasmaRounds'].obj) {
            equippedItemType = 'plasma'
        } else {
            equippedItemType = 'default'
        }
        imageWrapper.innerHTML = `<img src="${imageObj[equippedItemType][imageType]}" class="character-image">`
    }

    function drawOverlay(duration = 2000, mode = 'default') {
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

    function drawDisplay(mode = 'update') {
        var attributeInfo = {
            initialize: [
                {
                    id: 'player-name',
                    value: `- ${gameService.getCharacterName('player')} -`
                },
                {
                    id: 'enemy-name',
                    value: `- ${gameService.getCharacterName('enemy')} -`
                },
    
            ],
            update: [
                {
                    id: 'turn',
                    value: gameService.getCurrentTurn()
                },
                {
                    id: 'player-energy-regen',
                    value: `${Math.round(gameService.getCharacterAttribute('player', 'energy').baseRegen * 
                    gameService.getCharacterItemModifier('player', 'energy', 'regen'))}`
                },
                {
                    id: 'player-defense-mod',
                    value: `${Math.round(gameService.getCharacterAttribute('player', 'defenseRating').base * 
                    gameService.getCharacter('player').calculateItemModifier('defenseRating', 'base'))}x`
                },
                {
                    id: 'player-attack-mod',
                    value: `${Math.round(gameService.getCharacterAttribute('player', 'attackRating').base * 
                    gameService.getCharacter('player').calculateItemModifier('attackRating', 'base'))}x`
                }
            ]
        }
        var player = gameService.getCharacter('player')
        var enemy = gameService.getCharacter('enemy')
        var attributeInfo = gameService.getGameDict('attributeInfo')
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

    function setInitialState() {
        var player = gameService.getCharacter('player')
        var enemy = gameService.getCharacter('enemy')
        document.getElementById('player-wrapper').classList.remove('defeated')
        document.getElementById('enemy-wrapper').classList.remove('defeated')
        updateCharacterImage(player, 'idle')
        updateCharacterImage(enemy, 'idle')
        drawActionInterface()
        enableInterface('item-interface')
        enableInterface('attack-interface')
        drawDisplay('initialize')
        drawDisplay()
    }

    function checkForGameEnd() {
        var player = gameService.getCharacter('player')
        var enemy = gameService.getCharacter('enemy')
        if (gameService.characterDefeated()) {
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

    // PUBLIC

    this.toggleEquippedItem = function toggleEquippedItem() {
        gameService.toggleEquippedItem()
        updateActionInterface(character)
        updateCharacterImage(character, 'idle')
        drawDisplay()
    }

    this.attackEvent = function attackEvent(type, actor, target) {
        var player = gameService.getCharacter('player')
        var enemy = gameService.getCharacter('enemy')
        var character = gameService.getCharacter(actor)
        updateCharacterImage(this, 'attack')
        character.attack(type, target)
        drawDisplay()
        checkForGameEnd()
        disableInterface('attack-interface')
        disableInterface('item-interface')
        setTimeout(function () {
            updateCharacterImage(character, 'idle')
            if (character === player) {
                gameService.incrementTurn()
                gameService.enemyAction(enemy)
            }
        }, 500)
        setTimeout(function () {
            enableInterface('attack-interface')
            enableInterface('item-interface')
        }, 1000)
    }

    this.initializeFirstGame = function initializeFirstGame() {
        gameService.initializeFirstGame()
        this.setInitialState()
    }

    this.newGame = function newGame() {
        gameService.newGame()
        drawOverlay()
        setInitialState()
    }

}