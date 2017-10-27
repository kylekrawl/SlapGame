var health
var name
var hits

function slap() {
    hits += 1
    health -= 1
    update(health)
}

function punch() {
    hits += 1
    health -= 5
    update(health)
}

function kick() {
    hits += 1
    health -= 10
    update(health)
}

function update() {
    if (health < 0) {
        health = 0
    }
    document.getElementById("health").innerText = health
    document.getElementById("hits").innerText = hits
}

function setInitialConditions(name) {
    document.getElementById("name").innerText = name
    health = 100
    hits = 0
    update()
}

setInitialConditions('Test')