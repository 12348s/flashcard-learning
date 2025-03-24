document.addEventListener("DOMContentLoaded", () => {
    const flashcardContainer = document.getElementById("flashcardContainer");
    const toggleDarkMode = document.getElementById("toggleDarkMode");
    const progressText = document.getElementById("progress");
    const totalText = document.getElementById("total");
    const accuracyText = document.getElementById("accuracy");
    const categoryFilter = document.getElementById("categoryFilter");
    const testCategorySelect = document.getElementById("testCategorySelect");

    let flashcards = JSON.parse(localStorage.getItem("flashcards")) || [];
    let reviewedCount = 0;
    let correctAnswers = 0;
    let darkModeEnabled = false;
    let testCards = [];
    let currentTestIndex = 0;
    let testCorrectCount = 0;

    // TestMode Bootstrap Modal
    let testModeModal = new bootstrap.Modal(document.getElementById('testModeModal'), {
        backdrop: 'static',
        keyboard: false
    });

    function saveFlashcards() {
        localStorage.setItem("flashcards", JSON.stringify(flashcards));
    }

    window.addFlashcard = () => {
        const question = document.getElementById("questionInput").value;
        const answer = document.getElementById("answerInput").value;
        const category = document.getElementById("categoryInput").value || "General";

        if (question && answer) {
            flashcards.push({ question, answer, category, reviewed: false, bookmarked: false });
            saveFlashcards();
            updateCategories();
            renderFlashcards();
        }
    };

    function updateCategories() {
        const categories = [...new Set(flashcards.map(card => card.category))];
        
        
        categoryFilter.innerHTML = '<option value="All">All Categories</option>';
        categories.forEach(category => {
            categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
        });
        
        
        testCategorySelect.innerHTML = '<option value="All">All Categories</option>';
        categories.forEach(category => {
            testCategorySelect.innerHTML += `<option value="${category}">${category}</option>`;
        });
    }

    function renderFlashcards() {
        flashcardContainer.innerHTML = "";
        flashcards.forEach((card, index) => {
            flashcardContainer.innerHTML += `
                <div class="col-md-4 flashcard-wrapper">
                    <div class="flashcard ${card.bookmarked ? 'bookmarked' : ''}" onclick="flipCard(${index})">
                        <div class="flashcard-inner">
                            <div class="flashcard-front">${card.question}</div>
                            <div class="flashcard-back">
                                ${card.answer}
                                <button class="btn btn-warning btn-sm mt-2" onclick="toggleBookmark(${index}, event)">
                                    ${card.bookmarked ? 'Unbookmark' : 'Bookmark'}
                                </button>
                                <button class="btn btn-danger btn-sm mt-2" onclick="deleteFlashcard(${index}, event)">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
        updateProgress();
    }

    window.flipCard = (index) => {
        flashcardContainer.children[index].querySelector(".flashcard").classList.toggle("flip");
        flashcards[index].reviewed = true;
        reviewedCount++;
        saveFlashcards();
        updateProgress();
    };

    window.deleteFlashcard = (index, event) => {
        event.stopPropagation();
        flashcards.splice(index, 1);
        saveFlashcards();
        renderFlashcards();
    };

    window.toggleBookmark = (index, event) => {
        event.stopPropagation();
        flashcards[index].bookmarked = !flashcards[index].bookmarked;
        saveFlashcards();
        renderFlashcards();
    };

    window.shuffleFlashcards = () => {
        flashcards = flashcards.sort(() => Math.random() - 0.5);
        renderFlashcards();
    };

    window.filterByCategory = () => {
        const selectedCategory = categoryFilter.value;
        flashcardContainer.innerHTML = "";
    
        const filteredFlashcards = flashcards.filter(card => 
            selectedCategory === "All" || card.category === selectedCategory
        );
    
        filteredFlashcards.forEach((card, index) => {
            flashcardContainer.innerHTML += `
                <div class="col-md-4 flashcard-wrapper">
                    <div class="flashcard ${card.bookmarked ? 'bookmarked' : ''}" onclick="flipCard(${index})">
                        <div class="flashcard-inner">
                            <div class="flashcard-front">${card.question}</div>
                            <div class="flashcard-back">
                                ${card.answer}
                                <button class="btn btn-warning btn-sm mt-2" onclick="toggleBookmark(${index}, event)">
                                    ${card.bookmarked ? 'Unbookmark' : 'Bookmark'}
                                </button>
                                <button class="btn btn-danger btn-sm mt-2" onclick="deleteFlashcard(${index}, event)">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
    
        updateProgress();
    };
    
    function updateProgress() {
        const reviewedCards = flashcards.filter(card => card.reviewed).length;
        const totalCards = flashcards.length;
        progressText.textContent = reviewedCards;
        totalText.textContent = totalCards;
        accuracyText.textContent = totalCards ? `${Math.round((reviewedCards / totalCards) * 100)}%` : "0%";
    }

    
    window.searchFlashcards = () => {
        const searchTerm = document.getElementById("searchFlashcards").value.toLowerCase();
        flashcardContainer.innerHTML = "";
        
        const filteredFlashcards = flashcards.filter(card => 
            card.question.toLowerCase().includes(searchTerm) || 
            card.answer.toLowerCase().includes(searchTerm)
        );
        
        filteredFlashcards.forEach((card, index) => {
            const actualIndex = flashcards.indexOf(card);
            flashcardContainer.innerHTML += `
                <div class="col-md-4 flashcard-wrapper">
                    <div class="flashcard ${card.bookmarked ? 'bookmarked' : ''}" onclick="flipCard(${actualIndex})">
                        <div class="flashcard-inner">
                            <div class="flashcard-front">${card.question}</div>
                            <div class="flashcard-back">
                                ${card.answer}
                                <button class="btn btn-warning btn-sm mt-2" onclick="toggleBookmark(${actualIndex}, event)">
                                    ${card.bookmarked ? 'Unbookmark' : 'Bookmark'}
                                </button>
                                <button class="btn btn-danger btn-sm mt-2" onclick="deleteFlashcard(${actualIndex}, event)">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
    };

    
    window.startTestMode = () => {
        const selectedCategory = testCategorySelect.value;
        
        
        testCards = selectedCategory === "All" 
            ? [...flashcards]
            : flashcards.filter(card => card.category === selectedCategory);
        
        
        testCards = testCards.sort(() => Math.random() - 0.5);
        
        if (testCards.length === 0) {
            alert("No flashcards available for testing in this category.");
            return;
        }
        
        
        currentTestIndex = 0;
        testCorrectCount = 0;
        
       
        document.getElementById("testQuestion").textContent = testCards[0].question;
        document.getElementById("testAnswer").textContent = testCards[0].answer;
        document.getElementById("answerSection").style.display = "none";
        document.getElementById("showAnswerBtn").style.display = "block";
        document.getElementById("feedbackBtns").style.display = "none";
        document.getElementById("testResults").style.display = "none";
        document.getElementById("testCounter").textContent = `1/${testCards.length}`;
        document.getElementById("testProgress").style.width = `${(1/testCards.length) * 100}%`;
        
        
        testModeModal.show();
    };

    window.showTestAnswer = () => {
        document.getElementById("answerSection").style.display = "block";
        document.getElementById("showAnswerBtn").style.display = "none";
        document.getElementById("feedbackBtns").style.display = "block";
    };

    window.recordTestResult = (isCorrect) => {
        
        if (isCorrect) {
            testCorrectCount++;
            document.getElementById("testCard").classList.add("test-result-correct");
        } else {
            document.getElementById("testCard").classList.add("test-result-incorrect");
        }
        
        
        setTimeout(() => {
            document.getElementById("testCard").classList.remove("test-result-correct", "test-result-incorrect");
            currentTestIndex++;
            
            
            if (currentTestIndex >= testCards.length) {
                finishTest();
            } else {
                
                document.getElementById("testQuestion").textContent = testCards[currentTestIndex].question;
                document.getElementById("testAnswer").textContent = testCards[currentTestIndex].answer;
                document.getElementById("answerSection").style.display = "none";
                document.getElementById("showAnswerBtn").style.display = "block";
                document.getElementById("feedbackBtns").style.display = "none";
                
               
                document.getElementById("testCounter").textContent = `${currentTestIndex + 1}/${testCards.length}`;
                document.getElementById("testProgress").style.width = `${((currentTestIndex + 1)/testCards.length) * 100}%`;
            }
        }, 1000);
    };

    function finishTest() {
        const score = Math.round((testCorrectCount / testCards.length) * 100);
        
        
        document.getElementById("testQuestion").textContent = "Test Complete!";
        document.getElementById("answerSection").style.display = "none";
        document.getElementById("showAnswerBtn").style.display = "none";
        document.getElementById("feedbackBtns").style.display = "none";
        
        
        document.getElementById("testResults").style.display = "block";
        document.getElementById("testScore").textContent = `${score}%`;
        document.getElementById("correctAnswers").textContent = testCorrectCount;
        document.getElementById("totalQuestions").textContent = testCards.length;
    }
    function setupImportExport() {
        
        const sidebarEl = document.querySelector('.col-md-3');
        const importExportSection = document.createElement('div');
        importExportSection.innerHTML = `
            <h5 class="mt-4">Import/Export</h5>
            <button class="btn btn-info w-100 mb-2" id="exportBtn">Export Flashcards</button>
            <div class="d-flex">
                <select class="form-control me-2" id="exportFormat">
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                </select>
                <button class="btn btn-secondary" id="importBtn">Import</button>
            </div>
            <input type="file" id="importFile" accept=".json,.csv" style="display: none;">
        `;
        sidebarEl.appendChild(importExportSection);
        
        
        document.getElementById('exportBtn').addEventListener('click', exportFlashcards);
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
        document.getElementById('importFile').addEventListener('change', importFlashcards);
    }
    
    window.exportFlashcards = () => {
        const format = document.getElementById('exportFormat').value;
        let dataStr, filename;
        
        if (format === 'json') {
            dataStr = JSON.stringify(flashcards, null, 2);
            filename = 'flashcards.json';
        } else {
            
            const csvHeader = 'question,answer,category,reviewed,bookmarked\n';
            const csvRows = flashcards.map(card => {
                
                const q = `"${card.question.replace(/"/g, '""')}"`;
                const a = `"${card.answer.replace(/"/g, '""')}"`;
                const c = `"${card.category.replace(/"/g, '""')}"`;
                return `${q},${a},${c},${card.reviewed},${card.bookmarked}`;
            }).join('\n');
            dataStr = csvHeader + csvRows;
            filename = 'flashcards.csv';
        }
        
        const dataBlob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/csv' });
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(dataBlob);
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };
    
    window.importFlashcards = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const content = e.target.result;
            
            try {
                if (file.name.endsWith('.json')) {
                    const imported = JSON.parse(content);
                    if (Array.isArray(imported)) {
                        
                        if (confirm(`Import ${imported.length} flashcards? This will replace your current collection.`)) {
                            flashcards = imported;
                            saveFlashcards();
                            updateCategories();
                            renderFlashcards();
                            alert('Flashcards imported successfully!');
                        }
                    } else {
                        throw new Error('Invalid JSON format');
                    }
                } else if (file.name.endsWith('.csv')) {
                    const rows = content.split('\n');
                    const header = rows[0].toLowerCase();
                    
                    if (header.includes('question') && header.includes('answer')) {
                        const importedCards = [];
                        
                        for (let i = 1; i < rows.length; i++) {
                            if (!rows[i].trim()) continue;
                            
                            
                            let inQuote = false;
                            let currentValue = '';
                            let values = [];
                            
                            for (let j = 0; j < rows[i].length; j++) {
                                const char = rows[i][j];
                                
                                if (char === '"') {
                                    inQuote = !inQuote;
                                } else if (char === ',' && !inQuote) {
                                    values.push(currentValue);
                                    currentValue = '';
                                } else {
                                    currentValue += char;
                                }
                            }
                            
                            
                            values.push(currentValue);
                            
                            
                            values = values.map(v => v.replace(/^"(.*)"$/, '$1').replace(/""/g, '"'));
                            
                            importedCards.push({
                                question: values[0],
                                answer: values[1],
                                category: values[2] || 'General',
                                reviewed: values[3] === 'true',
                                bookmarked: values[4] === 'true'
                            });
                        }
                        
                        if (importedCards.length > 0) {
                            if (confirm(`Import ${importedCards.length} flashcards? This will replace your current collection.`)) {
                                flashcards = importedCards;
                                saveFlashcards();
                                updateCategories();
                                renderFlashcards();
                                alert('Flashcards imported successfully!');
                            }
                        } else {
                            throw new Error('No valid flashcards found in CSV');
                        }
                    } else {
                        throw new Error('Invalid CSV format. The file must contain "question" and "answer" columns.');
                    }
                } else {
                    throw new Error('Unsupported file format. Please use .json or .csv files.');
                }
            } catch (error) {
                alert(`Import failed: ${error.message}`);
            }
        };
        
        reader.readAsText(file);
        
        event.target.value = '';
    };

    
    let timerInterval;
    let timeLeft;
    let timedModeEnabled = false;
    let defaultTimeLimit = 30; 

    function setupTimedMode() {
        
        const testModeSection = document.querySelector('.col-md-3 h5:nth-of-type(2)').parentNode;
        const timedModeControls = document.createElement('div');
        timedModeControls.innerHTML = `
            <div class="form-check mt-2 mb-2">
                <input class="form-check-input" type="checkbox" id="enableTimedMode">
                <label class="form-check-label" for="enableTimedMode">
                    Enable Timed Mode
                </label>
            </div>
            <div id="timedModeOptions" style="display: none;">
                <div class="input-group mb-2">
                    <input type="number" class="form-control" id="timeLimit" value="${defaultTimeLimit}" min="5" max="120">
                    <span class="input-group-text">seconds</span>
                </div>
            </div>
        `;
        
        
        const startTestBtn = testModeSection.querySelector('.btn-success');
        testModeSection.insertBefore(timedModeControls, startTestBtn);
        
        
        document.getElementById('enableTimedMode').addEventListener('change', function() {
            timedModeEnabled = this.checked;
            document.getElementById('timedModeOptions').style.display = timedModeEnabled ? 'block' : 'none';
        });
        
        
        const testCard = document.getElementById('testCard');
        const timerElement = document.createElement('div');
        timerElement.id = 'timer';
        timerElement.className = 'mt-2 mb-2 text-center';
        timerElement.style.display = 'none';
        timerElement.innerHTML = `
            <div class="progress">
                <div id="timerBar" class="progress-bar bg-info" role="progressbar" style="width: 100%"></div>
            </div>
            <p class="mt-1"><span id="timerText">30</span> seconds remaining</p>
        `;
        testCard.parentNode.insertBefore(timerElement, testCard.nextSibling);
    }

    
    const originalStartTestMode = window.startTestMode;
    window.startTestMode = function() {
        originalStartTestMode();
        
        
        if (timedModeEnabled) {
            const timerElement = document.getElementById('timer');
            timerElement.style.display = 'block';
            
            startTimer();
        } else {
            document.getElementById('timer').style.display = 'none';
        }
    };

    function startTimer() {
        
        clearInterval(timerInterval);
        
        
        timeLeft = parseInt(document.getElementById('timeLimit').value) || defaultTimeLimit;
        if (timeLeft < 5) timeLeft = 5;
        if (timeLeft > 120) timeLeft = 120;
        
        
        const timerText = document.getElementById('timerText');
        const timerBar = document.getElementById('timerBar');
        timerText.textContent = timeLeft;
        timerBar.style.width = '100%';
        timerBar.className = 'progress-bar bg-info';
        
      
        timerInterval = setInterval(() => {
            timeLeft--;
            timerText.textContent = timeLeft;
            
   
            const percentage = (timeLeft / parseInt(document.getElementById('timeLimit').value)) * 100;
            timerBar.style.width = `${percentage}%`;
            
            
            if (timeLeft <= 5) {
                timerBar.className = 'progress-bar bg-danger';
            } else if (timeLeft <= 10) {
                timerBar.className = 'progress-bar bg-warning';
            }
            
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timeExpired();
            }
        }, 1000);
    }

    function timeExpired() {
        
        document.getElementById('answerSection').style.display = 'block';
        document.getElementById('showAnswerBtn').style.display = 'none';
        document.getElementById('feedbackBtns').style.display = 'block';
        document.getElementById('testCard').classList.add('test-result-incorrect');
        
        
        alert('Time expired!');
        
        
        setTimeout(() => {
            recordTestResult(false);
        }, 2000);
    }

    
    const originalRecordTestResult = window.recordTestResult;
    window.recordTestResult = function(isCorrect) {
        
        clearInterval(timerInterval);
        
       
        originalRecordTestResult(isCorrect);
        
        
        if (currentTestIndex < testCards.length - 1 && timedModeEnabled) {
            setTimeout(() => {
                startTimer();
            }, 1000);
        }
    };

    toggleDarkMode.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        darkModeEnabled = !darkModeEnabled;
        toggleDarkMode.textContent = darkModeEnabled ? "Light Mode" : "Dark Mode";
    });

    renderFlashcards();
    updateCategories();
    setupImportExport();
    setupTimedMode();
});
