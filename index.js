// Умова задачі.
const eq1 = new Equation([10, 5], 10);
const eq2 = new Equation([6, 20], 10);
const eq3 = new Equation([8, 15], 10);
const g = new Equation([200, 300], 0, true);

const st = new SimplexTable([eq1, eq2, eq3], g);

function graphicallySolve() {
    graphicalSolution([eq1, eq2, eq3], g);
}

// Даємо можливість кнопкці викликати метод step().
window.st = st;
