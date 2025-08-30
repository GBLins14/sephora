// Mapeamento de categorias
const categories = {
    1: { id: 1, name: "CABELO" },
    2: { id: 2, name: "ROSTO" },
    3: { id: 3, name: "BOCA" },
    5: { id: 5, name: "PERFUMES" },
    6: { id: 6, name: "CORPO" }
};

// Funções existentes
function MenuClick(nome) {
    alert(`Opção em manutenção, Sephora pede desculpas pelo inconveniente.`);
}

function LogoClick(nome) {
    window.location.href = "../";
}

function BuscarClick(nome) {
    const searchModal = document.getElementById('searchModal');
    searchModal.style.display = 'block';

    // Focar no input após um pequeno delay
    setTimeout(() => {
        document.getElementById('searchInput').focus();
    }, 100);
}

function SuporteClick(nome) {
    alert(`Opção em manutenção, Sephora pede desculpas pelo inconveniente.`);
}

function PerfilClick(nome) {
    alert(`Opção em manutenção, Sephora pede desculpas pelo inconveniente.`);
}

function CarrinhoClick(nome) {
    window.location.href = "../carrinho";
}

// Event listeners para os elementos do menu
document.getElementById("menu").onclick = () => MenuClick("Menu");
document.getElementById("logo").onclick = () => LogoClick("Logo");
document.getElementById("buscar").onclick = () => BuscarClick("Buscar");
document.getElementById("suporte").onclick = () => SuporteClick("Suporte");
document.getElementById("perfil").onclick = () => PerfilClick("Perfil");
document.getElementById("carrinho").onclick = () => CarrinhoClick("Carrinho");

document.getElementById("menu_Cabelo").onclick = () => filterProducts(1);
document.getElementById("menu_Rosto").onclick = () => filterProducts(2);
document.getElementById("menu_Boca").onclick = () => filterProducts(3);
document.getElementById("menu_Perfumes").onclick = () => filterProducts(4);
document.getElementById("menu_50off").onclick = () => filterProducts(all);
document.getElementById("menu_Ofertas").onclick = () => filterProducts(all);
document.getElementById("menu_Corpo").onclick = () => filterProducts(5);
document.getElementById("menu_Marcas").onclick = () => filterProducts(all);

// Variáveis globais
let allProducts = [];
let currentCategory = 'all';

// Função para criar as abas de categoria
function createCategoryTabs() {
    const tabsContainer = document.getElementById('categoryTabs');

    // Adicionar a aba "Todos"
    const allTab = document.createElement('div');
    allTab.className = 'category-tab active';
    allTab.dataset.category = 'all';
    allTab.textContent = 'TODOS';
    allTab.addEventListener('click', () => filterProducts('all'));
    tabsContainer.appendChild(allTab);

    // Adicionar abas para cada categoria
    Object.values(categories).forEach(category => {
        const tab = document.createElement('div');
        tab.className = 'category-tab';
        tab.dataset.category = category.id;
        tab.textContent = category.name;
        tab.addEventListener('click', () => filterProducts(category.id));
        tabsContainer.appendChild(tab);
    });
}

// Função para filtrar produtos por categoria
function filterProducts(categoryId) {
    currentCategory = categoryId;

    // Atualizar a classe ativa nas abas
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.category === categoryId) {
            tab.classList.add('active');
        }
    });

    // Atualizar o título da categoria
    const categoryTitle = document.getElementById('category-title');
    if (categoryId === 'all') {
        categoryTitle.textContent = 'TODOS OS PRODUTOS';
    } else {
        categoryTitle.textContent = categories[categoryId].name;
    }

    // Filtrar e exibir produtos
    if (categoryId === 'all') {
        displayProducts(allProducts);
    } else {
        const filteredProducts = allProducts.filter(product => product.categoria == categoryId);
        displayProducts(filteredProducts);
    }
}

// Adicionar event listeners para os ícones de novidades
document.querySelectorAll('.novidades-item').forEach(item => {
    item.addEventListener('click', function () {
        const category = this.dataset.category;
        filterProducts(category);
        scrollToSection('products-section');
    });
});

// URL do arquivo JSON no GitHub
const jsonUrl = 'https://raw.githubusercontent.com/GBLins14/sephora/refs/heads/main/products.json';

// Função para buscar produtos do JSON
async function fetchProducts() {
    try {
        const response = await fetch(jsonUrl);

        if (!response.ok) {
            throw new Error('Erro ao carregar produtos');
        }

        allProducts = await response.json();
        createCategoryTabs();
        filterProducts('all');
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('products-container').innerHTML = `
                    <div class="error">
                        <p>Não foi possível carregar os produtos.</p>
                        <p>Sephora pede desculpas pelo transtorno.</p>
                    </div>
                `;
    }
}

// Função para exibir os produtos
function displayProducts(products) {
    const container = document.getElementById('products-container');

    if (!products || products.length === 0) {
        container.innerHTML = '<div class="error">Nenhum produto encontrado para esta categoria.</div>';
        return;
    }

    container.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'card_product';

        // Obter desconto do produto (padrão de 50% se não especificado)
        const discountPercentage = product.desconto || 50;

        // Calcular preços
        const originalPrice = parseFloat(product.preco.replace(',', '.'));
        const discountPrice = originalPrice * (1 - discountPercentage / 100);
        const installmentValue = discountPrice / 2;

        productCard.innerHTML = `
                    <div class="image-container">
                        <img src="${product.imagem || 'https://via.placeholder.com/250'}" alt="${product.nome}">
                        <div class="discount-badge">-${discountPercentage}%</div>
                    </div>
                    <h1>${product.marca}</h1>
                    <h2>${product.nome}</h2>
                    <div class="rating">${product.avaliacao || '⭐⭐⭐⭐⭐'}</div>
                    <h2 class="original-price">De: R$ ${originalPrice.toFixed(2).replace('.', ',')}</h2>
                    <h1 class="discount-price">R$ ${discountPrice.toFixed(2).replace('.', ',')}</h1>
                    <h3 class="installments">OU 2X DE R$ ${installmentValue.toFixed(2).replace('.', ',')}</h3>
                    <h3 class="frete">Frete grátis</h3>
                `;

        // Adicionar evento de clique para abrir a página do produto
        productCard.addEventListener('click', () => {
            window.location.href = `../produto/index.html?id=${product.id}`;
        });

        container.appendChild(productCard);
    });
}

// Código para o carrossel de imagens
document.addEventListener('DOMContentLoaded', function () {
    const carrossel = document.getElementById('carrossel');
    const imagens = carrossel.querySelectorAll('img');
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const indicadoresContainer = document.getElementById('indicadores');

    let indiceAtual = 0;
    const totalImagens = imagens.length;

    // Criar indicadores
    for (let i = 0; i < totalImagens; i++) {
        const indicador = document.createElement('div');
        indicador.classList.add('indicador');
        if (i === 0) indicador.classList.add('ativo');
        indicador.addEventListener('click', () => pularParaImagem(i));
        indicadoresContainer.appendChild(indicador);
    }

    const indicadores = document.querySelectorAll('.indicador');

    // Atualizar a exibição do carrossel
    function atualizarCarrossel() {
        carrossel.style.transform = `translateX(-${indiceAtual * 100}%)`;

        // Atualizar indicadores
        indicadores.forEach((ind, index) => {
            ind.classList.toggle('ativo', index === indiceAtual);
        });
    }

    // Avançar para a próxima imagem
    function proximaImagem() {
        indiceAtual = (indiceAtual + 1) % totalImagens;
        atualizarCarrossel();
    }

    // Voltar para a imagem anterior
    function imagemAnterior() {
        indiceAtual = (indiceAtual - 1 + totalImagens) % totalImagens;
        atualizarCarrossel();
    }

    // Pular para uma imagem específica
    function pularParaImagem(index) {
        indiceAtual = index;
        atualizarCarrossel();
    }

    // Event listeners para os botões
    btnNext.addEventListener('click', proximaImagem);
    btnPrev.addEventListener('click', imagemAnterior);

    // Inicializar o carrossel
    atualizarCarrossel();

    // Opcional: avançar automaticamente a cada 5 segundos
    let intervalo = setInterval(proximaImagem, 5000);

    // Pausar o avanço automático quando o mouse estiver sobre o carrossel
    carrossel.addEventListener('mouseenter', () => {
        clearInterval(intervalo);
    });

    // Retomar o avanço automático quando o mouse sair do carrossel
    carrossel.addEventListener('mouseleave', () => {
        intervalo = setInterval(proximaImagem, 5000);
    });
});

function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({
        behavior: 'smooth'
    });
}

// Função para atualizar o contador do carrinho
function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('sephora_cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantidade, 0);

    // Remover contador existente
    const existingCounter = document.getElementById('cart-counter');
    if (existingCounter) existingCounter.remove();

    if (totalItems > 0) {
        const counter = document.createElement('div');
        counter.id = 'cart-counter';
        counter.style.cssText = `
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #e6007e;
                    color: white;
                    border-radius: 50%;
                    width: 18px;
                    height: 18px;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                `;
        counter.textContent = totalItems;

        const cartIcon = document.getElementById('carrinho');
        cartIcon.style.position = 'relative';
        cartIcon.appendChild(counter);
    }
}

// Inicializar a aplicação
document.addEventListener('DOMContentLoaded', function () {
    fetchProducts();
    updateCartCounter();
});

// Função para abrir a pesquisa
function BuscarClick(nome) {
    const searchModal = document.getElementById('searchModal');
    searchModal.style.display = 'block';

    // Focar no input após um pequeno delay
    setTimeout(() => {
        document.getElementById('searchInput').focus();
    }, 100);
}

// Função para fechar a pesquisa
function closeSearch() {
    document.getElementById('searchModal').style.display = 'none';
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '<div class="no-results">Digite para buscar produtos...</div>';
}

// Função para buscar produtos
function searchProducts(searchTerm) {
    const searchResults = document.getElementById('searchResults');

    if (searchTerm.length < 2) {
        searchResults.innerHTML = '<div class="no-results">Digite pelo menos 2 caracteres...</div>';
        return;
    }

    const term = searchTerm.toLowerCase();
    const results = allProducts.filter(product =>
        product.nome.toLowerCase().includes(term) ||
        product.marca.toLowerCase().includes(term) ||
        product.descricao.toLowerCase().includes(term)
    );

    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                Nenhum produto encontrado para "${searchTerm}"
            </div>
        `;
        return;
    }

    searchResults.innerHTML = '';

    results.forEach(product => {
        const discountPercentage = product.desconto || 50;
        const originalPrice = parseFloat(product.preco.replace(',', '.'));
        const discountPrice = originalPrice * (1 - discountPercentage / 100);

        const productElement = document.createElement('div');
        productElement.className = 'search-product';
        productElement.innerHTML = `
            <img src="${product.imagem || 'https://via.placeholder.com/60'}" alt="${product.nome}">
            <div class="search-product-info">
                <div class="search-product-name">${product.nome}</div>
                <div class="search-product-brand">${product.marca}</div>
                <div class="search-product-price">
                    R$ ${discountPrice.toFixed(2).replace('.', ',')} 
                    <span style="text-decoration: line-through; color: #999; font-size: 12px; margin-left: 5px;">
                        R$ ${originalPrice.toFixed(2).replace('.', ',')}
                    </span>
                </div>
            </div>
        `;

        productElement.addEventListener('click', () => {
            window.location.href = `../produto/index.html?id=${product.id}`;
        });

        searchResults.appendChild(productElement);
    });
}

// Event listener para o input de pesquisa
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        // Buscar enquanto digita
        searchInput.addEventListener('input', function () {
            searchProducts(this.value.trim());
        });

        // Fechar com ESC
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeSearch();
            }
        });
    }

    // Fechar modal clicando fora
    const searchModal = document.getElementById('searchModal');
    if (searchModal) {
        searchModal.addEventListener('click', function (e) {
            if (e.target === searchModal) {
                closeSearch();
            }
        });
    }
});
