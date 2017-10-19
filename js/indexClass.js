var app = new Application().init();

function Application(){
	var options = {
		tabBV : [0,102,204],
		tabR : [0,51,102,153,204,255],
		nbCol : 5
	};

	this.init = function(){
		var palette1 = new PremierePalette();
		palette1.init();

		var palette2 = new DeuxiemePalette();
		var s = new Evenements(palette1,palette2);
		s.initEventPalette();
	}




	function Palette(){
		this.tableauCouleur = [];
	}

	function PremierePalette(){
		this.container = $("div.palette");
		this.selected = [];
		this.inputCouleur = $("div.couleursSelectionnes input");
		this.tabBV = options.tabBV;
		this.tabR = options.tabR;

		$(this.inputCouleur).val("");

		this.init = function(){
			var nb = 1;
			for(var k in this.tabR){
				var divRow = document.createElement("div");
				divRow.className = "row";
				for(var j in this.tabBV){
					for(var i in this.tabBV){
						var col = new Couleur(this.tabR[k],this.tabBV[j],this.tabBV[i],nb);
						var divColor = col.toDOM();

						divRow.appendChild(divColor);
						this.container.append(divRow);

						this.tableauCouleur.push(col);
						nb++;
					}
				}
			}
		}

		this.testDeuxSelectionne = function(){
			return this.selected[0] != null && this.selected[1] != null;
 		}
	}
	PremierePalette.prototype = new Palette;

	function DeuxiemePalette(){
		this.container = $("div.autrePalette");
		this.nbCol = options.nbCol;
		this.inputNbCol = $("input#nbCol");
		this.rgb = true;
		this.switch = $("div.divSlider input");
		this.p = $("div.deuxieme-partie p");
		this.divRow = "div.autrePalette > div";

		this.switch[0].checked = true;
		document.querySelector("input#nbCol").value = this.nbCol;

		this.init = function(selected){
			this.p[0].style.visibility = "visible";

			if(this.rgb){
				var res = this.interpolationRGB(selected[0],selected[1]);
			}
			else{
				var res = this.interpolationHSV(selected[0],selected[1]);
			}
			this.tableauCouleur.push(res);
			this.createTableInter(res);
		}

		this.interpolationRGB = function(color1,color2){
			var array = [];
			for(var i=1; i<this.nbCol+1;i++){
					var resR = this.calculInterpolation(color1.r, color2.r, i, 0, this.nbCol+1);
					var resV = this.calculInterpolation(color1.g, color2.g, i, 0, this.nbCol+1);
					var resB = this.calculInterpolation(color1.b, color2.b, i, 0, this.nbCol+1);
					var res = new Couleur(Math.round(resR), Math.round(resV), Math.round(resB));
					array.push(res);
			}
			return array;
		}

		this.interpolationHSV = function(color1,color2){
			color1.toHSV();
			color2.toHSV();

			var s = this.moyenne(color1.s,color2.s);
			var v = this.moyenne(color1.v,color2.v);
			var array = [];
			for(var i=1; i<this.nbCol+1;i++){
				var h = this.calculInterpolation(color1.h, color2.h, i, 0, this.nbCol+1)
				var resultat = new Couleur(null,null,null,null,h,s,v);
				resultat.toRGB();
				array.push(resultat);
			}
			return array;
		}

		this.moyenne = function(val1, val2){
			return (val1 + val2) / 2;
		}

		this.calculInterpolation = function (couleur1, couleur2, n, min, max){
			return couleur1 + (n-min) * ((couleur2-couleur1)/(max-min));
		}

		this.createTableInter = function(array){
			var divs = document.querySelectorAll(this.divRow);
			if(divs.length > 7){
				var state = this;
				$(divs[0]).slideUp(400, function(){
					$(divs[0]).remove();
					state.tableInter(array);
				});
			}
			else{
				this.tableInter(array);
			}
			this.createMatrice(array);
		}

		this.tableInter = function(array){
			var div = document.createElement("div");
			div.className = "rowInvert";
			for(var i in array){
				var col = array[i].toDOM();
				div.appendChild(col);
			}
			$(div).hide();
			this.container.append(div);
			$(div).slideDown(1000);
		}

		this.createMatrice = function (array){
			var tbody = document.querySelector("tbody");
			$(tbody).html("");
			for(var i in array){
				for(var j in array){
					if(i != j && array[i].calculContraste(array[j])){
						// On créé une nouvelle ligne
						var tr = document.createElement("tr");
						var td1 = document.createElement("td");
						var col = array[i].toDOM();
						var p = document.createElement("span");
						p.appendChild(document.createTextNode("rgb(" + array[i].r + "," +  array[i].g + "," +  array[i].b + ")"));
						td1.appendChild(col);
						td1.appendChild(p);

						var td2 = document.createElement("td");
						col = array[j].toDOM();
						p = document.createElement("span");
						p.appendChild(document.createTextNode("rgb(" + array[j].r + "," +  array[j].g + "," +  array[j].b + ")"));
						td2.appendChild(col);
						td2.appendChild(p);

						tr.appendChild(td1);
						tr.appendChild(td2);

						tbody.appendChild(tr);
					}
				}
			}
		}

	}
	DeuxiemePalette.prototype = new Palette;

	function Couleur(rouge,vert,bleu,nb,h,s,v){
		this.r = rouge || 0;
		this.g = vert || 0;
		this.b = bleu || 0;
		this.DOM = null;
		this.nb = nb || null;
		this.h = h || null;
		this.s = s || null;
		this.v = v || null;

		this.toDOM = function(){
			var col = document.createElement("div");
			$(col).toggleClass("caseCouleur");
			col.style.backgroundColor = "rgb(" + this.r + "," +  this.g + "," +  this.b + ")";
			if(this.nb != null){
				col.setAttribute("nb", this.nb);
			}
			this.DOM = col;
			return col;
		}

		this.brightness = function(){
			return ((this.r * 299) + (this.g * 587) + (this.b * 114)) / 1000;
		}

		this.colorDiff = function(obj){
			return ((Math.max(this.r,obj.r) - Math.min(this.r,obj.r)) + (Math.max(this.g,obj.g) - Math.min(this.g,obj.g)) + (Math.max(this.b,obj.b) - Math.min(this.b,obj.b)));
		}

		this.calculContraste = function(obj){
			var brightnessColor1 = this.brightness();
			var brightnessColor2 = obj.brightness();
			if((brightnessColor1 - brightnessColor2) > 125){
				if(this.colorDiff(obj) > 500){
					return true;
				}
			}
			return false;
		}

		this.toHSV = function(){
			var rr, gg, bb,
	        r = this.r / 255,
	        g = this.g / 255,
	        b = this.b / 255,
	        h, s,
	        v = Math.max(r, g, b),
	        diff = v - Math.min(r, g, b),
	        diffc = function(c){
	            return (v - c) / 6 / diff + 1 / 2;
	        };

		    if (diff == 0) {
		        h = s = 0;
		    } else {
		        s = diff / v;
		        rr = diffc(r);
		        gg = diffc(g);
		        bb = diffc(b);

		        if (r === v) {
		            h = bb - gg;
		        }else if (g === v) {
		            h = (1 / 3) + rr - bb;
		        }else if (b === v) {
		            h = (2 / 3) + gg - rr;
		        }
		        if (h < 0) {
		            h += 1;
		        }else if (h > 1) {
		            h -= 1;
		        }
		    }

		    this.h = Math.round(h * 360);
		    this.s = Math.round(s * 100);
		    this.v = Math.round(v * 100);
		}

		this.toRGB = function(){
			var h = this.h / 360;
			var s = this.s / 100;
			var v = this.v / 100;
			var r, g, b, i, f, p, q, t;
		    i = Math.floor(h * 6);
		    f = h * 6 - i;
		    p = v * (1 - s);
		    q = v * (1 - f * s);
		    t = v * (1 - (1 - f) * s);
		    switch (i % 6) {
		        case 0: r = v, g = t, b = p; break;
		        case 1: r = q, g = v, b = p; break;
		        case 2: r = p, g = v, b = t; break;
		        case 3: r = p, g = q, b = v; break;
		        case 4: r = t, g = p, b = v; break;
		        case 5: r = v, g = p, b = q; break;
		    }
		    this.r =  Math.round(r * 255);
			this.g  = Math.round(g * 255);
		    this.b = Math.round(b * 255);
		}

	}

	function Evenements(palette1, palette2){
		this.premierePalette = palette1;
		this.deuxiemePalette = palette2;

		var eventThis = this;

		this.deuxiemePalette.inputNbCol.on("change",function(){
			eventThis.deuxiemePalette.nbCol = parseInt(this.value);
		}, false);

		document.querySelector("body").addEventListener("wheel",function(e){
			eventThis.eventRoulette(e);
		}, false);

		this.deuxiemePalette.switch.on("click",function(){
			eventThis.deuxiemePalette.rgb = this.checked;
		})


		this.initEventPalette = function(){
			var tab =  this.premierePalette.tableauCouleur
			var eventThis = this;
			for(var i in tab){
				tab[i].DOM.addEventListener("click",function(e){
					eventThis.clickPalette(e, this);
				},false);
			}
		}

		this.clickPalette = function(e,scope){
			var palette1 = this.premierePalette;
			var nb = parseInt(scope.getAttribute("nb"));
			var couleur = palette1.tableauCouleur[nb-1];

			if(couleur == palette1.selected[0] || couleur == palette1.selected[1] ){
				return;
			}
			if(e.ctrlKey){
				if(palette1.selected[1] != undefined){
					$(palette1.selected[1].DOM).toggleClass("selected");
				}
				palette1.selected[1] = couleur;
				$("input#color2").val(palette1.selected[1].DOM.style.backgroundColor);
			}
			else{
				if(palette1.selected[0] != undefined){
					$(palette1.selected[0].DOM).toggleClass("selected");
				}
				palette1.selected[0] = couleur;
				$("input#color1").val(palette1.selected[0].DOM.style.backgroundColor);
			}
			$(scope).toggleClass("selected");
			
			if(palette1.testDeuxSelectionne()){
				this.deuxiemePalette.init(palette1.selected);
			}

		}

		this.eventRoulette = function(e){
			//scroll vers le bas
			if(this.deuxiemePalette.nbCol == 0 && e.deltaY > 0){
				return;
			}
			if(e.deltaY > 0){
				this.deuxiemePalette.nbCol -= 1;
			}
			else{
				this.deuxiemePalette.nbCol += 1;
			}
			$(this.deuxiemePalette.inputNbCol).val(this.deuxiemePalette.nbCol);
		}
	}



}