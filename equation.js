class Equation {
    static additional = [];
    constructor(coefficients, right, is_goal, is_expand) {
        this.coefficients = coefficients;
        this.right = right;
        this.is_goal = is_goal;

        if (is_goal === undefined && is_expand === undefined) {
            Equation.additional.push(1);
            this.additional_index =
                this.coefficients.length + Equation.additional.length - 1;
        }
    }
    expand() {
        console.log("this", this);
        const newEq = new Equation(
            Array.from(this.coefficients),
            this.right,
            this.is_goal,
            true,
        );
        console.log("new", newEq);

        for (let i = 0; i < Equation.additional.length; i++) {
            if (i === this.additional_index - this.coefficients.length) {
                newEq.coefficients.push(1);
            } else {
                newEq.coefficients.push(0);
            }
        }

        return newEq;
    }

    solve_with_arguments(args) {
        let result = 0;
        for (let i = 0; i < args.length; i++) {
            result += args[i] * this.coefficients[i];
        }
        return result;
    }
}
