let selectedCard = null;
let isEditMode = false;

// 頁面加載時讀取儲存的卡片
document.addEventListener('DOMContentLoaded', loadCards);

document.getElementById('addCard').addEventListener('click', createCard);
document.getElementById('removeCard').addEventListener('click', removeLastCard);
document.getElementById('saveCard').addEventListener('click', saveCardContent);
document.getElementById('toggleEdit').addEventListener('click', toggleEditMode);

// 儲存所有卡片到 localStorage
function saveAllCards() {
    const container = document.getElementById('cardsContainer');
    const cards = container.querySelectorAll('.card');
    const cardsData = [];
    
    cards.forEach(card => {
        const frontContent = card.querySelector('.card-front').innerHTML;
        const backContent = card.querySelector('.card-back').innerHTML;
        cardsData.push({
            front: frontContent,
            back: backContent
        });
    });
    
    localStorage.setItem('savedCards', JSON.stringify(cardsData));
}

// 從 localStorage 讀取並創建卡片
function loadCards() {
    const savedCards = localStorage.getItem('savedCards');
    if (savedCards) {
        const cardsData = JSON.parse(savedCards);
        cardsData.forEach(cardData => {
            createCard(cardData);
        });
    }
}

function toggleEditMode() {
    isEditMode = !isEditMode;
    const container = document.getElementById('cardsContainer');
    const editor = document.getElementById('cardEditor');
    const toggleBtn = document.getElementById('toggleEdit');
    
    if (isEditMode) {
        container.classList.add('edit-mode');
        editor.style.display = 'block';
        toggleBtn.textContent = '退出編輯模式';
        // 添加選擇卡片事件，保留翻轉事件
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', selectCard);
        });
    } else {
        container.classList.remove('edit-mode');
        editor.style.display = 'none';
        toggleBtn.textContent = '進入編輯模式';
        selectedCard = null;
        // 移除選擇事件，保留翻轉事件
        document.querySelectorAll('.card').forEach(card => {
            card.removeEventListener('click', selectCard);
            card.classList.remove('selected');
        });
    }
}

function flipCard() {
    this.classList.toggle('flipped');
}

function selectCard(event) {
    if (!isEditMode) return;
    
    // 防止觸發翻轉事件
    event.stopPropagation();
    
    // 移除其他卡牌的選中狀態
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // 設置當前卡牌為選中狀態
    this.classList.add('selected');
    selectedCard = this;
    
    // 重置編輯器內容
    document.getElementById('frontContent').value = '';
    document.getElementById('backContent').value = '';
    document.getElementById('frontImage').value = '';
    document.getElementById('backImage').value = '';
}

function createCard(cardData = null) {
    const card = document.createElement('div');
    card.className = 'card';
    
    if (cardData) {
        // 如果有儲存的數據，使用儲存的內容
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">${cardData.front}</div>
                <div class="card-back">${cardData.back}</div>
            </div>
        `;
    } else {
        // 使用默認內容
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <p>點擊編輯正面</p>
                </div>
                <div class="card-back">
                    <p>點擊編輯背面</p>
                </div>
            </div>
        `;
    }

    // 檢查並修復可能的 undefined 內容
    const frontElement = card.querySelector('.card-front');
    const backElement = card.querySelector('.card-back');
    
    if (frontElement.innerHTML === 'undefined') {
        frontElement.innerHTML = '<p>點擊編輯正面</p>';
    }
    if (backElement.innerHTML === 'undefined') {
        backElement.innerHTML = '<p>點擊編輯背面</p>';
    }

    card.addEventListener('click', flipCard);
    
    if (isEditMode) {
        card.addEventListener('click', selectCard);
    }

    document.getElementById('cardsContainer').appendChild(card);
    saveAllCards(); // 每次新增卡片時儲存
}

function removeLastCard() {
    const container = document.getElementById('cardsContainer');
    if (container.lastChild) {
        container.removeChild(container.lastChild);
        saveAllCards(); // 移除卡片時儲存
    }
}

function saveCardContent() {
    if (!selectedCard) return;

    const frontContent = document.getElementById('frontContent').value;
    const backContent = document.getElementById('backContent').value;
    const frontImage = document.getElementById('frontImage').files[0];
    const backImage = document.getElementById('backImage').files[0];

    const cardFront = selectedCard.querySelector('.card-front');
    const cardBack = selectedCard.querySelector('.card-back');

    Promise.all([
        updateCardSide(cardFront, frontContent, frontImage),
        updateCardSide(cardBack, backContent, backImage)
    ]).then(() => {
        saveAllCards(); // 編輯卡片內容後儲存
    });
}

function updateCardSide(element, content, image) {
    return new Promise((resolve) => {
        if (image) {
            const reader = new FileReader();
            reader.onload = function(e) {
                element.innerHTML = `<img src="${e.target.result}" alt="卡牌圖片">`;
                resolve();
            };
            reader.readAsDataURL(image);
        } else if (content) {
            element.innerHTML = `<p>${content}</p>`;
            resolve();
        } else {
            resolve();
        }
    });
} 