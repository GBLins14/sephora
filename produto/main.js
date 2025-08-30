const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// URL do arquivo JSON (substitua pela sua URL real)
const jsonUrl = 'https://raw.githubusercontent.com/GBLins14/sephora/refs/heads/main/products.json';

// Função para carregar e exibir o produto
async function loadProduct() {
    if (!productId) {
        showError('ID do produto não especificado.');
        return;
    }

    try {
        const response = await fetch(jsonUrl);

        if (!response.ok) {
            throw new Error('Erro ao carregar produtos');
        }

        const products = await response.json();
        const product = products.find(p => p.id == productId);

        if (!product) {
            throw new Error('Produto não encontrado');
        }

        displayProduct(product);
    } catch (error) {
        console.error('Erro:', error);
        showError('Não foi possível carregar o produto. Tente novamente mais tarde.');
    }
}

// Função para exibir o produto
function displayProduct(product) {
    // Atualizar breadcrumb
    document.getElementById('breadcrumb-product').textContent = product.nome;

    // Calcular preços
    const discountPercentage = product.desconto || 50;
    const originalPrice = parseFloat(product.preco.toString().replace(',', '.'));
    const discountPrice = originalPrice * (1 - discountPercentage / 100);
    const installmentValue = discountPrice / 3; // 3x sem juros

    // Criar HTML do produto
    const productHTML = `
                <div class="product-content">
                    <div class="product-gallery">
                        <div class="main-image-container">
                            <img src="${product.imagem || 'https://via.placeholder.com/500'}" alt="${product.nome}" class="main-image" id="main-image">
                            <div class="discount-badge">-${discountPercentage}%</div>
                        </div>
                        
                        ${product.imagens && product.imagens.length > 0 ? `
                        <div class="gallery-thumbnails" id="thumbnails-container">
                            ${product.imagens.map((img, index) => `
                                <img src="${img}" alt="${product.nome} - ${index + 1}" class="thumbnail ${index === 0 ? 'active' : ''}" 
                                    onclick="changeImage('${img}', this)">
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="product-info">
                        <h1>${product.nome}</h1>
                        <div class="product-brand">${product.marca || 'Sephora Collection'}</div>
                        
                        <div class="rating">
                            <div class="stars">${product.avaliacao || '⭐⭐⭐⭐⭐'}</div>
                            <div class="reviews">${product.avaliacoes || '125 avaliações'}</div>
                        </div>
                        
                        <div class="price-container">
                            <div class="original-price">De: R$ ${originalPrice.toFixed(2).replace('.', ',')}</div>
                            <div class="discount-price">
                                Por: R$ ${discountPrice.toFixed(2).replace('.', ',')}
                                <span class="discount-percentage">${discountPercentage}% OFF</span>
                            </div>
                            <div class="installments">Ou em 3x de R$ ${installmentValue.toFixed(2).replace('.', ',')} sem juros</div>
                        </div>
                        
                        <div class="product-actions">
                            <div class="quantity-selector">
                                <button class="quantity-btn" onclick="decreaseQuantity()">-</button>
                                <input type="number" class="quantity-input" id="quantity" value="1" min="1" max="10">
                                <button class="quantity-btn" onclick="increaseQuantity()">+</button>
                            </div>
                            
                            <button class="buy-btn" onclick="buyNow()">
                                COMPRAR AGORA
                            </button>
                            
                            <button class="cart-btn" onclick="addToCart()">
                                ADICIONAR AO CARRINHO
                            </button>
                        </div>
                        
                        <div class="product-details">
                            <h2>Descrição do Produto</h2>
                            <p>${product.descricao || 'Produto de alta qualidade da Sephora.'}</p>
                            
                            ${product.detalhes ? `
                            <h2>Características</h2>
                            <ul class="details-list">
                                ${product.detalhes.map(detail => `<li>${detail}</li>`).join('')}
                            </ul>
                            ` : ''}
                            
                            <br>
                            <h2>Benefícios</h2>
                            <ul class="details-list">
                                <li>Entrega rápida</li>
                                <li>Produto original</li>
                                <li>Garantia da Sephora</li>
                                <li>Devolução em 30 dias</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;

    document.getElementById('product-container').innerHTML = productHTML;

    // Atualizar título da página
    document.title = `${product.nome} - Sephora`;
}

// Função para mostrar erro
function showError(message) {
    document.getElementById('product-container').innerHTML = `
                <div class="error">
                    <p>${message}</p>
                    <button onclick="window.location.href='../'" style="margin-top: 15px; padding: 10px 20px; background: #e6007e; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Voltar para a Loja
                    </button>
                </div>
            `;
}

// Funções de interação
function changeImage(src, element) {
    document.getElementById('main-image').src = src;
    document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
    element.classList.add('active');
}

function increaseQuantity() {
    const input = document.getElementById('quantity');
    if (input.value < 10) input.value = parseInt(input.value) + 1;
}

function decreaseQuantity() {
    const input = document.getElementById('quantity');
    if (input.value > 1) input.value = parseInt(input.value) - 1;
}

function addToCart() {
    const quantity = parseInt(document.getElementById('quantity').value);

    // Pega o preço já calculado corretamente
    const discountPriceText = document.querySelector('.discount-price').textContent;
    const discountPriceClean = parseFloat(discountPriceText.replace(/[^\d,]/g, '').replace(',', '.'));
    const originalPriceText = document.querySelector('.original-price').textContent;
    const originalPriceClean = parseFloat(originalPriceText.replace(/[^\d,]/g, '').replace(',', '.'));

    // Multiplicar pela quantidade e arredondar
    const discountPrice = parseFloat((discountPriceClean).toFixed(2));
    const originalPrice = parseFloat((originalPriceClean).toFixed(2));

    const product = {
        id: productId,
        nome: document.querySelector('.product-info h1').textContent,
        precoOriginal: originalPrice,
        preco: discountPrice,
        imagem: document.getElementById('main-image').src,
        quantidade: quantity,
        desconto: parseInt(document.querySelector('.discount-percentage').textContent.replace('% OFF', '')) || 0
    };

    // Se for atualizar quantidade existente, arredonde o total
    let cart = JSON.parse(localStorage.getItem('sephora_cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id === productId);

    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantidade += quantity;
    } else {
        cart.push(product);
    }

    // Salvar no localStorage
    localStorage.setItem('sephora_cart', JSON.stringify(cart));
    showCartNotification(quantity);
}



function showCartNotification(quantity) {
    const notification = document.createElement('div');
    notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 15px 20px;
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                animation: slideIn 0.3s ease;
            `;

    notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 18px;">✓</span>
                    <span>${quantity} item(s) adicionado(s) ao carrinho!</span>
                </div>
            `;

    document.body.appendChild(notification);

    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Adicione este CSS para as animações
const style = document.createElement('style');
style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
document.head.appendChild(style);

function buyNow() {
    const quantity = parseInt(document.getElementById('quantity').value);
    const productId = new URLSearchParams(window.location.search).get('id');

    // Pega o preço já calculado corretamente
    const discountPriceText = document.querySelector('.discount-price').textContent;
    // Remove "Por: R$ " e "% OFF", troca vírgula por ponto
    const discountPrice = parseFloat(
        discountPriceText.replace('Por: R$ ', '').replace('% OFF', '').replace(',', '.')
    );

    const originalPriceText = document.querySelector('.original-price').textContent;
    const originalPrice = parseFloat(
        originalPriceText.replace('De: R$ ', '').replace(',', '.')
    );

    const product = {
        id: productId,
        nome: document.querySelector('.product-info h1').textContent,
        precoOriginal: originalPrice,
        preco: discountPrice,
        imagem: document.getElementById('main-image').src,
        quantidade: quantity,
        desconto: parseInt(document.querySelector('.discount-percentage').textContent.replace('% OFF', '')) || 0
    };

    // Criar carrinho temporário com apenas este produto
    const tempCart = [product];
    localStorage.setItem('sephora_cart', JSON.stringify(tempCart));

    // Redirecionar para o checkout
    window.location.href = '../checkout/';
}

// Inicializar a página
document.addEventListener('DOMContentLoaded', loadProduct);
