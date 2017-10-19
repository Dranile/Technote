var container = document.querySelector("div.palette");
$("div.couleursSelectionnes input").val("");
var nbCol = 5;
document.querySelector("input#nbCol").value = nbCol;

document.querySelector("input#nbCol").addEventListener("change",function(){
	nbCol = parseInt(this.value);
}, false);
document.querySelector("body").addEventListener("wheel",function(e){
	//scroll vers le bas
	if(nbCol == 0 && e.deltaY > 0){
		return;
	}
	if(e.deltaY > 0){
		nbCol -= 1;
	}
	else{
		nbCol += 1;
	}
	$("input#nbCol").val(nbCol);
}, false);

document.querySelector("div.divSlider input").checked = true;
var rgb = true;
$("div.divSlider input").on('click', function(){
	rgb = this.checked;
});


var tabBV = [0,102,204];
var tabR = [0,51,102,153,204,255];
var selected = [];

//Création de la palette
for(var k in tabR){
	var divRow = document.createElement("div");
	divRow.className = "row";
	for(var j in tabBV){
		for(var i in tabBV){
			var divColor = document.createElement("div");
			divColor.style.backgroundColor = "rgb(" + tabR[k] + " , " + tabBV[j] + " , " + tabBV[i] + ")";

			divColor.addEventListener("click", function(e){
				clickPalette(e, this);
			}, false);

			divRow.appendChild(divColor);
			container.appendChild(divRow);
			//console.log(tabR[k] + " , " + tabBV[j] + " , " + tabBV[i]);
		}
	}
}

function clickPalette(e, scope){
	if(selected.includes(scope)){
		return;
	}
	if(e.ctrlKey){
		if(selected[1] != undefined){
			$(selected[1]).toggleClass("selected");
		}
		selected[1] = scope;
		$("input#color2").val(selected[1].style.backgroundColor);
	}
	else{
		if(selected[0] != undefined){
			$(selected[0]).toggleClass("selected");
		}
		selected[0] = scope;
		$("input#color1").val(selected[0].style.backgroundColor);
	}
	$(scope).toggleClass("selected");

	if(selected[0] != null && selected[1] != null){
		document.querySelector("div.deuxieme-partie p").style.visibility = "visible";
		var color1 = extractRVB(selected[0].style.backgroundColor);
		var color2 = extractRVB(selected[1].style.backgroundColor);

		if(rgb){
			var res = interpolationRGB(nbCol,color1,color2);
		}
		else{
			var res = interpolationHSV(nbCol,color1,color2);
		}

		// console.log(res);
		// for(var i in res){
		// 	res[i] = HSVtoRGB(res[i][0]/360,res[i][1]/100,res[i][2]/100);
		// 	console.log(res[i]);
		// }
		createTableInter(res);
	}
}

/*
 * Extrait les valeurs R V et B dans un tableau
 * Entree : chaine de caractere du type rgb(R,V,B) 
 * retour : Tableau [R,V,B]
*/
function extractRVB(str){
	var regex = "[0-9]+,[0-9]+,[0-9]+";
	str = str.replace(/\s/g,'')
	var strBis = str.match(regex);
	var array = strBis[0].split(",");

	for(var i in array){
		array[i] = parseInt(array[i]);
	}
	return array;
}
/*
 * Réalise l'interpolation d'une couleur1 avec un couleur2 n fois
 * Entrée : n le nombre de couleurs, color1 la premiere couleur et couleur 2 la seconde
 * Sortie : je sais pas encore, mais c'est le resultat des interpolations
*/
function interpolationRGB(n, color1, color2){
	var array = [];
	for(var i=1; i<n+1;i++){
			var R1 = color1[0];
			var R2 = color2[0];
			var resR = calculInterpolation(R1, R2, i, 0, n+1);
			var V1 = color1[1];
			var V2 = color2[1];
			var resV = calculInterpolation(V1, V2, i, 0, n+1);
			var B1 = color1[2];
			var B2 = color2[2];
			var resB = calculInterpolation(B1, B2, i, 0, n+1);
			var res = [resR,resV,resB];
			array.push(res);
	}
	return array;

}

function interpolationHSV(n, color1, color2) {
	color1 = rgbToHsv(color1[0],color1[1],color1[2]);
	color2 = rgbToHsv(color2[0],color2[1],color2[2]);
	var s = moyenneCouleur(color1["s"],color2["s"]);
	var v = moyenneCouleur(color1["v"],color2["v"]);
	var array = [];
	for(var i=1; i<n+1;i++){
		var res = calculInterpolation(color1["h"], color2["h"], i, 0, n+1)
		resultat = HSVtoRGB(res/360,s/100,v/100);
		resultat = [resultat[0], resultat[1], resultat[2]];
		array.push(resultat);
	}
	return array;
}

function calculInterpolation(couleur1, couleur2, n, min, max){
	return couleur1 + (n-min) * ((couleur2-couleur1)/(max-min));
}

function createTableInter(array){
	var divs = document.querySelectorAll("div.autrePalette > div");
	if(divs.length > 7){
		$(divs[0]).slideUp(400, function(){
			$(divs[0]).remove();
			tableInter(array);
		});
	}
	else{
		tableInter(array);
	}
	createMatrice(array);
}

function tableInter(array){
	var div = document.createElement("div");
	div.className = "rowInvert";
	for(var i in array){
		var col = document.createElement("div");
		col.style.backgroundColor = "rgb(" + Math.round(array[i][0]) + "," +  Math.round(array[i][1]) + "," +  Math.round(array[i][2]) + ")";
		div.appendChild(col);
	}
	$(div).hide();
	document.querySelector("div.autrePalette").appendChild(div);
	$(div).slideDown(1000);
}

// Retourne un array hsr
function rgbToHsv(red,green,blue){
	var rr, gg, bb,
        r = red / 255,
        g = green / 255,
        b = blue / 255,
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
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
}

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
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
    return {
        0: Math.round(r * 255),
        1: Math.round(g * 255),
        2: Math.round(b * 255)
    };
}

// Une couleur est un tableau de valeur pour le moment
function moyenneCouleur(color1, color2){
	return (color1 + color2)/2;
}


function createMatrice(array){
	var tbody = document.querySelector("tbody");
	$(tbody).html("");
	for(var i in array){
		for(var j in array){
			if(i != j && calculContraste(array[i], array[j])){
				// On créé une nouvelle ligne
				var tr = document.createElement("tr");
				var td1 = document.createElement("td");
				var col = document.createElement("div");
				col.style.backgroundColor = "rgb(" + Math.round(array[i][0]) + "," +  Math.round(array[i][1]) + "," +  Math.round(array[i][2]) + ")";
				var p = document.createElement("span");
				p.appendChild(document.createTextNode("rgb(" + Math.round(array[i][0]) + "," +  Math.round(array[i][1]) + "," +  Math.round(array[i][2]) + ")"));
				td1.appendChild(col);
				td1.appendChild(p);

				var td2 = document.createElement("td");
				col = document.createElement("div");
				col.style.backgroundColor = "rgb(" + Math.round(array[j][0]) + "," +  Math.round(array[j][1]) + "," +  Math.round(array[j][2]) + ")";
				p = document.createElement("span");
				p.appendChild(document.createTextNode("rgb(" + Math.round(array[j][0]) + "," +  Math.round(array[j][1]) + "," +  Math.round(array[j][2]) + ")"));
				td2.appendChild(col);
				td2.appendChild(p);

				tr.appendChild(td1);
				tr.appendChild(td2);

				tbody.appendChild(tr);
			}
		}
	}
}



function calculContraste(color1, color2){
	var brightnessColor1 = colorBrightness(color1);
	var brightnessColor2 = colorBrightness(color2);
	if((brightnessColor1 - brightnessColor2) > 125){
		console.log(colorDiff(color1,color2))
		if(colorDiff(color1, color2) > 500){
			return true;
		}
	}
	return false;
}

function colorBrightness(color){
	return ((color[0]*299) + (color[1]*587) + (color[2]*114))/1000; 
}

function colorDiff(color1, color2){
	return ((Math.max(color1[0],color2[0]) - Math.min(color1[0],color2[0])) + (Math.max(color1[1],color2[1]) - Math.min(color1[1],color2[1])) + (Math.max(color1[2],color2[2]) - Math.min(color1[2],color2[2])));
}
