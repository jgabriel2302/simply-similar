/* ##############################################################################
####			Simply Similar in Javascript				####
####		Simply Similar is an CountVectorizer algorithm in Javascript	####
####		created by João Gabriel Corrêa da Silva				####
####	https://www.linkedin.com/in/jo%C3%A3o-gabriel-corr%C3%AAa-da-silva/	####
   ############################################################################## */

class CountVectorizer {
  #ngram_range = [1, 2]
  #splitter = /\W/
  #normalizeEncode = true
  #glue = " "
  #sources = []
  #sources_matrix = []
  X = []
  Y = []
  #feature_names = []
  #token_matrix = []

  constructor(ngram_range = [1, 2], splitter = /\W/, glue = " ", normalizeEncode = true) {
    this.#ngram_range = this.#sortArray(ngram_range)
    this.#splitter = splitter
    this.#glue = glue
    this.#normalizeEncode = normalizeEncode
    this.#sources = []
  }

  #sortArray(array = [], asc = true) {
    return array.sort((a, b) => {
      if (typeof a === "string" && typeof b === "string") {
        return a.localeCompare(b) * (asc ? 1 : -1)
      } else {
        return (a - b) * (asc ? 1 : -1)
      }
    })
  }

  #chunkArray(array = [], chunkSize = 1) {
    chunkSize = Math.max(Math.min(chunkSize, array.length), 1)
    const chunks = new Array(Math.floor(array.length / chunkSize))
    let index = 0
    for (let i = 0; i < array.length; i += 1) {
      const chunk = array.slice(i, i + chunkSize)
      chunks[index] = chunk
      index++
    }
    return chunks
  }

  #joinMatrix(matrix = []) {
    let array = []
    for (const i of matrix) {
      array = array.concat(i)
    }
    return array
  }

  #removeDuplicates(array = []) {
    return array.filter((_, i) => array.indexOf(_) === i)
  }
  
  get feature_names(){
  	return this.#feature_names
  }

  multiply(m1 = [], m2 = []) {
		const size = Math.max(1, Math.min(m1.length, m2.length))
    let result = new Array(size).fill(0);
    for(let i = 0; i < result.length; i++){
    	result[i] = m1[i] * m2[i];
    }
    return result
  }

  fit_transform(sources = []) {
    if (!Array.isArray(sources)) return //Verficando se é uma lista
    sources = sources.filter((s) => typeof s === "string") //Filtrando apenas elementos de texto
    this.#sources = sources //Definindo nova origem
    this.#sources_matrix = new Array(sources.length)
      .fill([])
      .map((_i, index) => {
        const words = sources[index]
          .split(this.#splitter)
          .filter((s) => s.length > 1) //pegando palavras com mais de um caracter	
          .map(s=>this.#normalizeEncode? s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ""): s.toLowerCase())
        let grams = []
        for (const ngramsize of this.#ngram_range) {
          grams = grams.concat(
            this.#chunkArray(words, ngramsize).map((c) => c.join(this.#glue)),
          ) //criando grams
        }
        grams = this.#sortArray(grams)
        return grams
      }) //criando matriz de origens
    this.#feature_names = [].concat(
      this.#sortArray(this.#joinMatrix(this.#sources_matrix))
    )
		this.#feature_names = this.#removeDuplicates(this.#feature_names)
    this.X = new Array(this.#sources_matrix.length)
      .fill(this.#feature_names)
      .map((s, i) =>
        s
          .map((x) => this.#sources_matrix[i].filter(f=>f===x).length > 0)
          .map((x) => Number(x))
      )
    //Calculando a interseção entre as matrizes de tokens
    this.Y = this.X[0]
    for (let mi = 1; mi < this.X.length; mi++) {
      this.Y = this.multiply(this.Y, this.X[mi])
    }
    
    return this.X;
  }
  
  similarity(){
    const result = {
      X: this.X,
      Y: this.Y,
      resultX: this.X.map(s=>s.reduce( (sum, v)=>sum + v, 0 )),
      resultY: this.Y.reduce( (sum, v)=>sum + v, 0 ),
      result: 0
    }
		const r = result.resultX.slice(0, result.resultX.length-1)
    if(r.length > 0) //Calculando a similaridade
    	result.result = r.reduce( (sum, v)=>sum + (v === 0 ? 0: result.resultY / v), 0 ) / r.length
    return result
  }
}
