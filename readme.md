# Custom Datepicker ~directive

I create this simple custom date picker directive to structure a specific usage into a project related to the financial department into the companies. The basic function is to provide a range of dates and broadcast a custom event every time ta user choose, open or change the date.

Also it can get the date as a parameter and setup as initial date from a model.

## Template
### URL: datepicker.html
### Parameters: udi, nclass, model, parasm

**Code usage**

	<datepicker nclass="classes" uid="unicID" model="NgModel" params="Object"></datepicker>

### UID

*type:string* 

If you need a special ID for the element you can add it, if not, the directive create one basic related into the angular $id 


### nClass

*type: string*

Add an extra class for extend the basic styles

### Model

*type: Object*

Pass the ngModel to the to way binding, if has data use as the initial date.

### Params

*type: Object*

Receive an object with the parameters to configure the directive:

 	calendar: true,
	clock: false,
	autoDate: true,
	timeGap: 30,
	dateFormat: 'yyyy-MM-dd'

| Param | Default | Description |
|-------|---------|------------|
| calendar | true | Used to show the calendar |
| clock | false | Display a range of hours to choose |
| autoDate  | true | Get the current date initially |
| timeGap | 30 | is the time gap in the time selector |
| dateFormat | 'yyyy-MM-dd' | The format to display the date |

