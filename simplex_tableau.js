// Цей клас репрезентує симплекс-таблицю, він виконує обчислення. Можна сказати, це backend таблиці, а попередній клас - frontend.
class SimplexTable {
    // Ініціалізуємо об'єкт, задаємо початкові значення.
    constructor(equations, goal) {
        // Розширяємо додатковими змінними.
        this.goal_coefficients = goal.expand().coefficients;
        this.coefficients = equations
            .map((j) => j.expand())
            .map((i) => i.coefficients);

        // Оригінальні обмеження і цільова функція, які ми не мінятимемо.
        this.equations = equations;
        this.goal = goal;

        // Базис на початку це додаткові змінні
        this.basis = Array.from(
            { length: this.equations.length },
            (_, i) => i + equations[0].coefficients.length + 1,
        );

        // Стовпець вільних членів на початку складається з чисел після знака дорівнює із рівнянь системи обмежень.
        this.free = equations.map((i) => i.right);
        // Стовпець оціночних відношень на початку порожній.
        this.eval = Array.from({ length: equations.length }, () => "-");

        // HTML-елемент таблиці, який керується попереднім класом.
        this.element = new TableauView(
            equations[0].coefficients.length,
            Equation.additional.length,
        );

        // Індекс керуючого елемента. На початку невизначений.
        this.pivot_index = [null, null];

        // Значення цільової функції. Це значення до першої ітерації.
        this.f_value = 0;

        // Одразу показуємо таблицю. Жодних обчислень ще не виконано.
        this.element.show(
            this.basis,
            this.free,
            this.coefficients,
            this.eval,
            this.goal_coefficients,
            this.f_value,
        );
    }

    // Знаходимо провідний стовпець.
    find_pivot_column() {
        // Той, що відповідає найменшому значенню нових коефіцієнтів функції.
        const pivot = this.goal_coefficients.findIndex(
            (i) => i === Math.min(...this.goal_coefficients),
        );
        this.pivot_index[1] = pivot;
    }

    // Знаходимо провідний рядок.
    find_pivot_row() {
        let pivot = 0;
        for (let i = 1; i < this.eval.length; i++) {
            // Той, що відповідає найменшому додатньому значенню в стовпці оціночних відношень.
            if (this.eval[i] < this.eval[pivot] && this.eval[i] > 0) {
                pivot = i;
            }
        }
        this.pivot_index[0] = pivot;
    }

    // Знімаємо підсвітку провідних рядка та стовпця.
    dehighlight_pivot() {
        // Знімаємо підсвітку рядка
        for (let i = 0; i < this.coefficients[0].length; i++) {
            document
                .getElementById(`x-${this.pivot_index[0]}-${i}`)
                .classList.remove("highlighted");
        }

        // Знімаємо підсвітку стовпця (і самого провідного елемента).
        for (let i = 0; i < this.coefficients.length; i++) {
            document
                .getElementById(`x-${i}-${this.pivot_index[1]}`)
                .classList.remove("highlighted");
            document
                .getElementById(`x-${i}-${this.pivot_index[1]}`)
                .classList.remove("pivot-element");
        }
    }

    // Підсвічуємо провідні рядок та стовпець (і елемент).
    highlight_pivot() {
        // Підсвічуємо рядок.
        for (let i = 0; i < this.coefficients[0].length; i++) {
            document
                .getElementById(`x-${this.pivot_index[0]}-${i}`)
                .classList.add("highlighted");
        }

        // Підсвічуємо стовпець і елемент.
        for (let i = 0; i < this.coefficients.length; i++) {
            document
                .getElementById(`x-${i}-${this.pivot_index[1]}`)
                .classList.add("highlighted");
            if (i === this.pivot_index[0]) {
                document
                    .getElementById(`x-${i}-${this.pivot_index[1]}`)
                    .classList.add("pivot-element");
            }
        }
    }

    // Вираховуємо оціночні відношення.
    evaluate_relations() {
        for (let i = 0; i < this.eval.length; i++) {
            // Вільний член в даному рядку ділимо на елемент
            // в цьому ж рядку і провідному стовпці.
            const pivot = this.coefficients[i][this.pivot_index[1]];
            this.eval[i] = this.free[i] / pivot;
        }
    }

    // Зануляємо провідний стовпець.
    // Для цього від кожного рядка крім провідного віднімаємо провідний,
    // помножений на елемент на перетині провідного стовпця і даного рядка.
    zero_pivot_column() {
        // Провідний елемент.
        const pivot =
            this.coefficients[this.pivot_index[0]][this.pivot_index[1]];

        // Також вираховуємо вільні члени.
        for (let i = 0; i < this.free.length; i++) {
            if (i !== this.pivot_index[0]) {
                this.free[i] *= pivot;
                this.free[i] -=
                    (this.coefficients[i][this.pivot_index[1]] *
                        this.free[this.pivot_index[0]]) /
                    pivot;
            }
        }

        // Ітеруємося по рядках, що не є провідними.
        for (let i = 0; i < this.coefficients.length; i++) {
            if (i === this.pivot_index[0]) {
                continue;
            }
            // Елемент на перетині провідного стовпця і даного рядка.
            const from_pivot_column = this.coefficients[i][this.pivot_index[1]];

            // Ітеруємося по даному рядку.
            for (let j = 0; j < this.coefficients[i].length; j++) {
                // Віднімаємо відповідний елемент в провідному рядку,
                // помножений на елемент на перетині.
                this.coefficients[i][j] -=
                    from_pivot_column *
                    this.coefficients[this.pivot_index[0]][j];
            }
        }
    }

    // Вираховуємо елементи провідного рядка.
    calculate_pivot_row() {
        // Провідний елемент.
        const pivot =
            this.coefficients[this.pivot_index[0]][this.pivot_index[1]];

        for (let i = 0; i < this.coefficients[0].length; i++) {
            // Ділимо кожен елемент рядка на провідний елемент.
            this.coefficients[this.pivot_index[0]][i] /= pivot;
        }
        // Також вираховуємо відповідний вільний член.
        this.free[this.pivot_index[0]] /= pivot;
    }

    // Знаходимо значення цільової функції на даній ітерації.
    calculate_goal_function() {
        let result = 0;
        for (let i = 0; i < this.basis.length; i++) {
            const b = this.basis[i] - 1;
            result += this.free[i] * this.goal.expand().coefficients[b] * -1;
        }
        result *= -1;
        this.f_value = result;
        return result;
    }

    // Знаходимо нові коефіцієнти цільової функції.
    calculate_goal_coefficients() {
        for (let i = 0; i < this.goal_coefficients.length; i++) {
            const k_i = this.goal.expand().coefficients[i];
            let c = 0;
            for (let j = 0; j < this.basis.length; j++) {
                const b = this.basis[j] - 1;
                const cb = this.goal.expand().coefficients[b];
                c += cb * this.coefficients[j][i];
            }
            c -= k_i;
            this.goal_coefficients[i] = c;
        }
    }

    // Заміняємо базисний елемент в провідному рядку на провідний.
    replace_basis() {
        this.basis[this.pivot_index[0]] = this.pivot_index[1] + 1;
    }

    // Перевіряємо оптимальність розв'язку (чи немає від'ємних елементів у коефіцієнтах функції).
    check_solution() {
        let result = true;
        for (const goal_coefficient of this.goal_coefficients) {
            if (goal_coefficient < 0) {
                result = false;
                console.log(
                    "Solution is not optimal (there are negative indexes in last row), continuing",
                );
                return false;
            }
        }
        console.log("Solution is optimal, ending!");
        // Знімаємо підсвітку провідних рядка та стовпця.
        this.dehighlight_pivot();
        this.element.highight_free(this.free);
        return result;
    }

    // Показуємо розв'язок, коли його знайдено.
    show_solution() {
        // Видаляємо кнопку "Крок".
        document
            .querySelector(".page-container")
            .removeChild(document.getElementById("solve-button"));
        // Створюємо елемент, в якому покажемо розв'язок.
        const solution_el = document.createElement("h3");

        // Заповнюємо рядок з новою формулою.
        let f_formula = "(";
        for (let i = 0; i < this.basis.length - 1; i++) {
            if (!this.basis.includes(i + 1)) {
                f_formula += "0; ";
            } else {
                f_formula += `${roundstr(this.free[i])}; `;
            }
        }
        // Те саме для останнього елемента
        // (після якого не повинно бути крапки з комою і повинна бути дужка).
        if (!this.basis.includes(this.equations[0].coefficients.length + 1)) {
            f_formula += "0)";
        } else {
            f_formula += `${roundstr(this.free[this.equations[0].coefficients.length])})`;
        }

        // Задаємо текст і CSS-клас нового елемента.
        solution_el.innerText = `Solution found! Fmax = ${this.f_value}, the formula: ${f_formula}`;
        solution_el.classList.add("solution");

        // Додаємо його на сторінку.
        document.querySelector(".page-container").appendChild(solution_el);

        // Показуємо графічний розв'язок
        graphicallySolve();
    }

    // Крок ітерації.
    step() {
        // Перша ітерація.
        if (this.pivot_index[0] === null) {
            this.calculate_goal_function();
            this.calculate_goal_coefficients();
            this.find_pivot_column();
            this.evaluate_relations();
            this.find_pivot_row();
            this.highlight_pivot();
        } else {
            // Перевіряємо розв'язок.
            if (this.check_solution() === true) {
                this.show_solution();
                return;
            }
            this.dehighlight_pivot();
            this.replace_basis();
            this.calculate_pivot_row();
            this.zero_pivot_column();
            this.calculate_goal_function();
            this.calculate_goal_coefficients();
            this.find_pivot_column();
            this.evaluate_relations();
            this.find_pivot_row();
            this.highlight_pivot();
        }

        // Показуємо результат ітерації.
        this.element.show(
            this.basis,
            this.free,
            this.coefficients,
            this.eval,
            this.goal_coefficients,
            this.f_value,
        );
    }
}
