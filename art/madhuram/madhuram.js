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
    
    var a = new Audio('madhuram.mp3')
    a.addEventListener('playing', (event) => { setTimeout(advance, X[0]) })
    a.addEventListener('ended', (event) => { $('#main').fadeOut(); })
    a.play()
}

var N = 0
var X = [
    43000,   
    46500, 
    50000,   
    53500, 
    57000,   
    127000,  
    130500,
    134000,  
    137500,
    158000,  
    214000,  
    217500,
    221000,  
    224500,
    243000,  
    286000,  
    289500,
    293000,  
    296500,
    300000,  
    303500,
    307000,
    310500,
    314000,
    330000,
    333500,
    337000,
    340500,
    344000,
    387000,
    390500,
    394000,
    397500,
    401000,
    404500,
    408000,
    411500 
]
