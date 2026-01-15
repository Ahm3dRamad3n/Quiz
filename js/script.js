        // ===== الثيمات المتاحة =====
        const themes = [
            { name: '🔵 أزرق بنفسجي', primary: '#667eea', secondary: '#764ba2' },
            { name: '🔴 أحمر برتقالي', primary: '#f44336', secondary: '#ff9800' },
            { name: '🟢 أخضر سماوي', primary: '#4caf50', secondary: '#00bcd4' },
            { name: '💗 وردي بنفسجي', primary: '#e91e63', secondary: '#9c27b0' },
            { name: '🔷 أزرق سماوي', primary: '#2196f3', secondary: '#00bcd4' },
            { name: '🟠 برتقالي أحمر', primary: '#ff6f00', secondary: '#d32f2f' },
            { name: '🌲 أخضر داكن', primary: '#1b5e20', secondary: '#388e3c' },
            { name: '💜 بنفسجي فاتح', primary: '#7b1fa2', secondary: '#c2185b' },
            { name: '🌊 أزرق داكن', primary: '#0d47a1', secondary: '#1565c0' },
            { name: '🏝️ تركواز', primary: '#00796b', secondary: '#00897b' },
            { name: '✨ ذهبي', primary: '#f57f17', secondary: '#ff6f00' },
            { name: '🌙 رمادي أزرق', primary: '#455a64', secondary: '#546e7a' },
            { name: '🖤 Dark - أسود', primary: '#1a1a1a', secondary: '#2d2d2d' },
            { name: '🌑 Dark - رمادي', primary: '#2c3e50', secondary: '#34495e' },
            { name: '🌃 Dark - أزرق داكن', primary: '#1e3a5f', secondary: '#2c5aa0' }
        ];

        // ===== المتغيرات الرئيسية =====
        let quizzes = [];
        let currentQuiz = null;
        let currentQuestionIndex = 0;
        let answers = {}; // تتبع إجابات المستخدم
        let submitted = {}; // تتبع الأسئلة التي تم تقديم إجاباتها
        let skipped = new Set();
        let correctCount = 0;
        let incorrectCount = 0;
        let startTime = null;
        let timerInterval = null;
        let isTranslated = false;
        let timerMode = 'none';
        let timerDuration = 0;
        let timerStartTime = null;
        let timeExpired = false;

        // ===== تحميل البيانات =====
        async function loadQuizzes() {
            try {
                const response = await fetch('questions.json');
                quizzes = await response.json();
                initializeApp();
            } catch (error) {
                console.error('خطأ في تحميل الكويزات:', error);
                quizzes = [];
                initializeApp();
            }
        }

        function initializeApp() {
            loadTheme();
            displayThemeOptions();
            displayQuizzes();
        }

        // ===== نظام الثيمات =====
        function displayThemeOptions() {
            const container = document.getElementById('themeList');
            container.innerHTML = '';

            themes.forEach((theme, index) => {
                const div = document.createElement('div');
                div.className = 'theme-item';
                div.textContent = theme.name;
                div.onclick = () => {
                    applyTheme(index);
                    closeThemeMenu();
                };

                const savedTheme = localStorage.getItem('selectedTheme') || '0';
                if (parseInt(savedTheme) === index) {
                    div.classList.add('active');
                }

                container.appendChild(div);
            });
        }

        function toggleThemeMenu() {
            const menu = document.getElementById('themeMenu');
            menu.classList.toggle('show');
        }

        function closeThemeMenu() {
            document.getElementById('themeMenu').classList.remove('show');
        }

        document.addEventListener('click', (e) => {
            const menu = document.getElementById('themeMenu');
            const btn = document.querySelector('.theme-toggle-btn');
            if (!menu.contains(e.target) && !btn.contains(e.target)) {
                closeThemeMenu();
            }
        });

        function applyTheme(index) {
            const theme = themes[index];
            document.documentElement.style.setProperty('--primary', theme.primary);
            document.documentElement.style.setProperty('--secondary', theme.secondary);
            localStorage.setItem('selectedTheme', index);
            displayThemeOptions();
        }

        function loadTheme() {
            const savedTheme = localStorage.getItem('selectedTheme') || '0';
            applyTheme(parseInt(savedTheme));
        }

        // ===== عرض الكويزات =====
        function displayQuizzes() {
            const grid = document.getElementById('quizzesGrid');
            const emptyState = document.getElementById('emptyState');
            grid.innerHTML = '';

            if (quizzes.length === 0) {
                emptyState.style.display = 'block';
                return;
            }

            emptyState.style.display = 'none';

            quizzes.forEach((quiz, index) => {
                const card = document.createElement('div');
                card.className = 'quiz-card';

                const questionCount = quiz.questions.length;

                card.innerHTML = `
                    <h3>${quiz.name}</h3>
                    <p>${quiz.description || 'كويز تفاعلي'}</p>
                    <div class="quiz-info">
                        <span class="question-count">${questionCount} أسئلة</span>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <div class="timer-option">
                            <input type="radio" name="timer_${index}" value="none" id="timer_none_${index}" checked>
                            <label for="timer_none_${index}">بدون وقت</label>
                        </div>
                        <div class="timer-option">
                            <input type="radio" name="timer_${index}" value="ascending" id="timer_asc_${index}">
                            <label for="timer_asc_${index}">عد تصاعدي</label>
                        </div>
                        <div class="timer-option">
                            <input type="radio" name="timer_${index}" value="descending" id="timer_desc_${index}">
                            <label for="timer_desc_${index}">عد تنازلي</label>
                            <div class="timer-config" id="timer_config_${index}">
                                <label>اختر الوقت (بالدقائق):</label>
                                <input type="number" min="1" max="120" value="10" id="timer_value_${index}">
                            </div>
                        </div>
                    </div>
                    <button class="btn-primary" style="width: 100%;" onclick="startQuiz(${index})">ابدأ الكويز</button>
                `;

                const noneRadio = card.querySelector(`#timer_none_${index}`);
                const ascRadio = card.querySelector(`#timer_asc_${index}`);
                const descRadio = card.querySelector(`#timer_desc_${index}`);
                const config = card.querySelector(`#timer_config_${index}`);

                noneRadio.addEventListener('change', () => {
                    config.classList.remove('show');
                });

                ascRadio.addEventListener('change', () => {
                    config.classList.remove('show');
                });

                descRadio.addEventListener('change', () => {
                    config.classList.toggle('show');
                });

                grid.appendChild(card);
            });
        }

        // ===== بدء الكويز =====
        function startQuiz(index) {
            currentQuiz = quizzes[index];
            currentQuestionIndex = 0;
            answers = {};
            submitted = {};
            skipped = new Set();
            correctCount = 0;
            incorrectCount = 0;
            isTranslated = false;
            timeExpired = false;

            const timerRadios = document.getElementsByName(`timer_${index}`);
            timerMode = 'none';
            timerRadios.forEach(radio => {
                if (radio.checked) {
                    timerMode = radio.value;
                }
            });

            if (timerMode === 'descending') {
                const minutes = parseInt(document.getElementById(`timer_value_${index}`).value);
                timerDuration = minutes * 60;
            }

            startTime = Date.now();
            timerStartTime = Date.now();

            document.getElementById('homePage').style.display = 'none';
            document.getElementById('quizPage').style.display = 'block';
            document.getElementById('resultsPage').style.display = 'none';

            document.getElementById('quizTitle').textContent = currentQuiz.name;
            document.getElementById('totalQuestions').textContent = currentQuiz.questions.length;

            // إخفاء المؤقت إذا كان بدون وقت
            const timerElement = document.getElementById('timer');
            if (timerMode === 'none') {
                timerElement.classList.add('hidden');
            } else {
                timerElement.classList.remove('hidden');
                startTimer();
            }

            displayQuestion();
        }

        // ===== نظام المؤقت =====
        function startTimer() {
            if (timerInterval) clearInterval(timerInterval);

            timerInterval = setInterval(() => {
                let display = '';

                if (timerMode === 'ascending') {
                    const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
                    const minutes = Math.floor(elapsed / 60);
                    const seconds = elapsed % 60;
                    display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                } else if (timerMode === 'descending') {
                    const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
                    const remaining = timerDuration - elapsed;

                    if (remaining <= 0) {
                        clearInterval(timerInterval);
                        timeExpired = true;
                        markRemainingAsSkipped();
                        showResults();
                        return;
                    }

                    const minutes = Math.floor(remaining / 60);
                    const seconds = remaining % 60;
                    display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                }

                document.getElementById('timer').textContent = display;
            }, 1000);
        }

        function markRemainingAsSkipped() {
            for (let i = currentQuestionIndex; i < currentQuiz.questions.length; i++) {
                if (!submitted[i]) {
                    skipped.add(i);
                    submitted[i] = true;
                }
            }
        }

        // ===== عرض السؤال =====
        function displayQuestion() {
            const question = currentQuiz.questions[currentQuestionIndex];

            document.getElementById('questionNumber').textContent = `السؤال ${currentQuestionIndex + 1}`;
            document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;

            let typeText = '';
            if (question.type === 'true_false') typeText = 'صح / خطأ';
            else if (question.type === 'choice') typeText = 'اختيار واحد';
            else if (question.type === 'multiple_choice') typeText = 'اختيارات متعددة';

            document.getElementById('questionType').textContent = typeText;

            // عرض السؤال
            let questionText = isTranslated && question.question_ar ? question.question_ar : question.question;
            document.getElementById('questionText').textContent = questionText;

            // إظهار/إخفاء زر التأكيد
            const submitBtn = document.getElementById('submitBtn');
            if (question.type === 'multiple_choice') {
                submitBtn.style.display = 'inline-block';
                submitBtn.disabled = true;
            } else {
                submitBtn.style.display = 'none';
            }

            // إخفاء الملاحظات إذا لم يكن السؤال محلول
            const feedbackElement = document.getElementById('feedback');
            const isAnswered = submitted[currentQuestionIndex];
            
            if (!isAnswered) {
                feedbackElement.innerHTML = '';
                feedbackElement.classList.remove('show', 'correct', 'incorrect');
            }

            // عرض الخيارات
            const optionsContainer = document.getElementById('optionsContainer');
            optionsContainer.innerHTML = '';

            const groupName = `question_${currentQuestionIndex}`;
            let options = isTranslated && question.options_ar ? question.options_ar : question.options;

            const isSkippedQuestion = skipped.has(currentQuestionIndex);

            options.forEach((option, idx) => {
                const div = document.createElement('div');
                div.className = 'option';

                if (isAnswered && !isSkippedQuestion) {
                    div.classList.add('disabled');
                }

                const id = `option_${currentQuestionIndex}_${idx}`;
                const inputType = question.type === 'multiple_choice' ? 'checkbox' : 'radio';
                const input = document.createElement('input');
                input.type = inputType;
                input.name = groupName;
                input.value = idx;
                input.id = id;
                input.disabled = isAnswered && !isSkippedQuestion;

                if (question.type === 'multiple_choice') {
                    if (answers[currentQuestionIndex] && answers[currentQuestionIndex].includes(idx)) {
                        input.checked = true;
                        div.classList.add('selected');
                    }
                } else {
                    if (answers[currentQuestionIndex] === idx) {
                        input.checked = true;
                        div.classList.add('selected');
                    }
                }

                // تطبيق ألوان التصحيح إذا تم الإجابة
                if (isAnswered && !isSkippedQuestion) {
                    const isCorrect = checkIfCorrect(idx);
                    if (isCorrect) {
                        div.classList.add('correct');
                    } else if (answers[currentQuestionIndex] === idx || (Array.isArray(answers[currentQuestionIndex]) && answers[currentQuestionIndex].includes(idx))) {
                        div.classList.add('incorrect');
                    }
                }

                input.onchange = () => {
                    if (isAnswered && !isSkippedQuestion) return;

                    if (question.type === 'multiple_choice') {
                        const checkboxes = document.querySelectorAll(`input[name="${groupName}"]:checked`);
                        answers[currentQuestionIndex] = Array.from(checkboxes).map(cb => parseInt(cb.value));
                        updateOptionSelection(groupName);
                        updateSubmitButton();
                    } else {
                        document.querySelectorAll(`input[name="${groupName}"]`).forEach(inp => {
                            inp.parentElement.classList.remove('selected');
                        });
                        div.classList.add('selected');
                        answers[currentQuestionIndex] = idx;
                        
                        if (question.type !== 'multiple_choice') {
                            submitted[currentQuestionIndex] = true;
                            skipped.delete(currentQuestionIndex);
                            // طبق اللون الصحيح فوراً
                            const isCorrect = checkIfCorrect(idx);
                            if (isCorrect) {
                                div.classList.add('correct');
                                correctCount++;
                            } else {
                                div.classList.add('incorrect');
                                incorrectCount++;
                                // تمييز الإجابة الصحيحة
                                const correctIdx = question.correct_answer;
                                const correctOption = document.getElementById(`option_${currentQuestionIndex}_${correctIdx}`);
                                if (correctOption) {
                                    correctOption.parentElement.classList.add('correct');
                                }

                            }
                            // تجميد فوري
                            freezeQuestion();
                            showFeedback();
                        }
                    }
                };

                const label = document.createElement('label');
                label.htmlFor = id;
                label.textContent = option;

                div.appendChild(input);
                div.appendChild(label);
                optionsContainer.appendChild(div);
            });

            // إظهار الملاحظات إذا كان السؤال محلول
            if (isAnswered && !isSkippedQuestion) {
                feedbackElement.classList.add('show');
                showFeedback();
            }
            else {
                feedbackElement.classList.remove('show');
            }

            updateButtonStates();
        }

        function freezeQuestion() {
            const groupName = `question_${currentQuestionIndex}`;
            const inputs = document.querySelectorAll(`input[name="${groupName}"]`);
            inputs.forEach(input => {
                input.disabled = true;
                input.parentElement.classList.add('disabled');
            });
        }

        function checkIfCorrect(optionIdx) {
            const question = currentQuiz.questions[currentQuestionIndex];
            if (question.type === 'multiple_choice') {
                return question.correct_answers.includes(optionIdx);
            } else {
                return question.correct_answer === optionIdx;
            }
        }

        function updateOptionSelection(groupName) {
            document.querySelectorAll(`input[name="${groupName}"]`).forEach(inp => {
                inp.parentElement.classList.toggle('selected', inp.checked);
            });
        }

        function updateSubmitButton() {
            const submitBtn = document.getElementById('submitBtn');
            const question = currentQuiz.questions[currentQuestionIndex];
            
            if (question.type === 'multiple_choice') {
                const hasAnswer = answers[currentQuestionIndex] && answers[currentQuestionIndex].length > 0;
                const isSubmitted = submitted[currentQuestionIndex];
                submitBtn.disabled = !hasAnswer || isSubmitted;
            }
        }

        // ===== الترجمة =====
        function toggleTranslate() {
            isTranslated = !isTranslated;
            displayQuestion();
            showFeedback();
        }

        // ===== عرض الملاحظات =====
        function showFeedback() {
            if (answers[currentQuestionIndex] === undefined) return;
            const question = currentQuiz.questions[currentQuestionIndex];
            const feedback = document.getElementById('feedback');
            const userAnswer = answers[currentQuestionIndex];

            let isCorrect = false;

            if (question.type === 'multiple_choice') {
                isCorrect = JSON.stringify(userAnswer.sort((a, b) => a - b)) === 
                           JSON.stringify(question.correct_answers.sort((a, b) => a - b));
            } else {
                isCorrect = userAnswer === question.correct_answer;
            }

            if (isCorrect) {
                feedback.className = 'feedback show correct';
                const explanation = isTranslated && question.explanation_ar ? question.explanation_ar : question.explanation;
                feedback.innerHTML = `
                    <div class="feedback-title">✓ إجابة صحيحة!</div>
                    <div class="feedback-text">${explanation}</div>
                `;
            } else {
                let correctAnswerText = '';

                if (question.type === 'multiple_choice') {
                    const correctOptions = isTranslated && question.options_ar ? question.options_ar : question.options;
                    correctAnswerText = question.correct_answers.map(idx => correctOptions[idx]).join(' و ');
                } else {
                    const correctOptions = isTranslated && question.options_ar ? question.options_ar : question.options;
                    correctAnswerText = question.type === 'true_false' 
                        ? (question.correct_answer === 0 ? 'صحيح' : 'خطأ')
                        : correctOptions[question.correct_answer];
                }

                feedback.className = 'feedback show incorrect';
                const explanation = isTranslated && question.explanation_ar ? question.explanation_ar : question.explanation;
                feedback.innerHTML = `
                    <div class="feedback-title">✗ إجابة خاطئة</div>
                    <div class="feedback-text">
                        <strong>الإجابة الصحيحة:</strong> ${correctAnswerText}<br>
                        <strong>الشرح:</strong> ${explanation}
                    </div>
                `;
            }

            document.getElementById('correctCount').textContent = correctCount;
            document.getElementById('incorrectCount').textContent = incorrectCount;

            updateButtonStates();
        }

        // ===== تقديم الإجابة (للاختيارات المتعددة) =====
        function submitAnswer() {
            const question = currentQuiz.questions[currentQuestionIndex];
            const userAnswer = answers[currentQuestionIndex];

            if (!userAnswer || userAnswer.length === 0) {
                alert('الرجاء اختيار إجابة واحدة على الأقل');
                return;
            }

            submitted[currentQuestionIndex] = true;
            skipped.delete(currentQuestionIndex);
            // تجميد فوري
            freezeQuestion();
            showFeedback();
        }

        // ===== التنقل بين الأسئلة =====
        function nextQuestion() {
            const question = currentQuiz.questions[currentQuestionIndex];

            // التحقق من وجود إجابة
            if (!submitted[currentQuestionIndex]) {
                // إذا لم يكن هناك إجابة، اعتبره متخطى
                skipped.add(currentQuestionIndex);
                submitted[currentQuestionIndex] = true;
            }

            if (currentQuestionIndex < currentQuiz.questions.length - 1) {
                currentQuestionIndex++;
                displayQuestion();
            } else {
                showResults();
            }
        }

        function previousQuestion() {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                displayQuestion();
            }
        }

        function updateButtonStates() {
            document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
            document.getElementById('nextBtn').disabled = false;
        }

        // ===== عرض النتائج =====
        function showResults() {
            clearInterval(timerInterval);

            const totalQuestions = currentQuiz.questions.length;
            const skippedCount = skipped.size;
            const percentage = Math.round((correctCount / totalQuestions) * 100);

            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;

            document.getElementById('quizPage').style.display = 'none';
            document.getElementById('resultsPage').style.display = 'block';

            document.getElementById('finalScore').textContent = correctCount;
            document.getElementById('finalPercentage').textContent = `${percentage}%`;
            document.getElementById('finalCorrect').textContent = correctCount;
            document.getElementById('finalIncorrect').textContent = incorrectCount;
            document.getElementById('finalSkipped').textContent = skippedCount;

            // حذف الاخطاء السابقة وليس اخفائها
            document.getElementById('wrongAnswersList').innerHTML = '';
            document.getElementById('wrongAnswersContainer').style.display = 'none';
            document.getElementById('skippedAnswersList').innerHTML = '';
            document.getElementById('skippedAnswersContainer').style.display = 'none';

            // إظهار/إخفاء الوقت حسب نوع المؤقت
            const timeContainer = document.getElementById('timeContainer');
            if (timerMode === 'none') {
                timeContainer.style.display = 'none';
            } else {
                timeContainer.style.display = 'block';
                document.getElementById('totalTime').textContent = 
                    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }

            // الأسئلة الخاطئة
            const wrongAnswers = [];
            Object.keys(answers).forEach(index => {
                const question = currentQuiz.questions[index];
                let isCorrect = false;

                if (question.type === 'multiple_choice') {
                    isCorrect = JSON.stringify(answers[index].sort((a, b) => a - b)) === 
                               JSON.stringify(question.correct_answers.sort((a, b) => a - b));
                } else {
                    isCorrect = answers[index] === question.correct_answer;
                }

                if (!isCorrect) {
                    let correctAnswerText = '';
                    if (question.type === 'multiple_choice') {
                        correctAnswerText = question.correct_answers.map(idx => question.options[idx]).join(' و ');
                    } else {
                        correctAnswerText = question.type === 'true_false' 
                            ? (question.correct_answer === 0 ? 'صحيح' : 'خطأ')
                            : question.options[question.correct_answer];
                    }

                    wrongAnswers.push({
                        question: question.question,
                        userAnswer: question.type === 'multiple_choice' 
                            ? answers[index].map(idx => question.options[idx]).join(' و ')
                            : question.options[answers[index]],
                        correctAnswer: correctAnswerText,
                        explanation: question.explanation
                    });
                }
            });

            if (wrongAnswers.length > 0) {
                document.getElementById('wrongAnswersContainer').style.display = 'block';
                const list = document.getElementById('wrongAnswersList');
                list.innerHTML = '';

                wrongAnswers.forEach((item, idx) => {
                    const div = document.createElement('div');
                    div.className = 'answer-item';
                    div.innerHTML = `
                        <div class="question"><strong>${idx + 1}. ${item.question}</strong></div>
                        <div class="your-answer">إجابتك: <strong>${item.userAnswer}</strong></div>
                        <div class="correct-answer">الإجابة الصحيحة: <strong>${item.correctAnswer}</strong></div>
                        <div class="explanation">الشرح: ${item.explanation}</div>
                    `;
                    list.appendChild(div);
                });
            }
            

            // الأسئلة المتخطاة
            const skippedAnswers = [];
            skipped.forEach(index => {
                const question = currentQuiz.questions[index];
                let correctAnswerText = '';

                if (question.type === 'multiple_choice') {
                    correctAnswerText = question.correct_answers.map(idx => question.options[idx]).join(' و ');
                } else {
                    correctAnswerText = question.type === 'true_false' 
                        ? (question.correct_answer === 0 ? 'صحيح' : 'خطأ')
                        : question.options[question.correct_answer];
                }

                skippedAnswers.push({
                    question: question.question,
                    correctAnswer: correctAnswerText,
                    explanation: question.explanation
                });
            });

            if (skippedAnswers.length > 0) {
                document.getElementById('skippedAnswersContainer').style.display = 'block';
                const list = document.getElementById('skippedAnswersList');
                list.innerHTML = '';

                skippedAnswers.forEach((item, idx) => {
                    const div = document.createElement('div');
                    div.className = 'skipped-item';
                    div.innerHTML = `
                        <div class="question"><strong>${idx + 1}. ${item.question}</strong></div>
                        <div class="correct-answer">الإجابة الصحيحة: <strong>${item.correctAnswer}</strong></div>
                        <div class="explanation">الشرح: ${item.explanation}</div>
                    `;
                    list.appendChild(div);
                });
            }

            // إظهار زر تحميل PDF إذا كانت هناك أخطاء
            const downloadBtn = document.getElementById('downloadPdfBtn');
            if (wrongAnswers.length > 0 || skippedAnswers.length > 0) {
                downloadBtn.style.display = 'inline-block';
            } else {
                downloadBtn.style.display = 'none';
            }

        }

        // دالة مساعدة لتحميل الخط المحلي
        async function loadLocalFont(url) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error();
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result.split(',')[1]);
                    reader.readAsDataURL(blob);
                });
            } catch (e) {
                console.error(e);
                alert("تأكد من وجود ملف Cairo.ttf بجوار ملف HTML");
                throw e;
            }
        }

        // دالة عكس الكلمات العربية (الحل المعتمد للمشكلة)
        function fixArabic(text) {
            if (!text) return "";
            const IsContainingArabic = /[\u0600-\u06FF]/.test(text);    
            if (!IsContainingArabic) return text;
            const startindexenglish = text.search(/[A-Za-z0-9]/);
            if (startindexenglish === -1) {
                return text.split(' ').reverse().join(' ');
            }
            return  text.substring(startindexenglish - 1) + " "
            + text.substring(0, startindexenglish - 1).split(' ').reverse().join(' ') ;
        }

        // ===== تحميل تقرير الأخطاء كملف PDF =====
        async function downloadErrorsPDF() {
            const btn = document.getElementById('downloadPdfBtn');
            if (!btn) return;

            const originalText = btn.innerHTML;
            btn.innerHTML = '⏳ جاري التصميم...';
            btn.disabled = true;

            try {
                const fontBase64 = await loadLocalFont('./Cairo.ttf');

                pdfMake.vfs = { "Cairo.ttf": fontBase64 };
                pdfMake.fonts = {
                    Cairo: {
                        normal: 'Cairo.ttf',
                        bold: 'Cairo.ttf',
                        italics: 'Cairo.ttf',
                        bolditalics: 'Cairo.ttf'
                    }
                };

                const totalQuestions = currentQuiz.questions.length;
                const percentage = Math.round((correctCount / totalQuestions) * 100);
                
                const colors = {
                    wrongBg: '#fff5f5',     // خلفية حمراء فاتحة جداً للأخطاء
                    wrongBorder: '#ff4d4f', // لون الخط الجانبي للأخطاء
                    skipBg: '#fffbf0',      // خلفية صفراء فاتحة للمتخطاة
                    skipBorder: '#faad14',  // لون الخط الجانبي للمتخطاة
                    textDark: '#333333',
                    greenText: '#389e0d',   // أخضر داكن للإجابة الصحيحة
                    redText: '#cf1322'      // أحمر للإجابة الخاطئة
                };

                const iconCross = {
                    svg: `<svg viewBox="0 0 24 24"><path fill="${colors.wrongBorder}" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
                    width: 15, 
                    height: 15
                };

                const iconWarn = {
                    svg: `<svg viewBox="0 0 24 24"><path fill="${colors.skipBorder}" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`,
                    width: 15, 
                    height: 15
                };

                let content = [];

                // 1. الهيدر (Header)
                content.push({ text: fixArabic(' تقرير مراجعة الأخطاء'), style: 'header' });
                content.push({ text: currentQuiz.name, style: 'subheader' });
                content.push({ 
                    text: ` (${percentage}%) ${totalQuestions} من  ${correctCount} النتيجة: `, 
                    style: 'score',
                    color: percentage >= 50 ? colors.greenText : colors.redText
                });
                content.push({ text: ' ', margin: [0, 10] }); // مسافة

                // دالة لبناء "بطاقة السؤال" وتنسيقها
                const createQuestionCard = (child, type) => {
                    const qText = child.querySelector('.question')?.innerText || "";
                    const myAns = child.querySelector('.your-answer')?.innerText || "";
                    const correctAns = child.querySelector('.correct-answer')?.innerText || "";
                    const explain = child.querySelector('.explanation')?.innerText || "";

                    // تحديد الألوان حسب النوع (خطأ أم تخطي)
                    const bgColor = type === 'wrong' ? colors.wrongBg : colors.skipBg;
                    const borderColor = type === 'wrong' ? colors.wrongBorder : colors.skipBorder;

                    const isEnglish = /^[A-Za-z]/.test(qText.trim());

                    // محتوى البطاقة
                    const cardContent = [];
                    
                    // السؤال
                    cardContent.push({
                        text: isEnglish ? qText : fixArabic(qText),
                        style: 'questionText',
                        alignment: isEnglish ? 'left' : 'right'
                    });

                    // الإجابات
                    if (myAns) {
                        cardContent.push({
                            text: [ { text: isEnglish ? myAns : fixArabic(myAns), color: colors.redText } ],
                            alignment: 'right',
                            margin: [0, 5, 0, 2]
                        });
                    }

                    if (correctAns) {
                        cardContent.push({
                            text: [ { text: isEnglish ? correctAns : fixArabic(correctAns), color: colors.greenText } ],
                            alignment: 'right',
                            margin: [0, 2, 0, 5]
                        });
                    }

                    if (explain) {
                        cardContent.push({
                            text: [ { text: isEnglish ? explain : fixArabic(explain), italics: true, color: '#666' } ],
                            style: 'explanation',
                            alignment: 'right'
                        });
                    }

                    // استخدام جدول (Table) لعمل الخلفية والحدود
                    return {
                        table: {
                            widths: ['1%', '99%'], // عمود صغير للحد الملون، والباقي للمحتوى
                            body: [
                                [
                                    { 
                                        text: '', // العمود الملون الفارغ
                                        fillColor: borderColor, 
                                        border: [false, false, false, false] 
                                    }, 
                                    { 
                                        stack: cardContent, 
                                        fillColor: bgColor, 
                                        border: [false, false, false, false], // إخفاء حدود الجدول
                                        margin: [10, 10, 10, 10] // Padding داخلي
                                    }
                                ]
                            ]
                        },
                        layout: 'noBorders', // تأكيد إخفاء الحدود الافتراضية
                        margin: [0, 0, 0, 15], // مسافة أسفل كل بطاقة
                        unbreakable: true // منع قص البطاقة
                    };
                };

                // دالة معالجة الأقسام
                // دالة معالجة الأقسام (تم تعديلها لدعم الأيقونات)
                const processSection = (containerId, titleText, type) => {
                    const container = document.getElementById(containerId);
                    
                    // لو مفيش حاوية أو مفيش أسئلة، نخرج من الدالة
                    if (!container || container.children.length === 0) return;

                    // 1. تحديد الأيقونة واللون بناءً على نوع القسم (خطأ أم تخطي)
                    // (iconCross و iconWarn و colors لازم يكونوا متعرفين فوق الدالة دي)
                    const icon = type === 'wrong' ? iconCross : iconWarn;
                    const titleColor = type === 'wrong' ? colors.redText : colors.skipBorder;

                    // 2. إضافة العنوان + الأيقونة
                    // بنستخدم columns عشان نحطهم جنب بعض
                    content.push({
                        columns: [
                            { width: '*', text: '' }, // عمود فارغ لزق الكلام لليمين (عشان المحاذاة)
                            { 
                                width: 'auto', 
                                text: fixArabic(titleText), // النص العربي المعكوس
                                fontSize: 16, 
                                bold: true, 
                                color: titleColor,
                                margin: [0, 0, 10, 0] // مسافة صغيرة بين النص والأيقونة
                            },
                            { 
                                width: 20, 
                                svg: icon.svg, // رسم الأيقونة
                                color: icon.color, 
                                relativePosition: { y: 3 } // تظبيط ارتفاع الأيقونة عشان تكون في سوى النص
                            } 
                        ],
                        columnGap: 10, // مسافة بين الأيقونة والنص
                        margin: [0, 20, 0, 10] // هوامش العنوان كله
                    });

                    // 3. اللف على الأسئلة وإضافتها
                    Array.from(container.children).forEach((child) => {
                        // نستخدم الدالة createQuestionCard لإنشاء تصميم السؤال
                        content.push(createQuestionCard(child, type));
                    });
                };

                // معالجة البيانات
                processSection('wrongAnswersList', '  الأسئلة التي أجبت عليها بشكل خاطئ', 'wrong');
                processSection('skippedAnswersList', ' الأسئلة التي تم تخطيها', 'skip');

                if (content.length <= 4) {
                    content.push({ text: fixArabic('ممتاز! لا توجد ملاحظات.'), alignment: 'center', margin: [0, 20], color: 'green' });
                }

                const docDefinition = {
                    content: content,
                    defaultStyle: {
                        font: 'Cairo',
                        fontSize: 12,
                        alignment: 'right'
                    },
                    styles: {
                        header: { fontSize: 22, bold: true, alignment: 'center', color: '#555', margin: [0, 0, 0, 5] },
                        subheader: { fontSize: 16, bold: true, alignment: 'center', color: '#777', margin: [0, 0, 0, 10] },
                        score: { fontSize: 14, bold: true, alignment: 'center' },
                        questionText: { fontSize: 13, bold: true, color: '#333', margin: [0, 0, 0, 10] },
                        explanation: { fontSize: 11, margin: [0, 5, 0, 0] }
                    }
                };

                pdfMake.createPdf(docDefinition).download(`Quiz_Result_${currentQuiz.name}.pdf`);

            } catch (error) {
                console.error(error);
                alert("تأكد من تشغيل الموقع عبر Live Server ووجود ملف الخط");
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }

  
        // ===== إعادة المحاولة =====
        function retakeQuiz() {
            const index = quizzes.indexOf(currentQuiz);
            startQuiz(index);
        }

        // ===== العودة للرئيسية =====
        function goHome() {
            clearInterval(timerInterval);
            document.getElementById('homePage').style.display = 'flex';
            document.getElementById('quizPage').style.display = 'none';
            document.getElementById('resultsPage').style.display = 'none';
            currentQuiz = null;
        }

        // تحميل البيانات عند بدء التطبيق
        window.onload = loadQuizzes;
