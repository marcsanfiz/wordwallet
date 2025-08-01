// script.js actualizado para conectar con el backend

// Registro de usuario
// async function registerUser(username, password, animalEmoji) {...}

// Login de usuario
// async function loginUser(username, password) {...}

// Guardar palabras del usuario
// async function saveWords(username, words) {...}

// Obtener palabras del usuario
// async function getWords(username) {...}

// Guardar estadísticas del usuario
// async function saveStats(username, statistics) {...}

// Obtener estadísticas del usuario
// async function getStats(username) {...}

// Ejemplo de uso:
// registerUser("testUser", "1234", "🐱").then(console.log);
// loginUser("testUser", "1234").then(console.log);
// saveWords("testUser", [{ word: "Hola", translation: "Hello", category: "Saludo" }]).then(console.log);
// getWords("testUser").then(console.log);
// saveStats("testUser", { mostIncorrectWords: [{ word: "Hola", count: 3 }] }).then(console.log);
// getStats("testUser").then(console.log);

let words = []; // Almacena las palabras
let score = {
    correct: 0,
    incorrect: 0
};
let exerciseHistory = []; // Almacena el historial de ejercicios
let lastExerciseType = ''; // Variable para guardar el tipo del último ejercicio
let lastSelectedCategories = []; // Variable para guardar las categorías seleccionadas
let lastQuantity = 0; // Variable para guardar la cantidad de palabras
let flashcards = [];
let currentFlashcardIndex = 0;

// Agrega estas funciones al inicio del archivo
async function registerUser(username, password, animalEmoji) {
    try {
        let users = JSON.parse(localStorage.getItem('users')) || {};
        if (users[username]) {
            throw new Error('El nombre de usuario ya está en uso. Por favor, elige otro.');
        }
        users[username] = { password, animalEmoji };
        localStorage.setItem('users', JSON.stringify(users));
        return { success: true };
    } catch (error) {
        console.error('Error en registerUser:', error);
        return { success: false, message: error.message };
    }
}

function loginUser(username, password) {
    // Obtener todos los usuarios
    const users = JSON.parse(localStorage.getItem('users')) || {};
    console.log('Usuarios disponibles:', users); // Debug
    
    // Verificar si el usuario existe
    const user = users[username];
    if (!user) {
        console.log('Usuario no encontrado:', username);
        return { success: false, message: 'Usuario no encontrado' };
    }
    
    // Verificar la contraseña
    if (user.password !== password) {
        console.log('Contraseña incorrecta para:', username);
        return { success: false, message: 'Contraseña incorrecta' };
    }
    
    console.log('Login exitoso para:', username);
    return { success: true };
}

// Modifica el window.onload para cargar el usuario actual
let currentUser = null;
window.onload = function() {
    showLoginScreen();
    populateCategories();
    loadThemeFromLocalStorage();
    
    // Cargar credenciales guardadas si existen
    const savedCredentials = JSON.parse(localStorage.getItem('savedCredentials'));
    if (savedCredentials) {
        document.getElementById('login-username').value = savedCredentials.username;
        document.getElementById('login-password').value = savedCredentials.password;
        document.getElementById('remember-user-checkbox').checked = true;
    }
};

// Guardar palabra manualmente
document.getElementById("word-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const saveBtn = document.getElementById('save-word-btn');
    const saveText = document.getElementById('save-word-text');
    const saveLoader = document.getElementById('save-word-loader');

    // Mostrar loader
    saveText.classList.add('hidden');
    saveLoader.classList.remove('hidden');

    // Simular guardado (reemplazar con tu lógica)
    setTimeout(() => {
        saveText.classList.remove('hidden');
        saveLoader.classList.add('hidden');
        alert("Palabra guardada exitosamente");
    }, 1000);
});

// Validación de Inputs
function validateInputs(word, translation, category) {
    return word !== "" && translation !== "" && category !== "";
}

// Importar palabras desde un archivo CSV
async function handleCSVImport(event) {
    event.preventDefault();
    const fileInput = document.getElementById("csv-file");
    const file = fileInput.files[0];

    if (!file) {
        alert("Por favor, selecciona un archivo CSV.");
        return;
    }

    const reader = new FileReader();

    reader.onload = async function (e) {
        const text = e.target.result;
        const importedWords = parseCSV(text);

        if (validateImportedWords(importedWords)) {
            words.push(...importedWords);
            saveWordsToLocalStorage();
            renderWordList();
            populateCategories();
            // Recargar la pantalla "Añadir Palabras"
            showAddWords();
        } else {
            alert("El archivo CSV contiene datos inválidos.");
        }
    };

    reader.readAsText(file);
}

// Validación de Palabras Importadas
function validateImportedWords(importedWords) {
    return importedWords.length > 0 && importedWords.every(wordObj => wordObj.word !== "" && wordObj.translation !== "" && wordObj.category !== "");
}

// Guardar palabras en localStorage
function saveWordsToLocalStorage() {
    if (!currentUser) return;

    try {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        userData[currentUser] = userData[currentUser] || {};
        userData[currentUser].words = words;
        localStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
        alert('No se pudo guardar la información. Inténtalo de nuevo.');
    }
}

// Cargar palabras desde localStorage
function loadWordsFromLocalStorage() {
    if (!currentUser) return;

    try {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        if (userData[currentUser] && userData[currentUser].words) {
            words = userData[currentUser].words;
        }
    } catch (error) {
        console.error('Error al cargar palabras:', error);
        words = []; // Inicializar como array vacío en caso de error
    }
}

// Guardar historial de ejercicios en localStorage
function saveExerciseHistoryToLocalStorage() {
    if (!currentUser) return;
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    userData[currentUser] = userData[currentUser] || {};
    userData[currentUser].exerciseHistory = exerciseHistory;
    localStorage.setItem('userData', JSON.stringify(userData));
}

// Cargar historial de ejercicios desde localStorage
function loadExerciseHistoryFromLocalStorage() {
    if (!currentUser) return;
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    if (userData[currentUser] && userData[currentUser].exerciseHistory) {
        exerciseHistory = userData[currentUser].exerciseHistory;
    } else {
        exerciseHistory = [];
    }
}

// Mostrar la pantalla de añadir palabras
function showAddWords() {
    document.getElementById("home-screen").classList.remove("active");
    document.getElementById("add-words-screen").classList.add("active");
    document.getElementById("exercises-screen").classList.remove("active");
    document.getElementById("statistics-screen").classList.remove("active");
    renderWordList();
    populateCategories();
}

// Mostrar la pantalla de ejercicios
function showExercises() {
    document.getElementById("home-screen").classList.remove("active");
    document.getElementById("add-words-screen").classList.remove("active");
    document.getElementById("exercises-screen").classList.add("active");
    populateCategories();
    hideExerciseContent();
}

// Mostrar la pantalla de estadísticas
function showStatistics() {
    document.getElementById("home-screen").classList.remove("active");
    document.getElementById("add-words-screen").classList.remove("active");
    document.getElementById("exercises-screen").classList.remove("active");
    document.getElementById("statistics-screen").classList.add("active");
    showMostIncorrectWords();
}

// Mostrar palabras con más fallos
function showMostIncorrectWords() {
    const mostIncorrectWordsList = document.getElementById("most-incorrect-words-list");
    mostIncorrectWordsList.innerHTML = "";

    const wordPerformance = {};

    // Primero, inicializar el contador para cada palabra en nuestro vocabulario
    words.forEach(wordObj => {
        wordPerformance[wordObj.word] = { incorrect: 0 };
        wordPerformance[wordObj.translation] = { incorrect: 0 };
    });

    // Contar todos los fallos de cada palabra y su traducción
    exerciseHistory.forEach(entry => {
        if (!entry.isCorrect) {
            // Si la palabra está en el ejercicio como pregunta
            if (wordPerformance[entry.word]) {
                wordPerformance[entry.word].incorrect++;
            }
            // Si la respuesta correcta era la traducción
            const wordObj = words.find(w => w.word === entry.word || w.translation === entry.word);
            if (wordObj) {
                const otherWord = entry.word === wordObj.word ? wordObj.translation : wordObj.word;
                if (wordPerformance[otherWord]) {
                    wordPerformance[otherWord].incorrect++;
                }
            }
        }
    });

    // Filtrar palabras con más de 3 fallos y ordenarlas por número de fallos
    const filteredWords = Object.entries(wordPerformance)
        .filter(([_, stats]) => stats.incorrect > 3)
        .sort(([, a], [, b]) => b.incorrect - a.incorrect)
        .slice(0, 10); // Limitar a las 10 palabras con más fallos

    if (filteredWords.length === 0) {
        const noWordsMessage = document.createElement("li");
        noWordsMessage.textContent = "No hay palabras con más de 3 fallos";
        mostIncorrectWordsList.appendChild(noWordsMessage);
        return;
    }

    // Crear elementos para cada palabra
    filteredWords.forEach(([word, stats]) => {
        const wordResultElement = document.createElement("li");
        // Buscar la traducción de la palabra
        const wordObj = words.find(w => w.word === word || w.translation === word);
        const translation = wordObj ? 
            (wordObj.word === word ? wordObj.translation : wordObj.word) : 
            'Traducción no disponible';
        
        wordResultElement.innerHTML = `
            <strong>${word}</strong> - ${translation}<br>
            Número de fallos: ${stats.incorrect}
        `;
        mostIncorrectWordsList.appendChild(wordResultElement);
    });
}

// Volver a la pantalla principal
function goBack() {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar solo la pantalla principal
    document.getElementById("home-screen").classList.add("active");
    
    // Limpiar el contenido del ejercicio
    clearExerciseContent();
    
    // Resetear la puntuación
    resetScore();
}

// Renderizar la lista de palabras agrupadas por categorías
function renderWordList() {
    const wordListElement = document.getElementById("word-list");
    wordListElement.innerHTML = "";

    const groupedWords = words.reduce((acc, wordObj) => {
        if (!acc[wordObj.category]) {
            acc[wordObj.category] = [];
        }
        acc[wordObj.category].push(wordObj);
        return acc;
    }, {});

    for (const [category, words] of Object.entries(groupedWords)) {
        const categoryElement = document.createElement("li");
        categoryElement.classList.add("category-item");
        categoryElement.innerHTML = `
            <div class="category-header" onclick="toggleCategory('${category}')">
                <strong>${category}</strong>
                <span class="toggle-icon">+</span>
                <button onclick="deleteCategory('${category}')" class="btn small delete-category">Eliminar</button>
            </div>
            <ul class="word-sublist hidden" id="category-${category}">
                ${words.map((wordObj, index) => `
                    <li>
                        ${wordObj.word} - ${wordObj.translation}
                        <button onclick="editWord(${index})">Editar</button>
                        <button onclick="deleteWord(${index})">Eliminar</button>
                    </li>
                `).join('')}
            </ul>
        `;
        wordListElement.appendChild(categoryElement);
    }
}

// Función para alternar la visibilidad de las categorías
function toggleCategory(category) {
    const sublist = document.getElementById(`category-${category}`);
    const toggleIcon = sublist.previousElementSibling.querySelector('.toggle-icon');
    if (sublist.classList.contains('hidden')) {
        sublist.classList.remove('hidden');
        toggleIcon.textContent = '-';
    } else {
        sublist.classList.add('hidden');
        toggleIcon.textContent = '+';
    }
}

// Editar una palabra
function editWord(index) {
    const updatedWord = prompt("Nueva palabra:", words[index].word).trim();
    const updatedTranslation = prompt("Nueva traducción:", words[index].translation).trim();
    const updatedCategory = prompt("Nueva categoría:", words[index].category).trim();

    if (validateInputs(updatedWord, updatedTranslation, updatedCategory)) {
        words[index] = { word: updatedWord, translation: updatedTranslation, category: updatedCategory };
        saveWordsToLocalStorage();
        alert("Palabra actualizada exitosamente");
        renderWordList(); // Renderizar la lista de palabras después de editar una palabra
        populateCategories();
        updateCategoryStats();
    } else {
        alert("No se realizaron cambios. Por favor, complete todos los campos correctamente.");
    }
}

// Eliminar una palabra
function deleteWord(index) {
    if (confirm("¿Estás seguro de que deseas eliminar esta palabra?")) {
        words.splice(index, 1);
        saveWordsToLocalStorage();
        alert("Palabra eliminada exitosamente");
        renderWordList(); // Renderizar la lista de palabras después de eliminar una palabra
        populateCategories();
        updateCategoryStats();
    }
}

// Borrar todas las palabras
function clearAllWords() {
    if (confirm("¿Estás seguro de que deseas borrar todas las palabras?")) {
        words = [];
        saveWordsToLocalStorage();
        alert("Todas las palabras han sido borradas exitosamente");
        renderWordList(); // Renderizar la lista de palabras después de borrar todas las palabras
        populateCategories();
        updateCategoryStats();
    }
}

// Llenar el selector de categorías
function populateCategories() {
    const categoriesSelect = document.getElementById("categories");
    categoriesSelect.innerHTML = "";

    const uniqueCategories = [...new Set(words.map(word => word.category))];
    uniqueCategories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoriesSelect.appendChild(option);
    });
}

// Iniciar el modo Test
function startTest() {
    lastExerciseType = 'test';
    lastSelectedCategories = Array.from(document.getElementById('categories').selectedOptions).map(option => option.value);
    lastQuantity = parseInt(document.getElementById('quantity').value);
    startExercise('test');
}

// Iniciar el modo Escritura
function startWriting() {
    lastExerciseType = 'writing';
    lastSelectedCategories = Array.from(document.getElementById('categories').selectedOptions).map(option => option.value);
    lastQuantity = parseInt(document.getElementById('quantity').value);
    startExercise('writing');
}

// Iniciar el modo Mixto
function startMixed() {
    lastExerciseType = 'mixed';
    lastSelectedCategories = Array.from(document.getElementById('categories').selectedOptions).map(option => option.value);
    lastQuantity = parseInt(document.getElementById('quantity').value);
    startExercise('mixed');
}

// Iniciar el modo Estudio
function startStudy() {
    // Validar que se haya seleccionado al menos una categoría
    if (!validateCategories()) {
        alert("Por favor, selecciona al menos una categoría");
        return;
    }

    lastExerciseType = 'study';
    lastSelectedCategories = Array.from(document.getElementById('categories').selectedOptions).map(option => option.value);
    lastQuantity = parseInt(document.getElementById('quantity').value);
    
    // Mostrar diálogo de selección de modo
    document.getElementById('study-mode-dialog').classList.remove('hidden');
}

function selectStudyMode(mode) {
    // Ocultar el diálogo
    closeStudyModeDialog();
    
    // Validar nuevamente las categorías (por si acaso)
    if (!validateCategories()) {
        alert("Por favor, selecciona al menos una categoría");
        return;
    }

    // Obtener palabras para el estudio
    flashcards = getExerciseWords(lastSelectedCategories, lastQuantity);
    shuffleArray(flashcards);
    currentFlashcardIndex = 0;
    
    // Ocultar todas las pantallas primero
    document.getElementById('flashcards-screen').classList.add('hidden');
    document.getElementById('normal-study-screen').classList.add('hidden');
    document.getElementById('exercise-settings').classList.add('hidden');
    document.getElementById('exercise-content').classList.add('hidden');
    document.getElementById('exercise-summary').classList.add('hidden');
    
    if (mode === 'flashcards') {
        // Mostrar solo la pantalla de flashcards
        document.getElementById('flashcards-screen').classList.remove('hidden');
        showCurrentCard();
    } else if (mode === 'normal') {
        // Mostrar solo la pantalla de estudio normal
        document.getElementById('normal-study-screen').classList.remove('hidden');
        showCurrentStudyCard();
    }
}

// Obtener palabras para el ejercicio
function getExerciseWords(categories, quantity) {
    const filteredWords = words.filter(word => categories.includes(word.category));
    const wordPerformance = {};

    // Contar los fallos de cada palabra
    exerciseHistory.forEach(entry => {
        const wordObj = words.find(w => w.word === entry.word || w.translation === entry.word);
        if (wordObj && categories.includes(wordObj.category)) {
            if (!wordPerformance[wordObj.word]) {
                wordPerformance[wordObj.word] = { incorrect: 0 };
            }
            if (!entry.isCorrect) {
                wordPerformance[wordObj.word].incorrect++;
            }
        }
    });

    // Ordenar palabras por número de fallos (las que más fallos tienen primero)
    const sortedWords = filteredWords.sort((a, b) => {
        const aIncorrect = wordPerformance[a.word] ? wordPerformance[a.word].incorrect : 0;
        const bIncorrect = wordPerformance[b.word] ? wordPerformance[b.word].incorrect : 0;
        return bIncorrect - aIncorrect;
    });

    // Si no hay suficientes palabras, repetir las disponibles
    if (sortedWords.length < quantity) {
        const repeatedWords = [];
        while (repeatedWords.length < quantity) {
            repeatedWords.push(...sortedWords);
        }
        return repeatedWords.slice(0, quantity);
    }

    return sortedWords.slice(0, quantity);
}

// Iniciar el ejercicio
let currentQuestionIndex = 0;
let exerciseWords = [];
let exerciseType = "";
let currentWordObj = null;
let showWord = true; // Variable para rastrear si se muestra la palabra o la traducción

function startExercise(type) {
    if (!validateCategories()) return;
    
    exerciseWords = getExerciseWords(lastSelectedCategories, lastQuantity);
    
    // En modo estudio, no mezclar las palabras
    if (type !== 'study') {
        shuffleArray(exerciseWords);
    }
    
    exerciseType = type;
    currentQuestionIndex = 0;
    
    hideExerciseSettings();
    document.getElementById('exercise-content').classList.remove('hidden');
    document.getElementById('progress-bar-container').classList.remove('hidden');
    
    showNextQuestion();
}

// Ocultar configuración de ejercicios
function hideExerciseSettings() {
    document.getElementById("exercise-settings").classList.add("hidden");
    document.getElementById("exercise-content").classList.remove("hidden");
    document.getElementById("answer-input").classList.add("hidden");
    document.getElementById("submit-answer-btn").classList.add("hidden");
    document.getElementById("exercise-summary").classList.add("hidden");
    document.getElementById("progress-bar-container").classList.add("hidden");
}

// Mostrar la siguiente pregunta
function showNextQuestion() {
    if (currentQuestionIndex >= exerciseWords.length) {
        if (exerciseType === 'study') {
            // En modo estudio, reiniciar el índice para repasar las palabras
            currentQuestionIndex = 0;
        } else {
            endExercise();
            return;
        }
    }

    currentWordObj = exerciseWords[currentQuestionIndex];
    const questionElement = document.getElementById("question");
    const optionsElement = document.getElementById("options");
    const answerInputElement = document.getElementById("answer-input");
    const submitAnswerBtn = document.getElementById("submit-answer-btn");
    const resultMessageElement = document.getElementById("result-message");
    const progressBarContainer = document.getElementById("progress-bar-container");
    const progressBar = document.getElementById("progress-bar");

    questionElement.innerHTML = "";
    optionsElement.innerHTML = "";
    answerInputElement.classList.add("hidden");
    submitAnswerBtn.classList.add("hidden");
    resultMessageElement.innerHTML = "";

    const progressPercentage = ((currentQuestionIndex + 1) / exerciseWords.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;

    // En modo estudio, mostrar ambas palabras juntas
    if (exerciseType === 'study') {
        questionElement.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 20px;">${currentWordObj.word}</div>
            <div style="font-size: 20px; color: #666;">${currentWordObj.translation}</div>
        `;
        
        // Botón para avanzar
        const nextButton = document.createElement("button");
        nextButton.classList.add("btn", "primary");
        nextButton.textContent = "Siguiente";
        nextButton.onclick = () => {
            currentQuestionIndex++;
            showNextQuestion();
        };
        optionsElement.appendChild(nextButton);
        
        // Botón para repetir
        const repeatButton = document.createElement("button");
        repeatButton.classList.add("btn", "secondary");
        repeatButton.textContent = "Repetir";
        repeatButton.onclick = () => showNextQuestion();
        optionsElement.appendChild(repeatButton);
        
        return;
    }

    // Decidir aleatoriamente si mostrar la palabra o la traducción
    showWord = Math.random() < 0.5;

    if (exerciseType === "test" || (exerciseType === "mixed" && Math.random() < 0.5)) {
        const correctAnswer = showWord ? currentWordObj.translation : currentWordObj.word;
        const randomAnswers = getRandomAnswers(currentWordObj.category, showWord ? 'translation' : 'word', 3, correctAnswer);
        randomAnswers.push(correctAnswer);
        shuffleArray(randomAnswers);

        questionElement.innerHTML = showWord ? currentWordObj.word : currentWordObj.translation;
        randomAnswers.forEach(answer => {
            const optionButton = document.createElement("button");
            optionButton.classList.add("btn", "option");
            optionButton.innerHTML = answer;
            optionButton.onclick = () => checkAnswer(answer);
            optionsElement.appendChild(optionButton);
        });
    } else {
        questionElement.innerHTML = showWord ? currentWordObj.word : currentWordObj.translation;
        answerInputElement.classList.remove("hidden");
        submitAnswerBtn.classList.remove("hidden");
        submitAnswerBtn.onclick = () => checkAnswer(answerInputElement.value.trim());
    }

    document.getElementById('answer-input').value = '';  // Limpia el campo de texto

    currentQuestionIndex++;
}

// Obtener respuestas aleatorias para las opciones de test
function getRandomAnswers(category, type, count, correctAnswer) {
    const filteredWords = words.filter(word => word.category === category);
    const allAnswers = filteredWords.map(word => type === 'translation' ? word.translation : word.word);
    const randomAnswers = new Set();

    while (randomAnswers.size < count) {
        const randomAnswer = allAnswers[Math.floor(Math.random() * allAnswers.length)];
        if (randomAnswer !== correctAnswer) {
            randomAnswers.add(randomAnswer);
        }
    }

    return Array.from(randomAnswers);
}

// Verificar la respuesta
function checkAnswer(userAnswer) {
    const correctAnswer = showWord ? currentWordObj.translation : currentWordObj.word;
    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    
    // Guardar el resultado en el historial
    exerciseHistory.push({
        word: showWord ? currentWordObj.word : currentWordObj.translation,
        isCorrect: isCorrect,
        exerciseType: exerciseType,
        timestamp: new Date()
    });
    
    // Guardar el historial en localStorage
    saveExerciseHistoryToLocalStorage();
    
    if (isCorrect) {
        score.correct++;
        showNextQuestion();
    } else {
        score.incorrect++;
        showCorrectAnswerDialog(correctAnswer);
    }
}

// Mostrar el cuadro de diálogo con la respuesta correcta
function showCorrectAnswerDialog(correctAnswer) {
    const dialog = document.getElementById("correct-answer-dialog");
    const message = document.getElementById("correct-answer-message");
    message.textContent = `La respuesta correcta es: ${correctAnswer}`;
    dialog.classList.remove("hidden");
}

// Cerrar el cuadro de diálogo y pasar a la siguiente pregunta
function closeCorrectAnswerDialog() {
    const dialog = document.getElementById("correct-answer-dialog");
    dialog.classList.add("hidden");
    showNextQuestion();
}

// Finalizar el ejercicio
function endExercise() {
    const questionElement = document.getElementById("question");
    const optionsElement = document.getElementById("options");
    const answerInputElement = document.getElementById("answer-input");
    const submitAnswerBtn = document.getElementById("submit-answer-btn");
    const resultMessageElement = document.getElementById("result-message");
    const progressBarContainer = document.getElementById("progress-bar-container");

    questionElement.textContent = "";
    optionsElement.innerHTML = "";
    answerInputElement.classList.add("hidden");
    submitAnswerBtn.classList.add("hidden");
    resultMessageElement.textContent = "";
    progressBarContainer.classList.add("hidden");

    document.getElementById("exercise-content").classList.add("hidden");
    document.getElementById("exercise-summary").classList.remove("hidden");

    document.getElementById("summary-correct").textContent = `Correctas: ${score.correct}`;
    document.getElementById("summary-incorrect").textContent = `Incorrectas: ${score.incorrect}`;
}

// Función para cambiar el tema
function toggleTheme() {
    const body = document.body;
    if (!body) return; // Verificar si el body existe

    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);

    // Verificar si los elementos existen antes de acceder a ellos
    const themeSwitchHome = document.getElementById('theme-switch');
    const themeSwitchLogin = document.getElementById('theme-switch-login');
    if (themeSwitchHome) themeSwitchHome.checked = isDarkMode;
    if (themeSwitchLogin) themeSwitchLogin.checked = isDarkMode;

    // Actualizar logos
    const lightLogos = document.querySelectorAll('.light-logo');
    const darkLogos = document.querySelectorAll('.dark-logo');
    if (lightLogos && darkLogos) {
        lightLogos.forEach(logo => logo.style.display = isDarkMode ? 'none' : 'block');
        darkLogos.forEach(logo => logo.style.display = isDarkMode ? 'block' : 'none');
    }
}

function loadThemeFromLocalStorage() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', isDarkMode);
    
    // Inicializar ambos toggles
    const themeSwitchHome = document.getElementById('theme-switch');
    const themeSwitchLogin = document.getElementById('theme-switch-login');
    if (themeSwitchHome) themeSwitchHome.checked = isDarkMode;
    if (themeSwitchLogin) themeSwitchLogin.checked = isDarkMode;
    
    // Actualizar logos en ambas pantallas
    const lightLogos = document.querySelectorAll('.light-logo');
    const darkLogos = document.querySelectorAll('.dark-logo');
    lightLogos.forEach(logo => logo.style.display = isDarkMode ? 'none' : 'block');
    darkLogos.forEach(logo => logo.style.display = isDarkMode ? 'block' : 'none');
}

// Actualizar estadísticas generales
function updateGeneralStats() {
    const totalWordsElement = document.getElementById("total-words");
    const totalExercisesElement = document.getElementById("total-exercises");
    const correctPercentageElement = document.getElementById("correct-percentage");

    // Verificar si los elementos existen
    if (!totalWordsElement || !totalExercisesElement || !correctPercentageElement) {
        console.error('Elementos de estadísticas no encontrados');
        return;
    }

    const totalWords = words.length;
    const totalExercises = exerciseHistory.length;
    const correctPercentage = totalExercises > 0 ? ((score.correct / totalExercises) * 100).toFixed(2) + "%" : "0%";

    totalWordsElement.textContent = `Total de Palabras: ${totalWords}`;
    totalExercisesElement.textContent = `Total de Ejercicios: ${totalExercises}`;
    correctPercentageElement.textContent = `Porcentaje de Respuestas Correctas: ${correctPercentage}`;
}

// Actualizar estadísticas por categoría
function updateCategoryStats() {
    const categoryListElement = document.getElementById("category-list");
    if (!categoryListElement) return;
    categoryListElement.innerHTML = "";

    const categoryPerformance = {};

    exerciseHistory.forEach(entry => {
        const wordObj = words.find(word => word.word === entry.word || word.translation === entry.word);
        if (wordObj) {
            const category = wordObj.category;
            if (!categoryPerformance[category]) {
                categoryPerformance[category] = { correct: 0, incorrect: 0 };
            }

            if (entry.isCorrect) {
                categoryPerformance[category].correct++;
            } else {
                categoryPerformance[category].incorrect++;
            }
        }
    });

    Object.keys(categoryPerformance).forEach(category => {
        const categoryResult = categoryPerformance[category];
        const categoryResultElement = document.createElement("li");
        categoryResultElement.textContent = `Categoría: ${category}, Correctas: ${categoryResult.correct}, Incorrectas: ${categoryResult.incorrect}`;
        categoryListElement.appendChild(categoryResultElement);
    });
}

// Mostrar estadísticas generales
function showGeneralStats() {
    document.getElementById("general-stats").classList.remove("hidden");
    document.getElementById("category-stats").classList.add("hidden");
    document.getElementById("exercise-stats").classList.add("hidden");
    updateGeneralStats();
}

// Mostrar estadísticas por categoría
function showCategoryStats() {
    document.getElementById("general-stats").classList.add("hidden");
    document.getElementById("category-stats").classList.remove("hidden");
    document.getElementById("exercise-stats").classList.add("hidden");
    updateCategoryStats();
}

// Función para restablecer estadísticas
function resetStats() {
    if (confirm("¿Restablecer estadísticas?")) {
        localStorage.removeItem("exerciseHistory");
        alert("Estadísticas restablecidas.");
    }
}

// Parsear CSV
function parseCSV(text) {
    const lines = text.split("\n");
    const result = [];
    for (const line of lines) {
        const [word, translation, category] = line.split(",");
        if (word && translation && category) {
            result.push({ word: word.trim(), translation: translation.trim(), category: category.trim() });
        }
    }
    return result;
}

// Función para mezclar un array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function validateCategories() {
    const categories = document.getElementById('categories');
    const errorMessage = document.getElementById('category-error');
    
    if (categories.selectedOptions.length === 0) {
        errorMessage.classList.remove('hidden');
        return false;
    }
    errorMessage.classList.add('hidden');
    return true;
}

// Agregar estas funciones al inicio del archivo
function showLoginScreen() {
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('register-screen').classList.remove('active');
    document.getElementById('home-screen').classList.remove('active');
}

function showRegisterScreen() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('register-screen').classList.add('active');
    document.getElementById('home-screen').classList.remove('active');
}

function showMainScreen() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('register-screen').classList.remove('active');
    document.getElementById('home-screen').classList.add('active');
}

// Manejar el formulario de login
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const rememberUser = document.getElementById('remember-user-checkbox').checked;
    
    // Guardar credenciales si el checkbox está marcado
    if (rememberUser) {
        localStorage.setItem('savedCredentials', JSON.stringify({ username, password }));
    } else {
        localStorage.removeItem('savedCredentials');
    }
    
    const response = loginUser(username, password);
    if (response.success) {
        currentUser = username;
        loadWordsFromLocalStorage();
        loadExerciseHistoryFromLocalStorage();
        showMainScreen();
    } else {
        alert('Error al iniciar sesión: ' + response.message);
    }
});

// Manejar el formulario de registro
document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const animalEmoji = document.getElementById('animal-emoji').value;

    registerUser(username, password, animalEmoji).then(response => {
        if (response.success) {
            // Inicializar datos para el nuevo usuario
            const userData = JSON.parse(localStorage.getItem('userData')) || {};
            userData[username] = { words: [], exerciseHistory: [] };
            localStorage.setItem('userData', JSON.stringify(userData));
            
            alert('Usuario registrado con éxito');
            showLoginScreen();
        } else {
            // Mostrar el mensaje de error al usuario
            alert(response.message);
        }
    });
});

// Añade estas funciones para manejar la edición de usuario
function showEditUser() {
    document.getElementById("home-screen").classList.remove("active");
    document.getElementById("edit-user-screen").classList.add("active");
    
    // Cargar los datos actuales del usuario
    const users = JSON.parse(localStorage.getItem('users')) || {};
    const user = users[currentUser];
    if (user) {
        document.getElementById('edit-username').value = currentUser;
        document.getElementById('edit-password').value = user.password;
        document.getElementById('edit-animal-emoji').value = user.animalEmoji;
    }
}

document.getElementById('edit-user-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const newUsername = document.getElementById('edit-username').value;
    const newPassword = document.getElementById('edit-password').value;
    const newAnimalEmoji = document.getElementById('edit-animal-emoji').value;
    
    const users = JSON.parse(localStorage.getItem('users')) || {};
    
    // Verificar si el nuevo nombre de usuario ya existe
    if (newUsername !== currentUser && users[newUsername]) {
        alert('El nombre de usuario ya está en uso');
        return;
    }
    
    // Actualizar los datos del usuario
    delete users[currentUser];
    users[newUsername] = {
        password: newPassword,
        animalEmoji: newAnimalEmoji
    };
    localStorage.setItem('users', JSON.stringify(users));
    
    // Actualizar el usuario actual
    currentUser = newUsername;
    
    // Actualizar los datos asociados al usuario
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    userData[newUsername] = userData[currentUser] || { words: [], exerciseHistory: [] };
    delete userData[currentUser];
    localStorage.setItem('userData', JSON.stringify(userData));
    
    alert('Usuario actualizado con éxito');
    goBack();
});

// Función para repetir el ejercicio
function repeatExercise() {
    // Ocultar el resumen
    document.getElementById('exercise-summary').classList.add('hidden');
    
    // Restablecer las estadísticas del ejercicio actual
    score = {
        correct: 0,
        incorrect: 0
    };
    
    currentQuestionIndex = 0;

    // Volver a mostrar la sección de contenido del ejercicio
    document.getElementById('exercise-content').classList.remove('hidden');
    
    // Restablecer la barra de progreso
    document.getElementById('progress-bar-container').classList.remove('hidden');
    document.getElementById('progress-bar').style.width = '0%';

    // Limpiar mensajes anteriores
    document.getElementById('result-message').textContent = '';
    
    // Iniciar el ejercicio con la última configuración
    if (lastExerciseType) {
        startExercise(lastExerciseType);
    }
}

// Limpiar contenido del ejercicio
function clearExerciseContent() {
    const questionElement = document.getElementById("question");
    const optionsElement = document.getElementById("options");
    const answerInputElement = document.getElementById("answer-input");
    const submitAnswerBtn = document.getElementById("submit-answer-btn");
    const resultMessageElement = document.getElementById("result-message");
    const progressBarContainer = document.getElementById("progress-bar-container");

    questionElement.textContent = "";
    optionsElement.innerHTML = "";
    answerInputElement.classList.add("hidden");
    submitAnswerBtn.classList.add("hidden");
    resultMessageElement.textContent = "";
    progressBarContainer.classList.add("hidden");
}

// Ocultar contenido del ejercicio
function hideExerciseContent() {
    document.getElementById("exercise-settings").classList.remove("hidden");
    document.getElementById("exercise-content").classList.add("hidden");
    document.getElementById("exercise-summary").classList.add("hidden");
    document.getElementById("answer-input").classList.add("hidden");
    document.getElementById("submit-answer-btn").classList.add("hidden");
}

// Resetear la puntuación y el historial
function resetScore() {
    score.correct = 0;
    score.incorrect = 0;
}

// Función para mostrar la pantalla de Debug
function showDebug() {
    document.getElementById("home-screen").classList.remove("active");
    document.getElementById("debug-screen").classList.add("active");
    updateDebugTable();
}

// Función para actualizar la tabla de Debug
function updateDebugTable() {
    const debugContent = document.querySelector('#debug-screen .content');
    debugContent.innerHTML = '';

    // Agrupar palabras por categoría
    const groupedWords = words.reduce((acc, word) => {
        if (!acc[word.category]) {
            acc[word.category] = [];
        }
        acc[word.category].push(word);
        return acc;
    }, {});

    // Crear un objeto para almacenar las estadísticas de cada palabra
    const wordStats = {};
    words.forEach(word => {
        wordStats[word.word] = { correct: 0, incorrect: 0, priority: 1 }; // Prioridad base de 1
        wordStats[word.translation] = { correct: 0, incorrect: 0, priority: 1 };
    });

    // Contar aciertos y fallos y calcular prioridad
    exerciseHistory.forEach(entry => {
        const word = entry.word;
        const wordObj = words.find(w => w.word === word || w.translation === word);
        if (wordObj) {
            if (entry.isCorrect) {
                wordStats[word].correct++;
            } else {
                wordStats[word].incorrect++;
                // Aumentar la prioridad basada en fallos
                wordStats[word].priority = calculatePriority(wordStats[word].incorrect);
            }
        }
    });

    // Crear la lista de categorías
    const categoryList = document.createElement('ul');
    categoryList.className = 'category-list';

    Object.entries(groupedWords).forEach(([category, categoryWords]) => {
        const categoryItem = document.createElement('li');
        categoryItem.className = 'category-item';

        // Crear el encabezado de la categoría con el toggle
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        categoryHeader.innerHTML = `
            <strong>${category}</strong>
            <span class="toggle-icon">+</span>
        `;
        categoryHeader.onclick = () => toggleDebugCategory(category);
        categoryItem.appendChild(categoryHeader);

        // Crear la lista de palabras para esta categoría
        const wordList = document.createElement('ul');
        wordList.className = 'word-sublist hidden';
        wordList.id = `debug-category-${category}`;

        categoryWords.forEach(word => {
            const wordItem = document.createElement('li');
            const priority = wordStats[word.word].priority;
            wordItem.innerHTML = `
                <div class="word-stats">
                    <span>${word.word} - ${word.translation}</span>
                    <span class="stats">
                        <span class="correct">✓ ${wordStats[word.word].correct}</span>
                        <span class="incorrect">✗ ${wordStats[word.word].incorrect}</span>
                        <span class="priority" title="Prioridad de aparición">⚡ ${priority}x</span>
                    </span>
                </div>
            `;
            wordList.appendChild(wordItem);
        });

        categoryItem.appendChild(wordList);
        categoryList.appendChild(categoryItem);
    });

    debugContent.appendChild(categoryList);
}

// Función para calcular la prioridad basada en el número de fallos
function calculatePriority(incorrectCount) {
    // La prioridad aumenta con cada fallo, pero con un límite máximo
    const basePriority = 1;
    const maxPriority = 5;
    const priority = Math.min(basePriority + (incorrectCount * 0.5), maxPriority);
    return priority.toFixed(1); // Redondear a un decimal
}

// Función para alternar la visibilidad de las categorías en debug
function toggleDebugCategory(category) {
    const sublist = document.getElementById(`debug-category-${category}`);
    const toggleIcon = sublist.previousElementSibling.querySelector('.toggle-icon');
    if (sublist.classList.contains('hidden')) {
        sublist.classList.remove('hidden');
        toggleIcon.textContent = '-';
    } else {
        sublist.classList.add('hidden');
        toggleIcon.textContent = '+';
    }
}

function logout() {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        currentUser = null;
        showLoginScreen();
    }
}

function showCurrentCard() {
    if (currentFlashcardIndex >= flashcards.length) {
        endFlashcards();
        return;
    }

    const card = flashcards[currentFlashcardIndex];
    const flashcardElement = document.querySelector('.flashcard');
    
    // Resetear la rotación de la tarjeta
    flashcardElement.classList.remove('flipped');
    
    // Actualizar contenido
    document.getElementById('flashcard-word').textContent = card.word;
    document.getElementById('flashcard-translation').textContent = card.translation;
}

function flipCard() {
    const flashcardElement = document.querySelector('.flashcard');
    flashcardElement.classList.toggle('flipped');
}

function showNextCard() {
    const flashcard = document.querySelector(".flashcard");
    if (flashcard) flashcard.classList.remove("flipped");  // Reinicia el estado visual

    currentFlashcardIndex++;
    if (currentFlashcardIndex >= flashcards.length) {
        currentFlashcardIndex = 0; // Volver al inicio si llegamos al final
    }
    showCurrentCard();
}

function showPreviousCard() {
    currentFlashcardIndex--;
    if (currentFlashcardIndex < 0) {
        currentFlashcardIndex = flashcards.length - 1; // Ir al final si estamos al inicio
    }
    showCurrentCard();
}

function endFlashcards() {
    // Ocultar solo la pantalla de flashcards
    document.getElementById('flashcards-screen').classList.add('hidden');
    
    // Mostrar configuración de ejercicios
    document.getElementById('exercise-settings').classList.remove('hidden');
    
    // Mostrar opciones al terminar
    if (confirm("¿Deseas salir del ejercicio?")) {
        startStudy();
    }
}

function showCurrentStudyCard() {
    if (currentFlashcardIndex >= flashcards.length) {
        endNormalStudy();
        return;
    }

    const card = flashcards[currentFlashcardIndex];
    document.querySelector('.word').textContent = card.word;
    document.querySelector('.translation').textContent = card.translation;
}

function showNextStudyCard() {
    currentFlashcardIndex++;
    if (currentFlashcardIndex >= flashcards.length) {
        currentFlashcardIndex = 0; // Volver al inicio si llegamos al final
    }
    showCurrentStudyCard();
}

function showPreviousStudyCard() {
    currentFlashcardIndex--;
    if (currentFlashcardIndex < 0) {
        currentFlashcardIndex = flashcards.length - 1; // Ir al final si estamos al inicio
    }
    showCurrentStudyCard();
}

function endNormalStudy() {
    // Ocultar solo la pantalla de estudio normal
    document.getElementById('normal-study-screen').classList.add('hidden');
    
    // Mostrar configuración de ejercicios
    document.getElementById('exercise-settings').classList.remove('hidden');
    
    // Mostrar opciones al terminar
    if (confirm("¿Deseas salir del ejercicio?")) {
        startStudy();
    }
}

function closeStudyModeDialog() {
    document.getElementById('study-mode-dialog').classList.add('hidden');
}

// Función debounce
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Ejemplo de uso
window.addEventListener('resize', debounce(() => {
    console.log('Ventana redimensionada');
}, 300));

// Función para eliminar una categoría completa
function deleteCategory(category) {
    if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${category}" y todas sus palabras?`)) {
        // Filtrar las palabras que no pertenecen a la categoría eliminada
        words = words.filter(word => word.category !== category);

        // Guardar los cambios en localStorage
        saveWordsToLocalStorage();

        // Actualizar la lista de palabras y las categorías
        renderWordList();
        populateCategories();

        alert(`Categoría "${category}" eliminada exitosamente.`);
    }
}
