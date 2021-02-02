declare const Plotly: any;

export function contourChart(svgId: string, data: { x: number[], y: number[], z: number[], type: string }[], shapes: any) {

	let chartData: any = data;

	var layout = {
		autosize: false,
		width: 500,
		height: 500,
		margin: {
		  l: 50,
		  r: 50,
		  b: 100,
		  t: 100,
		  pad: 4
		},
		paper_bgcolor: '#7f7f7f',
		plot_bgcolor: '#c7c7c7',
		shapes
	  };

	Plotly.newPlot(svgId, chartData, layout);

}