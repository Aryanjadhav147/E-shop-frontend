function CartItem({ item }) {
  return (
    <div className="cart-item">
      <img src={item.image} alt={item.name} />
      <div>
        <h4>{item.name}</h4>
        <p>${item.price}</p>
        <p>Quantity: {item.quantity}</p>
      </div>
      <button>Remove</button>
    </div>
  );
}

export default CartItem;
