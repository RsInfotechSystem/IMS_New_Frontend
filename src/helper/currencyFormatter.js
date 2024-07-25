// function for format indian currency 
const currencyFormatter = (number) => {
    return (new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
        Number(number))
    )
}

export default currencyFormatter