export class CppExporter {
    static export(pidData) {
        let cppCode = `#pragma once\n\n`;
        
        cppCode += `struct PIDConfig {\n`;
        cppCode += `    float kp;\n`;
        cppCode += `    float ki;\n`;
        cppCode += `    float kd;\n`;
        cppCode += `};\n\n`;

        cppCode += `class QuadTuning {\n`;
        cppCode += `public:\n`;
        
        for (const [axis, pid] of Object.entries(pidData)) {
            cppCode += `    PIDConfig ${axis} = {${pid.kp.toFixed(4)}f, ${pid.ki.toFixed(4)}f, ${pid.kd.toFixed(4)}f};\n`;
        }
        
        cppCode += `};\n`;

        const blob = new Blob([cppCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'QuadTuning.h';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}