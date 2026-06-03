function show(n) {                      // unhides page elems with id = pN
    let el = document.getElementById('p' + n)

    if (!el) return
    
    el.classList.remove('hidden');
    $(el).hide()
    $(el).fadeIn()
    el.scrollIntoView({block: "center", behavior:"smooth"})
}

function advance() {
    show(N) // shows pN
    if (++N <= LEN) {
        setTimeout(advance, 60000/70.0)
    }
}

function start() {
    $('#pottu').unbind('click', start)
    $('#pottu').css('cursor', 'default')
    
    var a = new Audio(mp3)

    show(0) // shows p0

    a.addEventListener('playing', (event) => { setTimeout(advance, t0) })
    a.addEventListener('ended', (event) => { $('#main').fadeOut(); })
    a.play()
}

$('#pottu').bind('click', start)
