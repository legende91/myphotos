/*
jQuery.extend(jQuery.validator.messages, {
    required: "Ce champs est obligatoire.",
    remote: "Please fix this field.",
    email: "Veuillez renseigner une adresse email valide.",
    url: "Please enter a valid URL.",
    date: "Please enter a valid date.",
    dateISO: "Please enter a valid date (ISO).",
    number: "Please enter a valid number.",
    digits: "Please enter only digits.",
    creditcard: "Please enter a valid credit card number.",
    equalTo: "Les mots de passe ne sont pas identiques.",
    accept: "Please enter a value with a valid extension.",
    maxlength: jQuery.validator.format("Please enter no more than {0} characters."),
    minlength: jQuery.validator.format("Please enter at least {0} characters."),
    rangelength: jQuery.validator.format("Please enter a value between {0} and {1} characters long."),
    range: jQuery.validator.format("Please enter a value between {0} and {1}."),
    max: jQuery.validator.format("Please enter a value less than or equal to {0}."),
    min: jQuery.validator.format("Please enter a value greater than or equal to {0}.")
});

moment.lang('fr', {
	    months : "janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre".split("_"),
	    monthsShort : "janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.".split("_"),
	    weekdays : "dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),
	    weekdaysShort : "dim._lun._mar._mer._jeu._ven._sam.".split("_"),
	    weekdaysMin : "Di_Lu_Ma_Me_Je_Ve_Sa".split("_"),
	    longDateFormat : {
	        LT : "HH:mm",
	        L : "DD/MM/YYYY",
	        LL : "D MMMM YYYY",
	        LLL : "D MMMM YYYY LT",
	        LLLL : "dddd D MMMM YYYY LT"
	    },
	    calendar : {
	        sameDay: "[Aujourd'hui] à LT",
	        nextDay: '[Demain à] LT',
	        nextWeek: 'dddd',
	        lastDay: '[Hier] à LT',
	        lastWeek: 'dddd [dernier] à LT',
	        sameElse: 'L'
	    },
	    relativeTime : {
	        future : "dans %s",
	        past : "il y a %s",
	        s : "quelques secondes",
	        m : "une minute",
	        mm : "%d minutes",
	        h : "une heure",
	        hh : "%d heures",
	        d : "un jour",
	        dd : "%d jours",
	        M : "un mois",
	        MM : "%d mois",
	        y : "une année",
	        yy : "%d années"
	    },
	    ordinal : function (number) {
	        return number + (number === 1 ? 'er' : 'ème');
	    },
	    week : {
	        dow : 1, // Monday is the first day of the week.
	        doy : 4  // The week that contains Jan 4th is the first week of the year.
	    }
	});
*/
var my = new function () {
	var _ERROR_   = 0,
		_WARNING_ = 1,
		_NOTICE_  = 2,
		_LOG_     = 3,
		_DEBUG_   = 4;
	
	this.loglevel = 4;

	this.error = function (message, url) {
		if (this.loglevel >= _ERROR_) {
			var args = Array.prototype.slice.call(arguments);
			console.error (message);
			gallery.push ('messages', {
				type: 'danger',
				message: message
			});
		}
	};

	this.warn = function (message, url) {
		if (this.loglevel >= _WARNING_) {
			var args = Array.prototype.slice.call(arguments);
			console.warn (message);
			//notify (message, 'Attention', null, url);
		}
	};

	this.info = function (message, url) {
		if (this.loglevel >= _NOTICE_) {
			var args = Array.prototype.slice.call(arguments);
			console.info (message);
			gallery.push ('messages', {
				type: 'success',
				message: message
			});
		}
	};

	this.log = function () {
		if (this.loglevel >= _LOG_) {
			console.log.apply (console, Array.prototype.slice.call(arguments));
		}
	};

	this.debug = function () {
		if (this.loglevel >= _DEBUG_) {
			console.debug.apply (console, Array.prototype.slice.call(arguments));
		}
	};

		this.get = function (args) {
		var url = args.url,
			data = args.data,
			success = args.success,
			ferror = args.error,
			timeout = typeof (args.timeout) === 'undefined'?5000:args.timeout;
		my.log ('	calling "'+url+'" with parameters '+JSON.stringify (data)+'...');
		$.ajax({
			url: url,
			data: data,
			timeout: 5000,
			success: function(sresponse) {
				// $.mobile.loading('hide');
				var response, error, message;
				//my.log ('sresponse :', sresponse);
				try {
					response = JSON.parse(sresponse);
					error = response.error;
					message = response.message;
				} catch (e) {
					error = true;
					var tmp = document.createElement("DIV");  // strip html tags
					tmp.innerHTML = sresponse; 				  // strip html tags
					message = tmp.textContent||tmp.innerText; // strip html tags
				}
				if (error) {
					my.error ('Error '+error+' from '+url+': '+message);
					if (typeof(ferror) == 'function') {
						ferror();
					}
					return false;
				}
				my.log ('	response from '+url+':', message);
				if (typeof(success) == 'function')
					success(message);
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) { 
				// $.mobile.loading('hide');
				console.warn ('Warning '+XMLHttpRequest.status+' from '+url+': ', textStatus+';'+XMLHttpRequest.responseText+';'+errorThrown);
				if (typeof(ferror) == 'function')
					ferror();
			}
		});
	};
} ();

function getUrlVars(url) {
    var vars = {};
    var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
};

function get(fieldname) {
    value = localStorage.getItem(fieldname);
    return value;
}

function set(fieldname, value) {    
    try {
        localStorage.setItem(fieldname, typeof value==="undefined"?"":value);
    } 
    catch (e) {
        if (e == QUOTA_EXCEEDED_ERR)
            alert("Error: Local Storage limit exceeds.");
        else
            alert("Error: Saving to local storage.");
    }
}

function unset (fieldname) {
    localStorage.removeItem(fieldname);
}

function getObjects (collection) {
	var json=get(collection);
	return json && JSON.parse(json) || [];
}

function setObjects (collection, objects) {
	my.debug ('setting objects for', collection);
	set(collection, JSON.stringify(typeof objects === "undefined"?[]:objects));
}

function getObject (collection, id) {
	my.debug ('retrieving object "'+id+'" from "'+collection+'" in localStorage...');
	var objects = getObjects (collection);
	return objects[id];
}

function addObject (collection, object) {
	my.debug ('adding item to "'+collection+'" in localStorage...');
	var objects = getObjects (collection);
	if (objects)
		objects.push(object);
	else
		objects = [object];
	setObjects (collection, objects);
	my.debug ('	item added successfuly');
	set ('localversion', moment().format('YYYY-MM-DD HH:mm:ss'));
	sync ();
}

function editObject (collection, index, object) {
	my.debug ('updating item id', index, 'with', object, 'from', collection, 'in localStorage...');
	objects = getObjects (collection);
	objects[index] = object;
	setObjects (collection, objects);
	my.debug ('	item updated succesfuly');
	set ('localversion', moment().format('YYYY-MM-DD HH:mm:ss'));
	sync ();
}

function moveObject (collection, old_index, new_index) {
	var objects = getObjects (collection);
	objects.move (old_index, new_index);
	setObjects (collection, objects);
	set ('localversion', moment().format('YYYY-MM-DD HH:mm:ss'));
	sync ();
}

function removeObject (collection, index) {
	my.debug ('removing item "'+index+'" from '+collection+' localStorage...');
	var objects = getObjects (collection);
	objects.splice (index, 1);
	setObjects (collection, objects);
	my.debug ('	item removed successfuly');
	set ('localversion', moment().format('YYYY-MM-DD HH:mm:ss'));
	sync ();
}