const path = document.querySelector('.orange-line');
const pathData = path.getAttribute('d');
const curves = [];

function parsePathData(pathData) {
    const commands = pathData.match(/[a-df-zA-DF-Z][^a-df-zA-DF-Z]*/g);
    const parsedPath = [];

    for (const command of commands) {
        const type = command[0];
        const values = command.slice(1).trim().split(/\s*,\s*|\s+/).map(Number);

        parsedPath.push({ type, values });
    }

    return parsedPath;
}

function extractCurves(parsedPath) {
    const curves = [];

    for (let i = 0; i < parsedPath.length; i++) {
        const command = parsedPath[i];
        const nextCommand = parsedPath[i + 1];

        if (command.type === 'C') {
            const curve = {
                type: 'C',
                controlPoint1: { x: command.values[0], y: command.values[1] },
                controlPoint2: { x: command.values[2], y: command.values[3] },
                endPoint: { x: command.values[4], y: command.values[5] }
            };

            curves.push(curve);
        }
    }

    return curves;
}

const parsedPath = parsePathData(pathData);
const extractedCurves = extractCurves(parsedPath);



let text = "";
path.setAttribute("d", "");



function changePath(time) {
    parsedPath.forEach(data => {
        text += data.type;
    
        for (let i = 0; i < data.values.length; i++) {
            const endPointX = data.values[data.values.length - 1];
            const endPointY = data.values[data.values.length - 2];
    
            if(endPointX === data.values[i] || endPointY === data.values[i]) data.values[i];
            else data.values[i] = data.values[i];
        }
    
        text += data.values.join(" ");
    });
    
    
    path.setAttribute("d", text);
}




function animate() {
    gsap.ticker.add((time) =>{

        changePath(time);
      });
}

animate();
