import CustomerSchema from '../schemas/CustomerSchema.js';

export async function getCustomerById(req, res) {
  const { _id } = req.query;

  try {
    const customer = await CustomerSchema.findById(_id);
    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found',
        success: false,
      });
    }

    return res.status(200).json({
      message: 'Customer retrieved successfully',
      success: true,
      data: customer,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving customer',
      success: false,
      error: error.message,
    });
  }
}

export async function updateCart(req, res) {
  const { customerId, products } = req.body;

  try {
    await CustomerSchema.findOneAndUpdate(
      { _id: customerId },
      { cartItems: products },
      { upsert: true, new: true },
    );

    return res.status(200).json({
      message: 'Cart updated successfully',
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error updating cart',
      success: false,
      error: error.message,
    });
  }
}

export async function updateWishlist(req, res) {
  const { customerId, wishlist } = req.body;

  try {
    await CustomerSchema.findOneAndUpdate(
      { _id: customerId },
      { wishlist },
      { upsert: true, new: true },
    );

    return res.status(200).json({
      message: 'Wishlist updated successfully',
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error updating wishlist',
      success: false,
      error: error.message,
    });
  }
}
