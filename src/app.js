const buttons = document.querySelectorAll('nav button')

buttons.forEach(el=>{
    el.addEventListener('click', showText)
})

fetchCountriesData()

async function fetchCountriesData(){
    const countryCountSpan = document.querySelector('#country-count')

    try{
        const res = await fetch('https://restcountries.com/v3.1/all')
        const data = await res.json()
        
        countryCountSpan.textContent = data.length //number of countries updated to the page

        const [tenCountries,populationObj] = getTenByPopulationAndSort(data)
        
        const tenLanguages = getTopTenLanguages(data)

        showGraphs(tenCountries, populationObj)
        showGraphs(tenLanguages, {totalCountries: data.length})

    } catch(err){
        console.log(err)
    }
}

function getTenByPopulationAndSort(data){
    const newArr = []
    data.sort((a,b)=>{
        if(a.population>b.population){
            return -1
        }else if(a.population<b.population){
            return 1
        }else{
            return 0
        }
    })

    function sumPopulation(){
        let total = 0
        for(const country of data){
            total += country.population
        }

        return total
    }

    const totalPopulationInt = sumPopulation()
    const totalPopulationStr = totalPopulationInt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    for(const country of data.slice(0,10)){
        const {name:{common: name}, population} = country
        populationString = population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        newArr.push({name: name, populationStr: populationString, populationInt: population})
    }
    
    return [newArr, 
        {totalPopulationInt: totalPopulationInt,
         totalPopulationStr: totalPopulationStr}]
}

function getTopTenLanguages(data){

    const newArr = []

    for(const country of data){
        for(const language in country.languages){
            const langName = country.languages[language]
            if(!newArr.find(({name})=> name === langName)){
                newArr.push({name: langName, count: 1})
            } else{
                const i = newArr.indexOf(newArr.find(({name})=> name===langName))
                newArr[i].count += 1
            }
        }
    }

    newArr.sort((a,b)=>{
        if(a.count>b.count){
            return -1
        }else if(a.count<b.count){
            return 1
        }else{
            return 0
        }
    })

    return newArr.slice(0,10)
}

function showText(e){
    const pElements = document.querySelectorAll('nav p')
    const countryTable = document.querySelector('#country-table')
    const languageTable = document.querySelector('#language-table')

    if(this.id==='btn1'){
        pElements[0].hidden = false
        pElements[1].hidden = true
        countryTable.hidden = false
        languageTable.hidden = true
    } else{
        pElements[0].hidden = true
        pElements[1].hidden = false
        countryTable.hidden = true
        languageTable.hidden = false
    }
}

function showGraphs(arr, obj){
    const graphContainer = document.querySelector('#graph-container')
    const table = document.createElement('table')
    table.hidden = true

    if(document.querySelectorAll('table').length === 0){

        const thead = document.createElement('thead')
        const tr = document.createElement('tr')
        const th = document.createElement('th')

        th.setAttribute('colspan', '3')

        th.innerText = `World Population ${obj.totalPopulationStr}`
        tr.append(th)
        thead.append(tr)

        for(const country of arr){
            const percentage = findPercentage(country.populationInt,obj.totalPopulationInt)

            const tableRow = document.createElement('tr')
            const td1 = document.createElement('td')
            const td2 = document.createElement('td')
            const td3 = document.createElement('td')
            td1.textContent = country.name
            td2.classList.add(`percentage`)
            td3.textContent = country.populationStr
    
            tableRow.append(td1,td2,td3)
            
            table.append(tableRow)

            createPercentageProperty(percentage, td2)
        }

        table.prepend(thead)
    }

    if(document.querySelectorAll('table').length === 1){
        for(const language of arr){
            const percentage = findPercentage(language.count,obj.totalCountries)

            const tableRow = document.createElement('tr')
            const td1 = document.createElement('td')
            const td2 = document.createElement('td')
            const td3 = document.createElement('td')
            td1.textContent = language.name
            td2.classList.add('percentage')
            td3.textContent = language.count
    
            tableRow.append(td1,td2,td3)
            table.append(tableRow)

            createPercentageProperty(percentage, td2)
        }
    }

    graphContainer.append(table)

    if(document.querySelectorAll('table').length === 2){
        document.querySelectorAll('table')[0].id = 'country-table'
        document.querySelectorAll('table')[1].id = 'language-table'
    }
}

function createPercentageProperty(percentage, tdElement){
    const style = document.styleSheets[1]
    percentageStr = percentage.toString().replace('.', '_')

    //Create a CSS variable to store the transformY value for the graphs
    for(const rule of style.cssRules){
        if(rule.selectorText === ":root"){
            rule.style.setProperty(`--barPercentage-${percentageStr}`, `${percentage/100}`)
            console.log(rule.style)
        }
    }

    //Create rule on graphValues styleSheet with the percetageValue and the root variable for said percentage value
    style.insertRule(`.percentage-${percentageStr}{
        transform-origin: left top;
        transform: translateY(-0.25%) scaleX(var(--barPercentage-${percentageStr}))
    }`)

    tdElement.classList.add(`percentage-${percentageStr}`)
}

function findPercentage(n1,n2){
    return ((n1 * 100)/n2).toFixed(2)
}