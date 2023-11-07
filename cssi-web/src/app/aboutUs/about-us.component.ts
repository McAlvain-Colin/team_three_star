// Import the componenet declarator from angular core
import { Component } from "@angular/core";

// Defines a type decorator with a selector for the css file and the template is for HTML reference
@Component({
	selector: 'aboutUs',
	templateUrl: './about-us.component.html',
	styleUrls: ['./about-us.component.css']
})

// Export makes this class visible to other things.
export class AboutUsComponent {

}

// We can avoid all this boiler plate coding with ng g c componentName (auto generates the component)