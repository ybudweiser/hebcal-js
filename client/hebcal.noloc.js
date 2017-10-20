(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
	Hebcal - A Jewish Calendar Generator
	Copyright (C) 1994-2004  Danny Sadinoff
	Portions Copyright (c) 2002 Michael J. Radwin. All Rights Reserved.

	https://github.com/hebcal/hebcal-js

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program. If not, see <http://www.gnu.org/licenses/>.

	Danny Sadinoff can be reached at danny@sadinoff.com

	Michael Radwin has made significant contributions as a result of
	maintaining hebcal.com.

	The JavaScript code was completely rewritten in 2014 by Eyal Schachter.
 */

// name, lat, long, Israel
var cities = {
	"Ashdod": [ 31.8, 34.633, true ],
	"Atlanta": [ 33.75, -84.383, false ],
	"Austin": [ 30.266, -97.75, false ],
	"Baghdad": [ 33.233, 44.366, false ],
	"Beer Sheva": [ 31.25, 34.783, true ],
	"Berlin": [ 52.516, 13.4, false ],
	"Baltimore": [ 39.283, -76.6, false ],
	"Bogota": [ 4.6, -74.083, false ],
	"Boston": [ 42.333, -71.066, false ],
	"Buenos Aires": [ -34.616, -58.4, false ],
	"Buffalo": [ 42.883, -78.866, false ],
	"Chicago": [ 41.833, -87.75, false ],
	"Cincinnati": [ 39.1, -84.516, false ],
	"Cleveland": [ 41.5, -81.683, false ],
	"Dallas": [ 32.783, -96.8, false ],
	"Denver": [ 39.733, -104.983, false ],
	"Detroit": [ 42.333, -83.033, false ],
	"Eilat": [ 29.55, 34.95, true ],
	"Gibraltar": [ 36.133, -5.35, false ],
	"Haifa": [ 32.816, 34.983, true ],
	"Hawaii": [ 19.5, -155.5, false ],
	"Houston": [ 29.766, -95.366, false ],
	"Jerusalem": [ 31.783, 35.233, true ],
	"Johannesburg": [ -26.166, 28.033, false ],
	"Kiev": [ 50.466, 30.483, false ],
	"La Paz": [ -16.5, -68.15, false ],
	"Livingston": [ 40.283, -74.3, false ],
	"London": [ 51.5, -0.166, false ],
	"Los Angeles": [ 34.066, -118.25, false ],
	"Miami": [ 25.766, -80.2, false ],
	"Melbourne": [ -37.866, 145.133, false ],
	"Mexico City": [ 19.4, -99.15, false ],
	"Montreal": [ 45.5, -73.6, false ],
	"Moscow": [ 55.75, 37.7, false ],
	"New York": [ 40.716, -74.016, false ],
	"Omaha": [ 41.266, -95.933, false ],
	"Ottawa": [ 45.7, -76.183, false ],
	"Panama City": [ 8.966, -79.533, false ],
	"Paris": [ 48.866, 2.333, false ],
	"Petach Tikvah": [ 32.083, 34.883, true ],
	"Philadelphia": [ 39.95, -75.166, false ],
	"Phoenix": [ 33.45, -112.066, false ],
	"Pittsburgh": [ 40.433, -80, false ],
	"Saint Louis": [ 38.633, -90.2, false ],
	"Saint Petersburg": [ 59.883, 30.25, false ],
	"San Francisco": [ 37.783, -122.416, false ],
	"Seattle": [ 47.6, -122.333, false ],
	"Sydney": [ -33.916, 151.283, false ],
	"Tel Aviv": [ 32.083, 34.766, true ],
	"Tiberias": [ 32.966, 35.533, true ],
	"Toronto": [ 43.633, -79.4, false ],
	"Vancouver": [ 49.266, -123.116, false ],
	"White Plains": [ 41.033, -73.75, false ],
	"Washington DC": [ 38.916, -77, false ]
};

function getCity(city) {
	city = city.split(/\s+/).map(function(w,i,c){
		if (c.join(' ').toLowerCase() === 'washington dc' && i === 1) { // special case
			return w.toUpperCase();
		}
		return w[0].toUpperCase() + w.slice(1).toLowerCase();
	}).join(' ');
	return cities[city] || [ 0, 0, false ];
}
exports.getCity = getCity;

function listCities() {
	return Object.keys(cities);
}
exports.listCities = listCities;

exports.addCity = function(city, info) {
	if (!Array.isArray(info)) {
		throw new TypeError('adding non-array city');
	}
	if (info.length == 5) {
		var i = info.slice();
		info = [];
		info[0] = (i[0] * 60 + i[1]) / 60;
		info[1] = (i[2] * 60 + i[3]) / 60;
		info[2] = i[4];
	}
	if (info.length != 3) {
		throw new TypeError('length of city array is not 3');
	}
	city = city.split(/\s+/).map(function(w){return w[0].toUpperCase() + w.slice(1).toLowerCase()}).join(' ');
	cities[city] = info;
};

exports.nearest = function(lat, lon) {
	if (Array.isArray(lat)) {
		lat = (lat[0] * 60 + lat[1]) / 60;
	}
	if (Array.isArray(lon)) {
		lon = (lon[0] * 60 + lon[1]) / 60;
	}
	if (typeof lat != 'number') {
		throw new TypeError('incorrect lat type passed to nearest()');
	}
	if (typeof lon != 'number') {
		throw new TypeError('incorrect long type passed to nearest()');
	}

	return listCities().map(function(city){
		var i = getCity(city);
		return {
			name: city,
			dist: Math.sqrt( Math.pow(Math.abs(i[0] - lat), 2) + Math.pow(Math.abs(i[1] - lon), 2) )
		};
	}).reduce(function(close,city){
		return close.dist < city.dist ? close : city;
	}).name;
};
},{}],2:[function(require,module,exports){
/*
	Hebcal - A Jewish Calendar Generator
	Copyright (C) 1994-2004  Danny Sadinoff
	Portions Copyright (c) 2002 Michael J. Radwin. All Rights Reserved.

	https://github.com/hebcal/hebcal-js

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program. If not, see <http://www.gnu.org/licenses/>.

	Danny Sadinoff can be reached at 
	danny@sadinoff.com

	Michael Radwin has made significant contributions as a result of
	maintaining hebcal.com.

	The JavaScript code was completely rewritten in 2014 by Eyal Schachter
 */
window.Hebcal = require('..');

var finished = false, warn = (typeof console != 'undefined' && (console.warn || console.log)) || function(){};

Hebcal.events.on('newListener', function(e){
	if (e === 'ready' && !finished && Hebcal.ready) {
		finished = Hebcal.events.emit('ready');
	}
});

Object.defineProperty(Hebcal, 'onready', {
	configurable: true,

	get: function() {
		warn('Getting deprecated property Hebcal.onready');
		return Hebcal.events.listeners('ready')[0];
	},
	set: function(func) {
		warn('Setting deprecated property Hebcal.onready; use Hebcal.events.on(\'ready\', func) instead');
		Hebcal.events.on('ready', func);
	}
});

Hebcal.ready = true;
finished = Hebcal.events.emit('ready');
},{"..":7}],3:[function(require,module,exports){
/*
	Hebcal - A Jewish Calendar Generator
	Copyright (C) 1994-2004  Danny Sadinoff
	Portions Copyright (c) 2002 Michael J. Radwin. All Rights Reserved.

	https://github.com/hebcal/hebcal-js

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program. If not, see <http://www.gnu.org/licenses/>.

	Danny Sadinoff can be reached at danny@sadinoff.com

	Michael Radwin has made significant contributions as a result of
	maintaining hebcal.com.

	The JavaScript code was completely rewritten in 2014 by Eyal Schachter.
 */
var gematriya = require('gematriya');

var charCodeAt = 'charCodeAt';

var months = exports.months = {
	NISAN   : 1,
	IYYAR   : 2,
	SIVAN   : 3,
	TAMUZ   : 4,
	AV      : 5,
	ELUL    : 6,
	TISHREI : 7,
	CHESHVAN: 8,
	KISLEV  : 9,
	TEVET   : 10,
	SHVAT   : 11,
	ADAR_I  : 12,
	ADAR_II : 13
};

var monthNames = [
	["", 0, ""],
	["Nisan", 0, "ניסן"],
	["Iyyar", 0, "אייר"],
	["Sivan", 0, "סיון"],
	["Tamuz", 0, "תמוז"],
	["Av", 0, "אב"],
	["Elul", 0, "אלול"],
	["Tishrei", 0, "תשרי"],
	["Cheshvan", 0, "חשון"],
	["Kislev", 0, "כסלו"],
	["Tevet", 0, "טבת"],
	["Sh'vat", 0, "שבט"]
];
exports.monthNames = [
	monthNames.concat([["Adar", 0, "אדר"],["Nisan", 0, "ניסן"]]),
	monthNames.concat([["Adar 1", 0, "אדר א'"],["Adar 2", 0, "אדר ב'"],["Nisan", 0, "ניסן"]])
];

exports.days = {
	SUN: 0,
	MON: 1,
	TUE: 2,
	WED: 3,
	THU: 4,
	FRI: 5,
	SAT: 6
};

exports.LANG = function(str, opts){
	return opts == 'h' && str[2] || (opts == 'a' && str[1] || str[0]);
};

function LEAP(x) {
	return (1 + x * 7) % 19 < 7;
}
exports.LEAP = LEAP;

exports.MONTH_CNT = function(x) {
	return 12 + LEAP(x); // boolean is cast to 1 or 0
};

exports.daysInMonth = function(month, year) {
	return 30 - (month == months.IYYAR ||
	month == months.TAMUZ ||
	month == months.ELUL ||
	month == months.TEVET ||
	month == months.ADAR_II ||
	(month == months.ADAR_I && !LEAP(year)) ||
	(month == months.CHESHVAN && !lngChesh(year)) ||
	(month == months.KISLEV && shrtKis(year)));
};

exports.monthNum = function(month) {
	return typeof month === 'number' ? month :
		month[charCodeAt](0) >= 1488 && month[charCodeAt](0) <= 1514 && /('|")/.test(month) ? gematriya(month) :
			month[charCodeAt](0) >= 48 && month[charCodeAt](0) <= 57 /* number */ ? parseInt(month, 10) : monthFromName(month);
};

exports.dayYearNum = function(str) {
	return typeof str === 'number' ? str :
		str[charCodeAt](0) >= 1488 && str[charCodeAt](0) <= 1514 ? gematriya(str, true) : parseInt(str, 10);
};

/* Days from sunday prior to start of Hebrew calendar to mean
   conjunction of Tishrei in Hebrew YEAR
 */
function hebElapsedDays(hYear){
	// borrowed from original JS
	var m_elapsed = 235 * Math.floor((hYear - 1) / 19) +
		12 * ((hYear - 1) % 19) +
		Math.floor(((((hYear - 1) % 19) * 7) + 1) / 19);

	var p_elapsed = 204 + (793 * (m_elapsed % 1080));

	var h_elapsed = 5 + (12 * m_elapsed) +
		793 * Math.floor(m_elapsed / 1080) +
		Math.floor(p_elapsed / 1080);

	var parts = (p_elapsed % 1080) + 1080 * (h_elapsed % 24);

	var day = 1 + 29 * m_elapsed + Math.floor(h_elapsed / 24);
	var alt_day = day + ((parts >= 19440) ||
		((2 == (day % 7)) && (parts >= 9924) && !(LEAP (hYear))) ||
		((1 == (day % 7)) && (parts >= 16789) && LEAP (hYear - 1)));

	return alt_day + ((alt_day % 7) === 0 ||
		(alt_day % 7) == 3 ||
		(alt_day % 7) == 5);
}
exports.hebElapsedDays = hebElapsedDays;

/* Number of days in the hebrew YEAR */
function daysInYear(year)
{
	return hebElapsedDays(year + 1) - hebElapsedDays(year);
}
exports.daysInYear = daysInYear;

/* true if Cheshvan is long in Hebrew YEAR */
function lngChesh(year) {
	return (daysInYear(year) % 10) == 5;
}
exports.lngChesh = lngChesh;

/* true if Kislev is short in Hebrew YEAR */
function shrtKis(year) {
	return (daysInYear(year) % 10) == 3;
}
exports.shrtKis = shrtKis;

function monthFromName(c) {
	/*
	the Hebrew months are unique to their second letter
	N         Nisan  (November?)
	I         Iyyar
	E        Elul
	C        Cheshvan
	K        Kislev
	1        1Adar
	2        2Adar
	Si Sh     Sivan, Shvat
	Ta Ti Te Tamuz, Tishrei, Tevet
	Av Ad    Av, Adar

	אב אד אי אל   אב אדר אייר אלול
	ח            חשון
	ט            טבת
	כ            כסלב
	נ            ניסן
	ס            סיון
	ש            שבט
	תמ תש        תמוז תשרי
	*/
	switch (c.toLowerCase()[0]) {
		case 'n':
		case 'נ':
			return (c.toLowerCase()[1] == 'o') ?    /* this catches "november" */
				0 : months.NISAN;
		case 'i':
			return months.IYYAR;
		case 'e':
			return months.ELUL;
		case 'c':
		case 'ח':
			return months.CHESHVAN;
		case 'k':
		case 'כ':
			return months.KISLEV;
		case 's':
			switch (c.toLowerCase()[1]) {
				case 'i':
					return months.SIVAN;
				case 'h':
					return months.SHVAT;
				default:
					return 0;
			}
		case 't':
			switch (c.toLowerCase()[1]) {
				case 'a':
					return months.TAMUZ;
				case 'i':
					return months.TISHREI;
				case 'e':
					return months.TEVET;
			}
			break;
		case 'a':
			switch (c.toLowerCase()[1]) {
				case 'v':
					return months.AV;
				case 'd':
					if (/(1|[^i]i|a|א)$/i.test(c)) {
						return months.ADAR_I;
					}
					return months.ADAR_II; // else assume sheini
			}
			break;
		case 'ס':
			return months.SIVAN;
		case 'ש':
			return months.SHVAT;
		case 'א':
			switch (c.toLowerCase()[1]) {
				case 'ב':
					return months.AV;
				case 'ד':
					if (/(2|ii|b|ב)$/i.test(c)) {
						return months.ADAR_I;
					}
					return months.ADAR_II; // else assume sheini
				case 'י':
					return months.IYYAR;
				case 'ל':
					return months.ELUL;
			}
			break;
		case 'ת':
			switch (c.toLowerCase()[1]) {
				case 'מ':
					return months.TAMUZ;
				case 'ש':
					return months.TISHREI;
			}
			break;
	}
	return 0;
};
exports.monthFromName = monthFromName;

/* Note: Applying this function to d+6 gives us the DAYNAME on or after an
 * absolute day d.  Similarly, applying it to d+3 gives the DAYNAME nearest to
 * absolute date d, applying it to d-1 gives the DAYNAME previous to absolute
 * date d, and applying it to d+7 gives the DAYNAME following absolute date d.

**/
exports.dayOnOrBefore = function(day_of_week, absdate) {
	return absdate - ((absdate - day_of_week) % 7);
};

exports.map = function(self, fun, thisp) {
	// originally written for http://github.com/Scimonster/localbrowse
	if (self === null || typeof fun != 'function') {
		throw new TypeError();
	}
	var t = Object(self);
	var res = {};
	for (var i in t) {
		if (t.hasOwnProperty(i)) {
			res[i] = fun.call(thisp, t[i], i, t);
		}
	}
	if (Array.isArray(self) || typeof self == 'string') { // came as an array, return an array
		var arr = [];
		for (i in res) {
			arr[Number(i)] = res[i];
		}
		res = filter(arr, true); // for...in isn't guaranteed to give any meaningful order
		if (typeof self == 'string') {
			res = res.join('');
		}
	}
	return res;
};

function filter(self, fun, thisp) {
	if (self === null) {
		throw new TypeError('self is null');
	}
	switch (typeof fun) {
		case 'function':
			break; // do nothing
		case 'string':
		case 'number':
			return self[fun]; // str/num is just the property
		case 'boolean':
			// boolean shortcuts to filter only truthy/falsy values
			if (fun) {
				fun = function (v) {
					return v;
				};
			} else {
				fun = function (v) {
					return !v;
				};
			}
			break;
		case 'object':
			var funOrig = fun; // save it
			if (fun instanceof RegExp) { // test the val against the regex
				fun = function (v) {
					return funOrig.test(v);
				};
				break;
			} else if (Array.isArray(fun)) { // keep these keys
				fun = function (v, k) {
					return funOrig.indexOf(k) > -1;
				};
				break;
			}
		default:
			throw new TypeError('fun is not a supported type');
	}
	var res = {};
	var t = Object(self);
	for (var i in t) {
		if (t.hasOwnProperty(i)) {
			var val = t[i]; // in case fun mutates it
			if (fun.call(thisp, val, i, t)) {
				// define property on res in the same manner as it was originally defined
				var props = Object.getOwnPropertyDescriptor(t, i);
				props.value = val;
				Object.defineProperty(res, i, props);
			}
		}
	}
	if (Array.isArray(self) || typeof self == 'string') { // came as an array, return an array
		var arr = [];
		for (i in res) {
			arr[Number(i)] = res[i];
		}
		res = arr.filter(function (v) {
			return v;
		}); // for...in isn't guaranteed to give any meaningful order
		// can't use c.filter(arr,true) here because that would infitely recurse
		if (typeof self == 'string') {
			res = res.join('');
		}
	}
	return res;
}
exports.filter = filter;

exports.range = function(start, end, step) {
	step = step || 1;
	if (step < 0) {
		step = 0 - step;
	}

	var arr = [], i = start;
	if (start < end) {
		for (; i <= end; i += step) {
			arr.push(i);
		}
	} else {
		for (; i >= end; i -= step) {
			arr.push(i);
		}
	}
	return arr;
};

},{"gematriya":10}],4:[function(require,module,exports){
/*
	Hebcal - A Jewish Calendar Generator
	Copyright (C) 1994-2004  Danny Sadinoff
	Portions Copyright (c) 2002 Michael J. Radwin. All Rights Reserved.

	https://github.com/hebcal/hebcal-js

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program. If not, see <http://www.gnu.org/licenses/>.

	Danny Sadinoff can be reached at danny@sadinoff.com

	Michael Radwin has made significant contributions as a result of
	maintaining hebcal.com.

	The JavaScript code was completely rewritten in 2014 by Eyal Schachter.
 */
var c = require('./common'),
	greg = require('./greg'),
	gematriya = require('gematriya');

var shas = [
	// sname, aname, hname, blatt
	[ "Berachot",       "Berachos",         "ברכות",         64  ],
	[ "Shabbat",        "Shabbos",          "שבת",          157 ],
	[ "Eruvin",         "Eruvin",           "עירובין",         105 ],
	[ "Pesachim",       0,                  "פסחים",         121 ],
	[ "Shekalim",       0,                  "שקלים",         22  ],
	[ "Yoma",           0,                  "יומא",           88  ],
	[ "Sukkah",         0,                  "סוכה",          56  ],
	[ "Beitzah",        0,                  "ביצה",          40  ],
	[ "Rosh Hashana",   0,                  "ראש השנה",      35  ],
	[ "Taanit",         "Taanis",           "תענית",          31  ],
	[ "Megillah",       0,                  "מגילה",          32  ],
	[ "Moed Katan",     0,                  "מועד קטן",       29  ],
	[ "Chagigah",       0,                  "חגיגה",          27  ],
	[ "Yevamot",        "Yevamos",          "יבמות",          122 ],
	[ "Ketubot",        "Kesubos",          "כתובות",         112 ],
	[ "Nedarim",        0,                  "נדרים",          91  ],
	[ "Nazir",          0,                  "נזיר",           66  ],
	[ "Sotah",          0,                  "סוטה",          49  ],
	[ "Gitin",          0,                  "גיטין",           90  ],
	[ "Kiddushin",      0,                  "קידושין",         82  ],
	[ "Baba Kamma",     0,                  "בבא קמא",      119 ],
	[ "Baba Metzia",    0,                  "בבא מציעא",     119 ],
	[ "Baba Batra",     "Baba Basra",       "בבא בתרא",     176 ],
	[ "Sanhedrin",      0,                  "סנהדרין",        113 ],
	[ "Makkot",         "Makkos",           "מכות",          24  ],
	[ "Shevuot",        "Shevuos",          "שבועות",        49  ],
	[ "Avodah Zarah",   0,                  "עבודה זרה",     76  ],
	[ "Horayot",        "Horayos",          "הוריות",         14  ],
	[ "Zevachim",       0,                  "זבחים",         120 ],
	[ "Menachot",       "Menachos",         "מנחות",         110 ],
	[ "Chullin",        0,                  "חולין",          142 ],
	[ "Bechorot",       "Bechoros",         "בכורות",         61  ],
	[ "Arachin",        0,                  "ערכין",          34  ],
	[ "Temurah",        0,                  "תמורה",         34  ],
	[ "Keritot",        "Kerisos",          "כריתות",         28  ],
	[ "Meilah",         0,                  "מעילה",         22  ],
	[ "Kinnim",         0,                  "קנים",          4   ],
	[ "Tamid",          0,                  "תמיד",          10  ],
	[ "Midot",          "Midos",            "מדות",          4   ],
	[ "Niddah",         0,                  "נדה",           73  ]
].map(function(m){
	return {name: m.slice(0,3), blatt: m[3]};
});

exports.dafyomi = function(gregdate) {
	var dafcnt = 40, cno, dno, osday, nsday, total, count, j, cday, blatt;

	if (!(gregdate instanceof Date)) {
		throw new TypeError('non-date given to dafyomi');
	}

	osday = greg.greg2abs(new Date(1923, 8, 11));
	nsday = greg.greg2abs(new Date(1975, 5, 24));
	cday = greg.greg2abs(gregdate);

	if (cday < osday) { // no cycle; dy didn't start yet
		return {name: [], blatt: 0};
	}
	if (cday >= nsday) { // "new" cycle
		cno = 8 + ( (cday - nsday) / 2711 );
		dno = (cday - nsday) % 2711;
	} else { // old cycle
		cno = 1 + ( (cday - osday) / 2702 );
		dno = (cday - osday) % 2702;
	}

	// Find the daf taking note that the cycle changed slightly after cycle 7.

	total = blatt = 0;
	count = -1;

	// Fix Shekalim for old cycles
	if (cno <= 7) {
		shas[4].blatt = 13;
	} else {
		shas[4].blatt = 22;
	}

	// Find the daf
	j = 0;
	while (j < dafcnt) {
		count++;
		total = total + shas[j].blatt - 1;
		if (dno < total) {
			blatt = (shas[j].blatt + 1) - (total - dno);
			// fiddle with the weird ones near the end
			switch (count) {
				case 36:
					blatt = blatt + 21;
					break;
				case 37:
					blatt = blatt + 24;
					break;
				case 38:
					blatt = blatt + 33;
					break;
				default:
					break;
			}
			// Bailout
			j = 1 + dafcnt;
		}
		j++;
	}

	return {name: shas[count].name, blatt: blatt};
};

exports.dafname = function(daf, o) {
	return c.LANG(daf.name, o) + ' ' + (o === 'h' ? gematriya(daf.blatt) : daf.blatt);
};

},{"./common":3,"./greg":5,"gematriya":10}],5:[function(require,module,exports){
/*
	Hebcal - A Jewish Calendar Generator
	Copyright (C) 1994-2004  Danny Sadinoff
	Portions Copyright (c) 2002 Michael J. Radwin. All Rights Reserved.

	https://github.com/hebcal/hebcal-js

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program. If not, see <http://www.gnu.org/licenses/>.

	Danny Sadinoff can be reached at danny@sadinoff.com

	Michael Radwin has made significant contributions as a result of
	maintaining hebcal.com.

	The JavaScript code was completely rewritten in 2014 by Eyal Schachter.
 */
var floor = Math.floor,
	t0t1 = [30, 31],
	tMonthLengths = [0, 31, 28, 31].concat(t0t1, t0t1, 31, t0t1, t0t1),
	monthLengths = [
		tMonthLengths.slice()
	];
tMonthLengths[2]++;
monthLengths.push(tMonthLengths);

exports.daysInMonth = function(month, year) { // 1 based months
	return monthLengths[+LEAP(year)][month];
};

exports.monthNames = [
	'',
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

exports.lookupMonthNum = function(month) {
	return new Date(month + ' 1').getMonth() + 1;
};

function dayOfYear (date) {
	if (!date instanceof Date) {
		throw new TypeError('Argument to greg.dayOfYear not a Date');
	}
	var doy = date.getDate() + 31 * date.getMonth();
	if (date.getMonth() > 1) { // FEB
		doy -= floor((4 * (date.getMonth() + 1) + 23) / 10);
		if (LEAP(date.getFullYear())) {
			doy++;
		}
	}
	return doy;
}
exports.dayOfYear = dayOfYear;

function LEAP (year) {
	return !(year % 4) && ( !!(year % 100) || !(year % 400) );
}
exports.LEAP = LEAP;

exports.greg2abs = function(date) { // "absolute date"
	var year = date.getFullYear() - 1;
	return (dayOfYear(date) + // days this year
			365 * year + // + days in prior years
			( floor(year / 4) - // + Julian Leap years
			floor(year / 100) + // - century years
			floor(year / 400))); // + Gregorian leap years
};


/*
 * See the footnote on page 384 of ``Calendrical Calculations, Part II:
 * Three Historical Calendars'' by E. M. Reingold,  N. Dershowitz, and S. M.
 * Clamen, Software--Practice and Experience, Volume 23, Number 4
 * (April, 1993), pages 383-404 for an explanation.
 */
exports.abs2greg = function(theDate) {
// calculations copied from original JS code

	var d0 = theDate - 1;
	var n400 = floor(d0 / 146097);
	var d1 =  floor(d0 % 146097);
	var n100 =  floor(d1 / 36524);
	var d2 = d1 % 36524;
	var n4 =  floor(d2 / 1461);
	var d3 = d2 % 1461;
	var n1 =  floor(d3 / 365);

	var day = ((d3 % 365) + 1);
	var year = (400 * n400 + 100 * n100 + 4 * n4 + n1);

	if (4 == n100 || 4 == n1) {
		return new Date(year, 11, 31);
	}

	return new Date(new Date(++year, 0, day).setFullYear(year)); // new Date() is very smart
};
},{}],6:[function(require,module,exports){
/*
	Hebcal - A Jewish Calendar Generator
	Copyright (C) 1994-2004  Danny Sadinoff
	Portions Copyright (c) 2002 Michael J. Radwin. All Rights Reserved.

	https://github.com/hebcal/hebcal-js

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program. If not, see <http://www.gnu.org/licenses/>.

	Danny Sadinoff can be reached at danny@sadinoff.com

	Michael Radwin has made significant contributions as a result of
	maintaining hebcal.com.

	The JavaScript code was completely rewritten in 2014 by Eyal Schachter.
 */
var c = require('./common'),
	greg = require('./greg'),
	SolarCalc = require('solar-calc'),
	cities = require('./cities'),
	gematriya = require('gematriya');

// for minifying optimizations
var getFullYear = 'getFullYear',
	getMonth = 'getMonth',
	getDate = 'getDate',
	getTime = 'getTime',
	abs = 'abs',
	hour = 'hour',
	months = c.months,
	TISHREI = months.TISHREI,
	MONTH_CNT = c.MONTH_CNT,
	daysInMonth = c.daysInMonth,
	dayOnOrBefore = c.dayOnOrBefore,
	prototype = HDate.prototype;

var customZones={"tzeit": {angle:8.5,rising:false},
      "alot_hashachar": {angle:16.1,rising:true},
      "misheyakir_machmir":{angle:10.2,rising:true},
  	   "misheyakir":{angle:11.5,rising:true}};

function HDate(day, month, year) {
	var me = this;
	switch (arguments.length) {
		case 0:
			return new HDate(new Date());
		case 1:
			if (typeof day == 'undefined') {
				return new HDate();
			} else if (day instanceof Date) {
				// we were passed a Gregorian date, so convert it
				var d = abs2hebrew(greg.greg2abs(day));
				/*if (d.sunset() < day) {
					d = d.next();
				}*/
				return d;
			} else if (day instanceof HDate) {
				var d = new HDate(day[getDate](), day[getMonth](), day[getFullYear]());
				d.il = day.il;
				d.setLocation(d.lat, d.long);
				return d;
			} else if (typeof day == 'string') {
				switch (day.toLowerCase().trim()) {
					case 'today':
						return new HDate();
					case 'yesterday':
						return new HDate().prev();
					case 'tomorrow':
						return new HDate().next();
				}
				if (/\s/.test(day)) {
					var s = day.split(/\s+/);
					if (s.length == 2) {
						return new HDate(s[0], s[1]);
					} else if (s.length == 3) {
						return new HDate(s[0], s[1], s[2]);
					} else if (s.length == 4) { // should only be if s[1] is Adar
						if (/i/i.test(s[2])) { // Using I[I] syntax
							s[2] = s[2].length;
						} // otherwise using 1|2 syntax
						return new HDate(s[0], s[1] + s[2], s[3]);
					}
				}
			} else if (typeof day == 'number') { // absolute date
				return abs2hebrew(day);
			}
			throw new TypeError('HDate called with bad argument');
		case 2:
			return new HDate(day, month, (new HDate)[getFullYear]());
		case 3:
			me.day = me.month = 1;
			me.year = c.dayYearNum(year);

			me.setMonth(c.monthNum(month));
			me.setDate(c.dayYearNum(day));
			break;
		default:
			throw new TypeError('HDate called with bad arguments');
	}
	return me.setLocation.apply(me, HDate.defaultLocation);
}

HDate.defaultLocation = [0, 0];
Object.defineProperty(HDate, 'defaultCity', {
	enumerable: true,
	configurable: true,

	get: function() {
		return cities.nearest(HDate.defaultLocation[0], HDate.defaultLocation[1]);
	},
	set: function(city) {
		HDate.defaultLocation = cities.getCity(city).slice(0, 2);
	}
});

function fix(date) {
	fixMonth(date);
	fixDate(date);
}

function fixDate(date) {
	if (date.day < 1) {
		if (date.month == TISHREI) {
			date.year -= 1;
		}
		date.day += daysInMonth(date.month, date.year);
		date.month -= 1;
		fix(date);
	}
	if (date.day > daysInMonth(date.month, date.year)) {
		if (date.month == months.ELUL) {
			date.year += 1;
		}
		date.day -= daysInMonth(date.month, date.year);
		date.month += 1;
		fix(date);
	}
	fixMonth(date);
}

function fixMonth(date) {
	if (date.month == months.ADAR_II && !date.isLeapYear()) {
		date.month -= 1; // to Adar I
		fix(date);
	}
	if (date.month < 1) {
		date.month += MONTH_CNT(date.year);
		date.year -= 1;
		fix(date);
	}
	if (date.month > MONTH_CNT(date.year)) {
		date.month -= MONTH_CNT(date.year);
		date.year += 1;
		fix(date);
	}
}

prototype[getFullYear] = function() {
	return this.year;
};

prototype.isLeapYear = function() {
	return c.LEAP(this.year);
};

prototype[getMonth] = function() {
	return this.month;
};

prototype.getTishreiMonth = function() {
	var nummonths = MONTH_CNT(this[getFullYear]());
	return (this[getMonth]() + nummonths - 6) % nummonths || nummonths;
};

prototype.daysInMonth = function() {
	return daysInMonth(this[getMonth](), this[getFullYear]());
};

prototype[getDate] = function() {
	return this.day;
};

prototype.getDay = function() {
	return this.greg().getDay();
};

prototype.setFullYear = function(year) {
	this.year = year;
	fix(this);
	return this;
};

prototype.setMonth = function(month) {
	this.month = c.monthNum(month);
	fix(this);
	return this;
};

prototype.setTishreiMonth = function(month) {
	return this.setMonth((month + 6) % MONTH_CNT(this[getFullYear]()) || 13);
};

prototype.setDate = function(date) {
	this.day = date;
	fix(this);
	return this;
};

/* convert hebrew date to absolute date */
/* Absolute date of Hebrew DATE.
   The absolute date is the number of days elapsed since the (imaginary)
   Gregorian date Sunday, December 31, 1 BC. */
function hebrew2abs(d) {
	var m, tempabs = d[getDate](), year = d[getFullYear]();

	if (d[getMonth]() < TISHREI) {
		for (m = TISHREI; m <= MONTH_CNT(year); m++) {
			tempabs += daysInMonth(m, year);
		}

		for (m = months.NISAN; m < d[getMonth](); m++) {
			tempabs += daysInMonth(m, year);
		}
	} else {
		for (m = TISHREI; m < d[getMonth](); m++) {
			tempabs += daysInMonth(m, year);
		}
	}

	return c.hebElapsedDays(year) - 1373429 + tempabs;
}

function abs2hebrew(d) {
	var mmap = [
		months.KISLEV, months.TEVET, months.SHVAT, months.ADAR_I, months.NISAN,
		months.IYYAR, months.SIVAN, months.TAMUZ, TISHREI, TISHREI, TISHREI, months.CHESHVAN
	], hebdate, gregdate, month, year;

	if (d >= 10555144) {
		throw new RangeError("parameter to abs2hebrew " + d + " out of range");
	}

	gregdate = greg.abs2greg(d);
	hebdate = new HDate(1, TISHREI, (year = 3760 + gregdate[getFullYear]()));

	while (d >= hebrew2abs(hebdate.setFullYear(year + 1))) {
		year++;
	}

	if (year > 4634 && year < 10666) {
		// optimize search
		month = mmap[gregdate[getMonth]()];
	} else {
		// we're outside the usual range, so assume nothing about Hebrew/Gregorian calendar drift...
		month = TISHREI;
	}

	while (d > hebrew2abs(hebdate = new HDate(daysInMonth(month, year), month, year))) {
		month = (month % MONTH_CNT(year)) + 1;
	}

	return hebdate.setLocation.apply(hebdate.setDate(d - hebrew2abs(hebdate.setDate(1)) + 1), HDate.defaultLocation);
}

prototype.greg = function() {
	return greg.abs2greg(hebrew2abs(this));
};

prototype.gregEve = function() {
	return this.prev().sunset();
};

prototype[abs] = function() {
	return hebrew2abs(this);
};

prototype.toString = function(o) {
	return c.LANG([this[getDate](), null, gematriya(this[getDate]())], o) + ' ' +
		this.getMonthName(o) + ' ' +
		c.LANG([this[getFullYear](), null, gematriya(this[getFullYear]())], o);
};

prototype.getMonthName = function(o) {
	return c.LANG(c.monthNames[+this.isLeapYear()][this[getMonth]()], o);
};

prototype.setCity = function(city) {
	return this.setLocation(cities.getCity(city));
};

prototype.setLocation = function(lat, lon) {
	if (typeof lat == 'object' && !Array.isArray(lat)) {
		lon = lat.long;
		lat = lat.lat;
	}
	if (Array.isArray(lat) && typeof lon == 'undefined') {
		lon = lat[0];
		lat = lat[1];
	}
	if (Array.isArray(lat)) {
		lat = (lat[0] * 60 + lat[1]) / 60;
	}
	if (Array.isArray(lon)) {
		lon = (lon[0] * 60 + lon[1]) / 60;
	}
	if (typeof lat != 'number') {
		throw new TypeError('incorrect lat type passed to HDate.setLocation()');
	}
	if (typeof lon != 'number') {
		throw new TypeError('incorrect long type passed to HDate.setLocation()');
	}

	this.lat = lat;
	this.long = lon;

	this.solarcalc= new SolarCalc(this.getDay.apply(this),lat,lon,customZones);
	this.il = cities.getCity(cities.nearest(lat, lon))[2];

	return this;
};

function suntime(hdate) {
	var date = hdate.greg();
	 

	return solarcalc;
}

prototype.sunrise = function() {
	return suntime(this).sunrise;
};

prototype.sunset = function() {
	return suntime(this).sunset;
};

prototype[hour] = function() {
	return (this.sunset() - this.sunrise()) / 12; // ms in hour
};

prototype.hourMins = function() {
	// hour in ms / (1000 ms in s * 60 s in m) = mins in halachic hour
	return this[hour]() / (1000 * 60);
};

prototype.nightHour = function() {
	return (this.sunrise() - this.gregEve()) / 12; // ms in hour
};

prototype.nightHourMins = function() {
	// hour in ms / (1000 ms in s * 60 s in m) = mins in halachic hour
	return this.nightHour() / (1000 * 60);
};

function hourOffset(hdate, hours) {
	return new Date(hdate.sunrise()[getTime]() + (hdate[hour]() * hours));
}

var zemanim = {
	chatzot: function(hdate) {
		return hourOffset(hdate, 6);
	},
	chatzot_night: function(hdate) {
		return new Date(hdate.sunrise()[getTime]() - (hdate.nightHour() * 6));
	},
	alot_hashachar: function(hdate) {
		return suntime(hdate).alot_hashachar;
	},
	alot_hashacher: function(hdate) {
		return suntime(hdate).alot_hashachar;
	},
	misheyakir: function(hdate) {
		return suntime(hdate).misheyakir;
	},
	misheyakir_machmir: function(hdate) {
		return suntime(hdate).misheyakir_machmir;
	},
	sof_zman_shma: function(hdate) { // Gra
		return hourOffset(hdate, 3);
	},
	sof_zman_tfilla: function(hdate) { // Gra
		return hourOffset(hdate, 4);
	},
	mincha_gedola: function(hdate) {
		return hourOffset(hdate, 6.5);
	},
	mincha_ketana: function(hdate) {
		return hourOffset(hdate, 9.5);
	},
	plag_hamincha: function(hdate) {
		return hourOffset(hdate, 10.75);
	},
	tzeit: function(hdate) {
		return suntime(hdate).tzeit;
	},
	neitz_hachama: function(hdate) {
		return hdate.sunrise();
	},
	shkiah: function(hdate) {
		return hdate.sunset();
	}
};

prototype.getZemanim = function() {
	return c.map(zemanim, function(z){
		return z(this);
	}, this);
};

HDate.addZeman = function(zeman, func) {
	zemanim[zeman] = func;
};

prototype.next = function() {
	return abs2hebrew(this.abs() + 1).setLocation(this.lat, this.long);
};

prototype.prev = function() {
	return abs2hebrew(this.abs() - 1).setLocation(this.lat, this.long);
};

prototype.isSameDate = function(other) {
	if (other instanceof HDate) {
		if (other[getFullYear]() == -1) {
			other = new HDate(other).setFullYear(this[getFullYear]());
		}
		return this[abs]() == other[abs]();
	}
	return false;
};

function onOrBefore(day, t, offset) {
	return new HDate(dayOnOrBefore(day, t[abs]() + offset));
}

prototype.before = function(day) {
	return onOrBefore(day, this, -1);
};

prototype.onOrBefore = function(day) {
	return onOrBefore(day, this, 0);
};

prototype.nearest = function(day) {
	return onOrBefore(day, this, 3);
};

prototype.onOrAfter = function(day) {
	return onOrBefore(day, this, 6);
};

prototype.after = function(day) {
	return onOrBefore(day, this, 7);
};

module.exports = HDate;

},{"./cities":1,"./common":3,"./greg":5,"gematriya":10,"solar-calc":11}],7:[function(require,module,exports){
/*
	Hebcal - A Jewish Calendar Generator
	Copyright (C) 1994-2004  Danny Sadinoff
	Portions Copyright (c) 2002 Michael J. Radwin. All Rights Reserved.

	https://github.com/hebcal/hebcal-js

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program. If not, see <http://www.gnu.org/licenses/>.

	Danny Sadinoff can be reached at danny@sadinoff.com

	Michael Radwin has made significant contributions as a result of
	maintaining hebcal.com.

	The JavaScript code was completely rewritten in 2014 by Eyal Schachter.
 */
var c = require('./common'),
	HDate = require('./hdate'),
	holidays = require('./holidays'),
	Sedra = require('./sedra'),
	dafyomi = require('./dafyomi'),
	cities = require('./cities'),
	greg = require('./greg'),
	EventEmitter = require('events').EventEmitter,
	gematriya = require('gematriya');

// for minifying optimizations
var defProp = Object.defineProperty,
	TE = TypeError,
	find = 'find',
	strings = 'strings',
	getYearObject = 'getYearObject',
	map = 'map',
	getDay = 'getDay',
	getMonth = 'getMonth',
	getFullYear = 'getFullYear',
	isLeapYear = 'isLeapYear',
	length = 'length',
	next = 'next',
	prev = 'prev',
	months = c.months,
	TISHREI = months.TISHREI,
	NISAN = months.NISAN,
	HebcalProto = Hebcal.prototype,
	MonthProto = Month.prototype,
	GregYearProto = GregYear.prototype,
	GregMonthProto = GregMonth.prototype,
	HDateProto = HDate.prototype;

function getset(g, s) {
	return {
		enumerable: true,
		configurable: true,

		get: g,
		set: s
	};
}

function extend(base, into) {
	for (var i in into) {
		base[i] = into[i];
	}
	return base;
}

// Main Hebcal function

function Hebcal(year, month) {
	var me = this; // whenever this is done, it is for optimizations.
	if (!year) {
		year = (new HDate())[getFullYear](); // this year;
	}
	if (typeof year !== 'number') {
		throw new TE('year to Hebcal() is not a number');
	}
	me.year = year;
	if (month) {
		if (typeof month == 'string') {
			month = c.monthFromName(month);
		}
		if (typeof month == 'number') {
			month = [month];
		}

		if (Array.isArray(month)) {
			me.months = month[map](function(i){
				var m = new Month(i, year);
				defProp(m, '__year', {
					configurable: true,
					writable: true,
					value: me
				});
				return m;
			});

			me.holidays = holidays.year(year);
		} else {
			throw new TE('month to Hebcal is not a valid type');
		}
	} else {
		return new Hebcal(year, c.range(1, c.MONTH_CNT(year)));
	}

	me[length] = c.daysInYear(year);

	defProp(me, 'il', getset(function() {
		return me[getMonth](1).il;
	}, function(il) {
		me.months.forEach(function(m){
			m.il = il;
		});
	}));

	defProp(me, 'lat', getset(function() {
		return me[getMonth](1).lat;
	}, function(lat) {
		me.months.forEach(function(m){
			m.lat = lat;
		});
	}));
	defProp(me, 'long', getset(function() {
		return me[getMonth](1).long;
	}, function(lon) {
		me.months.forEach(function(m){
			m.long = lon;
		});
	}));
}

HebcalProto[isLeapYear] = HDateProto[isLeapYear];

HebcalProto.setCity = function(city) {
	this.months.forEach(function(m){
		m.setCity(city);
	});
	return this;
};

HebcalProto.setLocation = function(lat, lon) {
	this.months.forEach(function(m){
		m.setLocation(lat, lon);
	});
	return this;
};

HebcalProto[next] = function() {
	return new Hebcal(this.year + 1);
};

HebcalProto[prev] = function() {
	return new Hebcal(this.year - 1);
};

HebcalProto[getMonth] = function(month) {
	var months = this.months;
	month = c.monthNum(month);
	if (month > this.months[length]) {
		return this[next]()[getMonth](month - months[length]);
	}
	return months[month > 0 ? month - 1 : months[length] + month];
};

HebcalProto[getDay] = function(day) {
	var me = this;
	if (day > me[length]) {
		return null;
	}
	if (day < 0) {
		return me[getDay](me[length] - day);
	}
	var rosh = me[find](29, months.ELUL)[0].abs() + 1 - me[find](1, NISAN)[0].abs(); // number of days between Nisan and Tishrei
	if (day <= rosh) {
		return me[getMonth](NISAN)[getDay](day);
	}
	return me[getMonth](TISHREI)[getDay](day - rosh);
};

HebcalProto.days = function() {
	return [].concat.apply([], this.months[map](function(m){
		return m.days;
	}));
};

HebcalProto[map] = function() {
	return [][map].apply(this.days(), arguments);
};

HebcalProto.filter = function() {
	return [].filter.apply(this.days(), arguments);
};

HebcalProto.addHoliday = function(holiday) {
	if (!(holiday instanceof holidays.Event)) {
		throw new TE('non-Event passed to addHoliday()');
	}
	this.holidays.add(holiday);
	return this;
};

HebcalProto.findParsha = function(parsha, o) {
	var langs = o ? [o] : ['s','a','h']; // FIXME: abstract this away somewhere
	var days = this.filter(function(d){
		return Math.max.apply(null, langs.map(function(l){
			return d.getSedra(l).indexOf(parsha) + 1;
		}));
	});
	return days[days[length] - 1];
};
HebcalProto.findSedra = HebcalProto.findParsha;

HebcalProto[find] = function find_f(day, month) {
	var me = this;
	if (arguments[length] === 1) {
		if (typeof day == 'string') {
			return find_f[strings].call(me, day);
		} else if (Array.isArray(day)) {
			return [].concat.apply([], day[map](function(d){
				return me[find][Array.isArray(d) ? 'apply' : 'call'](me, d);
			}));
		} else if (day instanceof HDate) {
			return me[find](day.getDate(), day[getMonth]());
		} else if (day instanceof Date) {
			return me[find](new HDate(day));
		}
	} else if (arguments[length] == 2) {
		if (month instanceof Month) {
			return month[find](day);
		} else if (Array.isArray(month)) {
			return [].concat.apply([], month[map](function(m){
				return me[find](day, m);
			}));
		} else if (typeof month == 'string') {
			return me[find](day, c.monthNum(month));
		} else if (typeof month == 'number') {
			return me[find](day, me[getMonth](month));
		}
	}
	return [];
};
HebcalProto[find][strings] = function strings(str) {
	var split = str.split(/\s+/), func = strings[str.replace(/\s/g, '_').toLowerCase()];
	if (!split[length]) {
		return [];
	} else if (func) {
		return func.call(this);
	}
	try {
		return this[find](new HDate(str));
	} catch(e) {
		return split[length] - 1 ? this[find].apply(this, split) : [];
	}
};
HebcalProto[find][strings].rosh_chodesh = function() {
	return this[find]('Rosh Chodesh', c.range(1, this.months[length]));
};
HebcalProto[find][strings].holidays = function() {
	return [].concat.apply([], this.holidays[map](function(h){
		return this[find](h.date);
	}, this));
};
HebcalProto[find][strings].omer = function() {
	return this[find](c.range(15+1, 15+49), NISAN);
};
HebcalProto[find][strings].today = function() {
	return this[find](new HDate());
};
HebcalProto[find][strings].yesterday = function() {
	return [this[find]('today')[0][prev]()];
};
HebcalProto[find][strings].tomorrow = function() {
	return [this[find]('today')[0][next]()];
};
HebcalProto[find][strings].pesach = function() {
	return this[find](c.range(15, 15+8-this.il), NISAN);
};
HebcalProto[find][strings].sukkot = function() {
	return this[find](c.range(15, 15+9-this.il), TISHREI);
};
HebcalProto[find][strings].succot = HebcalProto[find][strings].succos = HebcalProto[find][strings].sukkos = HebcalProto[find][strings].sukkot;
HebcalProto[find][strings].shavuot = function() {
	return this[find](c.range(6, 7-this.il), months.SIVAN);
};
HebcalProto[find][strings].shavuos = HebcalProto[find][strings].shavuot;
HebcalProto[find][strings].rosh_hashana = function() {
	return this[find](c.range(1, 2), TISHREI);
};
HebcalProto[find][strings].rosh_hashanah = HebcalProto[find][strings].rosh_hashana;

// Hebcal properties

Hebcal.addZeman = HDate.addZeman;

Hebcal.cities = cities;

Hebcal.range = c.range;

Hebcal.gematriya = gematriya;

Hebcal.holidays = c.filter(holidays, ['masks', 'Event']); // not year(), atzmaut()

Hebcal.parshiot = Sedra.parshiot;

Hebcal.LANGUAGE = c.LANG;

Hebcal[map] = c[map];

Hebcal.filter = c.filter;

defProp(Hebcal, 'defaultLocation', getset(function(){
	return HDate.defaultLocation;
}, function(loc){
	Hebcal.events.emit('locationChange', HDate.defaultLocation);
	HDate.defaultLocation = loc;
}));
defProp(Hebcal, 'defaultCity', getset(function(){
	return HDate.defaultCity;
}, function(city){
	Hebcal.defaultLocation = cities.getCity(city).slice(0, 2); // call the event
}));

defProp(Hebcal, 'candleLighting', getset(function(){
	return holidays.Event.candleLighting;
}, function(mins){
	holidays.Event.candleLighting = mins;
}));

defProp(Hebcal, 'havdalah', getset(function(){
	return holidays.Event.havdalah;
}, function(mins){
	holidays.Event.havdalah = mins;
}));

// Months

function Month(month, year) {
	var me = this;
	month = c.monthNum(month);
	if (typeof month != 'number') {
		throw new TE('month to Hebcal.Month is not a valid type');
	}
	if (typeof year != 'number') {
		throw new TE('year to Hebcal.Month is not a number');
	}
	me.month = month;
	me.year = year;

	me.days = c.range(1, c.daysInMonth(month, year))[map](function(i){
		var d = new HDate(i, month, year);
		defProp(d, '__month', {
			configurable: true,
			writable: true,
			value: me
		});
		return d;
	});

	me[length] = me.days[length];

	me.holidays = c.filter(holidays.year(year), function(h){
		return h[0].date[getMonth]() == month;
	});

	defProp(me, 'il', getset(function(){
		return me[getDay](1).il;
	}, function(il){
		me.days.forEach(function(d){
			d.il = il;
		});
	}));

	defProp(me, 'lat', getset(function(){
		return me[getDay](1).lat;
	}, function(lat){
		me.days.forEach(function(d){
			d.lat = lat;
		});
	}));
	defProp(me, 'long', getset(function(){
		return me[getDay](1).long;
	}, function(lon){
		me.days.forEach(function(d){
			d.long = lon;
		});
	}));

	return me;
};

Hebcal.Month = Month;

MonthProto[isLeapYear] = HDateProto[isLeapYear];

MonthProto[prev] = function() {
	var me = this, year = me[getYearObject]();
	if (me.month === 1) { // Nisan
		return year[getMonth](-1);
	} else if (me.month === TISHREI) {
		return year[prev]()[getMonth](months.ELUL);
	} else {
		return year[getMonth](me.month - 1);
	}
};

MonthProto[next] = function() {
	var me = this, year = me[getYearObject]();
	if (me.month === c.MONTH_CNT(me.year)) { // Adar
		return year[getMonth](1);
	} else if (me.month === months.ELUL) {
		return year[next]()[getMonth](TISHREI);
	} else {
		return year[getMonth](me.month + 1);
	}
};

MonthProto[getDay] = function(day) {
	var days = this.days;
	day = c.dayYearNum(day);
	if (day > days[length]) {
		return this[next]()[getDay](day - days[length]);
	}
	return days[day > 0 ? day - 1 : days[length] + day];
};

MonthProto[getYearObject] = function() {
	return this.__year || new Hebcal(this.year);
};

MonthProto.getName = function(o) {
	return c.LANG(c.monthNames[+this[isLeapYear]()][this.month], o);
};

MonthProto.rosh_chodesh = function() {
	var prevMonth = this[prev]();
	return prevMonth[length] == 30 ? [prevMonth[getDay](-1), this[getDay](1)] : [this[getDay](1)];
};

MonthProto.setCity = function(city) {
	this.days.forEach(function(d){
		d.setCity(city);
	});
	return this;
};

MonthProto.setLocation = function(lat, lon) {
	this.days.forEach(function(d){
		d.setLocation(lat, lon);
	});
	return this;
};

MonthProto[map] = function() {
	return [][map].apply(this.days, arguments);
};

MonthProto.molad = function() {
	var retMolad = {}, year, m_elapsed, p_elapsed, h_elapsed, parts, m_adj, toInt = parseInt;

    m_adj = this.month - 7;
	year = this.year - 1;
    if (m_adj < 0) {
		m_adj += c.MONTH_CNT(year + 1);
	}

    m_elapsed = toInt(m_adj +
        235 * (year / 19)/* +
        12 * (year % 19) +
        (((year % 19) * 7) + 1) / 19*/);

    p_elapsed = toInt(204 + (793 * (m_elapsed % 1080)));

    h_elapsed = toInt(5 + (12 * m_elapsed) +
        793 * (m_elapsed / 1080)/* +
        p_elapsed / 1080*/ -
        6);

    parts = toInt((p_elapsed % 1080) + 1080 * (h_elapsed % 24));

    retMolad.doy = new HDate(toInt(1 + 29 * m_elapsed + h_elapsed / 24)).getDay();
    retMolad.hour = Math.round(h_elapsed % 24);
    var chalakim = toInt(parts % 1080);
    retMolad.minutes = toInt(chalakim / 18);
    retMolad.chalakim = chalakim % 18;
    var day = this.prev().find.strings.shabbat_mevarchim._calc.call(this)[0].onOrAfter(retMolad.doy).greg();
    day.setHours(retMolad.hour);
    day.setMinutes(retMolad.minutes);
    day.setSeconds(retMolad.chalakim * 3.33);
    retMolad.day = day;

    return retMolad;
};

MonthProto[find] = function find_f(day) {
	var me = this;
	if (typeof day == 'number') {
		return [me[getDay](day)];
	} else if (typeof day == 'string') {
		return find_f[strings].call(me, day);
	} else if (Array.isArray(day)) {
		return [].concat.apply([], day[map](function(d){
			return me[find](d);
		}));
	} else if (day instanceof HDate && day[getFullYear]() == me.year && day[getMonth]() == me.month) {
		return me[find](day.getDate());
	} else if (day instanceof Date) {
		return me[find](new HDate(day));
	}
	return [];
};
MonthProto[find][strings] = function strings(str) {
	var func = strings[str.replace(/\s/g, '_').toLowerCase()];
	if (func) {
		return func.call(this);
	}
	try {
		return this[find](new HDate(str));
	} catch(e) {
		var num = c.dayYearNum(str);
		return num ? this[find](num) : [];
	}
};
MonthProto[find][strings].rosh_chodesh = function() {
	return this.rosh_chodesh();
};
MonthProto[find][strings].shabbat_mevarchim = function sm() {
	return this.month === months.ELUL ? [] : // No birchat hachodesh in Elul
		sm._calc.call(this);
};
MonthProto[find][strings].shabbat_mevarchim._calc = function() {
	return this[find](this[getDay](29).onOrBefore(c.days.SAT));
};
MonthProto[find][strings].shabbos_mevarchim = MonthProto[find][strings].shabbos_mevorchim = MonthProto[find][strings].shabbat_mevarchim;

// HDate days

Hebcal.HDate = HDate;

HDateProto.getMonthObject = function() {
	return this.__month || new Month(this[getMonth](), this[getFullYear]());
};

HDateProto[getYearObject] = function() {
	return this.getMonthObject()[getYearObject]();
};

(function(){
	var orig = {}; // slightly less overhead when using unaffiliated HDate()s
	[prev, next].forEach(function(func){
		orig[func] = HDateProto[func];
		HDateProto[func] = function() {
			var day = orig[func].call(this);
			if (!this.__month) {
				return day;
			}
			return this[getYearObject]()[find](day)[0];
		};
	});
})();

HDateProto.getSedra = (function(){
	var __cache = {};

	return function(o) {
		var sedraYear = __cache[this[getFullYear]()];
		if (!sedraYear || (sedraYear.il != this.il)) {
			sedraYear = __cache[this[getFullYear]()] = new Sedra(this[getFullYear](), this.il);
		}
		return sedraYear.get(this)[map](function(p){
			return c.LANG(p, o);
		});
	}
})();
HDateProto.getParsha = HDateProto.getSedra;

HDateProto.holidays = function(all) {
	var me = this, days = me[getYearObject]().holidays[me];
	return days ? days.filter(function(h){
		return all ? true : !h.routine() && h.is(me);
	})[map](function(h){
		h.date.setLocation(me);
		return h;
	}) : [];
};

['candleLighting', 'havdalah'].forEach(function(prop){
	HDateProto[prop] = function(){
		var me = this, hd = me.holidays(true).filter(function(h){
			return h.is(me);
		});
		if (hd.length) {
			hd = c.filter(hd.map(function(h){
				return h[prop]();
			}), true);
		}
		return hd.length ? new Date(Math.max.apply(null, hd)) : null;
	};
});

HDateProto.omer = function() {
	var me = this, greg = me.greg().getTime(), year = me[getFullYear]();
	if (greg > new HDate(15, NISAN, year).greg().getTime() &&
		greg < new HDate( 6, months.SIVAN, year).greg().getTime()) {
		return me.abs() - new HDate(16, NISAN, year).abs() + 1;
	}
	return 0;
};

HDateProto.dafyomi = function(o) {
	return dafyomi.dafname(dafyomi.dafyomi(this.greg()), o);
};

HDateProto.tachanun = (function() {
	var NONE      = tachanun.NONE      = 0,
		MINCHA    = tachanun.MINCHA    = 1,
		SHACHARIT = tachanun.SHACHARIT = 2,
		ALL_CONGS = tachanun.ALL_CONGS = 4;

	var __cache = {
		all: {},
		some: {},
		yes_prev: {},
		il: {}
	};

	function tachanun() {
		var checkNext = !arguments[0], me = this;

		var year = me[getYearObject](), y = year.year;

		function mapAbs(arr) {
			return arr[map](function(d){
				return d.abs();
			});
		}

		var all, some, yes_prev;
		if (__cache.il[y] === me.il) {
			all = __cache.all[y];
			some = __cache.some[y];
			yes_prev = __cache.yes_prev[y];
		} else {
			all = __cache.all[y] = mapAbs(year[find]('Rosh Chodesh').concat(
				year[find](c.range(1, c.daysInMonth(NISAN, y)), NISAN), // all of Nisan
				year[find](15 + 33, NISAN), // Lag Baomer
				year[find](c.range(1, 8 - me.il), months.SIVAN), // Rosh Chodesh Sivan thru Isru Chag
				year[find]([9, 15], months.AV), // Tisha B'av and Tu B'av
				year[find](-1, months.ELUL), // Erev Rosh Hashanah
				year[find]([1, 2], TISHREI), // Rosh Hashanah
				year[find](c.range(9, 24 - me.il), TISHREI), // Erev Yom Kippur thru Isru Chag
				year[find](c.range(25, 33), months.KISLEV), // Chanukah
				year[find](15, months.SHVAT), // Tu B'shvat
				year[find]([14, 15], year[isLeapYear]() ? [months.ADAR_I, months.ADAR_II] : months.ADAR_I) // Purim/Shushan Purim + Katan
			));
			some = __cache.some[y] = mapAbs([].concat( // Don't care if it overlaps days in all, because all takes precedence
				year[find](c.range(1, 13), months.SIVAN), // Until 14 Sivan
				year[find](c.range(20, 31), TISHREI), // Until after Rosh Chodesh Cheshvan
				year[find](14, months.IYYAR), // Pesach Sheini
				holidays.atzmaut(y)[1].date || [], // Yom HaAtzma'ut, which changes based on day of week
				y >= 5727 ? year[find](29, months.IYYAR) : [] // Yom Yerushalayim
			));
			yes_prev = __cache.yes_prev[y] = mapAbs([].concat( // tachanun is said on the previous day at mincha
				year[find](-1, months.ELUL), // Erev Rosh Hashanah
				year[find](9, months.TISHREI), // Erev Yom Kippur
				year[find](14, months.IYYAR) // Pesach Sheini
			));
			__cache.il[y] = me.il;
		}

		all = all.indexOf(me.abs()) > -1;
		some = some.indexOf(me.abs()) > -1;
		yes_prev = yes_prev.indexOf(me.abs()+1) > -1;

		if (all) {
			return NONE;
		}
		var ret = (!some && ALL_CONGS) | (me[getDay]() != 6 && SHACHARIT);
		if (checkNext && !yes_prev) {
			ret |= ((me[next]().tachanun(true) & SHACHARIT) && MINCHA);
		} else {
			ret |= (me[getDay]() != 5 && MINCHA);
		}
		return ret == ALL_CONGS ? NONE : ret;
	}
	return tachanun;
})();

HDateProto.tachanun_uf = function(){
	var ret = this.tachanun();
	return {
		shacharit: !!(ret & this.tachanun.SHACHARIT),
		mincha: !!(ret & this.tachanun.MINCHA),
		all_congs: !!(ret & this.tachanun.ALL_CONGS)
	};
};

HDateProto.hallel = (function() {
	var NONE  = hallel.NONE  = 0,
		HALF  = hallel.HALF  = 1,
		WHOLE = hallel.WHOLE = 2;

	var __cache = {
		whole: {},
		half: {},
		il: {}
	};

	function hallel() {
		var me = this, year = me[getYearObject](), y = year.year;

		var whole = __cache.il[y] == me.il && __cache.whole[y] || (__cache.whole[y] = [].concat(
			year[find](c.range(25, 33), months.KISLEV), // Chanukah
			year[find]([15, me.il ? null : 16], NISAN), // First day(s) of Pesach
			year[find]('Shavuot'),
			year[find]('Sukkot'),
			holidays.atzmaut(y)[1].date || [], // Yom HaAtzma'ut, which changes based on day of week
			y >= 5727 ? year[find](29, months.IYYAR) : [] // Yom Yerushalayim
		)[map](function(d){
			return d.abs();
		}));
		var half = __cache.il[y] == me.il && __cache.half[y] || (__cache.half[y] = [].concat(
			year[find]('Rosh Chodesh').filter(function(rc){return rc[getMonth]() != TISHREI}), // Rosh Chodesh, but not Rosh Hashanah
			year[find](c.range(17 - me.il, 23 - me.il), NISAN) // Last six days of Pesach
		)[map](function(d){
			return d.abs();
		}));
		__cache.il[y] = me.il;

		return (whole.indexOf(me.abs()) > -1 && WHOLE) || (half.indexOf(me.abs()) > -1 && HALF) || NONE;
	}
	return hallel;
})();

// Events

(function(events){
	var refreshInterval, refresh, today = new HDate();

	defProp(events, 'refreshInterval', getset(function(){
		return refreshInterval;
	}, function(ms){
		if (refresh) {
			refresh = clearInterval(refresh);
		}
		refreshInterval = ms;
		if (ms) {
			refresh = setInterval(checkTimes, ms);
			if (refresh.unref) {
				refresh.unref(); // don't keep the process open
			}
		}
	}));

	events.beforeZeman = 1000 * 60 * 10; // 10 minutes

	function checkTimes() {
		var now = new HDate();

		if (!today.isSameDate(now)) {
			events.emit('dayChange');
			today = now;
		}

		function close(obj, compare) {
			return c.filter(c[map](obj, function(time){
				return time - nowGreg;
			}), function(time) {
				return time > 0 && time - compare < 0;
			});
		}

		var nowGreg = new Date(),
			almostTime = close(now.getZemanim(), events.beforeZeman),
			customTimes = close(events.customs, events.refreshInterval);

		for (var zeman in almostTime) {
			events.emit('almostZeman', zeman, almostTime[zeman]);
			if (almostTime[zeman] < events.refreshInterval) {
				events.emit('atZeman', zeman);
			}
		}
		for (var custom in customTimes) {
			events.emit('custom', custom);
		}
	}
	checkTimes();

	events.refreshInterval = 1000 * 60 * 5; // 5 minutes
	// set the interval

	events.customs = {};
})(Hebcal.events = new EventEmitter());

// Gregorian years

function GregYear(year, month) {
	var me = this;
	if (!year) {
		year = (new Date)[getFullYear]();
	}
	if (typeof year === 'string') {
		var d = new Date(year);
		month = year.indexOf(' ') + 1 || year.indexOf('-') + 1 || year.indexOf('/') + 1 ? d[getMonth]() + 1 : c.range(1, 12);
		// Check if a month was passed in the string. Can't just check for default January, because a real January might have been passed.
		return new GregYear(d[getFullYear](), month);
	}
	if (typeof year !== 'number') {
		throw new TE('year to Hebcal.GregYear() is not a number');
	}
	me.year = year;

	if (month) {
		if (typeof month === 'string') { // month name
			month = greg.lookupMonthName(month);
		}
		if (typeof month === 'number') {
			month = [month];
		}

		if (Array.isArray(month)) {
			me.months = month[map](function(i){
				var m = new GregMonth(i, year);
				defProp(m, '__year', {
					configurable: true,
					writable: true,
					value: me
				});
				return m;
			});
		} else {
			throw new TE('month to Hebcal.GregYear() is not a valid type');
		}
	} else {
		return new GregYear(year, c.range(1, 12));
	}

	me.hebyears = [].concat.apply([], me.months[map](function(m){
		return m.hebmonths[map](function(hm){
			return hm.year;
		});
	})).filter(function(val, i, arr){
		return arr.indexOf(val) === i; // keep unique values only
	});

	me.holidays = c.filter(holidays.year(me.hebyears[0]), function(h){
		return h[0].date.greg()[getFullYear]() === year && me.months.filter(function(m){ // don't keep ones that are out of bounds
			return m.month === h[0].date.greg()[getMonth]() + 1;
		})[length];
	});
	if (me.hebyears[1]) {
		extend(me.holidays, c.filter(holidays.year(me.hebyears[1]), function(h){
			return h[0].date.greg()[getFullYear]() === year && me.months.filter(function(m){ // don't keep ones that are out of bounds
				return m.month === h[0].date.greg()[getMonth]() + 1;
			})[length];
		}));
	}

	me[length] = 365 + greg.LEAP(year);

	defProp(me, 'il', getset(function() {
		return me[getMonth](1).il;
	}, function(il) {
		me.months.forEach(function(m){
			m.il = il;
		});
	}));

	defProp(me, 'lat', getset(function() {
		return me[getMonth](1).lat;
	}, function(lat) {
		me.months.forEach(function(m){
			m.lat = lat;
		});
	}));
	defProp(me, 'long', getset(function() {
		return me[getMonth](1).long;
	}, function(lon) {
		me.months.forEach(function(m){
			m.long = lon;
		});
	}));

	return me;
};

Hebcal.GregYear = GregYear;

GregYearProto[isLeapYear] = function() {
	return this[length] == 366;
};

GregYearProto.setCity = HebcalProto.setCity;
GregYearProto.setLocation = HebcalProto.setLocation;

GregYearProto[next] = function() {
	return new GregYear(this.year + 1);
};

GregYearProto[prev] = function() {
	return new GregYear(this.year - 1);
};

GregYearProto[getMonth] = function(month) {
	var months = this.months
	month = typeof month == 'number' ? month : greg.lookupMonthNum(month);
	if (month > months[length]) {
		return this[next]()[getMonth](month - months[length]);
	}
	return months[month > 0 ? month - 1 : months[length] + month];
};

extend(GregYearProto, {
	days: HebcalProto.days,
	map: HebcalProto[map],
	filter: HebcalProto.filter,
	addHoliday: HebcalProto.addHoliday,
});

/*GregYearProto.days = HebcalProto.days;
GregYearProto[map] = HebcalProto[map];
GregYearProto.filter = HebcalProto.filter;

GregYearProto.addHoliday = HebcalProto.addHoliday;*/

function GregMonth(month, year) {
	var me = this;
	if (typeof month == 'string') {
		month = greg.lookupMonthNum(month);
	}
	if (typeof month != 'number') {
		throw new TE('month to Hebcal.GregMonth is not a valid type');
	}
	if (typeof year != 'number') {
		throw new TE('year to Hebcal.GregMonth is not a number');
	}

	me.year = year;
	me.month = month;

	me.days = c.range(1, greg.daysInMonth(month, year))[map](function(i){
		var d = new HDate(new Date(year, month - 1, i));
		defProp(d, '__gregmonth', {
			configurable: true,
			writable: true,
			value: me
		});
		return d;
	});

	me[length] = me.days[length];

	me.hebmonths = [
		{month: me[getDay]( 1)[getMonth](), year: me[getDay]( 1)[getFullYear]()},
		{month: me[getDay](-1)[getMonth](), year: me[getDay](-1)[getFullYear]()}
	].filter(function(val, i, arr){
		return i === 0 || val.month != arr[0].month;
	});

	defProp(me, 'il', getset(function(){
		return me[getDay](1).il;
	}, function(il){
		me.days.forEach(function(d){
			d.il = il;
		});
	}));

	defProp(me, 'lat', getset(function(){
		return me[getDay](1).lat;
	}, function(lat){
		me.days.forEach(function(d){
			d.lat = lat;
		});
	}));
	defProp(me, 'long', getset(function(){
		return me[getDay](1).long;
	}, function(lon){
		me.days.forEach(function(d){
			d.long = lon;
		});
	}));

	return me;
};

Hebcal.GregMonth = GregMonth;

GregMonthProto[isLeapYear] = function() {
	return greg.LEAP(this.year);
};

GregMonthProto[prev] = function() {
	if (this.month === 1) {
		return this[getYearObject]()[prev]()[getMonth](-1);
	} else {
		return this[getYearObject]()[getMonth](this.month - 1);
	}
};

GregMonthProto[next] = function() {
	return this[getYearObject]()[getMonth](this.month + 1);
};

GregMonthProto[getDay] = function(day) {
	if (day > this.days[length]) {
		return this[next]()[getDay](day - this.days[length]);
	}
	return this.days[day > 0 ? day - 1 : this.days[length] + day];
};

GregMonthProto[getYearObject] = function() {
	return this.__year || new GregYear(this.year);
};

GregMonthProto.getName = function() {
	return greg.monthNames[this.month];
};

GregMonthProto.setCity = MonthProto.setCity;
GregMonthProto.setLocation = MonthProto.setLocation;

GregMonthProto[map] = MonthProto[map];

HDateProto.getGregMonthObject = function() {
	return this.__gregmonth || new GregMonth(this.greg()[getMonth]() + 1, this.greg()[getFullYear]());
};

HDateProto.getGregYearObject = function() {
	return this.getGregMonthObject()[getYearObject]();
};

module.exports = Hebcal;

},{"./cities":1,"./common":3,"./dafyomi":4,"./greg":5,"./hdate":6,"./holidays":8,"./sedra":15,"events":9,"gematriya":10}],8:[function(require,module,exports){
/*
	Hebcal - A Jewish Calendar Generator
	Copyright (C) 1994-2004  Danny Sadinoff
	Portions Copyright (c) 2002 Michael J. Radwin. All Rights Reserved.

	https://github.com/hebcal/hebcal-js

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program. If not, see <http://www.gnu.org/licenses/>.

	Danny Sadinoff can be reached at danny@sadinoff.com

	Michael Radwin has made significant contributions as a result of
	maintaining hebcal.com.

	The JavaScript code was completely rewritten in 2014 by Eyal Schachter.
 */
var c = require('./common'),
	HDate = require('./hdate'),
	gematriya = require('gematriya');

var __cache = {};

// for byte optimizations

var dayOnOrBefore = c.dayOnOrBefore,
	months = c.months,
	days = c.days,
	TISHREI = months.TISHREI,
	KISLEV = months.KISLEV,
	NISAN = months.NISAN,
	SAT = days.SAT,
	getDay = 'getDay',
	abs = 'abs',
	Shabbat = 'Shabbat',
	Shabbos = 'Shabbos';

function Chanukah(day) {
	return ['Chanukah: Candle ' + day, 0, 'חנוכה: נר ' + gematriya(day)];
}

function CHM(desc) {
	return [desc[0] + ' (CH"M)', desc[1] ? desc[1] + ' (CH"M)' : desc[1], desc[2] ? desc[2] + ' )חה"ם(' : desc[2]];
}

function Sukkot(day) {
	return ['Sukkot: ' + day, 'Succos: ' + day, 'סוכות יום ' + gematriya(day)];
}

function Pesach(day) {
	return ['Pesach: ' + day, 0, 'פסח יום ' + gematriya(day)];
}

var USER_EVENT          = 1,
	LIGHT_CANDLES       = 2,
	YOM_TOV_ENDS        = 4,
	CHUL_ONLY           = 8, // chutz l'aretz (Diaspora)
	IL_ONLY             = 16, // b'aretz (Israel)
	LIGHT_CANDLES_TZEIS = 32;

exports.masks = {
	USER_EVENT         : USER_EVENT,
	LIGHT_CANDLES      : LIGHT_CANDLES,
	YOM_TOV_ENDS       : YOM_TOV_ENDS,
	CHUL_ONLY          : CHUL_ONLY,
	IL_ONLY            : IL_ONLY,
	LIGHT_CANDLES_TZEIS: LIGHT_CANDLES_TZEIS
};

function Event(date, desc, mask) {
	var me = this;
	me.date = new HDate(date);
	me.desc = typeof desc != 'object' ? [desc] : desc;

	me.USER_EVENT          = !!( mask & USER_EVENT           );
	me.LIGHT_CANDLES       = !!( mask & LIGHT_CANDLES        );
	me.YOM_TOV_ENDS        = !!( mask & YOM_TOV_ENDS         );
	me.CHUL_ONLY           = !!( mask & CHUL_ONLY            );
	me.IL_ONLY             = !!( mask & IL_ONLY              );
	me.LIGHT_CANDLES_TZEIS = !!( mask & LIGHT_CANDLES_TZEIS  );
}

Event.prototype.is = function(date, il) {
	date = new HDate(date), myDate = this.date;
	if (arguments.length < 2) {
		//il = Event.isIL;
		il = date.il;
	}
	if (date.getDate() != myDate.getDate() || date.getMonth() != myDate.getMonth()) {
		return false;
	}
	if (date.getFullYear() != myDate.getFullYear()) {
		return false;
	}
	if (il && this.CHUL_ONLY || !il && this.IL_ONLY) {
		return false;
	}
	return true;
};

Event.prototype.masks = function() {
	var me = this;
	return (me.USER_EVENT          && USER_EVENT)    |
		   (me.LIGHT_CANDLES       && LIGHT_CANDLES) |
		   (me.YOM_TOV_ENDS        && YOM_TOV_ENDS)  |
		   (me.CHUL_ONLY           && CHUL_ONLY)     |
		   (me.IL_ONLY             && IL_ONLY)       |
		   (me.LIGHT_CANDLES_TZEIS && LIGHT_CANDLES_TZEIS);
};

Event.prototype.getDesc = function(o) {
	return c.LANG(this.desc, o);
};

Event.prototype.candleLighting = function() {
	var date = this.date;
	if (this.LIGHT_CANDLES) {
		return new Date(date.sunset() - (Event.candleLighting * 60 * 1000));
	} else if (this.LIGHT_CANDLES_TZEIS) {
		return date.getZemanim().tzeit;
	}
	return null;
};

Event.prototype.havdalah = function() {
	if (this.YOM_TOV_ENDS) {
		return new Date(this.date.sunset().getTime() + (Event.havdalah * 60 * 1000));
	}
	return null;
};

Event.prototype.routine = (function(){
	function routine(){
		return !!~routine.names.indexOf(this.getDesc('s'));
	}
	routine.names = [Shabbat, 'Erev ' + Shabbat];
	return routine;
})();

Event.isIL = false;

Event.candleLighting = 18;

Event.havdalah = 42;

exports.Event = Event;

exports.year = function(year) {
	if (__cache[year]) {
		return __cache[year];
	}

	var	RH = new HDate(1, TISHREI, year),
		pesach = new HDate(15, NISAN, year),
		tmpDate;

	var h = {};

	function add(ev) {
		if (Array.isArray(ev)) {
			ev.forEach(function(e){
				add(e);
			});
		} else {
			if (h[ev.date]) {
				h[ev.date].push(ev);
			} else {
				h[ev.date] = [ev];
			}
		}
	}

	Object.defineProperty(h, 'add', {value: add});

	add([ // standard holidays that don't shift based on year
		new Event(
			RH,
			['Rosh Hashana 1', 0, 'ראש השנה א\''],
			LIGHT_CANDLES_TZEIS
		), new Event(
			new HDate(2, TISHREI, year),
			['Rosh Hashana 2', 0, 'ראש השנה ב\''],
			YOM_TOV_ENDS
		), new Event(
			new HDate(3 + (RH[getDay]() == days.THU), TISHREI, year), // push off to SUN if RH is THU
			['Tzom Gedaliah', 0, 'צום גדליה'],
			0
		), new Event(
			new HDate(9, TISHREI, year),
			['Erev Yom Kippur', 0, 'ערב יום כיפור'],
			LIGHT_CANDLES
		), new Event( // first SAT after RH
			new HDate(dayOnOrBefore(SAT, 7 + RH[abs]())),
			[Shabbat + ' Shuva', Shabbos + ' Shuvah', 'שבת שובה'],
			0
		), new Event(
			new HDate(10, TISHREI, year),
			['Yom Kippur', 0, 'יום כיפור'],
			YOM_TOV_ENDS
		), new Event(
			new HDate(14, TISHREI, year),
			['Erev Sukkot', 'Erev Succos', 'ערב סוכות'],
			LIGHT_CANDLES
		), new Event(
			new HDate(15, TISHREI, year),
			Sukkot(1),
			LIGHT_CANDLES_TZEIS | CHUL_ONLY
		), new Event(
			new HDate(15, TISHREI, year),
			Sukkot(1),
			YOM_TOV_ENDS | IL_ONLY
		), new Event(
			new HDate(16, TISHREI, year),
			Sukkot(2),
			YOM_TOV_ENDS | CHUL_ONLY
		), new Event(
			new HDate(16, TISHREI, year),
			CHM(Sukkot(2)),
			IL_ONLY
		), new Event(
			new HDate(17, TISHREI, year),
			CHM(Sukkot(3)),
			0
		), new Event(
			new HDate(18, TISHREI, year),
			CHM(Sukkot(4)),
			0
		), new Event(
			new HDate(19, TISHREI, year),
			CHM(Sukkot(5)),
			0
		), new Event(
			new HDate(20, TISHREI, year),
			CHM(Sukkot(6)),
			0
		), new Event(
			new HDate(21, TISHREI, year),
			['Sukkot: 7 (Hoshana Raba)', 'Succos: 7 (Hoshana Raba)', 'סוכות יום ז\' )הושנע רבה('],
			LIGHT_CANDLES
		), new Event(
			new HDate(22, TISHREI, year),
			['Shmini Atzeret', 'Shmini Atzeres', 'שמיני עצרת'],
			LIGHT_CANDLES_TZEIS | CHUL_ONLY
		), new Event(
			new HDate(22, TISHREI, year),
			['Shmini Atzeret / Simchat Torah', 'Shmini Atzeres / Simchas Torah', 'שמיני עצרת / שמחת תורה'],
			YOM_TOV_ENDS | IL_ONLY
		), new Event(
			new HDate(23, TISHREI, year),
			['Simchat Torah', 'Simchas Torah', 'שמחת תורה'],
			YOM_TOV_ENDS | CHUL_ONLY
		), new Event(
			new HDate(24, KISLEV, year),
			['Erev Chanukah', 0, 'ערב חנוכה'],
			0
		), new Event(
			new HDate(25, KISLEV, year),
			Chanukah(1),
			0
		), new Event(
			new HDate(26, KISLEV, year),
			Chanukah(2),
			0
		), new Event(
			new HDate(27, KISLEV, year),
			Chanukah(3),
			0
		), new Event(
			new HDate(28, KISLEV, year),
			Chanukah(4),
			0
		), new Event(
			new HDate(29, KISLEV, year),
			Chanukah(5),
			0
		), new Event(
			new HDate(30, KISLEV, year), // yes, i know these are wrong
			Chanukah(6),
			0
		), new Event(
			new HDate(31, KISLEV, year), // HDate() corrects the month automatically
			Chanukah(7),
			0
		), new Event(
			new HDate(32, KISLEV, year),
			Chanukah(8),
			0
		), new Event(
			new HDate(15, months.SHVAT, year),
			["Tu B'Shvat", 0, 'ט"ו בשבט'],
			0
		), new Event(
			new HDate(dayOnOrBefore(SAT, pesach[abs]() - 43)),
			[Shabbat + ' Shekalim', Shabbos + ' Shekalim', 'שבת שקלים'],
			0
		), new Event(
			new HDate(dayOnOrBefore(SAT, pesach[abs]() - 30)),
			[Shabbat + ' Zachor', Shabbos + ' Zachor', 'שבת זכור'],
			0
		), new Event(
			new HDate(pesach[abs]() - (pesach[getDay]() == days.TUE ? 33 : 31)),
			["Ta'anit Esther", "Ta'anis Esther", 'תענית אסתר'],
			0
		), new Event(
			new HDate(13, months.ADAR_II, year),
			['Erev Purim', 0, 'ערב פורים'],
			0
		), new Event(
			new HDate(14, months.ADAR_II, year),
			['Purim', 0, 'פורים'],
			0
		), new Event(
			new HDate(15, months.ADAR_II, year),
			['Shushan Purim', 0, 'שושן פורים'],
			0
		), new Event(
			new HDate(dayOnOrBefore(SAT, pesach[abs]() - 14) - 7),
			[Shabbat + ' Parah', Shabbos + ' Parah', 'שבת פרה'],
			0
		), new Event(
			new HDate(dayOnOrBefore(SAT, pesach[abs]() - 14)),
			[Shabbat + ' Hachodesh', Shabbos + ' Hachodesh', 'שבת החודש'],
			0
		), new Event(
			new HDate(dayOnOrBefore(SAT, pesach[abs]() - 1)),
			[Shabbat + ' HaGadol', Shabbos + ' HaGadol', 'שבת הגדול'],
			0
		), new Event(
			// if the fast falls on Shabbat, move to Thursday
			pesach.prev()[getDay]() == SAT ? pesach.onOrBefore(days.THU) : new HDate(14, NISAN, year),
			["Ta'anit Bechorot", "Ta'anis Bechoros", 'תענית בכורות'],
			0
		), new Event(
			new HDate(14, NISAN, year),
			['Erev Pesach', 0, 'ערב פסח'],
			LIGHT_CANDLES
		), new Event(
			new HDate(15, NISAN, year),
			Pesach(1),
			LIGHT_CANDLES_TZEIS | CHUL_ONLY
		), new Event(
			new HDate(15, NISAN, year),
			Pesach(1),
			YOM_TOV_ENDS | IL_ONLY
		), new Event(
			new HDate(16, NISAN, year),
			Pesach(2),
			YOM_TOV_ENDS | CHUL_ONLY
		), new Event(
			new HDate(16, NISAN, year),
			CHM(Pesach(2)),
			IL_ONLY
		), new Event(
			new HDate(16, NISAN, year),
			['Start counting Omer', 0, 'התחלת ספירת העומר'],
			0
		), new Event(
			new HDate(17, NISAN, year),
			CHM(Pesach(3)),
			0
		), new Event(
			new HDate(18, NISAN, year),
			CHM(Pesach(4)),
			0
		), new Event(
			new HDate(19, NISAN, year),
			CHM(Pesach(5)),
			0
		), new Event(
			new HDate(20, NISAN, year),
			CHM(Pesach(6)),
			LIGHT_CANDLES
		), new Event(
			new HDate(21, NISAN, year),
			Pesach(7),
			LIGHT_CANDLES_TZEIS | CHUL_ONLY
		), new Event(
			new HDate(21, NISAN, year),
			Pesach(7),
			YOM_TOV_ENDS | IL_ONLY
		), new Event(
			new HDate(22, NISAN, year),
			Pesach(8),
			YOM_TOV_ENDS | CHUL_ONLY
		), new Event(
			new HDate(14, months.IYYAR, year),
			['Pesach Sheni', 0, 'פסח שני'],
			0
		), new Event(
			new HDate(18, months.IYYAR, year),
			["Lag B'Omer", 0, 'ל"ג בעומר'],
			0
		), new Event(
			new HDate(5, months.SIVAN, year),
			['Erev Shavuot', 'Erev Shavuos', 'ערב שבועות'],
			LIGHT_CANDLES
		), new Event(
			new HDate(6, months.SIVAN, year),
			['Shavuot 1', 'Shavuos 1', 'שבועות א\''],
			LIGHT_CANDLES_TZEIS | CHUL_ONLY
		), new Event(
			new HDate(6, months.SIVAN, year),
			['Shavuot', 'Shavuos', 'שבועות'],
			YOM_TOV_ENDS | IL_ONLY
		), new Event(
			new HDate(7, months.SIVAN, year),
			['Shavuot 2', 'Shavuos 2', 'שבועות ב\''],
			YOM_TOV_ENDS | CHUL_ONLY
		), new Event(
			new HDate(dayOnOrBefore(SAT, new HDate(1, TISHREI, year + 1)[abs]() - 4)),
			['Leil Selichot', 'Leil Selichos', 'ליל סליחות'],
			0
		), new Event(
			new HDate(29, months.ELUL, year),
			['Erev Rosh Hashana', 0, 'ערב ראש השנה'],
			LIGHT_CANDLES
		)
	]);

	tmpDate = new HDate(10, months.TEVET, year);
	if (tmpDate[getDay]() == SAT) {
		tmpDate = tmpDate.next();
	}
	add(new Event(
		tmpDate,
		["Asara B'Tevet", 0, 'עשרה בטבת'],
		0
	));

	if (c.LEAP(year)) {
		add(new Event(
			new HDate(14, months.ADAR_I, year),
			['Purim Katan', 0, 'פורים קטן'],
			0
		));

		add(new Event(
			new HDate(15, months.ADAR_I, year),
			['Shushan Purim Katan', 0, 'שושן פורים קטן'],
			0
		));
	}

	if (year >= 5711) { // Yom HaShoah first observed in 1951
		tmpDate = new HDate(27, NISAN, year);
		/* When the actual date of Yom Hashoah falls on a Friday, the
		 * state of Israel observes Yom Hashoah on the preceding
		 * Thursday. When it falls on a Sunday, Yom Hashoah is observed
		 * on the following Monday.
		 * http://www.ushmm.org/remembrance/dor/calendar/
		 */

		if (tmpDate[getDay]() == days.FRI) {
			tmpDate = tmpDate.prev();
		} else if (tmpDate[getDay]() == days.SUN) {
			tmpDate = tmpDate.next();
		}

		add(new Event(
			tmpDate,
			['Yom HaShoah', 0, 'יום השואה'],
			0
		));
	}

	add(atzmaut(year));

	if (year >= 5727) { // Yom Yerushalayim only celebrated after 1967
		add(new Event(
			new HDate(29, months.IYYAR, year),
			['Yom Yerushalayim', 0, 'יום ירושלים'],
			0
		));
	}

	tmpDate = new HDate(17, months.TAMUZ, year);
	if (tmpDate[getDay]() == SAT) {
		tmpDate = tmpDate.next();
	}
	add(new Event(
		tmpDate,
		["Shiva-Asar B'Tamuz", 0, "צום יז' בתמוז"],
		0
	));

	tmpDate = new HDate(9, months.AV, year);
	if (tmpDate[getDay]() == SAT) {
		tmpDate = tmpDate.next();
	}

	add(new Event(
		new HDate(dayOnOrBefore(SAT, tmpDate[abs]())),
		[Shabbat + ' Chazon', Shabbos + ' Chazon', 'שבת חזון'],
		0
	));

	add(new Event(
		tmpDate.prev(),
		["Erev Tish'a B'Av", 0, 'ערב תשעה באב'],
		0
	));

	add(new Event(
		tmpDate,
		["Tish'a B'Av", 0, 'תשעה באב'],
		0
	));

	add(new Event(
		new HDate(dayOnOrBefore(SAT, tmpDate[abs]() + 7)),
		[Shabbat + ' Nachamu', Shabbos + ' Nachamu', 'שבת נחמו'],
		0
	));

	for (var day = 6; day < c.daysInYear(year); day += 7) {
		add(new Event(
			new HDate(dayOnOrBefore(SAT, new HDate(1, TISHREI, year)[abs]() + day)),
			[Shabbat, Shabbos, 'שבת'],
			YOM_TOV_ENDS
		));

		add(new Event(
			new HDate(dayOnOrBefore(days.FRI, new HDate(1, TISHREI, year)[abs]() + day)),
			['Erev ' + Shabbat, 'Erev ' + Shabbos, 'ערב שבת'],
			LIGHT_CANDLES
		));
	}

	for (var month = 1; month <= c.MONTH_CNT(year); month++) {
		if ((month == NISAN ? c.daysInMonth(c.MONTH_CNT(year - 1), year - 1) :
				c.daysInMonth(month - 1, year)) == 30) {
			add(new Event(
				new HDate(1, month, year),
				['Rosh Chodesh 2', 0, "ראש חודש ב'"],
				0
			));

			add(new Event(
				new HDate(30, month - 1, year),
				['Rosh Chodesh 1', 0, "ראש חודש א'"],
				0
			));
		} else if (month !== TISHREI) {
			add(new Event(
				new HDate(1, month, year),
				['Rosh Chodesh', 0, 'ראש חודש'],
				0
			));
		}

		if (month == months.ELUL) {
			continue;
		}

		add(new Event(
			new HDate(29, month, year).onOrBefore(SAT),
			[Shabbat + ' Mevarchim', Shabbos + ' Mevorchim', 'שבת מברכים'],
			0
		));
	}

	return __cache[year] = h;
};

function atzmaut(year) {
	if (year >= 5708) { // Yom HaAtzma'ut only celebrated after 1948
		var tmpDate = new HDate(1, months.IYYAR, year), pesach = new HDate(15, NISAN, year);

		if (pesach[getDay]() == days.SUN) {
			tmpDate.setDate(2);
		} else if (pesach[getDay]() == SAT) {
			tmpDate.setDate(3);
		} else if (year < 5764) {
			tmpDate.setDate(4);
		} else if (pesach[getDay]() == days.TUE) {
			tmpDate.setDate(5);
		} else {
			tmpDate.setDate(4);
		}

		return [new Event(
			tmpDate,
			['Yom HaZikaron', 0, 'יום הזיכרון'],
			0
		), new Event(
			tmpDate.next(),
			["Yom HaAtzma'ut", 0, 'יום העצמאות'],
			0
		)];
	}
	return [];
}
exports.atzmaut = atzmaut;

},{"./common":3,"./hdate":6,"gematriya":10}],9:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],10:[function(require,module,exports){
/*
 * Convert numbers to gematriya representation, and vice-versa.
 *
 * Licensed MIT.
 *
 * Copyright (c) 2014 Eyal Schachter

 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function(){
	var letters = {}, numbers = {
		'': 0,
		א: 1,
		ב: 2,
		ג: 3,
		ד: 4,
		ה: 5,
		ו: 6,
		ז: 7,
		ח: 8,
		ט: 9,
		י: 10,
		כ: 20,
		ל: 30,
		מ: 40,
		נ: 50,
		ס: 60,
		ע: 70,
		פ: 80,
		צ: 90,
		ק: 100,
		ר: 200,
		ש: 300,
		ת: 400,
		תק: 500,
		תר: 600,
		תש: 700,
		תת: 800,
		תתק: 900,
		תתר: 1000
	}, i;
	for (i in numbers) {
		letters[numbers[i]] = i;
	}

	function gematriya(num, limit) {
		if (typeof num !== 'number' && typeof num !== 'string') {
			throw new TypeError('non-number or string given to gematriya()');
		}
		var str = typeof num === 'string';
		if (str) {
			num = num.replace(/('|")/g,'');
		}
		num = num.toString().split('').reverse();
		if (!str && limit) {
			num = num.slice(0, limit);
		}

		num = num.map(function g(n,i){
			if (str) {
				return limit && numbers[n] < numbers[num[i - 1]] && numbers[n] < 100 ? numbers[n] * 1000 : numbers[n];
			} else {
				if (parseInt(n, 10) * Math.pow(10, i) > 1000) {
					return g(n, i-3);
				}
				return letters[parseInt(n, 10) * Math.pow(10, i)];
			}
		});

		if (str) {
			return num.reduce(function(o,t){
				return o + t;
			}, 0);
		} else {
			num = num.reverse().join('').replace(/יה/g,'טו').replace(/יו/g,'טז').split('');

			if (num.length === 1) {
				num.push("'");
			} else if (num.length > 1) {
				num.splice(-1, 0, '"');
			}

			return num.join('');
		}
	}

	if (typeof module !== 'undefined') {
		module.exports = gematriya;
	} else {
		window.gematriya = gematriya;
	}
})();

},{}],11:[function(require,module,exports){
'use strict';

module.exports = require('./lib/solarCalc.js');

},{"./lib/solarCalc.js":13}],12:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Moon = (function () {
  function Moon(date, latitude, longitude) {
    _classCallCheck(this, Moon);

    this.date = date;
    this.latitude = latitude;
    this.longitude = longitude;

    this.julianDate = getJD(date);
  }

  _createClass(Moon, {
    illuminosity: {
      get: function () {
        return moonPhase(this.date) / 360;
      }
    },
    distance: {
      get: function () {
        return moonPos(this.date).distance;
      }
    }
  });

  return Moon;
})();

// Utility functions for astronomical programming.
// JavaScript by Peter Hayes http://www.peter-hayes.freeserve.co.uk/
// Copyright 2001-2002
// This code is made freely available but please keep this notice.
// I accept no liability for any errors in my coding but please
// let me know of any errors you find. My address is on my home page.

function getJD(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  var A = Math.floor(year / 100);
  var B = 2 - A + Math.floor(A / 4);
  var JD = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
  return JD;
}

// function dayno(year, month, day, hours) {
//   // Day number is a modified Julian date, day 0 is 2000 January 0.0
//   // which corresponds to a Julian date of 2451543.5
//   var A = Math.floor(year / 100);
//   var B = 2 - A + Math.floor(A / 4);
//   var JD = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5 + hours;
//   return JD;
// }

// function julian(year, month, day, hours) {
//   return dayno(year, month, day, hours) + 2451543.5;
// }

// function jdtocd(jd) {
//   // The calendar date from julian date
//   // Returns year, month, day, day of week, hours, minutes, seconds
//   var Z = Math.floor(jd + 0.5);
//   var F = jd + 0.5 - Z;
//   if (Z < 2299161) {
//     var A = Z;
//   } else {
//     var alpha = Math.floor((Z - 1867216.25) / 36524.25);
//     var A = Z + 1 + alpha - Math.floor(alpha / 4);
//   }
//   var B = A + 1524;
//   var C = Math.floor((B - 122.1) / 365.25);
//   var D = Math.floor(365.25 * C);
//   var E = Math.floor((B - D) / 30.6001);
//   var d = B - D - Math.floor(30.6001 * E) + F;
//   if (E < 14) {
//     var month = E - 1;
//   } else {
//     var month = E - 13;
//   }
//   if (month > 2) {
//     var year = C - 4716;
//   } else {
//     var year = C - 4715;
//   }
//   var day = Math.floor(d);
//   var h = (d - day) * 24;
//   var hours = Math.floor(h);
//   var m = (h - hours) * 60;
//   var minutes = Math.floor(m);
//   var seconds = Math.round((m - minutes) * 60);
//   if (seconds >= 60) {
//     minutes = minutes + 1;
//     seconds = seconds - 60;
//   }
//   if (minutes >= 60) {
//     hours = hours + 1;
//     minutes = 0;
//   }
//   var dw = Math.floor(jd + 1.5) - 7 * Math.floor((jd + 1.5) / 7);
//   return [year, month, day, dw, hours, minutes, seconds];
// }

// function local_sidereal(year, month, day, hours, lon) {
//   // Compute local siderial time in degrees
//   // year, month, day and hours are the Greenwich date and time
//   // lon is the observers longitude
//   var d = dayno(year, month, day, hours);
//   var lst = (98.9818 + 0.985647352 * d + hours * 15 + lon);
//   return rev(lst) / 15;
// }

// function radtoaa(ra, dec, year, month, day, hours, lat, lon) {
//   // convert ra and dec to altitude and azimuth
//   // year, month, day and hours are the Greenwich date and time
//   // lat and lon are the observers latitude and longitude
//   var lst = local_sidereal(year, month, day, hours, lon);
//   var x = cosd(15.0 * (lst - ra)) * cosd(dec);
//   var y = sind(15.0 * (lst - ra)) * cosd(dec);
//   var z = sind(dec);
//   // rotate so z is the local zenith
//   var xhor = x * sind(lat) - z * cosd(lat);
//   var yhor = y;
//   var zhor = x * cosd(lat) + z * sind(lat);
//   var azimuth = rev(atan2d(yhor, xhor) + 180.0); // so 0 degrees is north
//   var altitude = atan2d(zhor, Math.sqrt(xhor * xhor + yhor * yhor));
//   return [altitude, azimuth];
// }

// Extensions to the Math routines - Trig routines in degrees
// JavaScript by Peter Hayes http://www.peter-hayes.freeserve.co.uk/
// Copyright 2001-2002

function rev(angle) {
  return angle - Math.floor(angle / 360) * 360;
}

function sind(angle) {
  return Math.sin(angle * Math.PI / 180);
}

function cosd(angle) {
  return Math.cos(angle * Math.PI / 180);
}

function tand(angle) {
  return Math.tan(angle * Math.PI / 180);
}

function asind(c) {
  return 180 / Math.PI * Math.asin(c);
}

// function acosd(c) {
//   return (180.0 / Math.PI) * Math.acos(c);
// }

function atan2d(y, x) {
  return 180 / Math.PI * Math.atan(y / x) - 180 * (x < 0);
}

// function anglestring(a, circle) {
//   // returns a in degrees as a string degrees:minutes
//   // circle is true for range between 0 and 360 and false for -90 to +90
//   var ar = Math.round(a * 60) / 60;
//   var deg = Math.abs(ar);
//   var min = Math.round(60.0 * (deg - Math.floor(deg)));
//   if (min >= 60) {
//     deg += 1;
//     min = 0;
//   }
//   var anglestr = "";
//   if (!circle) anglestr += (ar < 0 ? "-" : "+");
//   if (circle) anglestr += ((Math.floor(deg) < 100) ? "0" : "");
//   anglestr += ((Math.floor(deg) < 10) ? "0" : "") + Math.floor(deg);
//   anglestr += ((min < 10) ? ":0" : ":") + (min);
//   return anglestr;
// }

// JavaScript by Peter Hayes http://www.aphayes.pwp.blueyonder.co.uk/
// Copyright 2001-2010
// Unless otherwise stated this code is based on the methods in
// Astronomical Algorithms, first edition, by Jean Meeus
// Published by Willmann-Bell, Inc.
// This code is made freely available but please keep this notice.
// The calculations are approximate but should be good enough for general use,
// I accept no responsibility for errors in astronomy or coding.

// WARNING moonrise code changed on 6 May 2003 to correct a systematic error
// these are now local times NOT UTC as the original code did.

// Meeus first edition table 45.A Longitude and distance of the moon

var T45AD = [0, 2, 2, 0, 0, 0, 2, 2, 2, 2, 0, 1, 0, 2, 0, 0, 4, 0, 4, 2, 2, 1, 1, 2, 2, 4, 2, 0, 2, 2, 1, 2, 0, 0, 2, 2, 2, 4, 0, 3, 2, 4, 0, 2, 2, 2, 4, 0, 4, 1, 2, 0, 1, 3, 4, 2, 0, 1, 2, 2];

var T45AM = [0, 0, 0, 0, 1, 0, 0, -1, 0, -1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, -1, 0, 0, 0, 1, 0, -1, 0, -2, 1, 2, -2, 0, 0, -1, 0, 0, 1, -1, 2, 2, 1, -1, 0, 0, -1, 0, 1, 0, 1, 0, 0, -1, 2, 1, 0, 0];

var T45AMP = [1, -1, 0, 2, 0, 0, -2, -1, 1, 0, -1, 0, 1, 0, 1, 1, -1, 3, -2, -1, 0, -1, 0, 1, 2, 0, -3, -2, -1, -2, 1, 0, 2, 0, -1, 1, 0, -1, 2, -1, 1, -2, -1, -1, -2, 0, 1, 4, 0, -2, 0, 2, 1, -2, -3, 2, 1, -1, 3, -1];

var T45AF = [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, -2, 2, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, -2, 2, 0, 2, 0, 0, 0, 0, 0, 0, -2, 0, 0, 0, 0, -2, -2, 0, 0, 0, 0, 0, 0, 0, -2];

var T45AL = [6288774, 1274027, 658314, 213618, -185116, -114332, 58793, 57066, 53322, 45758, -40923, -34720, -30383, 15327, -12528, 10980, 10675, 10034, 8548, -7888, -6766, -5163, 4987, 4036, 3994, 3861, 3665, -2689, -2602, 2390, -2348, 2236, -2120, -2069, 2048, -1773, -1595, 1215, -1110, -892, -810, 759, -713, -700, 691, 596, 549, 537, 520, -487, -399, -381, 351, -340, 330, 327, -323, 299, 294, 0];

var T45AR = [-20905355, -3699111, -2955968, -569925, 48888, -3149, 246158, -152138, -170733, -204586, -129620, 108743, 104755, 10321, 0, 79661, -34782, -23210, -21636, 24208, 30824, -8379, -16675, -12831, -10445, -11650, 14403, -7003, 0, 10056, 6322, -9884, 5751, 0, -4950, 4130, 0, -3958, 0, 3258, 2616, -1897, -2117, 2354, 0, 0, -1423, -1117, -1571, -1739, 0, -4421, 0, 0, 0, 0, 1165, 0, 0, 8752];

// Meeus table 45B latitude of the moon

var T45BD = [0, 0, 0, 2, 2, 2, 2, 0, 2, 0, 2, 2, 2, 2, 2, 2, 2, 0, 4, 0, 0, 0, 1, 0, 0, 0, 1, 0, 4, 4, 0, 4, 2, 2, 2, 2, 0, 2, 2, 2, 2, 4, 2, 2, 0, 2, 1, 1, 0, 2, 1, 2, 0, 4, 4, 1, 4, 1, 4, 2];

var T45BM = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 1, -1, -1, -1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 1, 0, -1, -2, 0, 1, 1, 1, 1, 1, 0, -1, 1, 0, -1, 0, 0, 0, -1, -2];

var T45BMP = [0, 1, 1, 0, -1, -1, 0, 2, 1, 2, 0, -2, 1, 0, -1, 0, -1, -1, -1, 0, 0, -1, 0, 1, 1, 0, 0, 3, 0, -1, 1, -2, 0, 2, 1, -2, 3, 2, -3, -1, 0, 0, 1, 0, 1, 1, 0, 0, -2, -1, 1, -2, 2, -2, -1, 1, 1, -1, 0, 0];

var T45BF = [1, 1, -1, -1, 1, -1, 1, 1, -1, -1, -1, -1, 1, -1, 1, 1, -1, -1, -1, 1, 3, 1, 1, 1, -1, -1, -1, 1, -1, 1, -3, 1, -3, -1, -1, 1, -1, 1, -1, 1, 1, 1, 1, -1, 3, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1];

var T45BL = [5128122, 280602, 277693, 173237, 55413, 46271, 32573, 17198, 9266, 8822, 8216, 4324, 4200, -3359, 2463, 2211, 2065, -1870, 1828, -1794, -1749, -1565, -1491, -1475, -1410, -1344, -1335, 1107, 1021, 833, 777, 671, 607, 596, 491, -451, 439, 422, 421, -366, -351, 331, 315, 302, -283, -229, 223, 223, -220, -220, -185, 181, -177, 176, 166, -164, 132, -119, 115, 107];

// MoonPos calculates the Moon position, based on Meeus chapter 45

function moonPos(date) {
  // julian date
  var jd = getJD(date) + 2451543.5;
  var T = (jd - 2451545) / 36525;
  var T2 = T * T;
  var T3 = T2 * T;
  var T4 = T3 * T;
  // Moons mean longitude L'
  var LP = 218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000;
  // Moons mean elongation
  var D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000;
  // Suns mean anomaly
  var M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000;
  // Moons mean anomaly M'
  var MP = 134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000;
  // Moons argument of latitude
  var F = 93.272095 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000;

  // Additional arguments
  var A1 = 119.75 + 131.849 * T;
  var A2 = 53.09 + 479264.29 * T;
  var A3 = 313.45 + 481266.484 * T;
  var E = 1 - 0.002516 * T - 0.0000074 * T2;
  var E2 = E * E;
  // Sums of periodic terms from table 45.A and 45.B
  var Sl = 0;
  var Sr = 0;
  for (var i = 0; i < 60; i++) {
    var Eterm = 1;
    if (Math.abs(T45AM[i]) === 1) Eterm = E;
    if (Math.abs(T45AM[i]) === 2) Eterm = E2;
    Sl += T45AL[i] * Eterm * sind(rev(T45AD[i] * D + T45AM[i] * M + T45AMP[i] * MP + T45AF[i] * F));
    Sr += T45AR[i] * Eterm * cosd(rev(T45AD[i] * D + T45AM[i] * M + T45AMP[i] * MP + T45AF[i] * F));
  }
  var Sb = 0;
  for (var i = 0; i < 60; i++) {
    var Eterm = 1;
    if (Math.abs(T45BM[i]) === 1) Eterm = E;
    if (Math.abs(T45BM[i]) === 2) Eterm = E2;
    Sb += T45BL[i] * Eterm * sind(rev(T45BD[i] * D + T45BM[i] * M + T45BMP[i] * MP + T45BF[i] * F));
  }
  // Additional additive terms
  Sl = Sl + 3958 * sind(rev(A1)) + 1962 * sind(rev(LP - F)) + 318 * sind(rev(A2));
  Sb = Sb - 2235 * sind(rev(LP)) + 382 * sind(rev(A3)) + 175 * sind(rev(A1 - F)) + 175 * sind(rev(A1 + F)) + 127 * sind(rev(LP - MP)) - 115 * sind(rev(LP + MP));
  // geocentric longitude, latitude and distance
  var mglong = rev(LP + Sl / 1000000);
  var mglat = rev(Sb / 1000000);
  if (mglat > 180) mglat = mglat - 360;
  var mr = Math.round(385000.56 + Sr / 1000);
  // Obliquity of Ecliptic
  var obl = 23.4393 - 3.563e-9 * (jd - 2451543.5);
  // RA and dec
  var ra = rev(atan2d(sind(mglong) * cosd(obl) - tand(mglat) * sind(obl), cosd(mglong))) / 15;
  var dec = rev(asind(sind(mglat) * cosd(obl) + cosd(mglat) * sind(obl) * sind(mglong)));
  if (dec > 180) dec = dec - 360;
  return {
    ra: ra,
    dec: dec,
    distance: mr
  };
}

// function MoonRise(year, month, day, TZ, latitude, longitude) {
//   // returns an array containing rise and set times or one of the
//   // following codes.
//   // -1 rise or set event not found and moon was down at 00:00
//   // -2 rise or set event not found and moon was up   at 00:00
//   // WARNING code changes on 6/7 May 2003 these are now local times
//   // NOT UTC and rise/set not found codes changed.
//   var hours = 0;
//   var riseset = [];
//   // elh is the elevation at the hour elhdone is true if elh calculated
//   var elh = [];
//   var elhdone = [];
//   for (var i = 0; i <= 24; i++) {
//     elhdone[i] = false;
//   }
//   // Compute the moon elevation at start and end of day
//   // store elevation at the hours in an array elh to save search time
//   var rad = MoonPos(year, month, day, hours - TZ);
//   var altaz = radtoaa(rad[0], rad[1], year, month, day, hours - TZ, latitude, longitude);
//   elh[0] = altaz[0];
//   elhdone[0] = true;
//   // set the return code to allow for always up or never rises
//   if (elh[0] > 0.0) {
//     riseset = [-2, -2];
//   } else {
//     riseset = [-1, -1];
//   }
//   hours = 24;
//   rad = MoonPos(year, month, day, hours - TZ);
//   altaz = radtoaa(rad[0], rad[1], year, month, day, hours - TZ, latitude, longitude);
//   elh[24] = altaz[0];
//   elhdone[24] = true;
//   // search for moonrise and set
//   for (var rise = 0; rise < 2; rise++) {
//     var found = false;
//     var hfirst = 0;
//     var hlast = 24;
//     // Try a binary chop on the hours to speed the search
//     while (Math.ceil((hlast - hfirst) / 2) > 1) {
//       hmid = hfirst + Math.round((hlast - hfirst) / 2);
//       if (!elhdone[hmid]) {
//         hours = hmid;
//         rad = MoonPos(year, month, day, hours - TZ);
//         altaz = radtoaa(rad[0], rad[1], year, month, day, hours - TZ, latitude, longitude);
//         elh[hmid] = altaz[0];
//         elhdone[hmid] = true;
//       }
//       if (((rise === 0) && (elh[hfirst] <= 0.0) && (elh[hmid] >= 0.0)) ||
//         ((rise === 1) && (elh[hfirst] >= 0.0) && (elh[hmid] <= 0.0))) {
//         hlast = hmid;
//         found = true;
//         continue;
//       }
//       if (((rise === 0) && (elh[hmid] <= 0.0) && (elh[hlast] >= 0.0)) ||
//         ((rise === 1) && (elh[hmid] >= 0.0) && (elh[hlast] <= 0.0))) {
//         hfirst = hmid;
//         found = true;
//         continue;
//       }
//       break;
//     }
//     // If the binary chop did not find a 1 hour interval
//     if ((hlast - hfirst) > 1) {
//       for (var i = hfirst; i < hlast; i++) {
//         found = false;
//         if (!elhdone[i + 1]) {
//           hours = i + 1;
//           rad = MoonPos(year, month, day, hours - TZ);
//           altaz = radtoaa(rad[0], rad[1], year, month, day, hours - TZ, latitude, longitude);
//           elh[hours] = altaz[0];
//           elhdone[hours] = true;
//         }
//         if (((rise === 0) && (elh[i] <= 0.0) && (elh[i + 1] >= 0.0)) ||
//           ((rise === 1) && (elh[i] >= 0.0) && (elh[i + 1] <= 0.0))) {
//           hfirst = i;
//           hlast = i + 1;
//           found = true;
//           break;
//         }
//       }
//     }
//     // simple linear interpolation for the minutes
//     if (found) {
//       var elfirst = elh[hfirst];
//       var ellast = elh[hlast];
//       hours = hfirst + 0.5;
//       rad = MoonPos(year, month, day, hours - TZ);
//       altaz = radtoaa(rad[0], rad[1], year, month, day, hours - TZ, latitude, longitude);
//       // alert("day ="+day+" hour ="+hours+" altaz="+altaz[0]+" "+altaz[1]);
//       if ((rise == 0) && (altaz[0] <= 0.0)) {
//         hfirst = hours;
//         elfirst = altaz[0];
//       }
//       if ((rise == 0) && (altaz[0] > 0.0)) {
//         hlast = hours;
//         ellast = altaz[0];
//       }
//       if ((rise == 1) && (altaz[0] <= 0.0)) {
//         hlast = hours;
//         ellast = altaz[0];
//       }
//       if ((rise === 1) && (altaz[0] > 0.0)) {
//         hfirst = hours;
//         elfirst = altaz[0];
//       }
//       var eld = Math.abs(elfirst) + Math.abs(ellast);
//       riseset[rise] = hfirst + (hlast - hfirst) * Math.abs(elfirst) / eld;
//     }
//   } // End of rise/set loop
//   return (riseset);
// }

function moonPhase(date) {
  // the illuminated percentage from Meeus chapter 46
  var j = getJD(date) + 2451543.5;
  var T = (j - 2451545) / 36525;
  var T2 = T * T;
  var T3 = T2 * T;
  var T4 = T3 * T;
  // Moons mean elongation Meeus first edition
  // var D=297.8502042+445267.1115168*T-0.0016300*T2+T3/545868.0-T4/113065000.0;
  // Moons mean elongation Meeus second edition
  var D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000;
  // Moons mean anomaly M' Meeus first edition
  // var MP=134.9634114+477198.8676313*T+0.0089970*T2+T3/69699.0-T4/14712000.0;
  // Moons mean anomaly M' Meeus second edition
  var MP = 134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000;
  // Suns mean anomaly
  var M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000;
  // phase angle
  var pa = 180 - D - 6.289 * sind(MP) + 2.1 * sind(M) - 1.274 * sind(2 * D - MP) - 0.658 * sind(2 * D) - 0.214 * sind(2 * MP) - 0.11 * sind(D);
  return rev(pa);
}

// function MoonQuarters(year, month, day) {
//   // returns an array of Julian Ephemeris Days (JDE) for
//   // new moon, first quarter, full moon and last quarter
//   // Meeus first edition chapter 47 with only the most larger additional corrections
//   // Meeus code calculate Terrestrial Dynamic Time
//   // TDT = UTC + (number of leap seconds) + 32.184
//   // At the end of June 2012 the 25th leap second was added
//   //
//   var quarters = [];
//   // k is an integer for new moon incremented by 0.25 for first quarter 0.5 for new etc.
//   var k = Math.floor((year + ((month - 1) + day / 30) / 12 - 2000) * 12.3685);
//   // Time in Julian centuries since 2000.0
//   var T = k / 1236.85;
//   // Sun's mean anomaly
//   var M = rev(2.5534 + 29.10535669 * k - 0.0000218 * T * T);
//   // Moon's mean anomaly (M' in Meeus)
//   var MP = rev(201.5643 + 385.81693528 * k + 0.0107438 * T * T + 0.00001239 * T * T * T - 0.00000011 * T * T * T);
//   var E = 1 - 0.002516 * T - 0.0000074 * T * T;
//   // Moons argument of latitude
//   var F = rev(160.7108 + 390.67050274 * k - 0.0016341 * T * T - 0.00000227 * T * T * T + 0.000000011 * T * T * T * T);
//   // Longitude of ascending node of lunar orbit
//   var Omega = rev(124.7746 - 1.56375580 * k + 0.0020691 * T * T + 0.00000215 * T * T * T);
//   // The full planetary arguments include 14 terms, only used the 7 most significant
//   var A = [];
//   A[1] = rev(299.77 + 0.107408 * k - 0.009173 * T * T);
//   A[2] = rev(251.88 + 0.016321 * k);
//   A[3] = rev(251.83 + 26.651886 * k);
//   A[4] = rev(349.42 + 36.412478 * k);
//   A[5] = rev(84.88 + 18.206239 * k);
//   A[6] = rev(141.74 + 53.303771 * k);
//   A[7] = rev(207.14 + 2.453732 * k);

//   // New moon
//   var JDE0 = 2451550.09765 + 29.530588853 * k + 0.0001337 * T * T - 0.000000150 * T * T * T + 0.00000000073 * T * T * T * T;
//   // Correct for TDT since 1 July 2012
//   JDE0 = JDE0 - 57.184 / (24 * 60 * 60);
//   var JDE = JDE0 - 0.40720 * sind(MP) + 0.17241 * E * sind(M) + 0.01608 * sind(2 * MP) + 0.01039 * sind(2 * F) + 0.00739 * E * sind(MP - M) - 0.00514 * E * sind(MP + M) + 0.00208 * E * E * sind(2 * M) - 0.00111 * sind(MP - 2 * F) - 0.00057 * sind(MP + 2 * F) + 0.00056 * E * sind(2 * MP + M) - 0.00042 * sind(3 * MP) + 0.00042 * E * sind(M + 2 * F) + 0.00038 * E * sind(M - 2 * F) - 0.00024 * E * sind(2 * MP - M) - 0.00017 * sind(Omega) - 0.00007 * sind(MP + 2 * M);

//   quarters[0] = JDE + 0.000325 * sind(A[1]) + 0.000165 * sind(A[2]) + 0.000164 * sind(A[3]) + 0.000126 * sind(A[4]) + 0.000110 * sind(A[5]) + 0.000062 * sind(A[6]) + 0.000060 * sind(A[7]);

//   // The following code needs tidying up with a loop and conditionals for each quarter
//   // First Quarter k=k+0.25
//   JDE = JDE0 + 29.530588853 * 0.25;
//   M = rev(M + 29.10535669 * 0.25);
//   MP = rev(MP + 385.81693528 * 0.25);
//   F = rev(F + 390.67050274 * 0.25);
//   Omega = rev(Omega - 1.56375580 * 0.25);
//   A[1] = rev(A[1] + 0.107408 * 0.25);
//   A[2] = rev(A[2] + 0.016321 * 0.25);
//   A[3] = rev(A[3] + 26.651886 * 0.25);
//   A[4] = rev(A[4] + 36.412478 * 0.25);
//   A[5] = rev(A[5] + 18.206239 * 0.25);
//   A[6] = rev(A[6] + 53.303771 * 0.25);
//   A[7] = rev(A[7] + 2.453732 * 0.25);

//   JDE = JDE - 0.62801 * sind(MP) + 0.17172 * E * sind(M) - 0.01183 * E * sind(MP + M) + 0.00862 * sind(2 * MP) + 0.00804 * sind(2 * F) + 0.00454 * E * sind(MP - M) + 0.00204 * E * E * sind(2 * M) - 0.00180 * sind(MP - 2 * F) - 0.00070 * sind(MP + 2 * F) - 0.00040 * sind(3 * MP) - 0.00034 * E * sind(2 * MP - M) + 0.00032 * E * sind(M + 2 * F) + 0.00032 * E * sind(M - 2 * F) - 0.00028 * E * E * sind(MP + 2 * M) + 0.00027 * E * sind(2 * MP + M) - 0.00017 * sind(Omega);
//   // Next term is w add for first quarter & subtract for second
//   JDE = JDE + (0.00306 - 0.00038 * E * cosd(M) + 0.00026 * cosd(MP) - 0.00002 * cosd(MP - M) + 0.00002 * cosd(MP + M) + 0.00002 * cosd(2 * F));

//   quarters[1] = JDE + 0.000325 * sind(A[1]) + 0.000165 * sind(A[2]) + 0.000164 * sind(A[3]) + 0.000126 * sind(A[4]) + 0.000110 * sind(A[5]) + 0.000062 * sind(A[6]) + 0.000060 * sind(A[7]);

//   // Full moon k=k+0.5
//   JDE = JDE0 + 29.530588853 * 0.5;
//   // Already added 0.25 for first quarter
//   M = rev(M + 29.10535669 * 0.25);
//   MP = rev(MP + 385.81693528 * 0.25);
//   F = rev(F + 390.67050274 * 0.25);
//   Omega = rev(Omega - 1.56375580 * 0.25);
//   A[1] = rev(A[1] + 0.107408 * 0.25);
//   A[2] = rev(A[2] + 0.016321 * 0.25);
//   A[3] = rev(A[3] + 26.651886 * 0.25);
//   A[4] = rev(A[4] + 36.412478 * 0.25);
//   A[5] = rev(A[5] + 18.206239 * 0.25);
//   A[6] = rev(A[6] + 53.303771 * 0.25);
//   A[7] = rev(A[7] + 2.453732 * 0.25);

//   JDE = JDE - 0.40614 * sind(MP) + 0.17302 * E * sind(M) + 0.01614 * sind(2 * MP) + 0.01043 * sind(2 * F) + 0.00734 * E * sind(MP - M) - 0.00515 * E * sind(MP + M) + 0.00209 * E * E * sind(2 * M) - 0.00111 * sind(MP - 2 * F) - 0.00057 * sind(MP + 2 * F) + 0.00056 * E * sind(2 * MP + M) - 0.00042 * sind(3 * MP) + 0.00042 * E * sind(M + 2 * F) + 0.00038 * E * sind(M - 2 * F) - 0.00024 * E * sind(2 * MP - M) - 0.00017 * sind(Omega) - 0.00007 * sind(MP + 2 * M);

//   quarters[2] = JDE + 0.000325 * sind(A[1]) + 0.000165 * sind(A[2]) + 0.000164 * sind(A[3]) + 0.000126 * sind(A[4]) + 0.000110 * sind(A[5]) + 0.000062 * sind(A[6]) + 0.000060 * sind(A[7]);

//   // Last Quarter k=k+0.75
//   JDE = JDE0 + 29.530588853 * 0.75;
//   // Already added 0.5 for full moon
//   M = rev(M + 29.10535669 * 0.25);
//   MP = rev(MP + 385.81693528 * 0.25);
//   F = rev(F + 390.67050274 * 0.25);
//   Omega = rev(Omega - 1.56375580 * 0.25);
//   A[1] = rev(A[1] + 0.107408 * 0.25);
//   A[2] = rev(A[2] + 0.016321 * 0.25);
//   A[3] = rev(A[3] + 26.651886 * 0.25);
//   A[4] = rev(A[4] + 36.412478 * 0.25);
//   A[5] = rev(A[5] + 18.206239 * 0.25);
//   A[6] = rev(A[6] + 53.303771 * 0.25);
//   A[7] = rev(A[7] + 2.453732 * 0.25);

//   JDE = JDE - 0.62801 * sind(MP) + 0.17172 * E * sind(M) - 0.01183 * E * sind(MP + M) + 0.00862 * sind(2 * MP) + 0.00804 * sind(2 * F) + 0.00454 * E * sind(MP - M) + 0.00204 * E * E * sind(2 * M) - 0.00180 * sind(MP - 2 * F) - 0.00070 * sind(MP + 2 * F) - 0.00040 * sind(3 * MP) - 0.00034 * E * sind(2 * MP - M) + 0.00032 * E * sind(M + 2 * F) + 0.00032 * E * sind(M - 2 * F) - 0.00028 * E * E * sind(MP + 2 * M) + 0.00027 * E * sind(2 * MP + M) - 0.00017 * sind(Omega);
//   // Next term is w add for first quarter & subtract for second
//   JDE = JDE - (0.00306 - 0.00038 * E * cosd(M) + 0.00026 * cosd(MP) - 0.00002 * cosd(MP - M) + 0.00002 * cosd(MP + M) + 0.00002 * cosd(2 * F));

//   quarters[3] = JDE + 0.000325 * sind(A[1]) + 0.000165 * sind(A[2]) + 0.000164 * sind(A[3]) + 0.000126 * sind(A[4]) + 0.000110 * sind(A[5]) + 0.000062 * sind(A[6]) + 0.000060 * sind(A[7]);

//   return quarters;
// }

module.exports = Moon;
},{}],13:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Sun = require("./sun.js");
var Moon = require("./moon.js");

var degreesBelowHorizon = {
  sunrise: 0.833,
  sunriseEnd: 0.3,
  twilight: 6,
  nauticalTwilight: 12,
  night: 18,
  goldenHour: -6
};

//customZones = {"tziet": {angle:5,rising:false}}

var SolarCalc = (function () {
  function SolarCalc(date, latitude, longitude, customZones) {
    _classCallCheck(this, SolarCalc);

    var self = this;
    this.date = date;
    this.lat = latitude;
    this.longitude = longitude;

    this.sun = new Sun(date, latitude, longitude);
    this.moon = new Moon(date, latitude, longitude);

    return new Proxy(this, {
      get: function get(target, prop) {
        if (!(prop in target)) {
          if (!(prop in customZones)) throw new Error("Unknown property: " + prop);
          return self.sun.timeAtAngle(customZones[prop].angle, customZones[prop].rising);
        }
        return target[prop];
      }
    });
  }

  _createClass(SolarCalc, {
    solarNoon: {
      get: function () {
        return this.sun.solarNoon;
      }
    },
    sunrise: {
      get: function () {
        return this.sun.timeAtAngle(degreesBelowHorizon.sunrise, true);
      }
    },
    sunset: {
      get: function () {
        return this.sun.timeAtAngle(degreesBelowHorizon.sunrise);
      }
    },
    sunriseEnd: {
      get: function () {
        return this.sun.timeAtAngle(degreesBelowHorizon.sunriseEnd, true);
      }
    },
    sunsetStart: {
      get: function () {
        return this.sun.timeAtAngle(degreesBelowHorizon.sunriseEnd, false);
      }
    },
    civilDawn: {
      get: function () {
        return this.sun.timeAtAngle(degreesBelowHorizon.twilight, true);
      }
    },
    dawn: {
      get: function () {
        return this.civilDawn;
      }
    },
    civilDusk: {
      get: function () {
        return this.sun.timeAtAngle(degreesBelowHorizon.twilight, false);
      }
    },
    dusk: {
      get: function () {
        return this.civilDusk;
      }
    },
    nauticalDawn: {
      get: function () {
        return this.sun.timeAtAngle(degreesBelowHorizon.nauticalTwilight, true);
      }
    },
    nauticalDusk: {
      get: function () {
        return this.sun.timeAtAngle(degreesBelowHorizon.nauticalTwilight, false);
      }
    },
    nightStart: {
      get: function () {
        return this.astronomicalDusk;
      }
    },
    astronomicalDusk: {
      get: function () {
        return this.sun.timeAtAngle(degreesBelowHorizon.night, false);
      }
    },
    astronomicalDawn: {
      get: function () {
        return this.sun.timeAtAngle(degreesBelowHorizon.night, true);
      }
    },
    nightEnd: {
      get: function () {
        return this.astronomicalDawn;
      }
    },
    goldenHourStart: {
      get: function () {
        return this.sun.timeAtAngle(degreesBelowHorizon.goldenHour, false);
      }
    },
    goldenHourEnd: {
      get: function () {
        return this.sun.timeAtAngle(degreesBelowHorizon.goldenHour, true);
      }
    },
    lunarDistance: {
      get: function () {
        return this.moon.distance;
      }
    },
    lunarIlluminosity: {
      get: function () {
        return this.moon.illuminosity;
      }
    }
  });

  return SolarCalc;
})();

module.exports = SolarCalc;
},{"./moon.js":12,"./sun.js":14}],14:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Sun = (function () {
  function Sun(date, latitude, longitude) {
    _classCallCheck(this, Sun);

    this.date = date;
    this.latitude = latitude;
    this.longitude = longitude;

    this.julianDate = getJD(date);
  }

  _createClass(Sun, {
    solarNoon: {
      get: function () {
        return calcSolNoon(this.julianDate, this.longitude, this.date);
      }
    },
    timeAtAngle: {
      value: function timeAtAngle(angle, rising) {
        return calcSunriseSet(rising, angle, this.julianDate, this.date, this.latitude, this.longitude);
      }
    }
  });

  return Sun;
})();

var formatDate = function formatDate(date, minutes) {
  var seconds = (minutes - Math.floor(minutes)) * 60;
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, minutes, seconds));
};

function calcTimeJulianCent(jd) {
  var T = (jd - 2451545) / 36525;
  return T;
}

function isLeapYear(yr) {
  return yr % 4 === 0 && yr % 100 !== 0 || yr % 400 === 0;
}

function calcDoyFromJD(jd) {
  var z = Math.floor(jd + 0.5);
  var f = jd + 0.5 - z;
  var A;
  if (z < 2299161) {
    A = z;
  } else {
    var alpha = Math.floor((z - 1867216.25) / 36524.25);
    A = z + 1 + alpha - Math.floor(alpha / 4);
  }
  var B = A + 1524;
  var C = Math.floor((B - 122.1) / 365.25);
  var D = Math.floor(365.25 * C);
  var E = Math.floor((B - D) / 30.6001);
  var day = B - D - Math.floor(30.6001 * E) + f;
  var month = E < 14 ? E - 1 : E - 13;
  var year = month > 2 ? C - 4716 : C - 4715;

  var k = isLeapYear(year) ? 1 : 2;
  var doy = Math.floor(275 * month / 9) - k * Math.floor((month + 9) / 12) + day - 30;
  return doy;
}

function radToDeg(angleRad) {
  return 180 * angleRad / Math.PI;
}

function degToRad(angleDeg) {
  return Math.PI * angleDeg / 180;
}

function calcGeomMeanLongSun(t) {
  var L0 = 280.46646 + t * (36000.76983 + t * 0.0003032);
  while (L0 > 360) {
    L0 -= 360;
  }
  while (L0 < 0) {
    L0 += 360;
  }
  return L0; // in degrees
}

function calcGeomMeanAnomalySun(t) {
  var M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  return M; // in degrees
}

function calcEccentricityEarthOrbit(t) {
  var e = 0.016708634 - t * (0.000042037 + 1.267e-7 * t);
  return e; // unitless
}

function calcSunEqOfCenter(t) {
  var m = calcGeomMeanAnomalySun(t);
  var mrad = degToRad(m);
  var sinm = Math.sin(mrad);
  var sin2m = Math.sin(mrad + mrad);
  var sin3m = Math.sin(mrad + mrad + mrad);
  var C = sinm * (1.914602 - t * (0.004817 + 0.000014 * t)) + sin2m * (0.019993 - 0.000101 * t) + sin3m * 0.000289;
  return C; // in degrees
}

function calcSunTrueLong(t) {
  var l0 = calcGeomMeanLongSun(t);
  var c = calcSunEqOfCenter(t);
  var O = l0 + c;
  return O; // in degrees
}

function calcSunApparentLong(t) {
  var o = calcSunTrueLong(t);
  var omega = 125.04 - 1934.136 * t;
  var lambda = o - 0.00569 - 0.00478 * Math.sin(degToRad(omega));
  return lambda; // in degrees
}

function calcMeanObliquityOfEcliptic(t) {
  var seconds = 21.448 - t * (46.815 + t * (0.00059 - t * 0.001813));
  var e0 = 23 + (26 + seconds / 60) / 60;
  return e0; // in degrees
}

function calcObliquityCorrection(t) {
  var e0 = calcMeanObliquityOfEcliptic(t);
  var omega = 125.04 - 1934.136 * t;
  var e = e0 + 0.00256 * Math.cos(degToRad(omega));
  return e; // in degrees
}

function calcSunDeclination(t) {
  var e = calcObliquityCorrection(t);
  var lambda = calcSunApparentLong(t);

  var sint = Math.sin(degToRad(e)) * Math.sin(degToRad(lambda));
  var theta = radToDeg(Math.asin(sint));
  return theta; // in degrees
}

function calcEquationOfTime(t) {
  var epsilon = calcObliquityCorrection(t);
  var l0 = calcGeomMeanLongSun(t);
  var e = calcEccentricityEarthOrbit(t);
  var m = calcGeomMeanAnomalySun(t);

  var y = Math.tan(degToRad(epsilon) / 2);
  y *= y;

  var sin2l0 = Math.sin(2 * degToRad(l0));
  var sinm = Math.sin(degToRad(m));
  var cos2l0 = Math.cos(2 * degToRad(l0));
  var sin4l0 = Math.sin(4 * degToRad(l0));
  var sin2m = Math.sin(2 * degToRad(m));

  var Etime = y * sin2l0 - 2 * e * sinm + 4 * e * y * sinm * cos2l0 - 0.5 * y * y * sin4l0 - 1.25 * e * e * sin2m;
  return radToDeg(Etime) * 4; // in minutes of time
}

function calcHourAngle(angle, lat, solarDec) {
  var latRad = degToRad(lat);
  var sdRad = degToRad(solarDec);
  var HAarg = Math.cos(degToRad(90 + angle)) / (Math.cos(latRad) * Math.cos(sdRad)) - Math.tan(latRad) * Math.tan(sdRad);
  var HA = Math.acos(HAarg);
  return HA; // in radians (for sunset, use -HA)
}

function isNumber(inputVal) {
  var oneDecimal = false;
  var inputStr = "" + inputVal;
  for (var i = 0; i < inputStr.length; i++) {
    var oneChar = inputStr.charAt(i);
    if (i === 0 && (oneChar === "-" || oneChar === "+")) {
      continue;
    }
    if (oneChar === "." && !oneDecimal) {
      oneDecimal = true;
      continue;
    }
    if (oneChar < "0" || oneChar > "9") {
      return false;
    }
  }
  return true;
}

function getJD(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  var A = Math.floor(year / 100);
  var B = 2 - A + Math.floor(A / 4);
  var JD = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
  return JD;
}

function calcSolNoon(jd, longitude, date) {
  var tnoon = calcTimeJulianCent(jd - longitude / 360);
  var eqTime = calcEquationOfTime(tnoon);
  var solNoonOffset = 720 - longitude * 4 - eqTime; // in minutes
  var newt = calcTimeJulianCent(jd + solNoonOffset / 1440);
  eqTime = calcEquationOfTime(newt);
  var solNoonLocal = 720 - longitude * 4 - eqTime; // in minutes
  while (solNoonLocal < 0) {
    solNoonLocal += 1440;
  }
  while (solNoonLocal >= 1440) {
    solNoonLocal -= 1440;
  }
  return formatDate(date, solNoonLocal);
  // return timeString(solNoonLocal, 3);
}

function dayString(jd) {
  if (jd < 900000 || jd > 2817000) {
    return "error";
  } else {
    var z = Math.floor(jd + 0.5);
    var f = jd + 0.5 - z;
    var A;
    if (z < 2299161) {
      A = z;
    } else {
      var alpha = Math.floor((z - 1867216.25) / 36524.25);
      A = z + 1 + alpha - Math.floor(alpha / 4);
    }
    var B = A + 1524;
    var C = Math.floor((B - 122.1) / 365.25);
    var D = Math.floor(365.25 * C);
    var E = Math.floor((B - D) / 30.6001);
    var day = B - D - Math.floor(30.6001 * E) + f;
    var month = E < 14 ? E - 1 : E - 13;
    var year = month > 2 ? C - 4716 : C - 4715;
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  }
}

function calcSunriseSetUTC(rise, angle, JD, latitude, longitude) {
  var t = calcTimeJulianCent(JD);
  var eqTime = calcEquationOfTime(t);
  var solarDec = calcSunDeclination(t);
  var hourAngle = calcHourAngle(angle, latitude, solarDec);
  //alert("HA = " + radToDeg(hourAngle));
  if (!rise) hourAngle = -hourAngle;
  var delta = longitude + radToDeg(hourAngle);
  var timeUTC = 720 - 4 * delta - eqTime; // in minutes
  return timeUTC;
}

function calcSunriseSet(rise, angle, JD, date, latitude, longitude)
// rise = 1 for sunrise, 0 for sunset
{
  var timeUTC = calcSunriseSetUTC(rise, angle, JD, latitude, longitude);
  var newTimeUTC = calcSunriseSetUTC(rise, angle, JD + timeUTC / 1440, latitude, longitude);
  if (isNumber(newTimeUTC)) {

    return formatDate(date, newTimeUTC);
  } else {
    // no sunrise/set found
    var doy = calcDoyFromJD(JD);
    var jdy;
    if (latitude > 66.4 && doy > 79 && doy < 267 || latitude < -66.4 && (doy < 83 || doy > 263)) {
      //previous sunrise/next sunset
      jdy = calcJDofNextPrevRiseSet(!rise, rise, angle, JD, latitude, longitude);
      return dayString(jdy);
    } else {
      //previous sunset/next sunrise
      jdy = calcJDofNextPrevRiseSet(rise, rise, angle, JD, latitude, longitude);
      return dayString(jdy);
    }
  }
}

function calcJDofNextPrevRiseSet(next, rise, type, JD, latitude, longitude) {
  var julianday = JD;
  var increment = next ? 1 : -1;

  var time = calcSunriseSetUTC(rise, type, julianday, latitude, longitude);
  while (!isNumber(time)) {
    julianday += increment;
    time = calcSunriseSetUTC(rise, type, julianday, latitude, longitude);
  }

  return julianday;
}

module.exports = Sun;
},{}],15:[function(require,module,exports){
/*
	Hebcal - A Jewish Calendar Generator
	Copyright (C) 1994-2004  Danny Sadinoff
	Portions Copyright (c) 2002 Michael J. Radwin. All Rights Reserved.

	https://github.com/hebcal/hebcal-js

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program. If not, see <http://www.gnu.org/licenses/>.

	Danny Sadinoff can be reached at danny@sadinoff.com

	Michael Radwin has made significant contributions as a result of
	maintaining hebcal.com.

	The JavaScript code was completely rewritten in 2014 by Eyal Schachter.
 */
/*
 * Many of the following algorithms were taken from hebrew calendar
 * routines by Maimonedes, from his Mishneh Torah, and implemented by
 *  Nachum Dershowitz                Department of Computer Science
 *  (217) 333-4219                   University of Illinois at Urbana-Champaign
 *  nachum@cs.uiuc.edu               1304 West Springfield Avenue
 *                                   Urbana, Illinois 61801
 *
 * The routines were included in the emacs 19 distribution.
 *
 */
var c = require('./common'), HDate = require('./hdate');

var concat = 'concat', range = c.range; // for client optimization

var INCOMPLETE = 0,
	REGULAR = 1,
	COMPLETE = 2;

function Sedra(hebYr, il) { // the Hebrew year
	il = !!il;
	var long_c = c.lngChesh(hebYr);
	var short_k = c.shrtKis(hebYr);
	var type;
	this.year = hebYr;
	if (long_c && !short_k) {
		type = COMPLETE;
	} else if (!long_c && short_k) {
		type = INCOMPLETE;
	} else {
		type = REGULAR;
	}

	var rosh_hashana = new HDate(1, c.months.TISHREI, hebYr).abs();
	var rosh_hashana_day = (rosh_hashana % 7) + 1;

	// find the first Saturday on or after Rosh Hashana
	this.first_saturday = c.dayOnOrBefore(6, rosh_hashana + 6);
	var leap = +c.LEAP(hebYr);
	this.type = type;
	this.rosh_hashana_day = rosh_hashana_day;
	this.leap = leap;
	this.il = il;

	var core = "" + leap + rosh_hashana_day + type;
	if (types[core]) {
		this.theSedraArray = types[core];
	} else {
		this.theSedraArray = types[core + (+il)]; // cast to num, then concat
	}

	if (!this.theSedraArray) {
		console.log(this);
		throw new TypeError("improper sedra year type calculated.");
	}
}

var parshiot = Sedra.parshiot = [
	[ 'Bereshit', 'Bereshis', 'בראשית' ], // 0
	[ 'Noach', 0, 'נח' ],
	[ 'Lech-Lecha', 0, 'לך-לך' ],
	[ 'Vayera', 0, 'וירא' ],
	[ 'Chayei Sara', 0, 'חי שרה' ],
	[ 'Toldot', 'Toldos', 'תולדות' ],
	[ 'Vayetzei', 0, 'ויצא' ],
	[ 'Vayishlach', 0, 'וישלח' ],
	[ 'Vayeshev', 0, 'וישב' ],
	[ 'Miketz', 0, 'מקץ' ],
	[ 'Vayigash', 0, 'ויגש' ], // 10
	[ 'Vayechi', 0, 'ויחי' ],
	[ 'Shemot', 'Shemos', 'שמות' ],
	[ 'Vaera', 0, 'וארא' ],
	[ 'Bo', 0, 'בא' ],
	[ 'Beshalach', 0, 'בשלח' ],
	[ 'Yitro', 'Yisro', 'יתרו' ],
	[ 'Mishpatim', 0, 'משפטים' ],
	[ 'Terumah', 0, 'תרומה' ],
	[ 'Tetzaveh', 0, 'תצוה' ],
	[ 'Ki Tisa', 'Ki Sisa', 'כי תשא' ], // 20
	[ 'Vayakhel', 0, 'ויקהל' ],
	[ 'Pekudei', 0, 'פקודי' ],
	[ 'Vayikra', 0, 'ויקרא' ],
	[ 'Tzav', 0, 'צו' ],
	[ 'Shmini', 0, 'שמיני' ],
	[ 'Tazria', 0, 'תזריע' ],
	[ 'Metzora', 0, 'מצרע' ],
	[ 'Achrei Mot', 'Achrei Mos', 'אחרי מות' ],
	[ 'Kedoshim', 0, 'קדשים' ],
	[ 'Emor', 0, 'אמור' ], // 30
	[ 'Behar', 0, 'בהר' ],
	[ 'Bechukotai', 'Bechukosai', 'בחקתי' ],
	[ 'Bamidbar', 0, 'במדבר' ],
	[ 'Nasso', 0, 'נשא' ],
	[ 'Beha\'alotcha', 'Beha\'aloscha', 'בהעלתך' ],
	[ 'Sh\'lach', 0, 'שלח לך' ],
	[ 'Korach', 0, 'קורח' ],
	[ 'Chukat', 'Chukas', 'חקת' ],
	[ 'Balak', 0, 'בלק' ],
	[ 'Pinchas', 0, 'פינחס' ], // 40
	[ 'Matot', 'Matos', 'מטות' ],
	[ 'Masei', 0, 'מסעי' ],
	[ 'Devarim', 0, 'דברים' ],
	[ 'Vaetchanan', 'V\'eschanan', 'ואתחנן' ],
	[ 'Eikev', 0, 'עקב' ],
	[ 'Re\'eh', 0, 'ראה' ],
	[ 'Shoftim', 0, 'שופטים' ],
	[ 'Ki Teitzei', 'Ki Seitzei', 'כי תצא' ],
	[ 'Ki Tavo', 'Ki Savo', 'כי תבוא' ],
	[ 'Nitzavim', 0, 'נצבים' ], // 50
	[ 'Vayeilech', 0, 'וילך' ],
	[ 'Ha\'Azinu', 0, 'האזינו' ]
];


// parsha doubler/undoubler
function D(p) {
	return -p;
}

// these are wrapped to protect them from [].concat()
var RH = [[ 'Rosh Hashana', 0, 'ראש השנה' ]]; //0
var YK = [[ 'Yom Kippur', 0, 'יום כיפור' ]];  //1

var SUKKOT = [[ 'Sukkot', 'Succos', 'סוכות' ]];  //0
var CHMSUKOT = [[ 'Chol hamoed Sukkot', 'Chol hamoed Succos', 'חול המועד סוכות' ]];  //0
var SHMINI = [[ 'Shmini Atzeret', 'Shmini Atzeres', 'שמיני עצרת' ]];  //0
var EOY = [[ 'End-of-Year: Simchat-Torah, Sukkot', 'End-of-Year: Simchas-Torah, Succos', 'סופשנה: סוכות וסמחת תורה' ]];  //0

var PESACH = [[ 'Pesach', 0, 'פסח' ]]; //25
var CHMPESACH = [[ 'Chol hamoed Pesach', 0, 'חול המועד פסח' ]];  //25
var PESACH7 = [[ 'Second days of Pesach', 0, 'שביעי של פסח' ]]; //25

var SHAVUOT = [[ 'Shavuot', 'Shavuos', 'שבועות' ]]; //33



// The ordinary year types (keviot)

// names are leap/nonleap - day - incomplete/regular/complete - diaspora/Israel

var types = {

	/* Hebrew year that starts on Monday, is `incomplete' (Heshvan and
	 * Kislev each have 29 days), and has Passover start on Tuesday. */
	//e.g. 5753
	'020' : [51, 52][concat](EOY, range(0, 20), D(21), 23, 24, PESACH, 25,
		D(26), D(28), 30, D(31), range(33, 40), D(41), range(43, 49), D(50)
	),

	/* Hebrew year that starts on Monday, is `complete' (Heshvan and
	 * Kislev each have 30 days), and has Passover start on Thursday. */
	//e.g. 5756
	'0220' : [51, 52][concat](EOY, range(0, 20), D(21), 23, 24, PESACH, 25, D(26), D(28),
		30, D(31), 33, SHAVUOT, range(34, 37), D(38), 40, D(41), range(43, 49), D(50)
	),

	/* Hebrew year that starts on Thursday, is `regular' (Heshvan has 29
	 * days and Kislev has 30 days), and has Passover start on Saturday. */
	//e.g. 5701
	'0510' : [52][concat](YK, EOY, range(0, 20), D(21), 23, 24, PESACH, PESACH,
		25, D(26), D(28), 30, D(31), range(33, 40), D(41), range(43, 50)
	),

	/* Hebrew year that starts on Thursday, is `regular' (Heshvan has 29
	 * days and Kislev has 30 days), and has Passover start on Saturday. */
	// e.g. 5745
	'0511' : [52][concat](YK, EOY, range(0, 20), D(21), 23, 24, PESACH,
		25, D(26), D(28), range(30, 40), D(41), range(43, 50)
	),

	/* Hebrew year that starts on Thursday, is `complete' (Heshvan and
	 * Kislev each have 30 days), and has Passover start on Sunday. */
	//e.g. 5754
	'052' : [52][concat](YK, CHMSUKOT, range(0, 24), PESACH7, 25, D(26),
		D(28), 30, D(31), range(33, 40), D(41), range(43, 50)
	),

	/* Hebrew year that starts on Saturday, is `incomplete' (Heshvan and Kislev
	 * each have 29 days), and has Passover start on Sunday. */
	//e.g. 5761
	'070' : [][concat](RH, 52, SUKKOT, SHMINI, range(0, 20), D(21), 23, 24, PESACH7,
		25, D(26), D(28), 30, D(31), range(33, 40), D(41), range(43, 50)
	),


	/* Hebrew year that starts on Saturday, is `complete' (Heshvan and
	 * Kislev each have 30 days), and has Passover start on Tuesday. */
	//e.g. 5716
	'072' : [][concat](RH, 52, SUKKOT, SHMINI, range(0, 20), D(21), 23, 24, CHMPESACH, 25,
		D(26), D(28), 30, D(31), range(33, 40), D(41), range(43, 49), D(50)
	),


	/* --  The leap year types (keviot) -- */
	/* Hebrew year that starts on Monday, is `incomplete' (Heshvan and
	 * Kislev each have 29 days), and has Passover start on Thursday. */
	//e.g. 5746
	'1200' : [51, 52][concat](CHMSUKOT, range(0, 27), CHMPESACH, range(28, 33),
		SHAVUOT, range(34, 37), D(38), 40, D(41), range(43, 49), D(50)
	),

	/* Hebrew year that starts on Monday, is `incomplete' (Heshvan and
	 * Kislev each have 29 days), and has Passover start on Thursday. */
	//e.g. 5746
	'1201' : [51, 52][concat](CHMSUKOT, range(0, 27), CHMPESACH,
		range(28, 40), D(41), range(43, 49), D(50)
	),

	/* Hebrew year that starts on Monday, is `complete' (Heshvan and
	 * Kislev each have 30 days), and has Passover start on Saturday. */
	//e.g.5752
	'1220' : [51, 52][concat](CHMSUKOT, range(0, 27), PESACH,
		PESACH, range(28, 40), D(41), range(43, 50)
	),

	/* Hebrew year that starts on Monday, is `complete' (Heshvan and
	 * Kislev each have 30 days), and has Passover start on Saturday. */
	//e.g.5752
	'1221' : [51, 52][concat](CHMSUKOT, range(0, 27), PESACH, range(28, 50)),

	/* Hebrew year that starts on Thursday, is `incomplete' (Heshvan and
	 * Kislev both have 29 days), and has Passover start on Sunday. */
	//e.g. 5768
	'150' : [52][concat](YK, CHMSUKOT, range(0, 28), PESACH7, range(29, 50)),

	/* Hebrew year that starts on Thursday, is `complete' (Heshvan and
	 * Kislev both have 30 days), and has Passover start on Tuesday. */
	//eg. 5771
	'152' : [52][concat](YK, CHMSUKOT, range(0, 28), CHMPESACH, range(29, 49), D(50)),

	/* Hebrew year that starts on Saturday, is `incomplete' (Heshvan and
	 * Kislev each have 29 days), and has Passover start on Tuesday. */
	//e.g.5757
	'170' : [][concat](RH, 52, SUKKOT, SHMINI, range(0, 27), CHMPESACH,
		range(28, 40), D(41), range(43, 49), D(50)
	),

	/* Hebrew year that starts on Saturday, is `complete' (Heshvan and
	 * Kislev each have 30 days), and has Passover start on Thursday. */
	'1720' : [][concat](RH, 52, SUKKOT, SHMINI, range(0, 27), CHMPESACH, range(28, 33),
		SHAVUOT, range(34, 37), D(38), 40, D(41), range(43, 49), D(50)
	)
};

/* Hebrew year that starts on Monday, is `complete' (Heshvan and
 * Kislev each have 30 days), and has Passover start on Thursday. */
types['0221'] = types['020'];

/* Hebrew year that starts on Tuesday, is `regular' (Heshvan has 29
 * days and Kislev has 30 days), and has Passover start on Thursday. */
//e.g. 5715
types['0310'] = types['0220'];

/* Hebrew year that starts on Tuesday, is `regular' (Heshvan has 29
 * days and Kislev has 30 days), and has Passover start on Thursday. */
types['0311'] = types['020'];

/* Hebrew year that starts on Tuesday, is `regular' (Heshvan has 29
 * days and Kislev has 30 days), and has Passover start on Saturday. */
// e.g. 5715
types['1310'] = types['1220'];
/* Hebrew year that starts on Tuesday, is `regular' (Heshvan has 29
 * days and Kislev has 30 days), and has Passover start on Saturday. */
types['1311'] = types['1221'];

/* Hebrew year that starts on Saturday, is `complete' (Heshvan and
 * Kislev each have 30 days), and has Passover start on Thursday. */
types['1721'] = types['170'];


Sedra.prototype.get = function(hDate) {
	return abs(this, hDate.abs());
};

// returns an array describing the parsha on the first Saturday on or after absdate
function abs(year, absDate) {

	// find the first saturday on or after today's date
	absDate = c.dayOnOrBefore(6, absDate + 6);

	var weekNum = (absDate - year.first_saturday) / 7;
	var index = year.theSedraArray[weekNum];

	if (undefined === index) {
		return abs(new Sedra(year.year + 1, year.il), absDate); // must be next year
	}
	if (typeof index == 'object') {
		// Shabbat has a chag. Return a description
		return [index];
	}
	if (index >= 0) {
		return [parshiot[index]];
	}

	index = D(index); // undouble the parsha
	return [parshiot[index], parshiot[index + 1]];
}

module.exports = Sedra;

},{"./common":3,"./hdate":6}]},{},[2])
//# sourceMappingURL=hebcal.noloc.js.map
