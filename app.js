let orders = []
let total = 0
let count = parseInt(localStorage.getItem("count") || 0)
let id = parseInt(localStorage.getItem("id") || 1) //Se añade operador or

const getData = async () => {
    let response = await fetch('data.json')
    let result = await response.json()
    return result
}



const htmlContador = document.querySelector(".contador")

const htmlCombos = document.querySelector("#combosContent")
const htmlDrinks = document.querySelector("#drinksContent")
const htmlDesserts = document.querySelector("#dessertsContent")
const htmlSearch = document.querySelector('#search')
const htmlSearchContent = document.querySelector('#searchContent')
const htmlNavbar = document.querySelectorAll(".nav-link")
const inputSearch = document.querySelector('#inputSearch')
const buttonFactura = document.querySelector("#btnFactura")

htmlNavbar.forEach(navbar => navbar.addEventListener("click",e=> getNavbarChangeClass(e)))
buttonFactura.addEventListener("click",()=> getFactura(orders))
inputSearch.addEventListener("input",e=>getInputSearch(e))

const getInputSearch = async ({target}) => {
    window.scrollTo({top: 0, behavior: 'smooth'});

    const data = await getData()
    //console.log(target.value)
    let filteredData = []
    let searchData = []
    let combos = data.combos.filter(item => item.name.toLowerCase().includes(target.value.toLowerCase())).map(item => {return{...item,'type':'combos'}})
    let drinks = data.drinks.filter(item => item.name.toLowerCase().includes(target.value.toLowerCase())).map(item => {return{...item,'type':'drinks'}})
    let desserts = data.dessert.filter(item => item.name.toLowerCase().includes(target.value.toLowerCase())).map(item => {return{...item,'type':'dessert'}})
    searchData = [...combos,...drinks,...desserts]
    filteredData = {
        combos: combos,
        drinks: drinks,
        dessert: desserts
    }
    //console.log(searchData)
    if(target.value.length > 0)
    {
        htmlSearch.setAttribute('class','')
        loadSearch(searchData)
        loadCards(filteredData)
        
    }
    else{
        htmlSearch.setAttribute('class','d-none')
        loadCards(data)
    }
}

const getNavbarChangeClass = ({target}) =>{
    //console.log(target.id)
    switch (target.id) {
        case 'combosNavbar':
            htmlNavbar[0].setAttribute('class', 'nav-link active');
            htmlNavbar[1].setAttribute('class', 'nav-link');
            htmlNavbar[2].setAttribute('class', 'nav-link');
            break;
        case 'drinksNavbar':
            htmlNavbar[0].setAttribute('class', 'nav-link');
            htmlNavbar[1].setAttribute('class', 'nav-link active');
            htmlNavbar[2].setAttribute('class', 'nav-link');
            break;
        case 'dessertsNavbar':
            htmlNavbar[0].setAttribute('class', 'nav-link');
            htmlNavbar[1].setAttribute('class', 'nav-link');
            htmlNavbar[2].setAttribute('class', 'nav-link active');
            break;
        default:
            break;
    }
}

const getTotal = (orders) => {
    return orders.reduce((acc,order) => acc+order.precio,0)
}


const getFactura = (orders) =>{
    let total = 0
    if(orders.length > 0)
    {
       total  = getTotal(orders)
    }
    loadBill(orders,total)
}

const toastifyMessage = message =>{
    Toastify({
        text: `${message} añadido al carrito`,
        duration: 3000,
        newWindow: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "rgba(255, 0, 0, 0.614)",
        },
      }).showToast();
}

const addToCart = (index,product,type) =>{
    count === "" ? (count=1) : count ++;
    const {name:nameProduct, price: priceProduct, solo: soloProduct} = product.length ? product[index] : product
     let order = {
        comida: '',
        precio: '',
        combo: type === 'combo',
    }
    let radios
    let totalPrice = 0
    let name = ''
    if(type === 'combo')
    {
        radios = document.querySelectorAll(`[name=${product.length ? 'radio'+index : 'searchradio'+index}]`)
        totalPrice = (!radios[1]?.checked) ? soloProduct : priceProduct // operador ternario y conditional chaining
        name = nameProduct //destructuring y uso de alias
    }
    else{
        radios = document.querySelectorAll(`[name=${product.length ?'radio'+ nameProduct:'searchradio' + nameProduct}]`)
        radios.forEach(radio =>{
            console.log(radio.checked)

           if(radio?.checked)
            name = `${radio?.checked && radio?.id.replaceAll('search', "")} ${nameProduct} ` 
        })
        totalPrice = priceProduct
    }
    order.comida = name
    order.precio = totalPrice
    order.combo = (type === 'combo' && radios[1]?.checked) || false
    orders.push({
        id: id ++, //operador de incremento
        ...order
    })//spread operator

    localStorage.setItem("id",id)
    localStorage.setItem("count",count)
    localStorage.setItem("orders",JSON.stringify(orders))
    toastifyMessage(name)

    htmlContador.innerHTML = count
    //console.log(orders)
}

const changePrice = ({target:{id: elementId}},id,combos) =>{
    //console.log(e.target.id)
    let element = document.querySelector(`${combos.length ? '#price'+id: '#searchprice'+id}`)
    //console.log(combos.length)
    const {solo, price} = combos.length ? combos[id] : combos
    element.innerHTML = elementId.includes('solo') ? solo : price
}

const loadCart = () => {
    orders = JSON.parse(localStorage.getItem("orders")) || []
    //console.log(orders)
}

const loadBill = (orders,total) => {
    
    let recibo = document.querySelector('tbody')
    let modalFooter = document.querySelector('#paidButton')
    let rowsTable = ''
    if(orders.length > 0)
    {
        orders.forEach((order,index) => { 
            //console.log(order)
            const {comida,precio,combo} = order //destructuring

            rowsTable += `
            <tr>
                <td>${index+1}</td>
                <td>${comida}</td>
                <td class="text-center">${combo ? '*' : ''}</td>
                <td class="text-center">${precio.toFixed(2)}</td>
            </tr>
            `
        })
        rowsTable += `
            <tr>
                <td class="text-end" colspan="3"><b>Total</b></td>
                <td class="text-center" style="color:#fff">${total.toFixed(2)}</td>
            </tr>
        `
    }
    else{
        rowsTable = '<tr><td colspan="4" class="text-center">No Productos en el carrito</td></tr>'
    }
    modalFooter.innerHTML = `<button id="paid_bill" type="button"  data-bs-dismiss="modal" class="btn btn-danger">${orders.length > 0 ? 'PAGAR' : 'SALIR' }</button>`
    let buttonPaidEvent = document.querySelector(`#paid_bill`)
    orders.length > 0 && buttonPaidEvent.addEventListener('click',()=>customAlert(total))
    recibo.innerHTML=rowsTable
}

const customAlert = (total) =>{
    localStorage.setItem("orders",[])
    localStorage.setItem("count","")
    count = ""
    htmlContador.innerHTML = ""
    orders = []
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-danger mx-2',
          cancelButton: 'btn btn-secondary mx-2'
        },
        buttonsStyling: false
      })
      
      swalWithBootstrapButtons.fire({
        title: 'Realizar pago de la compra?',
        text: "Luego de realizado no podra ser revertido!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Pagar!',
        cancelButtonText: 'Cancelar Order',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          swalWithBootstrapButtons.fire(
            `Se ha recibido su pago de ${total.toFixed(2)}!`,
            'Muchas gracias por preferirnos.',
            'success'
          )
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Orden Cancelada',
            'Se procede a cancelar su orden',
            'error'
          )
        }
      })


}

const loadSearch = (data) => {
    htmlSearchContent.innerHTML = ''
    data.forEach((product,index)=>{
        let divCard = document.createElement('div')
        const {img,name,description,price,type} = product //destructuring
        divCard.setAttribute('class','card')
        switch (type) {
            case 'combos':
                divCard.innerHTML =
                ` <img src=${img} class="card-img-top">
                <div class="card-body">
                <h5 class="card-title">${name}</h5>
                <p class="card-text">${description}</p>
                <div id="searchprice${index}" class="card-price">$ ${price}</div>
                <div class="card-selection">
                <div><input id="searchsolo${index}" type="radio" name="searchradio${index}"> Solo</div>
                <div><input id="searchcombo${index}" checked type="radio" name="searchradio${index}"> En combo</div></div>
                <button id="searchbutton${index}" class="btn btn-danger">Añadir al carrito</button>
                </div>`
                htmlSearchContent.appendChild(divCard)
                let radiosEvent = document.querySelectorAll(`[name="searchradio${index}"]`)
                let buttonEventCombos = document.querySelector(`#searchbutton${index}`)
                radiosEvent.forEach(radioEvent =>
                    radioEvent.addEventListener('click',e=>changePrice(e,index,product))
                )
                buttonEventCombos.addEventListener('click',()=>addToCart(index,product,'combo'))
                break;
            case 'drinks':
                divCard.innerHTML =
                ` <img src=${img} class="card-img-top">
                <div class="card-body">
                <h5 class="card-title">${name}</h5>
                <p class="card-text">${description}</p>
                <div id="searchprice${index}" class="card-price">$ ${price}</div>
                <div id="searchselectionDrinks${index}" class="card-selection">
                </div>
                <button id="searchbuttonDrink${index}" class="btn btn-danger">Añadir al carrito</button>
                </div>`
                htmlSearchContent.appendChild(divCard)
                let selectionDrinks = document.querySelector(`#searchselectionDrinks${index}`)
                let radios = ''
                product.flavors.forEach(flavor =>
                    radios +=  `<div><input checked id="search${flavor}" type="radio" name="searchradio${name}"> ${flavor}</div>`
                )
                selectionDrinks.innerHTML = radios
                let buttonEventDrinks = document.querySelector(`#searchbuttonDrink${index}`)
                buttonEventDrinks.addEventListener('click',()=>addToCart(index,product,'drink'))
                break;
            case 'dessert':
                divCard.innerHTML = ` <img src=${img} class="card-img-top">
                <div class="card-body">
                <h5 class="card-title">${name}</h5>
                <p class="card-text">${description}</p>
                <div id="searchprice${index}" class="card-price">$ ${price}</div>
                <div id="searchselectionDesserts${index}" class="card-selection">

                </div>
                <button id="searchbuttonDessert${index}" class="btn btn-danger">Añadir al carrito</button>
                </div>`
                htmlSearchContent.appendChild(divCard)
                let selectionDesserts = document.querySelector(`#searchselectionDesserts${index}`)
                let radiosDesserts = ''
                product.flavors.forEach(flavor =>
                    radiosDesserts +=  `<div><input checked id="search${flavor}" type="radio" name="searchradio${name}"> ${flavor}</div>`
                )
                selectionDesserts.innerHTML = radiosDesserts
                let buttonEventDesserts = document.querySelector(`#searchbuttonDessert${index}`)
                buttonEventDesserts.addEventListener('click',()=>addToCart(index,product,'dessert'))
                break;
            default:
                break;
        }
    })
}

const loadCards = (data) => {
    htmlCombos.innerHTML = ''
    htmlDesserts.innerHTML = ''
    htmlDrinks.innerHTML = ''
    Object.keys(data).forEach(key => {
        data[key].forEach((product,index)=>{
            let divCard = document.createElement('div')
            
            const {img,name,description,price} = product //destructuring
            divCard.setAttribute('class','card')

            switch (key) {
                case 'combos':
                    divCard.innerHTML =
                    ` <img src=${img} class="card-img-top">
                    <div class="card-body">
                    <h5 class="card-title">${name}</h5>
                    <p class="card-text">${description}</p>
                    <div id="price${index}" class="card-price">$ ${price.toFixed(2)}</div>
                    <div class="card-selection">
                    <div><input id="solo${index}" type="radio" name="radio${index}"> Solo</div>
                    <div><input id="combo${index}" checked type="radio" name="radio${index}"> En combo</div></div>
                    <button id="button${index}" class="btn btn-danger">Añadir al carrito</button>
                    </div>`
                    htmlCombos.appendChild(divCard)
                    let radiosEvent = document.querySelectorAll(`[name="radio${index}"]`)
                    let buttonEventCombos = document.querySelector(`#button${index}`)
                    radiosEvent.forEach(radioEvent =>
                        radioEvent.addEventListener('click',e=>changePrice(e,index,data[key]))
                    )
                    buttonEventCombos.addEventListener('click',()=>addToCart(index,data[key],'combo'))
                    break;
                case 'drinks':
                    divCard.innerHTML =
                    ` <img src=${img} class="card-img-top">
                    <div class="card-body">
                    <h5 class="card-title">${name}</h5>
                    <p class="card-text">${description}</p>
                    <div id="price${index}" class="card-price">$ ${price.toFixed(2)}</div>
                    <div id="selectionDrinks${index}" class="card-selection">
                    </div>
                    <button id="buttonDrink${index}" class="btn btn-danger">Añadir al carrito</button>
                    </div>`
                    htmlDrinks.appendChild(divCard)
                    let selectionDrinks = document.querySelector(`#selectionDrinks${index}`)
                    let radios = ''
                    product.flavors.forEach(flavor =>
                        radios +=  `<div><input checked id="${flavor}" type="radio" name="radio${name}"> ${flavor}</div>`
                    )
                    selectionDrinks.innerHTML = radios
                    let buttonEventDrinks = document.querySelector(`#buttonDrink${index}`)
                    buttonEventDrinks.addEventListener('click',()=>addToCart(index,data[key],'drink'))
                    break;
                case 'dessert':
                    divCard.innerHTML = ` <img src=${img} class="card-img-top">
                    <div class="card-body">
                    <h5 class="card-title">${name}</h5>
                    <p class="card-text">${description}</p>
                    <div id="price${index}" class="card-price">$ ${price.toFixed(2)}</div>
                    <div id="selectionDesserts${index}" class="card-selection">

                    </div>
                    <button id="buttonDessert${index}" class="btn btn-danger">Añadir al carrito</button>
                    </div>`
                    htmlDesserts.appendChild(divCard)
                    let selectionDesserts = document.querySelector(`#selectionDesserts${index}`)
                    let radiosDesserts = ''
                    product.flavors.forEach(flavor =>
                        radiosDesserts +=  `<div><input checked id="${flavor}" type="radio" name="radio${name}"> ${flavor}</div>`
                    )
                    selectionDesserts.innerHTML = radiosDesserts
                    let buttonEventDesserts = document.querySelector(`#buttonDessert${index}`)
                    buttonEventDesserts.addEventListener('click',()=>addToCart(index,data[key],'dessert'))
                    break;
                default:
                    break;
            }
        })

    })
}

const loadContador = () => {
    htmlContador.innerHTML = count === 0 ? '' : count
}

const loadMenu = async () => {
    const data = await getData()

    loadCards(data)

    loadContador()
}

loadMenu()
loadCart()


