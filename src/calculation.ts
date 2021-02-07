import { Circle } from "./circle";
import { calcDist, Environment, mathify } from "./environment";
import { Point } from "./point";

export function calculatePotential(xRange: number[], yRange: number[], step: number): Promise<{ point: Point, pot: number }[]> {
	return new Promise((res, rej) => {
		let result: { point: Point, pot: number }[] = [];
		for (let x = xRange[0]; x <= xRange[1]; x = x + step) {
			for (let y = yRange[0]; y <= yRange[1]; y = y + step) {
				let potExpr = Environment.getInstance().getPot(new Point(x, y));
				let modPotExpr = mathify(potExpr);
				try {
					let pot = eval(modPotExpr);
					result.push({ point: new Point(x, y), pot: pot });
				} catch {
					console.log(modPotExpr, x, y);
				}
			}
			console.log("% done", (x * 100 / xRange[1]));
		}
		console.log("% done", 100);
		res(result);
	})
}

export function calculateGradientX(point: Point): { point: Point, dudx: number } {
	let gradientExpr = Environment.getInstance().getGradientX(point);
	
	let modGradientExpr = mathify(gradientExpr);
	try {
		let dudx = eval(modGradientExpr);
		return { point, dudx };
	} catch {
		console.log(modGradientExpr, point);
	}
}

export function calculateGradientY(point: Point): { point: Point, dudy: number } {
	let gradientExpr = Environment.getInstance().getGradientY(point);
	let modGradientExpr = mathify(gradientExpr);
	try {
		let dudy = eval(modGradientExpr);
		return { point, dudy };
	} catch {
		console.log(modGradientExpr, point);
	}
}

(<any>window).calculateGradientX = calculateGradientX;
(<any>window).calculateGradientY = calculateGradientY;

function pointsEqual(p1: Point, p2: Point): boolean{
	if(p1.x == p2.x && p1.y == p2.y){
		return true;
	}
	return false;
}

function adaptAlpha(alpha: number, dudx: number, dudy: number): number{
	if(calcDist(new Point(dudx, dudy), new Point(0, 0)) >= 0.01){
		return alpha/10;
	}
	if(calcDist(new Point(dudx, dudy), new Point(0, 0)) >= 0.0001){
		return alpha;
	}
	if((calcDist(new Point(dudx, dudy), new Point(0, 0)) < 0.000001)){
		return alpha*1000;
	}
	if((calcDist(new Point(dudx, dudy), new Point(0, 0)) < 0.00001)){
		return alpha*100;
	}
	if((calcDist(new Point(dudx, dudy), new Point(0, 0)) < 0.0001)){
		return alpha*10;
	}
	// if((calcDist(new Point(dudx, dudy), new Point(0, 0)) < 0.001)){
	// 	return alpha*10;
	// }
}

export function gradientDescent(start: Point, goal: Point, boundary: Circle, alpha: number, epsilon: number, cb?: (q: Point[], dudx: number, dudy: number, count: number, terminated: boolean) => boolean): Promise<Point[]>{
	return new Promise<Point[]>((res, req)=>{
		let q: Point[] = [start];
		let dudx: number = calculateGradientX(q[0]).dudx;
		let dudy: number = calculateGradientY(q[0]).dudy;
		let count = 0;
		console.log("gradient5!!!");
		while ((calcDist(new Point(dudx, dudy), new Point(0, 0)) > epsilon)) {
			let alpha_star = adaptAlpha(alpha, dudx, dudy);
			let x = q[q.length - 1].x - alpha_star*dudx;
			let y = q[q.length - 1].y - alpha_star*dudy;
			let new_point = new Point(x, y);
			q.push(new_point);
			if(cb && !cb(q, dudx, dudy, count, false)){
				return q;
			}
			dudx = calculateGradientX(q[q.length - 1]).dudx;
			dudy = calculateGradientY(q[q.length - 1]).dudy;
			++count;
		}
		cb(q, dudx, dudy, count, true);
		res(q);
	});
}

export function convertData(vals: { point: Point, pot: number }[]): { x: number[], y: number[], z: number[], type: string } {
	let x: number[] = [], y: number[] = [], z: number[] = [];
	for (let i = 0; i < vals.length; i++) {
		x.push(vals[i].point.x);
		y.push(vals[i].point.y);
		z.push(vals[i].pot);
	}
	return { x, y, z, type: "contour" };
}