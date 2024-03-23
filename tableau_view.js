class TableauView {
    constructor(main_count, added_count) {
        this.element = document.createEvent("div");
        this.element.id = "simplex-table";
        document.querySelector(".page-container").prepend(this.element);
        this.make_header(main_count, added_count);
    }

    make_header(main_count, added_count) {
        for (const ht of [
            { id: "basis", text: "Базис" },
            { id: "free", text: "Вільні члени" },
            { id: "vars", text: "Змінні" },
            { id: "eval", text: "Оціночні відношення" },
            { id: "main", text: "Основні" },
            { id: "added", text: "Додаткові" },
        ]) {
            createElement(
                "div",
                this.element,
                [ht.id, "header__element"],
                ht.id,
                ht.text,
                true,
            );
        }

        for (let i = 0; i < main_count + added_count; i++) {
            createElement(
                "div",
                this.element,
                ["header__element"],
                `x-${i}`,
                `x-${i + 1}`,
                true,
            );
        }

        let x_template_areas = "";
        for (let i = 0; i < main_count + added_count; i++) {
            x_template_areas += `x-${i} `;
        }

        this.element.style.gridTemplateAreas = `'basis free ${"vars ".repeat(main_count + added_count)} eval'`;
        this.element.style.gridTemplateAreas += `'basis free ${"main ".repeat(main_count)} ${"added ".repeat(added_count)} eval'`;
        this.element.style.gridTemplateAreas += `'basis free ${x_template_areas} eval'`;
        this.element.style.gridTemplateColumns = `repeat(${3 + main_count + added_count}, 1fr)`;
    }

    show_for_first(basis, free, coefficients, eval_column, goal_coefficients) {
        for (let i = 0; i < coefficients.length; i++) {
            createElement(
                "div",
                this.element,
                ["main__element"],
                `b-${i}`,
                `x${basis[i]}`,
            );
            createElement(
                "div",
                this.element,
                ["main__element"],
                `f-${i}`,
                free[i],
            );

            for (let j = 0; j < coefficients[i].length; j++) {
                createElement(
                    "div",
                    this.element,
                    ["main__element"],
                    `x-${i}-${j}`,
                    coefficients[i][j],
                );
            }

            createElement(
                "div",
                this.element,
                ["main__element"],
                `e-${i}`,
                eval_column[i],
            );
        }
        createElement("div", this.element, ["main__element"], "", "F");
        createElement("div", this.element, ["main__element"], "f-value", 0);
        for (let i = 0; i < goal_coefficients.length; i++) {
            createElement(
                "div",
                this.element,
                ["main__element"],
                `F-${i}`,
                goal_coefficients[i],
            );
        }
    }

    show(basis, free, coefficients, eval_column, goal_coefficients, f_value) {
        if (!document.getElementById(`x-${0}-${0}`)) {
            this.show_for_first(
                basis,
                free,
                coefficients,
                eval_column,
                goal_coefficients,
            );
            return;
        }
        for (let i = 0; i < basis.length; i++) {
            document.getElementById(`b-${i}`).innerText = `x${basis[i]}`;
            document.getElementById(`f-${i}`).innerText = roundstr(free[i]);
            for (let j = 0; j < coefficients[i].length; j++) {
                document.getElementById(`x-${i}-${j}`).innerText = roundstr(
                    coefficients[i][j],
                );
            }
            document.getElementById(`e-${i}`).innerText = roundstr(
                eval_column[i],
            );
        }
        document.getElementById("f-value").innerText = roundstr(f_value);
        for (let i = 0; i < goal_coefficients.length; i++) {
            document.getElementById(`F-${i}`).innerText = roundstr(
                goal_coefficients[i],
            );
        }
    }
    highight_free(free) {
        for (let i = 0; i < free.length; i++) {
            document.getElementById(`f-${i}`).classList.add("free-highlighted");
            document
                .getElementById(`b-${i}`)
                .classList.add("basis-highlighted");
        }
        document.getElementById("f-value").classList.add("f-highlighted");
    }
}
