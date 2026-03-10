export const calculateSubtotal = (price, quantity) => {
  return (price * quantity).toFixed(2)
}

export const calculateTotal = (items) => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)
}

export const formatPrice = (price) => {
  return `fcfa${parseFloat(price).toFixed(2)}`
}