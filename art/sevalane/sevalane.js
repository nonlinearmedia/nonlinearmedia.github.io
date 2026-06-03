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
    
    var a = new Audio('sevalane.mp3')
    a.addEventListener('playing', (event) => { setTimeout(advance, X[0]) })
    a.addEventListener('ended', (event) => { $('#main').fadeOut(); })
    a.play()
}

var N = 0
var X = [
    10000, // om1
    13400,
    16800,
    18500,

    23000, // sevalane
    24700,
    26400,
    28100,

    29800,
    31500,
    33200,
    34900,

    51000, // om2
    52700,
    54400,
    56100,

    71000, // eesanai
    72700,
    74400,
    76100,

    77800,
    79500,
    81200,
    82900,

    99000, // om3
   100700,
   102400,
   104100,
    
   147000, // kuzhalosai
   148700,
   150400,
   152100,

   153800,
   155500,
   157200,
   158900,

   178000, // paaril
   179700,
   181400,
   183100,

   184800,
   186500,
   188200,
   189900,

   205000, // om4

   233000, // sevalane
   236000, 
   239000,
   242000,

   245000 // om    
]
