export const calculateSubtotal = (price, quantity) => {
  return price * quantity
}

export const calculateTotal = (items) => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0)
}

// Format FCFA (pas de décimales)
export const formatPrice = (price) => {
  const num = typeof price === 'string' ? parseFloat(price) : price
  return `${Math.round(num).toLocaleString('fr-FR')} FCFA`
}
