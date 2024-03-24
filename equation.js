// Клас репрезентує рівняння (або функцію)
class Equation {
    // Всі додаткові змінні (їх значення)
    static additional = [];

    // Ініціалізація об'єкта
    constructor(coefficients, right, is_goal, is_expand) {
        // Коефіцієнти біля змінних
        this.coefficients = coefficients;
        // Знак після дорівнює
        this.right = right;
        // Чи репрезентує об'єкт функцію
        this.is_goal = is_goal;

        // Потрібно для правильного розширення рівняння (див. метод expand())
        // У функції не повинно бути додаткових індексів.
        if (is_goal === undefined && is_expand === undefined) {
            // Додаємо нову додаткову змінну
            Equation.additional.push(1);

            // Задаємо цьому об'єкту індекс додаткової змінної, вставленої в це рівняння.
            this.additional_index =
                this.coefficients.length + Equation.additional.length - 1;
        }
    }

    // Розширення рівняння, тобто додавання всіх змінних, навіть якщо їх коефіцієнт 0
    // (за замовчуванням в рівнянні є лише додані безпосередньо до нього змінні).
    expand() {
        const newEq = new Equation(
            Array.from(this.coefficients),
            this.right,
            this.is_goal,
            true,
        );

        // Проходимося по всіх додаткових змнних та
        // додаємо їх коефіцієнт до коефіцієнтів розширеного рівняння.
        for (let i = 0; i < Equation.additional.length; i++) {
            if (i === this.additional_index - this.coefficients.length) {
                newEq.coefficients.push(1);
            } else {
                newEq.coefficients.push(0);
            }
        }

        return newEq;
    }

    // Підставляємо значення у функцію і обраховуємо результат.
    solve_with_arguments(args) {
        if (args.length !== this.coefficients.length || this.is_goal !== true) {
            return undefined;
        }
        let result = 0;
        for (let i = 0; i < args.length; i++) {
            result += args[i] * this.coefficients[i];
        }
        return result;
    }
}
