const START_HOUR = 6;
const FINISH_HOUR = 20;

var currentWeek = null;
var textFile;

window.onload = function () {
	var divWeek = document.getElementById('week');
	
	currentWeek = new Week();
	
	divWeek.appendChild(currentWeek.getControl());
	
	
	var btnSave = document.getElementById('btnSave');
	btnSave.onclick = function () {
		Save();
	}
	var txbSaveName = document.getElementById('txbSaveName');
	var btnLoad = document.getElementById('btnLoad');
	
	  document.getElementById('files').addEventListener('change', handleFileSelect, false);
}

function Week() {
	var t = this;
	
	t.days = {};
	t.days['sun'] = new Day('sun');
	t.days['mon'] = new Day('mon');
	t.days['tue'] = new Day('tue');
	t.days['wed'] = new Day('wed');
	t.days['thur'] = new Day('thur');
	t.days['fri'] = new Day('fri');
	t.days['sat'] = new Day('sat');
	
	t.getControl = function () {
		var div = document.createElement("div");
		div.className += ' week';
		
		for (key in t.days) {
			if (t.days.hasOwnProperty(key)) {
				div.appendChild(t.days[key].getControl());
			}
		}
		
		return div;
	}
	
	t.getJSONObj = function () {
		var arr = {};
		
		for (key in t.days) {
			if (t.days.hasOwnProperty(key)) {
				arr[key] = t.days[key].getJSONObj();
			}
		}
		
		return arr;
	}
	
	t.loadFromJSON = function (obj) {
		obj = obj['obj'];
		for (key in t.days) {
			if (t.days.hasOwnProperty(key)) {
				t.days[key].loadFromJSON(obj[key]);
			}
		}
	}
}

function Day(day) {
	var t = this;
	t.day = day;
	
	t.hours = {};
	for (var i = START_HOUR; i <= FINISH_HOUR; i++) {
		t.hours[i - START_HOUR] = new Hour(i);
	}
	
	t.getControl = function () {
		var div = document.createElement("div");
		div.className += ' day';
		
		t.lblDay = document.createElement("span");
		t.lblDay.innerHTML = day;
		div.appendChild(t.lblDay);
		
		for (key in t.hours) {
			if (t.hours.hasOwnProperty(key)) {
				div.appendChild(t.hours[key].getControl());
			}
		}
		
		return div;
	}
	
	t.getJSONObj = function () {
		var arr = {};
		
		for (key in t.hours) {
			if (t.hours.hasOwnProperty(key)) {
				arr[key] = t.hours[key].getJSONObj();
			}
		}
		
		return arr;
	}
	
	t.loadFromJSON = function (obj) {
		for (key in t.hours) {
			if (t.hours.hasOwnProperty(key)) {
				t.hours[key].loadFromJSON(obj[key]);
			}
		}
	}
}

function Hour(hour) {
	var t = this;
	
	t.hour = hour;
	
	t.getControl = function () {
		var div = document.createElement("DIV");
		div.className += ' hour';
		
		if (!t.txbText) {
			t.txbText = document.createElement("textarea");
			t.txbText.placeholder = t.hour.toString();
		}
		
		div.appendChild(t.txbText);
		return div;
	}
	
	t.getJSONObj = function () {
		return { 'text': t.txbText.value };
	}
	
	t.loadFromJSON = function (obj) {
		t.txbText.value = obj['text'];
	}
}

function Save() {
	var obj = currentWeek.getJSONObj();
	
	var str = JSON.stringify({ obj });
	
	var link = document.getElementById('linkDownload');
    link.href = makeTextFile(str);
}

makeTextFile = function (text) {
var data = new Blob([text], {type: 'text/plain'});

// If we are replacing a previously generated file we need to
// manually revoke the object URL to avoid memory leaks.
if (textFile !== null) {
  window.URL.revokeObjectURL(textFile);
}

textFile = window.URL.createObjectURL(data);

return textFile;
};

function Load() {
	
}

function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    var file = files[0];

	if (file.type != 'text/plain') {
		window.alert('make sure your file has the extension .txt!!');
		return;
	}

	var reader = new FileReader();
	reader.onload = function (e) {
		setupFromFile(reader.result);
	}
	reader.readAsText(file);
  }
  
  function setupFromFile(dataAsString) {
        var loadObj = JSON.parse(dataAsString);

        currentWeek.loadFromJSON(loadObj);
    }

