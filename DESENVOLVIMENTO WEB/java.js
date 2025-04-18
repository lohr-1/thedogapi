/**
 * Carrega a galeria de raças de cães,
 * criando dinamicamente os cards com imagens e informações.
 */
async function carregarGaleria() {
  const response = await fetch("https://api.thedogapi.com/v1/breeds");
  const racas = await response.json();
  
  const galeria = document.getElementById("dog-cards");
  galeria.innerHTML = "";

  for (const raca of racas) {
    const card = document.createElement("div");
    card.className = "dog-card";
    card.setAttribute("data-name", raca.name.toLowerCase());

    let imgUrl = '';

    // Se houver imagem associada à raça, utiliza-a; senão, tenta buscar separadamente
    if (raca.image?.url) {
      imgUrl = raca.image.url;
    } else {
      const busca = await fetch(`https://api.thedogapi.com/v1/images/search?breed_id=${raca.id}`);
      const resultado = await busca.json();
      imgUrl = resultado[0]?.url || '';
    }

    const imgElement = imgUrl
    ? `<img src="${imgUrl}" alt="${raca.name}" loading="lazy"/>`
    : `<div class="no-image">No Image</div>`;  

    // Estrutura HTML do card
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

/**
 * Carrega a lista de raças para o componente datalist,
 * permitindo autocompletar a busca por raças.
 */
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

/**
 * Adiciona o efeito Parallax nos cards de cães,
 * ajustando o ângulo de rotação conforme a posição do mouse.
 */
function adicionarParallaxNosCards() {
  const cards = document.querySelectorAll('.dog-card');

  cards.forEach(card => {
    // Evento de movimento do mouse sobre o card
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;

      const rotateX = percentY * 10; // Inclinação no eixo X
      const rotateY = percentX * -10; // Inclinação no eixo Y

      card.style.setProperty('--rotateX', `${rotateX}deg`);
      card.style.setProperty('--rotateY', `${rotateY}deg`);
    });

    // Evento de saída do mouse, reseta o card
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rotateX', `0deg`);
      card.style.setProperty('--rotateY', `0deg`);
    });
  });
}

let slideInterval;

/**
 * Inicia o carrossel automático da galeria,
 * realizando o scroll horizontal suave.
 */
function iniciarSlide() {
  const galeria = document.getElementById("dog-cards");

  slideInterval = setInterval(() => {
    galeria.scrollBy({ left: 1, behavior: "auto" });
    if (galeria.scrollLeft + galeria.clientWidth >= galeria.scrollWidth) {
      galeria.scrollTo({ left: 0, behavior: "auto" });
    }
  }, 30); // 30ms para aliviar processamento
  
}

/**
 * Busca por um card de raça digitada e foca nele,
 * parando o slide para destacar o card selecionado.
 */
function buscarERolar() {
  const nome = document.getElementById("breedInput").value.trim().toLowerCase();
  const cards = document.querySelectorAll(".dog-card");

  let encontrado = false;
  
  cards.forEach((card) => {
    if (card.dataset.name.includes(nome)) {
      encontrado = true;
      clearInterval(slideInterval); // Pausa o carrossel
      card.scrollIntoView({ behavior: "smooth", inline: "center" });
      card.style.border = "2px solid black";

      setTimeout(() => {
        card.style.border = "";
        iniciarSlide(); // <- REINICIA O SLIDE após 15s
      }, 15000); // Mantém o destaque por 15 segundos
    }
  });

  if (!encontrado) {
    alert("Breed not found.");
  }
}

/**
 * Inicializa o comportamento da página:
 * carrega as listas, cards, aplica parallax e inicia o slide automático.
 */
document.addEventListener("DOMContentLoaded", async () => {
  await carregarListaRacas();
  await carregarGaleria();
  adicionarParallaxNosCards();
  iniciarSlide();
});

/**
 * Evento de clique no botão de busca.
 */
document.getElementById("searchButton").addEventListener("click", (e) => {
  e.preventDefault();
  buscarERolar();
  adicionarParallaxNosCards(); // Reaplica parallax se necessário
});
