const boxesKey = 'medicineBoxes';
const boxOrderKey = 'medicineBoxOrder';
let currentBoxName = '';
let currentMedicineData = [];
let isEditing = false;
let isSelectEditing = false;
let currentEditingRow = null;
let currentDeletingBox = '';
let currentRenamingBox = '';
let showSampleRow = false;

const homePage = document.getElementById('home-page');
const selectPage = document.getElementById('select-page');
const medicinePage = document.getElementById('medicine-page');
const openBtn = document.getElementById('open-btn');
const newBoxBtn = document.getElementById('new-box-btn');
const boxButtonsContainer = document.getElementById('box-buttons-container');
const backHomeBtn = document.getElementById('back-home-btn');
const backSelectBtn = document.getElementById('back-select-btn');
const editBtn = document.getElementById('edit-btn');
const addRowBtn = document.getElementById('add-row-btn');
const tableBody = document.getElementById('table-body');
const usageModal = document.getElementById('usage-modal');
const cancelUsageBtn = document.getElementById('cancel-usage-btn');
const confirmUsageBtn = document.getElementById('confirm-usage-btn');
const usageCheckboxes = usageModal.querySelectorAll('input[type="checkbox"]');
const nameModal = document.getElementById('name-modal');
const boxNameInput = document.getElementById('box-name-input');
const cancelNameBtn = document.getElementById('cancel-name-btn');
const confirmNameBtn = document.getElementById('confirm-name-btn');
const boxTitle = document.getElementById('box-title');
const duplicateModal = document.getElementById('duplicate-modal');
const okDuplicateBtn = document.getElementById('ok-duplicate-btn');
const limitModal = document.getElementById('limit-modal');
const okLimitBtn = document.getElementById('ok-limit-btn');
const renameModal = document.getElementById('rename-modal');
const renameInput = document.getElementById('rename-input');
const cancelRenameBtn = document.getElementById('cancel-rename-btn');
const confirmRenameBtn = document.getElementById('confirm-rename-btn');
const deleteModal = document.getElementById('delete-modal');
const deleteMessage = document.getElementById('delete-message');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const selectEditBtn = document.getElementById('select-edit-btn');
const dateErrorModal = document.getElementById('date-error-modal');
const okDateErrorBtn = document.getElementById('ok-date-error-btn');
const deleteMedicineModal = document.getElementById('delete-medicine-modal');
const cancelDeleteMedicineBtn = document.getElementById('cancel-delete-medicine-btn');
const confirmDeleteMedicineBtn = document.getElementById('confirm-delete-medicine-btn');
const processingModal = document.getElementById('processing-modal');
const progressFill = document.querySelector('.progress-fill');
const nameErrorModal = document.getElementById('name-error-modal');
const okNameErrorBtn = document.getElementById('ok-name-error-btn');
let currentDeletingMedicineIndex = null;

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    page.classList.add('active');
}

function loadBoxes() {
    const saved = localStorage.getItem(boxesKey);
    if (saved) {
        return JSON.parse(saved);
    }
    return {};
}

function saveBoxes(boxes) {
    localStorage.setItem(boxesKey, JSON.stringify(boxes));
}

function loadBoxOrder() {
    const saved = localStorage.getItem(boxOrderKey);
    if (saved) {
        return JSON.parse(saved);
    }
    return [];
}

function saveBoxOrder(order) {
    localStorage.setItem(boxOrderKey, JSON.stringify(order));
}

function getOrderedBoxNames() {
    const boxes = loadBoxes();
    const order = loadBoxOrder();
    const boxNames = Object.keys(boxes);
    const orderedNames = [];
    order.forEach(name => {
        if (boxNames.includes(name)) {
            orderedNames.push(name);
        }
    });
    boxNames.forEach(name => {
        if (!orderedNames.includes(name)) {
            orderedNames.push(name);
        }
    });
    return orderedNames;
}

function renderBoxButtons() {
    boxButtonsContainer.innerHTML = '';
    const boxes = loadBoxes();
    const boxNames = getOrderedBoxNames();
    
    boxNames.forEach((name, index) => {
        const row = document.createElement('div');
        row.className = 'box-row';
        row.dataset.name = name;
        
        const btn = document.createElement('button');
        btn.className = 'select-btn';
        btn.innerHTML = `<span class="btn-icon">💊</span>${name}`;
        btn.onclick = () => {
            if (!isSelectEditing) {
                openBox(name);
            }
        };
        row.appendChild(btn);
        
        if (isSelectEditing) {
            const actionButtons = document.createElement('div');
            actionButtons.className = 'box-action-buttons';
            
            const upBtn = document.createElement('button');
            upBtn.className = 'box-action-btn up';
            upBtn.textContent = '↑';
            upBtn.disabled = index === 0;
            upBtn.onclick = () => moveBoxUp(index);
            actionButtons.appendChild(upBtn);
            
            const downBtn = document.createElement('button');
            downBtn.className = 'box-action-btn down';
            downBtn.textContent = '↓';
            downBtn.disabled = index === boxNames.length - 1;
            downBtn.onclick = () => moveBoxDown(index);
            actionButtons.appendChild(downBtn);
            
            const renameBtn = document.createElement('button');
            renameBtn.className = 'box-action-btn rename';
            renameBtn.textContent = '重命名';
            renameBtn.onclick = () => openRenameModal(name);
            actionButtons.appendChild(renameBtn);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'box-action-btn delete';
            deleteBtn.textContent = '删除';
            deleteBtn.onclick = () => openDeleteModal(name);
            actionButtons.appendChild(deleteBtn);
            
            row.appendChild(actionButtons);
        }
        
        boxButtonsContainer.appendChild(row);
    });
    
    if (isSelectEditing) {
        newBoxBtn.classList.add('hidden');
        selectEditBtn.textContent = '完成';
    } else {
        newBoxBtn.classList.remove('hidden');
        selectEditBtn.textContent = '编辑';
    }
}

function moveBoxUp(index) {
    const order = loadBoxOrder();
    if (index > 0) {
        [order[index - 1], order[index]] = [order[index], order[index - 1]];
        saveBoxOrder(order);
        renderBoxButtons();
    }
}

function moveBoxDown(index) {
    const order = loadBoxOrder();
    if (index < order.length - 1) {
        [order[index], order[index + 1]] = [order[index + 1], order[index]];
        saveBoxOrder(order);
        renderBoxButtons();
    }
}

function toggleSelectEdit() {
    isSelectEditing = !isSelectEditing;
    renderBoxButtons();
}

function openBox(name) {
    const boxes = loadBoxes();
    currentBoxName = name;
    currentMedicineData = boxes[name] || [];
    if (currentMedicineData.length > 0) {
        showSampleRow = false;
    }
    boxTitle.textContent = name;
    isEditing = false;
    editBtn.textContent = '编辑';
    addRowBtn.classList.add('hidden');
    const actionColHeader = document.querySelector('#medicine-table thead th.action-col');
    actionColHeader.classList.add('hidden');
    renderTable();
    showPage(medicinePage);
}

function saveCurrentBox() {
    const boxes = loadBoxes();
    boxes[currentBoxName] = currentMedicineData;
    saveBoxes(boxes);
}

function openNameModal() {
    const boxes = loadBoxes();
    const boxCount = Object.keys(boxes).length;
    
    if (boxCount >= 5) {
        limitModal.classList.remove('hidden');
        return;
    }
    
    boxNameInput.value = '';
    nameModal.classList.remove('hidden');
    boxNameInput.focus();
}

function closeNameModal() {
    nameModal.classList.add('hidden');
}

function confirmName() {
    const inputValue = boxNameInput.value;
    const name = inputValue.trim();
    
    if (!name) {
        openNameErrorModal();
        return;
    }
    
    const boxes = loadBoxes();
    if (boxes[name]) {
        closeNameModal();
        duplicateModal.classList.remove('hidden');
        return;
    }
    
    boxes[name] = [];
    saveBoxes(boxes);
    
    const order = loadBoxOrder();
    order.push(name);
    saveBoxOrder(order);
    
    closeNameModal();
    renderBoxButtons();
    showSampleRow = true;
    openBox(name);
}

function openRenameModal(name) {
    currentRenamingBox = name;
    renameInput.value = name;
    renameModal.classList.remove('hidden');
    renameInput.focus();
}

function closeRenameModal() {
    renameModal.classList.add('hidden');
    currentRenamingBox = '';
}

function confirmRename() {
    const inputValue = renameInput.value;
    const newName = inputValue.trim();
    
    if (!newName) {
        openNameErrorModal();
        return;
    }
    
    if (newName === currentRenamingBox) {
        closeRenameModal();
        return;
    }
    
    const boxes = loadBoxes();
    if (boxes[newName]) {
        alert('该名称已存在！');
        return;
    }
    
    boxes[newName] = boxes[currentRenamingBox];
    delete boxes[currentRenamingBox];
    saveBoxes(boxes);
    
    const order = loadBoxOrder();
    const index = order.indexOf(currentRenamingBox);
    if (index !== -1) {
        order[index] = newName;
        saveBoxOrder(order);
    }
    
    closeRenameModal();
    renderBoxButtons();
}

function openDeleteModal(name) {
    currentDeletingBox = name;
    deleteMessage.textContent = `确认删除${name}吗？`;
    deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
    deleteModal.classList.add('hidden');
    currentDeletingBox = '';
}

function confirmDelete() {
    const boxes = loadBoxes();
    delete boxes[currentDeletingBox];
    saveBoxes(boxes);
    
    const order = loadBoxOrder();
    const index = order.indexOf(currentDeletingBox);
    if (index !== -1) {
        order.splice(index, 1);
        saveBoxOrder(order);
    }
    
    closeDeleteModal();
    renderBoxButtons();
}

function closeDuplicateModal() {
    duplicateModal.classList.add('hidden');
}

function closeLimitModal() {
    limitModal.classList.add('hidden');
}

function renderTable() {
    tableBody.innerHTML = '';
    let hasExpired = false;
    
    if (showSampleRow && (currentMedicineData.length === 0 || isEditing)) {
        const sampleRow = document.createElement('tr');
        sampleRow.className = 'sample-row';
        
        const imgCell = document.createElement('td');
        const sampleImg = document.createElement('img');
        sampleImg.src = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=a%20simple%20medicine%20pill%20icon%2C%20minimal%20design&image_size=square';
        sampleImg.className = 'sample-img';
        imgCell.appendChild(sampleImg);
        sampleRow.appendChild(imgCell);
        
        const nameCell = document.createElement('td');
        nameCell.textContent = '示例';
        sampleRow.appendChild(nameCell);
        
        const prodDateCell = document.createElement('td');
        prodDateCell.textContent = '2026-03-22';
        sampleRow.appendChild(prodDateCell);
        
        const expDateCell = document.createElement('td');
        expDateCell.textContent = '2027-02-03';
        sampleRow.appendChild(expDateCell);
        
        const usageCell = document.createElement('td');
        usageCell.textContent = '其他';
        sampleRow.appendChild(usageCell);
        
        const freqCell = document.createElement('td');
        freqCell.textContent = '一天一次';
        sampleRow.appendChild(freqCell);
        
        const actionCell = document.createElement('td');
        actionCell.className = 'action-col hidden';
        sampleRow.appendChild(actionCell);
        
        tableBody.appendChild(sampleRow);
    }
    
    currentMedicineData.forEach((item, index) => {
        const row = createTableRow(item, index);
        if (isExpired(item.expDate)) {
            hasExpired = true;
        }
        tableBody.appendChild(row);
    });
    
    const expiryNote = document.getElementById('expiry-note');
    if (hasExpired) {
        expiryNote.classList.remove('hidden');
    } else {
        expiryNote.classList.add('hidden');
    }
}

function isExpired(expDate) {
    if (!expDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expDate);
    return expiry < today;
}

function validateDates(prodDate, expDate) {
    if (!prodDate || !expDate) return true;
    const prod = new Date(prodDate);
    const exp = new Date(expDate);
    return prod <= exp;
}

function openDateErrorModal() {
    dateErrorModal.classList.remove('hidden');
}

function closeDateErrorModal() {
    dateErrorModal.classList.add('hidden');
}

function openNameErrorModal() {
    nameErrorModal.classList.remove('hidden');
}

function closeNameErrorModal() {
    nameErrorModal.classList.add('hidden');
}

function createTableRow(item, index) {
    const row = document.createElement('tr');
    row.dataset.index = index;
    
    if (isExpired(item.expDate)) {
        row.classList.add('expired-row');
    }

    const imgCell = document.createElement('td');
    if (item.image) {
        const img = document.createElement('img');
        img.src = item.image;
        img.className = 'uploaded-img';
        imgCell.appendChild(img);
    }
    if (isEditing) {
        const uploadInput = document.createElement('input');
        uploadInput.type = 'file';
        uploadInput.accept = 'image/*';
        uploadInput.style.display = 'none';
        const uploadBtn = document.createElement('button');
        uploadBtn.className = 'upload-btn';
        uploadBtn.textContent = item.image ? '更换' : '上传';
        uploadBtn.onclick = () => uploadInput.click();
        uploadInput.onchange = (e) => handleImageUpload(e, index);
        imgCell.appendChild(document.createElement('br'));
        imgCell.appendChild(uploadBtn);
        imgCell.appendChild(uploadInput);
    }
    row.appendChild(imgCell);

    const nameCell = document.createElement('td');
    if (isEditing) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = item.name || '';
        input.placeholder = '药品名';
        input.onchange = (e) => {
            currentMedicineData[index].name = e.target.value;
            saveCurrentBox();
        };
        nameCell.appendChild(input);
    } else {
        nameCell.textContent = item.name || '-';
    }
    row.appendChild(nameCell);

    const prodDateCell = document.createElement('td');
    if (isEditing) {
        const input = document.createElement('input');
        input.type = 'date';
        input.value = item.prodDate || '';
        input.onchange = (e) => {
            currentMedicineData[index].prodDate = e.target.value;
            if (!validateDates(currentMedicineData[index].prodDate, currentMedicineData[index].expDate)) {
                openDateErrorModal();
                currentMedicineData[index].prodDate = '';
                input.value = '';
            }
            saveCurrentBox();
        };
        prodDateCell.appendChild(input);
    } else {
        prodDateCell.textContent = item.prodDate || '-';
    }
    row.appendChild(prodDateCell);

    const expDateCell = document.createElement('td');
    if (isEditing) {
        const input = document.createElement('input');
        input.type = 'date';
        input.value = item.expDate || '';
        input.onchange = (e) => {
            currentMedicineData[index].expDate = e.target.value;
            if (!validateDates(currentMedicineData[index].prodDate, currentMedicineData[index].expDate)) {
                openDateErrorModal();
                currentMedicineData[index].expDate = '';
                input.value = '';
            }
            saveCurrentBox();
        };
        expDateCell.appendChild(input);
    } else {
        expDateCell.textContent = item.expDate || '-';
    }
    row.appendChild(expDateCell);

    const usageCell = document.createElement('td');
    const usageDisplay = document.createElement('div');
    usageDisplay.className = 'usage-display';
    usageDisplay.textContent = item.usage ? item.usage.join(', ') : '选择';
    if (isEditing) {
        usageDisplay.onclick = () => openUsageModal(index);
    }
    usageCell.appendChild(usageDisplay);
    row.appendChild(usageCell);

    const freqCell = document.createElement('td');
    if (isEditing) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = item.frequency || '';
        input.placeholder = '频率';
        input.onchange = (e) => {
            currentMedicineData[index].frequency = e.target.value;
            saveCurrentBox();
        };
        freqCell.appendChild(input);
    } else {
        freqCell.textContent = item.frequency || '-';
    }
    row.appendChild(freqCell);

    const actionCell = document.createElement('td');
    actionCell.className = 'action-col';
    if (isEditing) {
        actionCell.classList.remove('hidden');
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '删除';
        deleteBtn.onclick = () => deleteRow(index);
        actionCell.appendChild(deleteBtn);
    } else {
        actionCell.classList.add('hidden');
    }
    row.appendChild(actionCell);

    return row;
}

function handleImageUpload(e, index) {
    const file = e.target.files[0];
    if (file) {
        processingModal.classList.remove('hidden');
        progressFill.style.width = '0%';
        
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 20;
            if (progress <= 80) {
                progressFill.style.width = progress + '%';
            }
        }, 100);
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxSize = 200;
                
                if (width > height) {
                    if (width > maxSize) {
                        height = height * maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = width * maxSize / height;
                        height = maxSize;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                progressFill.style.width = '100%';
                
                setTimeout(() => {
                    currentMedicineData[index].image = canvas.toDataURL('image/jpeg', 0.7);
                    saveCurrentBox();
                    renderTable();
                    processingModal.classList.add('hidden');
                    clearInterval(progressInterval);
                }, 300);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function openUsageModal(index) {
    currentEditingRow = index;
    usageCheckboxes.forEach(cb => cb.checked = false);
    if (currentMedicineData[index].usage) {
        currentMedicineData[index].usage.forEach(u => {
            const checkbox = usageModal.querySelector(`input[value="${u}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    usageModal.classList.remove('hidden');
}

function closeUsageModal() {
    usageModal.classList.add('hidden');
    currentEditingRow = null;
}

function confirmUsage() {
    const selected = [];
    usageCheckboxes.forEach(cb => {
        if (cb.checked) selected.push(cb.value);
    });
    if (currentEditingRow !== null) {
        currentMedicineData[currentEditingRow].usage = selected;
        saveCurrentBox();
        renderTable();
    }
    closeUsageModal();
}

function openDeleteMedicineModal(index) {
    currentDeletingMedicineIndex = index;
    deleteMedicineModal.classList.remove('hidden');
}

function closeDeleteMedicineModal() {
    deleteMedicineModal.classList.add('hidden');
    currentDeletingMedicineIndex = null;
}

function confirmDeleteMedicine() {
    if (currentDeletingMedicineIndex !== null) {
        currentMedicineData.splice(currentDeletingMedicineIndex, 1);
        saveCurrentBox();
        renderTable();
    }
    closeDeleteMedicineModal();
}

function deleteRow(index) {
    openDeleteMedicineModal(index);
}

function addRow() {
    currentMedicineData.push({
        image: '',
        name: '',
        prodDate: '',
        expDate: '',
        usage: [],
        frequency: ''
    });
    saveCurrentBox();
    renderTable();
}

function toggleEdit() {
    isEditing = !isEditing;
    editBtn.textContent = isEditing ? '完成' : '编辑';
    
    const actionColHeader = document.querySelector('#medicine-table thead th.action-col');
    if (isEditing) {
        addRowBtn.classList.remove('hidden');
        if (actionColHeader) {
            actionColHeader.classList.remove('hidden');
        }
    } else {
        addRowBtn.classList.add('hidden');
        if (actionColHeader) {
            actionColHeader.classList.add('hidden');
        }
        saveCurrentBox();
        if (currentMedicineData.length > 0) {
            showSampleRow = false;
        }
    }
    renderTable();
}

openBtn.addEventListener('click', () => {
    renderBoxButtons();
    showPage(selectPage);
});

newBoxBtn.addEventListener('click', openNameModal);
selectEditBtn.addEventListener('click', toggleSelectEdit);

backHomeBtn.addEventListener('click', () => {
    isSelectEditing = false;
    showPage(homePage);
});

backSelectBtn.addEventListener('click', () => {
    saveCurrentBox();
    renderBoxButtons();
    showPage(selectPage);
});

editBtn.addEventListener('click', toggleEdit);
addRowBtn.addEventListener('click', addRow);

cancelUsageBtn.addEventListener('click', closeUsageModal);
confirmUsageBtn.addEventListener('click', confirmUsage);

usageModal.addEventListener('click', (e) => {
    if (e.target === usageModal) closeUsageModal();
});

cancelNameBtn.addEventListener('click', closeNameModal);
confirmNameBtn.addEventListener('click', confirmName);

nameModal.addEventListener('click', (e) => {
    if (e.target === nameModal) closeNameModal();
});

boxNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') confirmName();
});

cancelRenameBtn.addEventListener('click', closeRenameModal);
confirmRenameBtn.addEventListener('click', confirmRename);

renameModal.addEventListener('click', (e) => {
    if (e.target === renameModal) closeRenameModal();
});

renameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') confirmRename();
});

cancelDeleteBtn.addEventListener('click', closeDeleteModal);
confirmDeleteBtn.addEventListener('click', confirmDelete);

deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
});

okDuplicateBtn.addEventListener('click', closeDuplicateModal);
duplicateModal.addEventListener('click', (e) => {
    if (e.target === duplicateModal) closeDuplicateModal();
});

okLimitBtn.addEventListener('click', closeLimitModal);
limitModal.addEventListener('click', (e) => {
    if (e.target === limitModal) closeLimitModal();
});

okDateErrorBtn.addEventListener('click', closeDateErrorModal);
dateErrorModal.addEventListener('click', (e) => {
    if (e.target === dateErrorModal) closeDateErrorModal();
});

cancelDeleteMedicineBtn.addEventListener('click', closeDeleteMedicineModal);
confirmDeleteMedicineBtn.addEventListener('click', confirmDeleteMedicine);

deleteMedicineModal.addEventListener('click', (e) => {
    if (e.target === deleteMedicineModal) closeDeleteMedicineModal();
});

okNameErrorBtn.addEventListener('click', closeNameErrorModal);

nameErrorModal.addEventListener('click', (e) => {
    if (e.target === nameErrorModal) closeNameErrorModal();
});
