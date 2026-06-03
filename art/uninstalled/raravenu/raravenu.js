
// Keep setting self-timers for every 1.5s (45 bpm) for 300 measures

var N = 0              // span number
var MAX_N = 260        // will gradually show spans p0 to p260, at 1.5s intervals
var MEASURE_DUR = 1420 // 42bpm = 1.428s beats

var enter_sound = new Audio('enter_sound.mp3');

function advance() {
    let tag = "p" + N
    let el = document.getElementById(tag)
    if (el) {
        el.classList.remove('hidden')
        $(el).hide();
        $(el).fadeIn()

        el.classList.add('jiggle')
        el.scrollIntoView({block: "center", behavior:"smooth"})
    }
    if (++N < MAX_N)
        setTimeout(advance, MEASURE_DUR)
}

function start() {
    var promise = enter_sound.play();
    if (promise !== undefined)
      promise.then(_ => {}).catch(_ => {});

    $('#btn').fadeOut()
    
    var a = new Audio('raravenu.mp3')
    var init_offset = 3000;

    a.addEventListener('playing', (event) => { setTimeout(advance, init_offset) })
    a.addEventListener('ended', (event) => { $('#main').fadeOut(); })
    a.play()
}

