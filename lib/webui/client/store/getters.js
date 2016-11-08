// export const checkoutStatus = state => state.cart.checkoutStatus

export const allSession = state => {
    let sessions = state.session.sessions;

    let keys = Object.keys(sessions);

    return keys.map((idx) => {
        return sessions[idx];
    });
}

// export const cartProducts = state => {
//   return state.cart.added.map(({ id, quantity }) => {
//     const product = state.products.all.find(p => p.id === id)
//     return {
//       title: product.title,
//       price: product.price,
//       quantity
//     }
//   })
// }
