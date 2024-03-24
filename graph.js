function graphicalSolution(equations, goal_function) {
    const graphEl = document.createElement("div");
    graphEl.id = "SolutionPlot";
    document.querySelector(".page-container").appendChild(graphEl);

    const data = [];

    data.push(...drawConstraints(equations));

    let intersections = findIntersections(equations);

    intersections = intersections.filter((i) =>
        planesIncludePoint(Object.values(i), equations),
    );

    const edgePointsAtAxis = edgeAxisPoints(
        data.filter((i) => i.mode === "lines"),
    );

    intersections.push({ x: edgePointsAtAxis.x[0], y: edgePointsAtAxis.y[0] });
    intersections.push({ x: edgePointsAtAxis.x[1], y: edgePointsAtAxis.y[1] });

    intersections.sort((a, b) => {
        if (a.x === b.x) {
            return b.y - a.y;
        }
        return a.x - b.x;
    });

    data.push(plotFromPoints(intersections, "Feasible region", true));

    data.push(
        plotFromPoints(
            [chooseBestSolution(intersections, goal_function)],
            "Solution",
        ),
    );

    Plotly.newPlot("SolutionPlot", data);
}

function drawConstraints(equations) {
    let plots = [];
    for (const equation of equations) {
        let plot = {
            x: [],
            y: [],
            mode: "lines",
            name: `Нерівність ${equation.coefficients[0]}x + ${equation.coefficients[1]}x <= ${equation.right}`,
        };
        for (let i = 0; i < equation.coefficients.length; i++) {
            plot.x.push(equation.right / equation.coefficients[0]);
            plot.y.push(0);
            plot.y.push(equation.right / equation.coefficients[1]);
            plot.x.push(0);
        }
        plots.push(plot);
    }
    return plots;
}

function findIntersections(equations) {
    let intersections = [];

    for (let i = 0; i < equations.length - 1; i++) {
        for (let j = i; j < equations.length; j++) {
            const a1 = equations[i].coefficients[0];
            const b1 = equations[i].coefficients[1];
            const a2 = equations[j].coefficients[0];
            const b2 = equations[j].coefficients[1];
            const c1 = -1 * equations[i].right;
            const c2 = -1 * equations[j].right;
            const x = (b1 * c2 - b2 * c1) / (a1 * b2 - a2 * b1);
            const y = (a2 * c1 - a1 * c2) / (a1 * b2 - a2 * b1);
            intersections.push({ x: x, y: y });
        }
    }
    intersections = intersections.filter((i) => !(isNaN(i.x) && isNaN(i.y)));

    return intersections;
}

function chooseBestSolution(points, goal) {
    let max_result = 0;
    let bestPoint = points[0];
    for (let i = 0; i < points.length; i++) {
        const res = goal.solve_with_arguments([points[i].x, points[i].y]);
        if (res > max_result) {
            max_result = res;
            bestPoint = points[i];
        }
    }
    return bestPoint;
}

function plotFromPoints(points, name, fill = false) {
    const plt = {
        x: [],
        y: [],
        mode: "markers",
        name: name,
    };

    if (fill) {
        plt.fill = "tozeroy";
        plt.mode = "markers+lines";
    }

    for (const point of points) {
        plt.x.push(point.x);
        plt.y.push(point.y);
    }

    return plt;
}

function nontrivialMin(arr) {
    let min = arr.findIndex((i) => i > 0);
    for (let i = min; i < arr.length; i++) {
        if (arr[i] > 0 && arr[i] < arr[min]) {
            min = i;
        }
    }
    return { index: min, value: arr[min] };
}

function edgeAxisPoints(plots) {
    const all_x = plots.map((i) => i.x).flat();
    const all_y = plots.map((i) => i.y).flat();

    let min_x = 0;
    let min_y = 0;
    for (let i = 0; i < all_x.length; i++) {
        if (all_x[i] !== 0 && all_y[i] === 0) {
            if (min_x === 0) {
                min_x = i;
            }
            if (all_x[i] < all_x[min_x]) {
                min_x = i;
            }
        }

        if (all_y[i] !== 0 && all_x[i] === 0) {
            if (all_y[min_y] === 0) {
                min_y = i;
            }
            if (all_y[i] < all_y[min_y]) {
                min_y = i;
            }
        }
    }

    return { x: [all_x[min_x], 0], y: [0, all_y[min_y]] };
}

function planesIncludePoint(point, planes) {
    for (let i = 0; i < planes.length; i++) {
        let current = 0;
        for (let j = 0; j < planes[i].coefficients.length; j++) {
            current += planes[i].coefficients[j] * point[j];
        }
        if (current > planes[i].right) {
            return false;
        }
    }
    return true;
}
