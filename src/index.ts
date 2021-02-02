import { DisplayComponent } from './displaycomponent';
const parentID = "main_container";

export function addDisplayComponent(){
	const comp = new DisplayComponent(parentID);
	comp.show();
}
addDisplayComponent();
(<any>window).addDisplayComponent = addDisplayComponent;