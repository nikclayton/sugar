// import sugar from './sugar/sugar';
import angular from 'angular';
// import { SSelectElement, SActivateElement } from './sugar/index';
//
import sActivateManager from './sugar/components/s-activate-manager';
import SSelectElement from './sugar/components/s-select-element';
import sDrawerManager from './sugar/components/s-drawer-manager';
// 
// import SSelectElement from './sugar/index';
// import SActivateElement from './sugar/index';

const app = angular.module('angular-demo', []).run(() => {

});

// app.directive('sSelect', () => {
// 	return {
// 		restrict : 'A',
// 		link : (scope, elm, attrs) => {
// 			console.log('elm', elm);

// 			const select = new sugar.SelectElement(elm[0]);

// 		}
// 	}
// })

app.controller('myForm',
	['$scope',
	 '$timeout',
	(
	 $scope,
	 $timeout
	) => {

		// $scope.select_1_model = null;
		$scope.select_1_items = [{
			id : 622487880,
			group : 'coco',
			label : 'Hello world'
		}, {
			id : 622487880,
			group : 'caca',
			label : 'Hello coco'
		}];
		$scope.select_1_model = $scope.select_1_items[0];
		$scope.select_2_model = [];
		$scope.select_3_model = $scope.select_1_items[0];
		$scope.select_4_model = [];

		// $scope.keywords = 'efwefew';

		// $timeout(() => {
			for(let i = 0; i<10; i++) {
				$scope.select_1_items.push({
					id : Math.round(Math.random() * 622487880),
					group : (Math.random() < 0.5) ? 'coco' : 'caca',
					label : Math.random()*99999
				});
			}
		// }, 2000);

		$scope.$watch('select_1_model', (newVal, oldVal) => {
			console.log('select_1_model updated', newVal, oldVal);
		});

}]);