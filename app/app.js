const Meyda = require("meyda");
const p5 = require("p5");
const dat = require("dat.gui");

//https://meyda.js.org/audio-features

let lastFeatures; //global var to store in this var. in scope when we can them in the context of p5

function prepareMicrophone(callback){
    navigator.mediaDevices.getUserMedia({audio: true, video: false}).then((stream) =>{

        const context = new AudioContext(); //it is a web audio that represent the whole audio graph
    
        const source = context.createMediaStreamSource(stream);

        callback(context, source); //context and the source are needed for the analyser
    });
}

prepareMicrophone((context, source) => {
    let newBlock = document.createElement("h1");
    newBlock.innerHTML = "Microphone loaded successfully";
    document.body.appendChild(newBlock);

    const analyzer = Meyda.createMeydaAnalyzer({
        audioContext: context,
        source: source,
        bufferSize: 2048, //has to be a power of 2; 512
        featureExtractors: ["loudness", "chroma"],
        callback: (features) => {
            lastFeatures = features;
        }
    });

    analyzer.start();
});

const chromaDrawing = (p) =>{
    const params = {
        scale: 200
    };
    const gui = new dat.GUI();
    gui.add(params, "scale", 0, 400);

    p.setup = () =>{
        p.createCanvas(700,400);
    };

    p.draw = () =>{
        p.colorMode(p.RGB, 255);
        p.background(255,255, 255);
        if (lastFeatures){
            lastFeatures.chroma.forEach((c,i)=>{ 
                const angle = Math.PI * 2 * i/ lastFeatures.chroma.length;
                const angleWidth = (2 * Math.PI) / lastFeatures.chroma.length;
                const radius = c * params.scale;
                const hue = 255*c;
                p.colorMode(p.HSB, 255);
                p.fill(hue, 255,255);
                p.arc(p.width/2, p.height/2, radius, radius, angle, angle + angleWidth);
            });
    
        }
    }
};
const basicDrawing = (p) =>{
    p.setup = () =>{
        p.createCanvas(700,400);
    };

    p.draw = () =>{
        p.background(255,255, 255);
        if (lastFeatures){

            lastFeatures.loudness.specific.forEach((loudness, i) =>{
                const radius = loudness* 100;
                p.colorMode(p.HSB, 255);
                p.strokeWeight(6);
                const hue = 255*i /lastFeatures.loudness.specific.length; // it is 0 - 1 and times 255 to make it more possible for hue
                p.stroke(hue, 255, 255, 100);
                //p.noFill();
                p.ellipse(p.width/2, p.height/2, radius, radius);
            });
        }
    }
};

//const myp5 = new p5(basicDrawing, "main");
const myp5 = new p5(chromaDrawing, "main");