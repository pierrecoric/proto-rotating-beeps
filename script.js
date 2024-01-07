
let context = [];
let oscillators = [];
let gains = [];
let oscillatorsParam = [];

let amountOscillators = 0;

const oscillatorsDiv = document.getElementById('oscillators');








//arrayOfObjects, empty

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
}


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


function stop(id) {
    // Use setValueAtTime for a more consistent fade-out across browsers
    gains[id].gain.setValueAtTime(gains[id].gain.value, context[id].currentTime);
    gains[id].gain.linearRampToValueAtTime(0.00001, context[id].currentTime + oscillatorsParam[id].fadeOutTime);

    // Stop the oscillator after the fade-out duration
    oscillators[id].stop(context[id].currentTime + oscillatorsParam[id].fadeOutTime);
}








// Object to store interval IDs
const intervalIds = {};

const beep = (id) => {
    start(id);
    stop(id);
}

const beepTime = (id) => {
    // Clear the previous interval if it exists
    if (intervalIds[id]) {
        clearInterval(intervalIds[id]);
    }

    let interval = oscillatorsParam[id].interval * 1000;

    // Set up a new interval and save the interval ID
    intervalIds[id] = setInterval(() => beep(id), interval);
};

const destroyBeep = (id) => {
    // Clear the interval associated with the given id
    if (intervalIds[id]) {
        clearInterval(intervalIds[id]);
        // Optionally, you can also stop the beep immediately
        stop(id);
    }
};


function createNewOscillatorDiv(id, freq, fadeOutTime, interval) {
    const gradProcent = computeProcentGradient(fadeOutTime, interval)
    console.log(gradProcent);
    const $rotationStyle = `"
    animation: rotateGradient ${interval}s linear infinite; 
    background: conic-gradient(from 180deg, black 0%, red ${gradProcent}% 100%);
    "`

    let newOscillatorDiv = `
        <div id="osc-${id}"class="oscillator-div">
            <form id="update-oscillator">
                <label>Frequency: <input id="freq-${id}" type="number" min="110" max="440" required value="${freq}"></label>
                <label>Fade-Out: <input id="fade-out-${id}" type="number" min="0.05" max="2" step="0.01" required value="${fadeOutTime}"></label>
                <label>Interval: <input id="interval-${id}" type="number" min="0.1" max="3" step="0.01" required value="${interval}"></label>
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


function computeProcentGradient(fadeOutTime, interval) {
    let result = (fadeOutTime / interval) * 100
    return result;
}



document.getElementById('create-oscillator').addEventListener('submit', function(event) {
    // Prevent the default form submission
    event.preventDefault();
    // Retrieve values from the form
    const freqValue = parseFloat(document.getElementById('freq').value);
    const fadeOutValue = parseFloat(document.getElementById('fade-out').value);
    const intervalValue = parseFloat(document.getElementById('interval').value);
    // Call your function here passing the retrieved values
    createNewOscillator(amountOscillators, freqValue, fadeOutValue, intervalValue);
    beepTime(amountOscillators);
    oscillatorsDiv.insertAdjacentHTML('beforeend', createNewOscillatorDiv(amountOscillators, freqValue, fadeOutValue, intervalValue));
    amountOscillators ++;
});

function deleteOscillator(event, id) {
    // Prevent the default behavior of the button click
    event.preventDefault();
    const divToRemove = document.getElementById(`osc-${id}`);
    divToRemove.remove();
    destroyBeep(id);
}

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