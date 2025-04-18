async function carregarGaleria() {
  const response = await fetch("https://api.thedogapi.com/v1/breeds");
  const racas = await response.json();
  
  const galeria = document.getElementById("dog-cards"); // Agora pega o novo ID
  galeria.innerHTML = "";

  for (const raca of racas) {
    const card = document.createElement("div");
    card.className = "dog-card";
    card.setAttribute("data-name", raca.name.toLowerCase());

    let imgUrl = '';

    if (raca.image?.url) {
      imgUrl = raca.image.url;
    } else {
      const busca = await fetch(`https://api.thedogapi.com/v1/images/search?breed_id=${raca.id}`);
      const resultado = await busca.json();
      imgUrl = resultado[0]?.url || '';
    }

    const imgElement = imgUrl
      ? `<img src="${imgUrl}" alt="${raca.name}" />`
      : `<div class="no-image">No Image</div>`;

    card.innerHTML = `
      ${imgElement}
      <h2>${raca.name}</h2>
      <p><strong>Weight:</strong> ${raca.weight.metric} kg</p>
      <p><strong>Height:</strong> ${raca.height.metric} cm</p>
      <p><strong>Temperament:</strong> ${raca.temperament || "Not informed"}</p>
    `;

    galeria.appendChild(card);
  }
}


async function carregarListaRacas() {
  const response = await fetch("https://api.thedogapi.com/v1/breeds");
  const racas = await response.json();

  const datalist = document.getElementById("racas");
  datalist.innerHTML = "";

  racas.sort((a, b) => a.name.localeCompare(b.name));
  racas.forEach((raca) => {
    const option = document.createElement("option");
    option.value = raca.name;
    datalist.appendChild(option);
  });
}

function adicionarParallaxNosCards() {
  const cards = document.querySelectorAll('.dog-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;

      const rotateX = percentY * 10; // Profundidade eixo X
      const rotateY = percentX * -10; // Profundidade eixo Y

      card.style.setProperty('--rotateX', `${rotateX}deg`);
      card.style.setProperty('--rotateY', `${rotateY}deg`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rotateX', `0deg`);
      card.style.setProperty('--rotateY', `0deg`);
    });
  });
}


let slideInterval;

function iniciarSlide() {
  const galeria = document.getElementById("dog-cards");

  slideInterval = setInterval(() => {
    galeria.scrollBy({
      left: 2, // anda só 2 pixels por vez
      behavior: "auto" // sem "smooth" para não acumular movimento
    });

    if (galeria.scrollLeft + galeria.clientWidth >= galeria.scrollWidth) {
      galeria.scrollTo({ left: 0, behavior: "auto" });
    }
  }, 16); // 16ms = 60 frames por segundo (padrão animação suave)
}


function buscarERolar() {
  const nome = document.getElementById("breedInput").value.trim().toLowerCase();
  const cards = document.querySelectorAll(".dog-card");

  let encontrado = false;
  cards.forEach((card) => {
    if (card.dataset.name.includes(nome)) {
      encontrado = true;
      clearInterval(slideInterval);
      card.scrollIntoView({ behavior: "smooth", inline: "center" });
      card.style.border = "2px solid black";
      setTimeout(() => {
        card.style.border = "";
        iniciarSlide(); 
      }, 2000);
    }
  });

  if (!encontrado) {
    alert("Breed not found.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await carregarListaRacas();
  carregarGaleria();         
  iniciarSlide();
});


document.getElementById("searchButton").addEventListener("click", (e) => {
  e.preventDefault();
  buscarERolar();
});

