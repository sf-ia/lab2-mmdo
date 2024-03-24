class SimplexTable {
    constructor(equations, goal) {
        this.goal_coefficients = goal.expand().coefficients;
        this.coefficients = equations
            .map((j) => j.expand())
            .map((i) => i.coefficients);

        this.equations = equations;
        this.goal = goal;

        this.basis = Array.from(
            { length: this.equations.length },
            (_, i) => i + equations[0].coefficients.length + 1,
        );

        this.free = equations.map((i) => i.right);
        this.eval = Array.from({ length: equations.length }, () => "-");

        this.element = new TableauView(
            equations[0].coefficients.length,
            Equation.additional.length,
        );

        this.pivot_index = [null, null];

        this.f_value = 0;

        this.element.show(
            this.basis,
            this.free,
            this.coefficients,
            this.eval,
            this.goal_coefficients,
            this.f_value,
        );
    }

    find_pivot_column() {
        const pivot = this.goal_coefficients.findIndex(
            (i) => i === Math.min(...this.goal_coefficients),
        );
        this.pivot_index[1] = pivot;
    }

    find_pivot_row() {
        let pivot = 0;
        for (let i = 1; i < this.eval.length; i++) {
            if (this.eval[i] < this.eval[pivot] && this.eval[i] > 0) {
                pivot = i;
            }
        }
        this.pivot_index[0] = pivot;
    }

    dehighlight_pivot() {
        for (let i = 0; i < this.coefficients[0].length; i++) {
            document
                .getElementById(`x-${this.pivot_index[0]}-${i}`)
                .classList.remove("highlighted");
        }

        for (let i = 0; i < this.coefficients.length; i++) {
            document
                .getElementById(`x-${i}-${this.pivot_index[1]}`)
                .classList.remove("highlighted");
            document
                .getElementById(`x-${i}-${this.pivot_index[1]}`)
                .classList.remove("pivot-element");
        }
    }

    highlight_pivot() {
        for (let i = 0; i < this.coefficients[0].length; i++) {
            document
                .getElementById(`x-${this.pivot_index[0]}-${i}`)
                .classList.add("highlighted");
        }

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

    evaluate_relations() {
        for (let i = 0; i < this.eval.length; i++) {
            const pivot = this.coefficients[i][this.pivot_index[1]];
            this.eval[i] = this.free[i] / pivot;
        }
    }

    zero_pivot_column() {
        const pivot =
            this.coefficients[this.pivot_index[0]][this.pivot_index[1]];

        for (let i = 0; i < this.free.length; i++) {
            if (i !== this.pivot_index[0]) {
                this.free[i] *= pivot;
                this.free[i] -=
                    (this.coefficients[i][this.pivot_index[1]] *
                        this.free[this.pivot_index[0]]) /
                    pivot;
            }
        }

        for (let i = 0; i < this.coefficients.length; i++) {
            if (i === this.pivot_index[0]) {
                continue;
            }
            const from_pivot_column = this.coefficients[i][this.pivot_index[1]];

            for (let j = 0; j < this.coefficients[i].length; j++) {
                this.coefficients[i][j] -=
                    from_pivot_column *
                    this.coefficients[this.pivot_index[0]][j];
            }
        }
    }

    calculate_pivot_row() {
        const pivot =
            this.coefficients[this.pivot_index[0]][this.pivot_index[1]];

        for (let i = 0; i < this.coefficients[0].length; i++) {
            this.coefficients[this.pivot_index[0]][i] /= pivot;
        }
        this.free[this.pivot_index[0]] /= pivot;
    }

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

    replace_basis() {
        this.basis[this.pivot_index[0]] = this.pivot_index[1] + 1;
    }

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
        this.dehighlight_pivot();
        this.element.highight_free(this.free);
        return result;
    }

    show_solution() {
        document
            .querySelector(".page-container")
            .removeChild(document.getElementById("solve-button"));
        const solution_el = document.createElement("h3");

        let f_formula = "(";
        for (let i = 0; i < this.basis.length - 1; i++) {
            if (!this.basis.includes(i + 1)) {
                f_formula += "0; ";
            } else {
                f_formula += `${roundstr(this.free[i])}; `;
            }
        }
        if (!this.basis.includes(this.equations[0].coefficients.length + 1)) {
            f_formula += ")";
        } else {
            f_formula += `${roundstr(this.free[this.equations[0].coefficients.length])})`;
        }

        solution_el.innerText = `Solution found! Fmax = ${this.f_value}, the formula: ${f_formula}`;
        solution_el.classList.add("solution");

        document.querySelector(".page-container").appendChild(solution_el);

        graphicallySolve();
    }

    step() {
        if (this.pivot_index[0] === null) {
            this.calculate_goal_function();
            this.calculate_goal_coefficients();
            this.find_pivot_column();
            this.evaluate_relations();
            this.find_pivot_row();
            this.highlight_pivot();
        } else {
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
