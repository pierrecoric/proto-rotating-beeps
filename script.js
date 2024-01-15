let context = [];
let oscillators = [];
let gains = [];
let oscillatorsParam = [];
let amountOscillators = 0;
//the div with all the oscillators
const oscillatorsDiv = document.getElementById('oscillators');

//function to create all we need for a new oscillator. Global variable amountOscillators keep track of how many we create
function createNewOscillator(id, freq, fadeOutTime, interval) {
    //append new context, oscillator and gain
    context.push(new AudioContext());
    oscillators.push(context[id].createOscillator());
    gains.push(context[id].createGain())
    //append the array oscilatorsParam with id freqency, fadeout time and interval
    oscillatorsParam.push({
        id: id,
        freq: freq,
        fadeOutTime: fadeOutTime,
        interval: interval
    });
    beep(id);
}
//function to start sound
function start(id) {
    oscillators[id] = context[id].createOscillator();
    oscillators[id].type = "sine";
    oscillators[id].frequency.value = oscillatorsParam[id].freq;
    gains[id] = context[id].createGain();
    gains[id].gain.value = 0.2;
    oscillators[id].connect(gains[id]);
    gains[id].connect(context[id].destination);
    oscillators[id].start();
}
//function to stop sound
function stop(id) {
    gains[id].gain.setValueAtTime(gains[id].gain.value, context[id].currentTime);
    gains[id].gain.linearRampToValueAtTime(0.00001, context[id].currentTime + oscillatorsParam[id].fadeOutTime);
    // Stop the oscillator after the fade-out duration
    oscillators[id].stop(context[id].currentTime + oscillatorsParam[id].fadeOutTime);
}

// Object to store interval IDs
const intervalIds = {};
//function that starts then stop a given sound, creating a beep
const beep = (id) => {
    start(id);
    stop(id);
}
//articulate beeps through time
const beepTime = (id) => {
    // Clear the previous interval if it exists
    if (intervalIds[id]) {
        clearInterval(intervalIds[id]);
    }
    //turn the interval into millisecondes
    let interval = oscillatorsParam[id].interval * 1000;
    // Set up a new interval and save the interval ID
    intervalIds[id] = setInterval(() => beep(id), interval);
};
//end a beep
const destroyBeep = (id) => {
    // Clear the interval associated with the given id
    if (intervalIds[id]) {
        clearInterval(intervalIds[id]);
        stop(id);
    }
};
//function to create the ui
function createNewOscillatorDiv(id, freq, fadeOutTime, interval) {
    const gradProcent = computeProcentGradient(fadeOutTime, interval)
    console.log(gradProcent);
    const $rotationStyle = `"
    animation: rotateGradient ${interval}s linear infinite; 
    background: conic-gradient(from 180deg, black 0%, white ${gradProcent}% 100%);
    "`
    let newOscillatorDiv = `
        <div id="osc-${id}"class="oscillator-div">
            <form id="update-oscillator">
                <label>Frequency: <input id="freq-${id}" type="range" min="55" max="880" required value="${freq}" onchange="updateOscillator(event, ${id})">${freq}Hz</label>
                <label>Fade-Out: <input id="fade-out-${id}" type="range" min="0.05" max=${interval} step="0.01" required value="${fadeOutTime}" onchange="updateOscillator(event, ${id})">${fadeOutTime}sec</label>
                <label>Interval: <input id="interval-${id}" type="range" min="0.1" max="16" step="0.01" required value="${interval}" onchange="updateOscillator(event, ${id})">${interval}sec</label>
                <button onclick="updateOscillator(event, ${id})">update</button>
                <button onclick="deleteOscillator(event, ${id})">delete</button>
            </form>
            <div class="gizmoContainer">
                <div class="gizmo" style=${$rotationStyle}>
                </div>
            </div>
        </div>
    `;
    return newOscillatorDiv;
}
//just to return the way we should render gradients
const computeProcentGradient = (fadeOutTime, interval) => {
    let result = (fadeOutTime / interval) * 100
    return result;
}
//when the user click to create a new oscillator
document.getElementById('create-oscillator').addEventListener('submit', function(event) {
    // Prevent the default form submission
    event.preventDefault();
    // Retrieve values from the form
    const freqValue = parseFloat(document.getElementById('freq').value);
    const fadeOutValue = parseFloat(document.getElementById('fade-out').value);
    const intervalValue = parseFloat(document.getElementById('interval').value);
    createNewOscillator(amountOscillators, freqValue, fadeOutValue, intervalValue);
    beepTime(amountOscillators);
    oscillatorsDiv.insertAdjacentHTML('beforeend', createNewOscillatorDiv(amountOscillators, freqValue, fadeOutValue, intervalValue));
    amountOscillators ++;

});
//when the user click to delete an oscillator
function deleteOscillator(event, id) {
    // Prevent the default behavior of the button click
    event.preventDefault();
    const divToRemove = document.getElementById(`osc-${id}`);
    divToRemove.remove();
    destroyBeep(id);
}
//when the user click to update an oscillator
function updateOscillator(event, id) {
    // Prevent the default behavior of the button click
    event.preventDefault();
    console.log(id);
    const freqValue = parseFloat(document.getElementById(`freq-${id}`).value);
    const fadeOutValue = parseFloat(document.getElementById(`fade-out-${id}`).value);
    const intervalValue = parseFloat(document.getElementById(`interval-${id}`).value);

    destroyBeep(id);

    oscillatorsParam[id].freq = freqValue;
    oscillatorsParam[id].fadeOutTime = fadeOutValue;
    oscillatorsParam[id].interval = intervalValue;

    const divToRemove = document.getElementById(`osc-${id}`);
    divToRemove.insertAdjacentHTML('afterend', createNewOscillatorDiv(id, freqValue, fadeOutValue, intervalValue));
    divToRemove.remove();
    
    beepTime(id);
}

function initializeFun(freqValue, fadeOutValue, intervalValue) {
    createNewOscillator(amountOscillators, freqValue, fadeOutValue, intervalValue);
    beepTime(amountOscillators);
    oscillatorsDiv.insertAdjacentHTML('beforeend', createNewOscillatorDiv(amountOscillators, freqValue, fadeOutValue, intervalValue));
    amountOscillators ++;
}

function somethingNice(event) {
    event.preventDefault();
    initializeFun(55, 4.1, 4.2);
    initializeFun(110, 4.12, 4.25);
    initializeFun(82, 4.05, 4.1);
    initializeFun(65, 4.1, 4.3);
    initializeFun(220, 2.16, 2.2);
    initializeFun(261, 4.12, 4.27);
    initializeFun(440, 0.1, 3.6);
    initializeFun(880, 0.1, 8.3);
    console.log("fun");
}