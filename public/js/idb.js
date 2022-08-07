let db;

const request = indexedDB.open('budget_tracker', 1);
request.onupgradeneeded = function(event) {
    const db = event.target.result;

    db.createObjectStore('new_transaction', { autoIncrement: true });
};
request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.online) {
        uploadTransaction();
    }
};
request.onerror = function(event) {
    console.log(event.target.errorCode);
};
function save(record) {
    const transaction = db.transaction(['new_trans', 'readwrite']);
    const budgetObjectStore = transaction.objectStore('new_trans');
    budgetObjectStore.add(record);
};
function uploadTransaction() {
    const transaction = db.transaction(['new_trans'], 'readwrite');
    const budgetObjectStore = transacton.objectStore('new_trans');
    const getAll = budgetObjectStore.getAll();
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                header: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_trans'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('new_trans');
                budgetObjectStore.clear();
                alert('All transactions submitted');
            }).catch(err => {
                console.log(err);
            });
        }
    }
}

window.addEventListener('online', uploadTransaction);