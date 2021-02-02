import { Circle } from './circle';
import { Point } from './point';
var alg = require("algebrite");
(<any>window).alg = alg;
function getDist(q_goal: Point): string{
	let str = `distance = sqrt( (x - ${q_goal.x})^2 + (y - ${q_goal.y})^2 )`;
	return str;
}

function getPotential(kappa: number): string{
	let str = `p = ( (distance^2) / ( distance^(2*${kappa}) + b )^(1/${kappa}) )`;
	return str;
}

function getRepulsive(boundary: Circle, obstacles: Circle[]): string{
	let str = `b = ( -1*( (x - ${boundary.cx})^2 + (y - ${boundary.cy})^2 ) + ${boundary.r}^2 )`;
	obstacles.forEach(o=>{
		str = str + `*( (x - ${o.cx})^2 + (y - ${o.cy})^2 - ${o.r}^2 )`;
	})
	return str;
}

function getGradientX(): string{
	let str = `dudx = d(p, x)`;
	return str;
}

function getGradientY(): string{
	let str = `dudy = d(p, y)`;
	return str;
}

export function calcDist(p1: Point, p2: Point): number{
	return ((p1.x - p2.x)**2 + (p1.y - p2.y)**2)**0.5;
}

export function mathify(str: string){
	return str.replace(/\^/g, "**").replace(/\.\.\./g, "");
}

const POT_CLAMP = "1";

export class Environment {
	static env: Environment;
	isSet: boolean;
	obstacles: Circle[];
	boundary: Circle;
	private constructor(){

	}
	public static getInstance(): Environment {
		if(Environment.env == undefined){
			Environment.env = new Environment();
		}
		return Environment.env;
	}
	set(goal: Point, boundary: Circle, obstacles: Circle[], kappa: number): void {
		this.obstacles = obstacles;
		this.boundary = boundary;
		alg.run(getRepulsive(boundary, obstacles));
		alg.run(getDist(goal));
		alg.run(getPotential(kappa));
		alg.run(getGradientX());
		alg.run(getGradientY());
		this.isSet = true;
	}
	clear(variable: string): void {
		alg.clear(variable);
		this.isSet = false;
	}
	clearAll(): void {
		alg.clearAll();
		this.isSet = false;
	}
	getPot(p: Point): string {
		if(this.isSet && this.safePoint(p)){
			return alg.eval(alg.eval("p", "x",  p.x.toString()).toString(), "y", p.y.toString()).toString();
		}
		if(this.isSet && !this.safePoint(p)){
			return POT_CLAMP;
		}
	}
	getGradientX(p: Point): string {
		if(this.isSet && this.safePoint(p)){
			let ev = this.removeDots(alg.eval("dudx", "x",  p.x.toString()).toString());
			ev = this.removeDots(alg.eval(ev, "y", p.y.toString()).toString());
			return ev;
		}
		if(this.isSet && !this.safePoint(p)){
			return "0";
		}
	}
	removeDots(str: string){
		return str.replace(/\.\.\./g, "");
	}
	getGradientY(p: Point): string {
		if(this.isSet && this.safePoint(p)){
			let ev = this.removeDots(alg.eval("dudy", "x",  p.x.toString()).toString());
			ev = this.removeDots(alg.eval(ev, "y", p.y.toString()).toString());
			return ev;
		}
		if(this.isSet && !this.safePoint(p)){
			return "0";
		}
	}
	safePoint(p: Point){
		// p should not be inside or on the circle
		for(let i = 0; i < this.obstacles.length; i++){
			let x = this.obstacles[i].cx;
			let y = this.obstacles[i].cy;
			let r = this.obstacles[i].r;
			if(calcDist(p, new Point(x, y)) <=  r){
				return false;
			}
		}
		// p should not be outside boundary
		if(calcDist(p, new Point(this.boundary.cx, this.boundary.cy)) > this.boundary.r){
			return false;
		}
		return true;
	}
}