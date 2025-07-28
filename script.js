// HTML elementlerini değişkenlere atama
const amountInput = document.getElementById('amount');
const fromSelect = document.getElementById('from');
const toSelect = document.getElementById('to');
const convertBtn = document.getElementById('convert-btn');
const swapBtn = document.getElementById('swap-btn');
const resultDiv = document.getElementById('result');
const rateInfoDiv = document.getElementById('rate-info');

// Frankfurter API URL'leri (API Anahtarı Gerekmez)
const apiUrl_currencies = 'https://api.frankfurter.app/currencies';
const apiUrl_latest = 'https://api.frankfurter.app/latest';

// Desteklenen para birimlerini API'den çek ve select kutularını doldur
async function loadCurrencies() {
    try {
        const response = await fetch(apiUrl_currencies);
        const currencies = await response.json(); // {"USD": "United States Dollar", "EUR": "Euro", ...}

        // Para birimlerini select kutularına ekle
        for (const code in currencies) {
            const option1 = document.createElement('option');
            option1.value = code;
            option1.textContent = `${code} - ${currencies[code]}`;
            fromSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = code;
            option2.textContent = `${code} - ${currencies[code]}`;
            toSelect.appendChild(option2);
        }

        // Başlangıç değerlerini ata (Örn: USD -> TRY)
        fromSelect.value = 'USD';
        toSelect.value = 'TRY';

    } catch (error) {
        showError('Para birimleri yüklenemedi. Lütfen internet bağlantınızı kontrol edin.');
        console.error('Hata:', error);
    }
}

// Hata mesajı gösterme fonksiyonu
function showError(message) {
    resultDiv.textContent = message;
    resultDiv.style.color = 'red';
}

// Çeviri işlemini yapma fonksiyonu
async function convertCurrency() {
    const amount = amountInput.value;
    const fromCurrency = fromSelect.value;
    const toCurrency = toSelect.value;

    // Girdileri kontrol et
    if (amount === '' || amount <= 0) {
        showError('Lütfen geçerli bir miktar girin.');
        rateInfoDiv.textContent = '';
        return;
    }
    
    // Eğer aynı para birimleri seçilirse, direkt sonucu göster
    if (fromCurrency === toCurrency) {
        resultDiv.textContent = `${amount} ${fromCurrency} = ${amount} ${toCurrency}`;
        resultDiv.style.color = '#333';
        rateInfoDiv.textContent = '';
        return;
    }

    resultDiv.textContent = 'Çevriliyor...';
    resultDiv.style.color = '#333';
    rateInfoDiv.textContent = '';

    try {
        const response = await fetch(`${apiUrl_latest}?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`);
        const data = await response.json();

        if (data.rates && data.rates[toCurrency]) {
            const resultValue = data.rates[toCurrency].toFixed(2);
            
            // 1 birim için kuru hesapla
            const singleRateResponse = await fetch(`${apiUrl_latest}?from=${fromCurrency}&to=${toCurrency}`);
            const singleRateData = await singleRateResponse.json();
            const rate = singleRateData.rates[toCurrency].toFixed(4);

            resultDiv.innerHTML = `
                ${amount} ${fromCurrency} = <strong>${resultValue} ${toCurrency}</strong>
            `;
            rateInfoDiv.innerHTML = `<span style="font-size: 14px; color: #00fff7;">1 ${fromCurrency} = ${rate} ${toCurrency}</span>`;
        } else {
            showError('Çeviri sırasında bir hata oluştu.');
            rateInfoDiv.textContent = '';
        }

    } catch (error) {
        showError('Çeviri yapılamadı. Sunucuya ulaşılamıyor.');
        rateInfoDiv.textContent = '';
        console.error('Hata:', error);
    }
}

// Para birimlerini değiştirme (swap) fonksiyonu
function swapCurrencies() {
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    convertCurrency(); // Değiştirdikten sonra hemen çevir
}

// Olay dinleyicilerini (Event Listeners) ekleme
document.addEventListener('DOMContentLoaded', loadCurrencies);
convertBtn.addEventListener('click', convertCurrency);
swapBtn.addEventListener('click', swapCurrencies);