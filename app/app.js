const Meyda = require("meyda");
const p5 = require("p5");
const dat = require("dat.gui");
const StartAudioContext = require("startaudiocontext");

//https://meyda.js.org/audio-features

let lastFeatures; //global var to store in this var. in scope when we can them in the context of p5
let htmlAudioElement;
let word = "Synchronize";

function readAudioFromFile(callback){
    const audioContext = new AudioContext();
    StartAudioContext(audioContext);
    //if (){
    htmlAudioElement = document.getElementById("audio");
//}
    const source = audioContext.createMediaElementSource(htmlAudioElement);
    source.connect(audioContext.destination);
    if (callback) callback(audioContext, source);
}

readAudioFromFile((context, source) => {
    if (htmlAudioElement.src === 'synchronize.mp3'){
        word = 'Synchronize';
    }
    if (htmlAudioElement.src === 'satisfaction.mp3'){
        word = 'Satisfaction';
    }
    let newBlock = document.createElement("h4");
    newBlock.innerHTML = `You are now listening to "${word}".`;
    document.body.appendChild(newBlock);
    if (typeof Meyda === "undefined"){
        console.log("Metda could not be found! Have you included it?");
    }
    else{
        const analyzer = Meyda.createMeydaAnalyzer({
            audioContext: context,
            source: source,
            bufferSize: 512, //2048, //has to be a power of 2; 512
            featureExtractors: ["loudness", "chroma", "amplitudeSpectrum"],
            callback: (features) => {
                //console.log(features);
                lastFeatures = features;
            }
        });

        analyzer.start();
    }
});

const lineDrawing = (p) =>{
    const params = {
        Amplitude: 60,
        Loudness: 50
    };
    const gui = new dat.GUI();
    gui.add(params, "Amplitude", 0, 500);
    gui.add(params, "Loudness", 40, 50);

    p.setup = () =>{
        p.createCanvas(1000,500);
        p.background(255, 255, 255);
    };

    let oldRadius = 0;

    p.draw = () =>{
        p.colorMode(p.RGB, 255);
        p.background(255, 255, 255);

        if (lastFeatures && !Number.isNaN(lastFeatures.amplitudeSpectrum)){
            lastFeatures.amplitudeSpectrum.forEach((amp,i) =>{
                //console.log(Math.max(amp));
                const angle = Math.PI * 2 * i/lastFeatures.amplitudeSpectrum.length;
                let newRadius = (amp * params.Amplitude);
                let radius = 0.5 * oldRadius + 0.5 * newRadius;
                oldRadius = radius;

                const x = (radius * Math.cos(angle));
                const y = (radius * Math.sin(angle));
               
                p.stroke(11);
                p.fill(11);
                p.ellipse(p.width/2, p.height/2, 170, 170);
                p.strokeWeight(2);
                p.stroke(0);
                //console.log(radius);
                p.line(p.width/2, p.height/2, x+p.width/2, y+p.height/2);
                p.stroke(255);
                p.fill(255);
                p.ellipse(p.width/2, p.height/2, 60, 60);
            });
        }
        if (lastFeatures){
            lastFeatures.loudness.specific.forEach((loudness, i) =>{
                const radius = loudness* params.Loudness;
                p.colorMode(p.RGB, 256);
                p.strokeWeight(2);
                p.stroke(255);
                p.noFill();
                p.ellipse(p.width/2, p.height/2, radius, radius);
            });
        }
    }
};

const myp5 = new p5(lineDrawing, "main"); 