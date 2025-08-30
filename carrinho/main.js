function loadCart() {
    const cart = JSON.parse(localStorage.getItem('sephora_cart')) || [];
    displayCart(cart);
}

function displayCart(cart) {
    const container = document.getElementById('cart-container');

    if (cart.length === 0) {
        container.innerHTML = `
                    <div class="empty-cart">
                        <h2>Seu carrinho está vazio</h2>
                        <p>Explore nossos produtos e adicione itens incríveis ao seu carrinho!</p>
                        <a href="../" class="empty-cart-btn">Continuar Comprando</a>
                    </div>
                `;
        return;
    }

    // Garantir que os preços sejam números
    cart.forEach(item => {
        item.preco = parseFloat(item.preco);
        item.precoOriginal = parseFloat(item.precoOriginal || item.preco);
    });

    // Calcular subtotal, desconto e total
    const subtotal = cart.reduce((total, item) => total + (item.precoOriginal * item.quantidade), 0);
    const discount = cart.reduce((total, item) => total + ((item.precoOriginal - item.preco) * item.quantidade), 0);
    const total = subtotal - discount;

    container.innerHTML = `
                <div class="cart-content">
                    <div class="cart-items">
                        <h2 class="cart-title">Meu Carrinho (${cart.length} ${cart.length === 1 ? 'item' : 'itens'})</h2>
                        
                        ${cart.map((item, index) => `
                            <div class="cart-item">
                                <img src="${item.imagem}" alt="${item.nome}" class="cart-item-image">
                                
                                <div class="cart-item-info">
                                    <h3>${item.nome}</h3>
                                    <div class="cart-item-price">R$ ${item.preco.toFixed(2).replace('.', ',')}</div>
                                    
                                    <div class="cart-item-quantity">
                                        <button class="quantity-btn" onclick="updateQuantity(${index}, ${item.quantidade - 1})">-</button>
                                        <input type="number" class="quantity-input" value="${item.quantidade}" min="1" 
                                            onchange="updateQuantity(${index}, parseInt(this.value))">
                                        <button class="quantity-btn" onclick="updateQuantity(${index}, ${item.quantidade + 1})">+</button>
                                    </div>
                                    
                                    <button class="remove-btn" onclick="removeItem(${index})">Remover</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="cart-summary">
                        <h2 class="summary-title">Resumo do Pedido</h2>
                        
                        <div class="summary-item">
                            <span>Subtotal</span>
                            <span>R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
                        </div>

                        ${discount > 0 ? `
                        <div class="summary-item" style="color: #4CAF50;">
                            <span>Descontos</span>
                            <span>- R$ ${discount.toFixed(2).replace('.', ',')}</span>
                        </div>
                        ` : ''}

                        <div class="summary-item">
                            <span>Frete</span>
                            <span>Grátis</span>
                        </div>

                        <div class="summary-total">
                            <span>Total</span>
                            <span>R$ ${total.toFixed(2).replace('.', ',')}</span>
                        </div>

                        <button class="checkout-btn" onclick="checkout()">FINALIZAR COMPRA</button>
                        <a href="../" class="continue-shopping">Continuar comprando</a>
                    </div>
                </div>
            `;
}

function updateQuantity(index, newQuantity) {
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 99) newQuantity = 99;

    const cart = JSON.parse(localStorage.getItem('sephora_cart')) || [];
    cart[index].quantidade = newQuantity;
    localStorage.setItem('sephora_cart', JSON.stringify(cart));
    loadCart();
}

function removeItem(index) {
    const cart = JSON.parse(localStorage.getItem('sephora_cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('sephora_cart', JSON.stringify(cart));
    loadCart();
}

function checkout() {
    // Verificar se o carrinho está vazio
    const cart = JSON.parse(localStorage.getItem('sephora_cart')) || [];
    if (cart.length === 0) {
        alert('Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.');
        return;
    }

    // Redirecionar para a página de checkout
    window.location.href = '../checkout/';
}

// Inicializar o carrinho
document.addEventListener('DOMContentLoaded', loadCart);
