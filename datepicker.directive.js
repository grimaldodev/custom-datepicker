(function () {
	'use strict';
	angular
		.module('contralormx')
		.directive('datepicker', ['$rootScope', '$filter', 'Contralor', Directive]);

	function Directive() {
		return {
			restrict: 'E',
			templateUrl: 'datepicker.html',
			controller: Controller,
			controllerAs: 'datepicker',
			scope: {
				uid: '@?',
				nclass: '@?',
				model: '=?',
				params: '=?'
			}
		};

		function Controller($scope, $rootScope, $filter, Contralor) {
			var vm = $scope,
				settings = {
					calendar: true,
					clock: false,
					autoDate: true,
					timeGap: 30,
					dateFormat: 'yyyy-MM-dd'
				};
			vm.uid = vm.uid ? vm.uid : 'datepicker' + vm.$id;
			vm.model = vm.model || undefined;
			vm.month = undefined;
			vm.monthList = undefined;
			vm.header = undefined;
			vm.clock = undefined;
			vm.calendarToggle = calendarToggle;
			vm.calendarChange = calendarChange;
			vm.calendarHeader = calendarHeader;
			vm.calendarSelect = calendarSelect;
			vm.params = vm.params ? angular.extend(settings, vm.params) : settings;
			vm.inputValue = vm.params.autoDate ? new Date() : undefined;
			if (vm.model) {
				vm.inputValue = new Date(vm.model);
			}
			vm.inputValue = $filter('date')(vm.inputValue, vm.params.dateFormat);
			return vm;

			function calendarToggle(target) {
				var $target = angular.element(event.currentTarget).parents('.datepicker').find('.' + target),
					$doc = angular.element(document);
				switch (target) {
				case 'calendar':
					if (vm.model) {
						vm.month = calendarGetData({
							newDate: vm.model
						});
					} else {
						vm.month = calendarGetData();
					}
					vm.header = {
						name: vm.month.name + ' ' + vm.month.year,
						year: vm.month.year,
						id: vm.month.id,
						position: target
					};
					break;
				case 'clock':
					vm.clock = calendarClockData({
						newDate: vm.model
					});
					break;
				}
				//The toggle
				$target.toggleClass('hidden') // Hide it
					.siblings('.display') // Find the other display
					.not('.hidden') // Get visible display
					.toggleClass('hidden'); // Hide them
				//The focus
				if (!$target.is('.hidden')) {
					$doc.click(function () {
						$target.parent()
							.children('.display') // Get all displays in datepicker
							.not('.hidden') // Chose only the visibles
							.toggleClass('hidden'); // Hide them
						$doc.off('click'); // Stop listen
						vm.month = undefined;
						vm.monthList = undefined;
						vm.header = undefined;
						vm.clock = undefined;
					});
				} else {
					$doc.off('click'); // Stop listen
				}
				eventCatcher('calendarToggle');
			}

			function calendarChange(direction, origin) {
				switch (origin.position) {
				case 'calendar':
					var dateObj = new Date();
					dateObj.setMonth(origin.id);
					dateObj.setYear(origin.year);
					if (direction === 'prev') {
						if (dateObj.getMonth() === 0) {
							dateObj.setMonth(11);
							dateObj.setYear(dateObj.getFullYear() - 1);
						} else {
							dateObj.setMonth(dateObj.getMonth() - 1);
						}
					} else if (direction === 'next') {
						if (dateObj.getMonth() === 11) {
							dateObj.setMonth(0);
							dateObj.setYear(dateObj.getFullYear() + 1);
						} else {
							dateObj.setMonth(dateObj.getMonth() + 1);
						}
					}
					vm.month = calendarGetData({
						newDate: dateObj
					});
					vm.header = {
						name: vm.month.name + ' ' + vm.month.year,
						year: vm.month.year,
						id: vm.month.id,
						position: 'calendar'
					};
					eventCatcher('changeMonth');
					break;
				case 'monthList':
					vm.header.name = vm.header.name + 1;
					eventCatcher('changeYear');
					break;
				}
			}

			function calendarGetData(params) {
				var fullMonth = [],
					totalDays = [],
					dateObj = new Date(),
					actualMonth = Contralor.utils.months[dateObj.getMonth()],
					settings = {
						month: actualMonth.name,
						days: actualMonth.days
					},
					dayModel = {
						date: 0,
						disabled: true,
						id: '',
						type: 'day',
						wd: ''
					};
				if (params) {
					angular.extend(settings, params);
				}
				if (settings.newDate) {
					dateObj = new Date(settings.newDate);
					actualMonth = Contralor.utils.months[dateObj.getMonth()];
					settings.month = actualMonth.name;
					settings.days = actualMonth.days;
				}
				dateObj.setDate(1);
				//Count how many elements need before the loop
				if (dateObj.getDay() !== 0) {
					for (var i = 0; i < dateObj.getDay(); i++) {
						totalDays.push(dayModel);
					}
				}
				//Create the object with the day id and the position
				for (var j = 0; j < settings.days; j++) {
					var day = j + 1;
					dateObj.setDate(day);
					totalDays.push({
						date: dateObj.getTime(),
						disabled: false,
						id: day,
						type: 'day',
						wd: dateObj.getDay()
					});
				}
				//Complete the last week
				var emptyDays = 42 - totalDays.length;
				for (var k = 0; k < emptyDays; k++) {
					totalDays.push(dayModel);
				}
				//create weeks
				var inicio = 0,
					fin = 7;
				for (var l = 0; l < 6; l++) {
					var temp = totalDays.slice(inicio, fin);
					fullMonth.push(temp);
					inicio = fin;
					fin = inicio + 7;
				}
				return {
					id: dateObj.getMonth(),
					year: dateObj.getFullYear(),
					name: actualMonth.name,
					data: fullMonth
				};
			}

			function calendarHeader(params) {
				var $this = {
					'calendar': function () {
						var year = new Date(),
							list = Contralor.utils.months;
						if (vm.model) {
							year.setFullYear(vm.model.getFullYear());
						}
						vm.month = false;
						for (var index in list) {
							list[index].shortName = list[index].name.slice(0, 3);
							list[index].type = 'month';
						}
						vm.monthList = list;
						vm.header = {
							name: year.getFullYear(),
							position: 'monthList'
						};
					},
					'monthList': function () {
						vm.header.position = 'yearList';
					}
				};
				$this[params.position]();
				eventCatcher('headerChange');
			}

			function calendarSelect(params) {
				var dateSelected = new Date(params.date);
				switch (params.type) {
				case 'day':
					dateSelected.setHours(0, 0, 0, 0);
					vm.inputValue = $filter('date')(dateSelected, vm.params.dateFormat);
					vm.model = dateSelected;
					vm.clock = calendarClockData(dateSelected);
					eventCatcher('selectDate', true);
					break;
				case 'time':
					vm.inputValue = $filter('date')(dateSelected, 'yyyy-MM-dd HH:mm');
					vm.model = dateSelected;
					eventCatcher('selectTime', true);
					break;
				case 'month':
					vm.monthList = undefined;
					var dateObj = new Date(vm.header.name, params.id - 1, 1);
					vm.month = calendarGetData({
						newDate: dateObj
					});
					vm.header = {
						name: vm.month.name + ' ' + vm.month.year,
						id: vm.month.id,
						position: 'calendar'
					};
					eventCatcher('slectMonth');
					break;
				}
			}

			function calendarClockData(params) {
				var data = [],
					iterations = vm.params.timeGap,
					gapMMS = iterations * 60000,
					dateObj = params.newDate ? new Date(params.newDate) : new Date();
				dateObj.setMinutes(0, 0, 0);
				//Create the initial date
				var initDate = dateObj.getTime();
				//Create the final date
				dateObj.setHours(23, 59);
				var endMMS = (vm.params.timeGap - 1) * 60000;
				var endDate = dateObj.getTime() - endMMS;
				for (initDate; initDate <= endDate; initDate) {
					var tempDate = new Date(initDate);
					data.push({
						date: tempDate.getTime(),
						value: $filter('date')(tempDate, 'HH:mm'),
						type: 'time'
					});
					initDate = initDate + gapMMS;
				}
				return data;
			}

			function eventCatcher(type, flow) {
				$rootScope.$broadcast('datepicker', type);
				if (!flow) {
					event.stopImmediatePropagation();
				}
			}
		}
	}
})();