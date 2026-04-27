// SCROLL ANIMATION
const cards = document.querySelectorAll('.card');

window.addEventListener('scroll', ()=>{
    cards.forEach(card=>{
        let posisi = card.getBoundingClientRect().top;
        let layar = window.innerHeight;

        if(posisi < layar - 100){
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }
    });
});

// GANTI FOTO (ANTI ERROR)
document.getElementById("profileImg").addEventListener("click", function(){
    let url = prompt("Masukkan link foto baru:");
    if(url && url.startsWith("http")){
        this.src = url;
    }else{
        alert("Link tidak valid 😅");
    }
});

// PARALLAX EFFECT
window.addEventListener("scroll", function(){
    let scroll = window.scrollY;
    document.querySelector(".hero").style.backgroundPositionY = scroll * 0.5 + "px";
});