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
				<label for="goalx_${id}">Goal x</label>
			</td>
			<td>
				<input type="number" id="goalx_${id}">
			</td>
			</tr>
			<tr>
			<td>
				<label for="goaly_${id}">Goal y</label>
			</td>
			<td>
				<input type="number" id="goaly_${id}">
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
				<td><input type="text" id="obstacles_${id}"></td>
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
	getInputs(){
		let start = this.getStart() || new Point(2, 10);
		let goal = this.getGoal() || new Point(18, 10);
		let boundary = this.getBoundary() || new Circle(10, 10, 10);
		let obstacles = this.getObstacles() || [new Circle(10, 15, 2), new Circle(10, 5, 2)];
		let kappa = this.getKappa() || 3;
		console.log("Inputs are:", {start, goal, boundary, obstacles,kappa});
		return {start, goal, boundary, obstacles, kappa};
	}
	getStart(): Point{
		let x = parseFloat((<HTMLInputElement>document.getElementById("container_" + this.divID).querySelector("#startx_" + this.svgID)).value);
		let y = parseFloat((<HTMLInputElement>document.getElementById("container_" + this.divID).querySelector("#starty_" + this.svgID)).value);
		if(!x || !y){
			return;
		}
		return new Point(x, y);
	}
	getGoal(): Point {
		let x = parseFloat((<HTMLInputElement>document.getElementById("container_" + this.divID).querySelector("#goalx_" + this.svgID)).value);
		let y = parseFloat((<HTMLInputElement>document.getElementById("container_" + this.divID).querySelector("#goaly_" + this.svgID)).value);
		if(!x || !y){
			return;
		}
		return new Point(x, y);
	}
	getBoundary(): Circle {
		let str = (<HTMLInputElement>document.getElementById("container_" + this.divID).querySelector("#boundary_" + this.svgID)).value;
		try {
			let arr = eval(str);
			return new Circle(arr[0][0], arr[0][1], arr[1]);
		} catch {

		}
	}
	getObstacles(): Circle[] {
		let str = (<HTMLInputElement>document.getElementById("container_" + this.divID).querySelector("#obstacles_" + this.svgID)).value;
		try {
			let arr = eval(str);
			let obs: Circle[] = [];
			for(let i = 0; i < arr.length; i++){
				obs.push(new Circle(arr[i][0][0], arr[i][0][1], arr[i][1]));
			}
			return obs;
		} catch {

		}
	}
	getKappa(): number{
		return parseFloat((<HTMLInputElement>document.getElementById("container_" + this.divID).querySelector("#kappa_" + this.svgID)).value);
	}
	calculatePot(): void {
		let {start, goal, boundary, obstacles,kappa} = this.getInputs();
		Environment.getInstance().set(goal, boundary, obstacles, kappa);
		this.obstacles = obstacles;
		calculatePotential([0, 20], [0, 20], 1).then(vals => {
			this.data = vals;
			contourChart("contour_chart_container_" + this.svgID, [convertData(vals)], []);
		})
	}
	calculatePath() {
		let {start, goal, boundary, obstacles,kappa} = this.getInputs();
		Environment.getInstance().set(goal, boundary, obstacles, kappa);
		let path = gradientDescent(start, goal, boundary, 10, 0.0001);
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