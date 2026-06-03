function advance() {
    let tag = "p" + N
    let el = document.getElementById(tag)
    el.classList.remove('hidden')
    $(el).hide();
    $(el).fadeIn()

    el.classList.add('jiggle')
    el.scrollIntoView({block: "center", behavior:"smooth"})

    if (++N < X.length)
        setTimeout(advance, X[N]-X[N-1])
}

function start() {
    $('#btn').fadeOut()
    
    var a = new Audio('varaveena.mp3')
    a.addEventListener('playing', (event) => { setTimeout(advance, X[0]) })
    a.addEventListener('ended', (event) => { $('#main').fadeOut(); })
    a.play()
}

var N = 0
var X = [
    4000,    // varaveena
    8200,
    12000,
    16200,

    20800,  // suruchira
    24200,
    28000,
    32000,
    
    36100,  // nirupama
    40200,
    44200,
    48200,

    52200,  // varadaa
    56200,
    60100,
    64200,

    68200,  // sarasija
    72200,

    76200  // jaya jaya jaya
]
