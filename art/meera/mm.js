var X = [19000,23000,27000,31000,35000,39000,44000,51000,63000,67000,71000,75000,79000,83000,88000,95000,107000,111000,115000,119000,123000,127000,132000,139000,141000,148000,159000,163000,167000,171000,175000,179000,184000,191000,195250,200000,208750,216500,216510,225000,225500,233000,234250,241000,244750,249000,249500,253000]
var N = 0;

function advance() {
    let tag = ".p" + N
    let els = document.querySelectorAll(tag)
    for (var i = 0; i < els.length; i++) {
        els[i].classList.remove('hidden')
        $(els[i]).hide();
        $(els[i]).fadeIn()
        els[i].classList.add('jiggle')
        els[i].scrollIntoView({block: "center", behavior:"smooth"})
    }
    if (++N < X.length)
        setTimeout(advance, X[N]-X[N-1])
}
function start() {
    $('#btn').fadeOut()
    
    var a = new Audio('https://art.nonlinearmedia.org/meera/phantom.mp3')
    a.addEventListener('playing', (event) => { setTimeout(advance, X[0]) })
    a.addEventListener('ended', (event) => { $('#main').fadeOut(); })
    a.play()
}

