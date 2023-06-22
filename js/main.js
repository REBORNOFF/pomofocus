import { modal, openModal } from './modal.js';

let workDuration = 25 * 60; // 25 минут работы (в секундах)
let shortBreakDuration = 5 * 60; // 5 минут короткого перерыва (в секундах)
let longBreakDuration = 15 * 60; // 15 минут длинного перерыва (в секундах)
let pomodoroCount = 4; // Количество помидоро до длинного перерыва

let currentTime = workDuration;
let timerInterval = null;
let isWorking = true;
let pomodorosCompleted = 0;
let currentTaskIndex = 0;
let tasks = [];

const timerElement = document.getElementById('timer');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const skipButton = document.getElementById('skip');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const workDurationInput = document.getElementById('work-duration');
const shortBreakDurationInput = document.getElementById('short-break-duration');
const longBreakDurationInput = document.getElementById('long-break-duration');
const pomodoroCountInput = document.getElementById('pomodoro-count');
const settings_btn = document.getElementById('settings_btn');

// Функция для форматирования времени в формат "мм:сс"
function formatTime(seconds) {
	const minutes = Math.floor(seconds / 60);
	const secondsRemaining = seconds % 60;

	return `${minutes.toString().padStart(2, '0')}:${secondsRemaining
		.toString()
		.padStart(2, '0')}`;
}

// Функция обновления таймера
function updateTimer() {
	timerElement.textContent = formatTime(currentTime);

	if (currentTime <= 0) {
		clearInterval(timerInterval);
		if (isWorking) {
			pomodorosCompleted++;
			if (pomodorosCompleted % pomodoroCount === 0) {
				isWorking = false;
				currentTime = longBreakDuration;
			} else {
				isWorking = false;
				currentTime = shortBreakDuration;
			}
		} else {
			isWorking = true;
			currentTime = workDuration;
			currentTaskIndex++;
			if (currentTaskIndex >= tasks.length) {
				currentTaskIndex = 0;
			}
		}
		timerInterval = setInterval(updateTimer, 1000);
	}

	currentTime--;
}

// Обновление настроек времени
function updateSettings() {
	workDuration = parseInt(workDurationInput.value) * 60;
	shortBreakDuration = parseInt(shortBreakDurationInput.value) * 60;
	longBreakDuration = parseInt(longBreakDurationInput.value) * 60;
	pomodoroCount = parseInt(pomodoroCountInput.value);

	resetTimer();
}

// Функция сброса таймера
function resetTimer() {
	clearInterval(timerInterval);

	timerInterval = null;
	isWorking = true;
	currentTime = workDuration;
	startButton.disabled = false;
	pauseButton.disabled = true;
	resetButton.disabled = true;
	skipButton.disabled = true;
	taskInput.disabled = false;
	timerElement.textContent = formatTime(currentTime);
}

// Обработчик события для кнопки "Start"
startButton.addEventListener('click', function () {
	updateSettings();

	if (!timerInterval) {
		startButton.disabled = true;
		pauseButton.disabled = false;
		resetButton.disabled = false;
		skipButton.disabled = false;
		taskInput.disabled = true;
		timerInterval = setInterval(updateTimer, 1000);
	}
});

// Обработчик события для кнопки "Pause"
pauseButton.addEventListener('click', function () {
	if (timerInterval) {
		startButton.disabled = false;
		pauseButton.disabled = true;
		clearInterval(timerInterval);
		timerInterval = null;
	}
});

// Обработчик события для кнопки "Reset"
resetButton.addEventListener('click', resetTimer);

// Обработчик события для кнопки "Skip"
skipButton.addEventListener('click', function () {
	clearInterval(timerInterval);

	timerInterval = null;
	startButton.disabled = false;
	pauseButton.disabled = true;

	if (isWorking) {
		isWorking = false;
		if (pomodorosCompleted % pomodoroCount === 0) {
			currentTime = longBreakDuration;
		} else {
			currentTime = shortBreakDuration;
		}
	} else {
		isWorking = true;
		currentTime = workDuration;
		currentTaskIndex++;
		if (currentTaskIndex >= tasks.length) {
			currentTaskIndex = 0;
		}
	}
	timerElement.textContent = formatTime(currentTime);
});

// Обработчик события для ввода задачи
taskInput.addEventListener('keydown', function (event) {
	if (event.key === 'Enter' && taskInput.value !== '') {
		tasks.push({
			name: taskInput.value,
			completed: false
		});
		renderTaskList();
		taskInput.value = '';
	}
});

// Функция отметки задачи как выполненной
function markTaskAsCompleted(index) {
	tasks[index].completed = true;
	renderTaskList();
}

// Функция удаления задачи
function deleteTask(index) {
	tasks.splice(index, 1);
	renderTaskList();
}

// Функция отображения списка задач
function renderTaskList() {
	taskList.innerHTML = '';

	tasks.forEach((task, index) => {
		const taskItem = document.createElement('li');
		taskItem.classList.add('tasks__item');

		if (index === currentTaskIndex) {
			taskItem.textContent = task.name;
			taskItem.classList.add('tasks__item-current');
		} else {
			taskItem.textContent = task.name;
		}

		if (task.completed) {
			taskItem.classList.add('completed-task');
		}

		const button__wrapper = document.createElement('div');
		button__wrapper.classList.add('button__wrapper');

		const completeButton = document.createElement('button');
		completeButton.classList.add('tasks__button');
		completeButton.textContent = 'Complete';
		completeButton.addEventListener('click', function () {
			markTaskAsCompleted(index);
		});

		const deleteButton = document.createElement('button');

		deleteButton.classList.add('tasks__button');
		deleteButton.textContent = 'Delete';
		deleteButton.addEventListener('click', function () {
			deleteTask(index);
		});

		button__wrapper.appendChild(completeButton);
		button__wrapper.appendChild(deleteButton);
		taskItem.appendChild(button__wrapper);
		taskList.appendChild(taskItem);
	});
}

settings_btn.addEventListener('click', () => {
	openModal('.modal');
	modal('.modal');
});

// Инициализация
updateSettings();
renderTaskList();