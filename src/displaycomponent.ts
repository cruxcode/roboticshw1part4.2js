import { calculateGradientX, calculatePotential, convertData, gradientDescent } from "./calculation";
import { contourChart } from "./chart";
import { Circle } from "./circle";
import { Environment } from "./environment";
import { Point } from "./point";

function createTemplate(id: number) {
	const template = `
			<table>
			<tr>
			<td>
				<label for="startx_${id}">Start x</label>
			</td>
			<td>
				<input type="number" id="startx_${id}">
			</td>
			</tr>
			<tr>
			<td>
				<label for="starty_${id}">Start y</label>
			</td>
			<td>
				<input type="number" id="starty_${id}">
			</td>
			</tr>
			<tr>
				<td>
					<label for="kappa_${id}">Kappa</label>
				</td>
				<td>
					<input type="number" id="kappa_${id}">
				</td>
			</tr>
			<tr>
				<td><label for="boundary_${id}">Boundary<label></td>
				<td><input type="text" id="boundary_${id}"></td>
			</tr>
			<tr>
				<td><label for="obstacles_${id}">Obstacles</label></td>
				<td><input type="text" id="obstacle_${id}"></td>
			</tr>
			</table>
			<button id="computePot_${id}">Compute Potential</button>
			<button id="computePath_${id}">Find Path</button>
			<button id="showObstacles_${id}">Show Obstacles</button>
			<div id="contour_chart_container_${id}"></div>
		`;
	return template;
}
export class DisplayComponent {
	parent: HTMLElement;
	svgID: number;
	divID: number;
	static activeID: number[] = [0];
	data: { point: Point, pot: number }[];
	obstacles: Circle[] = [];
	private static getID() {
		let max = Math.max(...DisplayComponent.activeID);
		DisplayComponent.activeID.push(max + 1);
		return max + 1;
	}
	constructor(parentID: string) {
		this.parent = document.getElementById(parentID);
		this.svgID = DisplayComponent.getID();
		this.divID = this.svgID;
	}
	show() {
		let template = createTemplate(this.svgID);
		let div = document.createElement("div");
		div.style.border = "1px solid black";
		div.style.display = "inline-block";
		div.style.width = "fit-content";
		div.id = "container_" + this.divID;
		div.innerHTML = template.trim();
		(<HTMLElement>div.querySelector("#computePot_" + this.svgID)).addEventListener("click", () => { this.calculatePot() });
		(<HTMLElement>div.querySelector("#computePath_" + this.svgID)).addEventListener("click", () => { this.calculatePath(); });
		(<HTMLElement>div.querySelector("#showObstacles_" + this.svgID)).addEventListener("click", () => { this.showObstacles() });
		this.parent.appendChild(div);
	}
	calculatePot(): void {
		const goal = new Point(18, 10);
		const boundary = new Circle(10, 10, 10);
		const obstacles = [new Circle(10, 15, 2), new Circle(10, 5, 2)];
		const kappa = parseInt((<HTMLInputElement>document.getElementById("container_" + this.divID).querySelector("#kappa_" + this.svgID)).value);
		Environment.getInstance().set(goal, boundary, obstacles, kappa);
		this.obstacles = obstacles;
		calculatePotential([0, 20], [0, 20], 1).then(vals => {
			this.data = vals;
			contourChart("contour_chart_container_" + this.svgID, [convertData(vals)], []);
		})
	}
	calculatePath() {
		const goal = new Point(18, 10);
		const boundary = new Circle(10, 10, 10);
		const obstacles = [new Circle(10, 15, 2), new Circle(10, 5, 2)];
		const kappa = parseInt((<HTMLInputElement>document.getElementById("container_" + this.divID).querySelector("#kappa_" + this.svgID)).value);
		Environment.getInstance().set(goal, boundary, obstacles, kappa);
		let x = parseFloat((<HTMLInputElement>document.getElementById("startx_" + this.svgID)).value);
		let y = parseFloat((<HTMLInputElement>document.getElementById("starty_" + this.svgID)).value);
		let path = gradientDescent(new Point(x, y), goal, boundary, 10, 0.0001);
		console.log(path);
	}
	showObstacles() {
		if (this.data) {
			let shapes = [];
			for (let i = 0; i < this.obstacles.length; i++) {
				shapes.push({
					type: 'circle',
					xref: 'x',
					yref: 'y',
					x0: this.obstacles[i].cx - this.obstacles[i].r,
					y0: this.obstacles[i].cy - this.obstacles[i].r,
					x1: this.obstacles[i].cx + this.obstacles[i].r,
					y1: this.obstacles[i].cy + this.obstacles[i].r,
					opacity: 0.75,
					fillcolor: 'black',
					line: {
						color: 'black'
					}
				});
			}
			contourChart("contour_chart_container_" + this.svgID, [convertData(this.data)], shapes);
		}
	}
}