document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    const resultScreen = document.getElementById('result-screen');
    const historyScreen = document.getElementById('history-screen');
    
    const gameModeSelect = document.getElementById('game-mode');
    const difficultySelect = document.getElementById('difficulty');
    const questionCountSelect = document.getElementById('question-count');
    const advancedModeToggle = document.getElementById('advanced-mode');
    const historyLimitSelect = document.getElementById('history-limit');
    const startBtn = document.getElementById('start-btn');
    const submitBtn = document.getElementById('submit-btn');
    const retryBtn = document.getElementById('retry-btn');
    const viewHistoryBtn = document.getElementById('view-history-btn');
    const viewHistoryBtnResult = document.getElementById('view-history-btn-result');
    const backToHomeBtn = document.getElementById('back-to-home-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    
    const currentQuestionEl = document.getElementById('current-question');
    const totalQuestionsEl = document.getElementById('total-questions');
    const timerEl = document.getElementById('timer');
    
    const num1El = document.getElementById('num1');
    const num2El = document.getElementById('num2');
    const operatorEl = document.getElementById('operator');
    const resultEl = document.getElementById('result');
    const answerInput = document.getElementById('answer-input');
    
    const resultModeEl = document.getElementById('result-mode');
    const resultDifficultyEl = document.getElementById('result-difficulty');
    const resultTotalEl = document.getElementById('result-total');
    const resultCorrectEl = document.getElementById('result-correct');
    const resultIncorrectEl = document.getElementById('result-incorrect');
    const resultAccuracyEl = document.getElementById('result-accuracy');
    const resultTimeEl = document.getElementById('result-time');
    const historyContainerEl = document.getElementById('history-container');
    
    // Mode tabs for history
    const allModeTab = document.getElementById('all-mode-tab');
    const additionModeTab = document.getElementById('addition-mode-tab');
    const subtractionModeTab = document.getElementById('subtraction-mode-tab');
    const mixedModeTab = document.getElementById('mixed-mode-tab');
    
    // Game state
    let gameState = {
        mode: 'addition', // 'addition', 'subtraction', or 'mixed'
        difficulty: 'basic', // 'basic' or 'advanced'
        questionCount: 10,
        currentQuestion: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        startTime: null,
        endTime: null,
        timerInterval: null,
        currentNum1: null,
        currentNum2: null,
        currentOperator: null,
        currentResult: null,
        currentQuestionType: null, // 'normal', 'findNum2', or 'findNum1'
        advancedMode: false,
        historyLimit: 30,
        currentAnswer: null
    };
    
    // Toggle functionality for advanced mode
    advancedModeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.querySelector('.toggle-text').textContent = '開啟';
        } else {
            document.querySelector('.toggle-text').textContent = '關閉';
        }
    });
    
    // Utility functions
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    function generateQuestion() {
        // Reset the UI elements first
        num1El.textContent = '?';
        num2El.textContent = '?';
        resultEl.textContent = '?';
        
        // Remove the revealed-answer class from all elements
        num1El.classList.remove('revealed-answer');
        num2El.classList.remove('revealed-answer');
        resultEl.classList.remove('revealed-answer');
        
        // Remove any feedback styling from previous question
        const questionContainer = document.querySelector('.question-container');
        questionContainer.classList.remove('correct-answer', 'incorrect-answer');
        
        // Remove any existing feedback icon
        const questionEl = document.querySelector('.question');
        const existingIcon = questionEl.querySelector('.feedback-icon');
        if (existingIcon) {
            questionEl.removeChild(existingIcon);
        }
        
        // Re-enable input and button
        answerInput.disabled = false;
        submitBtn.disabled = false;
        
        // Determine operator based on game mode
        if (gameState.mode === 'addition') {
            gameState.currentOperator = '+';
        } else if (gameState.mode === 'subtraction') {
            gameState.currentOperator = '-';
        } else {
            // Mixed mode - randomly choose + or -
            gameState.currentOperator = Math.random() < 0.5 ? '+' : '-';
        }
        
        operatorEl.textContent = gameState.currentOperator;
        
        // Generate numbers based on difficulty
        if (gameState.difficulty === 'basic') {
            // 10 以內的加減法
            if (gameState.currentOperator === '+') {
                gameState.currentNum1 = getRandomNumber(1, 9);
                gameState.currentNum2 = getRandomNumber(1, 9);
                gameState.currentResult = gameState.currentNum1 + gameState.currentNum2;
            } else {
                // For subtraction, ensure result is not negative
                gameState.currentNum1 = getRandomNumber(2, 10);
                gameState.currentNum2 = getRandomNumber(1, gameState.currentNum1 - 1);
                gameState.currentResult = gameState.currentNum1 - gameState.currentNum2;
            }
        } else {
            // 兩位數的加減法
            if (gameState.currentOperator === '+') {
                gameState.currentNum1 = getRandomNumber(1, 99);
                gameState.currentNum2 = getRandomNumber(1, 99);
                gameState.currentResult = gameState.currentNum1 + gameState.currentNum2;
            } else {
                // For subtraction, ensure result is not negative
                gameState.currentNum1 = getRandomNumber(11, 99);
                gameState.currentNum2 = getRandomNumber(1, gameState.currentNum1 - 1);
                gameState.currentResult = gameState.currentNum1 - gameState.currentNum2;
            }
        }
        
        if (!gameState.advancedMode) {
            // Normal mode: num1 + num2 = ?
            gameState.currentQuestionType = 'normal';
            gameState.currentAnswer = gameState.currentResult;
            
            num1El.textContent = gameState.currentNum1;
            num2El.textContent = gameState.currentNum2;
            resultEl.textContent = '?';
        } else {
            // Advanced mode: randomly pick between 3 question types
            const questionType = Math.random() < 0.33 ? 'normal' : Math.random() < 0.5 ? 'findNum2' : 'findNum1';
            gameState.currentQuestionType = questionType;
            
            if (questionType === 'normal') {
                // num1 + num2 = ?
                num1El.textContent = gameState.currentNum1;
                num2El.textContent = gameState.currentNum2;
                resultEl.textContent = '?';
                gameState.currentAnswer = gameState.currentResult;
            } else if (questionType === 'findNum2') {
                // num1 + ? = result
                num1El.textContent = gameState.currentNum1;
                num2El.textContent = '?';
                resultEl.textContent = gameState.currentResult;
                gameState.currentAnswer = gameState.currentNum2;
            } else {
                // ? + num2 = result
                num1El.textContent = '?';
                num2El.textContent = gameState.currentNum2;
                resultEl.textContent = gameState.currentResult;
                gameState.currentAnswer = gameState.currentNum1;
            }
        }
        
        answerInput.value = '';
        answerInput.focus();
        
        currentQuestionEl.textContent = gameState.currentQuestion + 1;
    }
    
    function updateTimer() {
        const currentTime = new Date();
        const elapsedSeconds = Math.floor((currentTime - gameState.startTime) / 1000);
        timerEl.textContent = formatTime(elapsedSeconds);
    }
    
    function startTimer() {
        gameState.startTime = new Date();
        gameState.timerInterval = setInterval(updateTimer, 1000);
    }
    
    function stopTimer() {
        clearInterval(gameState.timerInterval);
        gameState.endTime = new Date();
        const totalSeconds = Math.floor((gameState.endTime - gameState.startTime) / 1000);
        return formatTime(totalSeconds);
    }
    
    function showFeedback(isCorrect) {
        // Update the question area with the correct answer
        if (gameState.currentQuestionType === 'normal') {
            // If it was a normal question (2 + 3 = ?), update the result
            resultEl.textContent = gameState.currentResult;
            resultEl.classList.add('revealed-answer');
        } else if (gameState.currentQuestionType === 'findNum2') {
            // If it was finding the second number (2 + ? = 5), update num2
            num2El.textContent = gameState.currentNum2;
            num2El.classList.add('revealed-answer');
        } else {
            // If it was finding the first number (? + 3 = 5), update num1
            num1El.textContent = gameState.currentNum1;
            num1El.classList.add('revealed-answer');
        }

        // Add feedback indicator to the question container
        const questionContainer = document.querySelector('.question-container');
        questionContainer.classList.remove('correct-answer', 'incorrect-answer');
        questionContainer.classList.add(isCorrect ? 'correct-answer' : 'incorrect-answer');

        // Add feedback icon next to the question
        const questionEl = document.querySelector('.question');
        const feedbackIcon = document.createElement('span');
        feedbackIcon.className = `feedback-icon ${isCorrect ? 'correct' : 'incorrect'}`;
        feedbackIcon.textContent = isCorrect ? '✓' : '✗';
        
        // Remove any existing feedback icon first
        const existingIcon = questionEl.querySelector('.feedback-icon');
        if (existingIcon) {
            questionEl.removeChild(existingIcon);
        }
        
        questionEl.appendChild(feedbackIcon);
        
        // Disable the input and button temporarily
        answerInput.disabled = true;
        submitBtn.disabled = true;
    }
    
    function getHistoryKey() {
        return 'math_practice_history';
    }
    
    function loadHistoryFromStorage(mode = null) {
        const historyKey = getHistoryKey();
        const historyData = localStorage.getItem(historyKey);
        let history = historyData ? JSON.parse(historyData) : [];
        
        if (mode && mode !== 'all') {
            history = history.filter(item => item.mode === mode);
        }
        
        return history;
    }
    
    function loadAllHistoryFromStorage() {
        const historyKey = getHistoryKey();
        const historyData = localStorage.getItem(historyKey);
        return historyData ? JSON.parse(historyData) : [];
    }
    
    function saveHistoryToStorage(history) {
        const historyKey = getHistoryKey();
        localStorage.setItem(historyKey, JSON.stringify(history));
    }
    
    function addResultToHistory(result) {
        let history = loadAllHistoryFromStorage();
        history.unshift(result);
        
        // Limit the history size
        if (history.length > gameState.historyLimit) {
            history = history.slice(0, gameState.historyLimit);
        }
        
        saveHistoryToStorage(history);
    }
    
    function clearHistory(mode = null) {
        if (mode && mode !== 'all') {
            // Clear only the specified mode
            let history = loadAllHistoryFromStorage();
            history = history.filter(item => item.mode !== mode);
            saveHistoryToStorage(history);
        } else {
            // Clear all history
            localStorage.removeItem(getHistoryKey());
        }
    }
    
    function displayHistory(mode = 'all') {
        const history = loadHistoryFromStorage(mode);
        historyContainerEl.innerHTML = '';
        
        if (history.length === 0) {
            historyContainerEl.innerHTML = '<div class="empty-history">還沒有練習紀錄</div>';
            return;
        }
        
        history.forEach((item, index) => {
            const historyItemDiv = document.createElement('div');
            historyItemDiv.className = 'history-item';
            
            const date = new Date(item.date);
            const formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            
            let modeName;
            if (item.mode === 'addition') {
                modeName = '加法模式';
            } else if (item.mode === 'subtraction') {
                modeName = '減法模式';
            } else {
                modeName = '混合模式';
            }
            
            let difficultyName = item.difficulty === 'basic' ? '10以內加減法' : '兩位數加減法';
            
            // Get previous result for comparison
            let accuracyTrend = '';
            let timeTrend = '';
            
            if (index < history.length - 1) {
                const prevResult = history[index + 1];
                
                if (prevResult.mode === item.mode && prevResult.difficulty === item.difficulty) {
                    // Compare accuracy
                    const currentAccuracy = item.correctAnswers / item.totalQuestions;
                    const prevAccuracy = prevResult.correctAnswers / prevResult.totalQuestions;
                    
                    if (currentAccuracy > prevAccuracy) {
                        accuracyTrend = '<span class="progress-indicator improved">↑</span>';
                    } else if (currentAccuracy < prevAccuracy) {
                        accuracyTrend = '<span class="progress-indicator declined">↓</span>';
                    } else {
                        accuracyTrend = '<span class="progress-indicator same">→</span>';
                    }
                    
                    // Compare time (assuming same number of questions)
                    if (item.totalQuestions === prevResult.totalQuestions) {
                        const currentTimeSeconds = parseTimeToSeconds(item.time);
                        const prevTimeSeconds = parseTimeToSeconds(prevResult.time);
                        
                        if (currentTimeSeconds < prevTimeSeconds) {
                            timeTrend = '<span class="progress-indicator improved">↑</span>';
                        } else if (currentTimeSeconds > prevTimeSeconds) {
                            timeTrend = '<span class="progress-indicator declined">↓</span>';
                        } else {
                            timeTrend = '<span class="progress-indicator same">→</span>';
                        }
                    }
                }
            }
            
            historyItemDiv.innerHTML = `
                <div class="history-number">${index + 1}</div>
                <div class="history-content">
                    <div class="history-date">${formattedDate}</div>
                    <div class="history-details">
                        <span>模式: ${modeName}</span>
                        <span>難度: ${difficultyName}</span>
                        <span>題數: ${item.totalQuestions}</span>
                        <span>正確: ${item.correctAnswers}</span>
                        <span class="history-accuracy">正確率: ${Math.round(item.correctAnswers / item.totalQuestions * 100)}% ${accuracyTrend}</span>
                        <span class="history-time">時間: ${item.time} ${timeTrend}</span>
                    </div>
                </div>
            `;
            
            historyContainerEl.appendChild(historyItemDiv);
        });
    }
    
    function formatTimeChange(seconds) {
        if (seconds === 0) return '0秒';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        let result = '';
        if (minutes > 0) {
            result += `${minutes}分`;
        }
        if (remainingSeconds > 0 || minutes === 0) {
            result += `${remainingSeconds}秒`;
        }
        
        return result;
    }
    
    function parseTimeToSeconds(timeStr) {
        const [minutes, seconds] = timeStr.split(':').map(Number);
        return minutes * 60 + seconds;
    }
    
    function showHistory() {
        setupScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        historyScreen.classList.remove('hidden');
        
        // Show all history by default
        setActiveHistoryTab('all');
        displayHistory('all');
    }
    
    function setActiveHistoryTab(mode) {
        // Remove active class from all tabs
        allModeTab.classList.remove('active');
        additionModeTab.classList.remove('active');
        subtractionModeTab.classList.remove('active');
        mixedModeTab.classList.remove('active');
        
        // Add active class to the selected tab
        if (mode === 'all') {
            allModeTab.classList.add('active');
        } else if (mode === 'addition') {
            additionModeTab.classList.add('active');
        } else if (mode === 'subtraction') {
            subtractionModeTab.classList.add('active');
        } else if (mode === 'mixed') {
            mixedModeTab.classList.add('active');
        }
    }
    
    function showResults() {
        gameScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');
        
        const timeSpent = stopTimer();
        let modeName;
        
        if (gameState.mode === 'addition') {
            modeName = '加法模式';
        } else if (gameState.mode === 'subtraction') {
            modeName = '減法模式';
        } else {
            modeName = '混合模式';
        }
        
        let difficultyName = gameState.difficulty === 'basic' ? '10以內加減法' : '兩位數加減法';
        
        // Update result details
        resultModeEl.textContent = modeName;
        resultDifficultyEl.textContent = difficultyName;
        resultTotalEl.textContent = gameState.questionCount;
        resultCorrectEl.textContent = gameState.correctAnswers;
        resultIncorrectEl.textContent = gameState.incorrectAnswers;
        resultAccuracyEl.textContent = `${Math.round((gameState.correctAnswers / gameState.questionCount) * 100)}%`;
        resultTimeEl.textContent = timeSpent;
        
        // Save the result to history
        const result = {
            mode: gameState.mode,
            difficulty: gameState.difficulty,
            advancedMode: gameState.advancedMode,
            totalQuestions: gameState.questionCount,
            correctAnswers: gameState.correctAnswers,
            incorrectAnswers: gameState.incorrectAnswers,
            accuracy: Math.round((gameState.correctAnswers / gameState.questionCount) * 100),
            time: timeSpent,
            date: new Date().toISOString()
        };
        
        addResultToHistory(result);
        
        // Calculate trend summary
        const trendSummaryEl = document.getElementById('result-trend-summary');
        const history = loadHistoryFromStorage(gameState.mode);
        
        if (history.length > 1) {
            // Find the most recent previous result with the same mode and difficulty
            let prevResult = null;
            for (let i = 1; i < history.length; i++) {
                if (history[i].mode === gameState.mode && history[i].difficulty === gameState.difficulty) {
                    prevResult = history[i];
                    break;
                }
            }
            
            if (prevResult) {
                const currentAccuracy = gameState.correctAnswers / gameState.questionCount;
                const prevAccuracy = prevResult.correctAnswers / prevResult.totalQuestions;
                
                const currentTimeSeconds = parseTimeToSeconds(timeSpent);
                const prevTimeSeconds = parseTimeToSeconds(prevResult.time);
                
                const accuracyDiff = Math.round((currentAccuracy - prevAccuracy) * 100);
                const timeDiff = prevTimeSeconds - currentTimeSeconds;
                
                let accuracyTrendClass = 'same';
                let timeTrendClass = 'same';
                
                if (accuracyDiff > 0) accuracyTrendClass = 'improved';
                else if (accuracyDiff < 0) accuracyTrendClass = 'declined';
                
                if (timeDiff > 0) timeTrendClass = 'improved';
                else if (timeDiff < 0) timeTrendClass = 'declined';
                
                trendSummaryEl.innerHTML = `
                    <h3>與上次相比</h3>
                    <div class="trend-details">
                        <div class="trend ${accuracyTrendClass}">
                            正確率：${accuracyDiff > 0 ? '+' : ''}${accuracyDiff}%
                        </div>
                        <div class="trend ${timeTrendClass}">
                            時間：${timeDiff > 0 ? '-' : '+'}${formatTimeChange(Math.abs(timeDiff))}
                        </div>
                    </div>
                    <div class="indicators-note">
                        <p><span class="progress-indicator improved">↑</span> 進步</p>
                        <p><span class="progress-indicator declined">↓</span> 退步</p>
                        <p><span class="progress-indicator same">→</span> 持平</p>
                    </div>
                `;
            } else {
                trendSummaryEl.innerHTML = '';
            }
        } else {
            trendSummaryEl.innerHTML = '';
        }
    }
    
    function startGame() {
        // Read game settings
        gameState.mode = gameModeSelect.value;
        gameState.difficulty = difficultySelect.value;
        gameState.questionCount = parseInt(questionCountSelect.value);
        gameState.advancedMode = advancedModeToggle.checked;
        gameState.historyLimit = parseInt(historyLimitSelect.value);
        
        // Reset game state
        gameState.currentQuestion = 0;
        gameState.correctAnswers = 0;
        gameState.incorrectAnswers = 0;
        
        // Update UI
        totalQuestionsEl.textContent = gameState.questionCount;
        
        // Switch to game screen
        setupScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        // Generate first question
        generateQuestion();
        
        // Start timer
        startTimer();
        
        // Save settings to localStorage
        saveSettings();
    }
    
    function resetGame() {
        // Reset necessary game state
        gameState.currentQuestion = 0;
        gameState.correctAnswers = 0;
        gameState.incorrectAnswers = 0;
        
        // Start game again
        startGame();
    }
    
    function backToHome() {
        historyScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
    }
    
    function loadSettings() {
        // Load saved settings from localStorage
        const savedSettings = localStorage.getItem('math_practice_settings');
        
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            if (settings.mode) gameModeSelect.value = settings.mode;
            if (settings.difficulty) difficultySelect.value = settings.difficulty;
            if (settings.questionCount) questionCountSelect.value = settings.questionCount;
            if (settings.historyLimit) historyLimitSelect.value = settings.historyLimit;
            
            // Handle the toggle specially
            if (settings.advancedMode) {
                advancedModeToggle.checked = settings.advancedMode;
                document.querySelector('.toggle-text').textContent = '開啟';
            } else {
                advancedModeToggle.checked = false;
                document.querySelector('.toggle-text').textContent = '關閉';
            }
        }
    }
    
    function saveSettings() {
        // Save current settings to localStorage
        const settings = {
            mode: gameState.mode,
            difficulty: gameState.difficulty,
            questionCount: gameState.questionCount,
            advancedMode: gameState.advancedMode,
            historyLimit: gameState.historyLimit
        };
        
        localStorage.setItem('math_practice_settings', JSON.stringify(settings));
    }
    
    // Event Listeners
    startBtn.addEventListener('click', startGame);
    
    submitBtn.addEventListener('click', () => {
        const userAnswer = parseInt(answerInput.value);
        
        if (isNaN(userAnswer)) {
            // If the input is not a number, don't proceed
            answerInput.focus();
            return;
        }
        
        const isCorrect = userAnswer === gameState.currentAnswer;
        
        if (isCorrect) {
            gameState.correctAnswers++;
        } else {
            gameState.incorrectAnswers++;
        }
        
        showFeedback(isCorrect);
        
        // Proceed to next question after a short delay
        setTimeout(() => {
            gameState.currentQuestion++;
            
            if (gameState.currentQuestion < gameState.questionCount) {
                generateQuestion();
            } else {
                showResults();
            }
        }, 1200);
    });
    
    answerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    });
    
    retryBtn.addEventListener('click', resetGame);
    
    viewHistoryBtn.addEventListener('click', showHistory);
    viewHistoryBtnResult.addEventListener('click', showHistory);
    
    backToHomeBtn.addEventListener('click', backToHome);
    
    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('確定要清除所有紀錄嗎？')) {
            // Get current active tab
            const activeTab = document.querySelector('.mode-tab.active');
            let mode = 'all';
            
            if (activeTab.id === 'addition-mode-tab') mode = 'addition';
            else if (activeTab.id === 'subtraction-mode-tab') mode = 'subtraction';
            else if (activeTab.id === 'mixed-mode-tab') mode = 'mixed';
            
            clearHistory(mode);
            displayHistory(mode);
        }
    });
    
    // History tab events
    allModeTab.addEventListener('click', () => {
        setActiveHistoryTab('all');
        displayHistory('all');
    });
    
    additionModeTab.addEventListener('click', () => {
        setActiveHistoryTab('addition');
        displayHistory('addition');
    });
    
    subtractionModeTab.addEventListener('click', () => {
        setActiveHistoryTab('subtraction');
        displayHistory('subtraction');
    });
    
    mixedModeTab.addEventListener('click', () => {
        setActiveHistoryTab('mixed');
        displayHistory('mixed');
    });
    
    // Load saved settings
    loadSettings();
}); 