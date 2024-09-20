/**
 * Função que retorna os dados da planilha em formato CSV
 * @callback getTable
 * @returns {Promise<Response>} Objeto json contendo os valores da tabela
 */
async function getTable(){
    const urlCSVFile = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTny8Lp9GympyG02eKvahw5M45FVxaTFW2beOvMp-kr6yW0awYbsfPEKL5w42luPJhFQ89Xrxo6Ls65/pub?output=csv";
    try{
        return await fetch(urlCSVFile)
            .then(response=> {
                if (!response.ok) throw ("Ocorreu erro de conexão");

                return response.text()
                    .catch(e=> { throw ("Não foi possivel converter os dados da tabela corretamente") });

            })
            .then(csv => {
                const objPapa =  Papa.parse(csv, {header: true, transformHeader: true, dynamicTyping:true, skipFirstNLines: true, })
                if(objPapa.errors.length > 0){
                    throw (objPapa.errors.join("\n"));
                }
                return objPapa.data;
            })
            .catch(err=> {
                if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                    throw ("É possivel que haja um problema de compartilhamento de dado ou erro no endereço de requisição")
                } else {
                    throw (err.message)
                }
            })

    }catch(error){
        throw (error);
    }

}

/**
 * Obter os dados da tabela compartilhada no google contendo os dados pertinentes para o mapa
 * @callback getTable
 * @returns {[]} contendo Objetos das colunas e celulas da tabela
 */
//getTable().then(t=> console.log(t)).catch(error=>console.log("TABELA", error));







/***************************************************************************************************/
/*AÇÕES EM QUE DETALHAM OS WEBSITES DAS CAMARAS E PREFEITURAS */

/**
 * Buscar dados das prefeituras no json arquivo
 * @callback getPrefeituras
 * @returns {Promise<any>}
 */
async function getPrefeituras(){
    try{
        return await fetch("prefeituras.json")
            .then(response => {
                if(!response.ok){
                    throw("Problema de conexao")
                }
                return response.json()
                    .catch(e=> { throw ("Deu problema na hora de converter para json") })
            })
            .catch(error => {throw (error)});

    }catch(error){
        throw error;
    }
}

/**
 * Buscar dados das camaras no json arquivo
 * @callback getCamaras
 * @returns {Promise<any>}
 */
async function getCamaras(){
    try{
        return await fetch("camaras.json")
            .then(response => {
                if(!response.ok){
                    throw("Problema de conexao")
                }
                return response.json()
                    .catch(e=> { throw ("Deu problema na hora de converter para json") })
            })
            .catch(error => {throw (error)});

    }catch(error){
        throw error;
    }
}

/**
 * Buscar dados das camaras no json arquivo
 * @callback getCamaras
 * @returns {Promise<any>}
 */
async function getPCMunicipios(){
    try{
        return await fetch("pc-municipais.json")
            .then(response => {
                if(!response.ok){
                    throw("Problema de conexao")
                }
                return response.json()
                    .catch(e=> { throw ("Deu problema na hora de converter para json") })
            })
            .catch(error => {throw (error)});

    }catch(error){
        throw error;
    }
}

/**
 * Para exibir Tooltips com nome dos Municipios quando passar o mouse sobre o mapa
 * @param {evt} Mousemove ao movimento do cursor sobre o municipio
 * @param text contendo o nome do municipio ao qual o cursor estaja sobre
 */
function showTooltip(evt, text) {
    let tooltip = document.getElementById("anotherTooltip");
    tooltip.innerHTML = text;
    tooltip.style.display = "block";
    tooltip.style.left = evt.pageX + 10 + 'px';
    tooltip.style.top = evt.pageY + 10 + 'px';
}

/**
 * Para esconder a tooltipo assi que o cursos nao estiver mais sobre a ara do mapa
 */
function hideTooltip() {
    var tooltip = document.getElementById("anotherTooltip");
    tooltip.style.display = "none";
}


/**
 * Para buscar os dados referentes ao que o usuario seleciou no mapa ao clicar sobre o municipio
 * @callback getPCMunicipios
 * @param id valor referente ao municipio selecionado
 * @returns {Promise<void>} objeto contendo as informações especificas do municipio selecionado
 */
async function setStateMap(id){
    try{

        await getPCMunicipios().then(item=> {
            let objMuniciprefeitura = item.find(item => item.id === id);

            if(objMuniciprefeitura){
                document.getElementById('cidade_nulo').style.display = "none";
                document.getElementById('cidade_dados').style.display = "block";

                let active = document.querySelector('.active');
                if(active)active.classList.remove("active");
                document.querySelector('#'+id).classList.add("active");

                document.getElementById('selectbox_cidades').value = objMuniciprefeitura.id;
                document.getElementById('cidade_titulo').innerText = objMuniciprefeitura.nome;

                let indisponivel = '<span class="ml-5 link-disabled">Endereço indisponivel</span>';
                let toBuild = [
                    {'data': objMuniciprefeitura.web.prefeitura.site, 'elem': 'prefeitura-site'},
                    {'data': objMuniciprefeitura.web.prefeitura.portal_transparencia, 'elem': 'prefeitura-portal-transparencia'},
                    {'data': objMuniciprefeitura.web.prefeitura.ouvidoria, 'elem': 'prefeitura-ouvidoria'},
                    {'data': objMuniciprefeitura.web.camara.site, 'elem': 'camara-site'},
                    {'data': objMuniciprefeitura.web.camara.portal_transparencia, 'elem': 'camara-portal-transparencia'},
                    {'data': objMuniciprefeitura.web.camara.ouvidoria, 'elem': 'camara-ouvidoria'}
                ];
                toBuild.forEach(item => buildHtml(item.data, item.elem, indisponivel));
            }else{
                throw("Não foi possivel carregar o dados do municipios selecionado");
            }
        }).catch(err=>{throw err});

    }catch(error){
        alert(error);
    }
}

/**
 * Funçao que constroi o elemnto do tipo link a ser rendereizado na lista ao lado do mapa
 * @param data possui dos dados para montar o elemento html
 * @param elem contem id do elemento para onde será rendereizado
 * @param indisponivel contem o HTML do elemento a ser renderizado caso não haja valor para exibir
 */
function buildHtml(data, elem, indisponivel){
    let html = "";
    let e = document.getElementById(elem);
    html = (data != "") ? '<a href="'+data+'" target="_blank">'+data+'</a>' : indisponivel;
    e.innerHTML = html;
}

/**
 * Observa a mudança na selectbox contendo alista dos municpios e dispara uma nova consulta
 * @callback setStateMap
 * @param id valor referente ao municipio selecionado
 */
function selectBoxChange(id){
    if(id){
        document.getElementById('cidade_nulo').style.display = "none";
        document.getElementById('cidade_dados').style.display = "block";
        setStateMap(id);
    }else{
        document.getElementById('cidade_nulo').style.display = "block";
        document.getElementById('cidade_dados').style.display = "none";
        document.getElementById('cidade_titulo').innerText = "";
        document.querySelector('.active').classList.remove("active");
    }
}
