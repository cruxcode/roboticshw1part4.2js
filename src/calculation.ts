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

function pointsEqual(p1: Point, p2: Point): boolean{
	if(p1.x == p2.x && p1.y == p2.y){
		return true;
	}
	return false;
}

export function gradientDescent(start: Point, goal: Point, boundary: Circle, alpha: number, epsilon: number): Point[]{
	let q: Point[] = [start];
	let dudx: number = calculateGradientX(q[0]).dudx;
	let dudy: number = calculateGradientY(q[0]).dudy;
	let count = 0;
	const max_iter = 1000;
	while ((calcDist(new Point(dudx, dudy), new Point(0, 0)) > epsilon) && count < max_iter) {
		let x = q[q.length - 1].x - alpha*dudx;
		let y = q[q.length - 1].y - alpha*dudy;
		let new_point = new Point(x, y);
		q.push(new_point);
		// if(calculateGradientX(q[q.length - 1]) == undefined && !pointsEqual(q[q.length - 1], goal)){
		// 	dudx = (q[q.length - 1].x - goal.x)/(2*boundary.r);
		// } else {
			dudx = calculateGradientX(q[q.length - 1]).dudx;
		// }
		// if(calculateGradientY(q[q.length - 1]) == undefined && !pointsEqual(q[q.length - 1], goal)){
		// 	dudy = (q[q.length - 1].y - goal.y)/(2*boundary.r);
		// } else {
			dudy = calculateGradientY(q[q.length - 1]).dudy;
		// }

		if(count%20 == 0){
			console.log("% done", count*100/max_iter);
		}
		++count;
	}
	return q;
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