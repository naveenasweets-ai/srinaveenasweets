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

export async function getAddresses(req, res) {
  try {
    const customer = await CustomerSchema.findById(req.user._id).select(
      'addresses',
    );
    return res.status(200).json({
      message: 'Addresses retrieved successfully',
      success: true,
      data: customer?.addresses || [],
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving addresses',
      success: false,
      error: error.message,
    });
  }
}

export async function addAddress(req, res) {
  const {
    fullname,
    mobile,
    fullAddress,
    city,
    state,
    pincode,
    lat,
    lng,
  } = req.body;

  try {
    const customer = await CustomerSchema.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found',
        success: false,
      });
    }

    const newAddress = {
      fullname,
      mobile,
      fullAddress,
      city,
      state,
      pincode,
      lat: Number(lat),
      lng: Number(lng),
      isDefault:
        customer.addresses.length === 0 ||
        !customer.addresses.some((addr) => addr.isDefault),
    };

    customer.addresses.push(newAddress);
    await customer.save();

    return res.status(201).json({
      message: 'Address added successfully',
      success: true,
      data: customer.addresses,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error adding address',
      success: false,
      error: error.message,
    });
  }
}

export async function updateAddress(req, res) {
  const { addressId } = req.params;
  const {
    fullname,
    mobile,
    fullAddress,
    city,
    state,
    pincode,
    lat,
    lng,
    isDefault,
  } = req.body;

  try {
    const customer = await CustomerSchema.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found',
        success: false,
      });
    }

    const address = customer.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({
        message: 'Address not found',
        success: false,
      });
    }

    if (isDefault) {
      customer.addresses.forEach((addr) => {
        addr.isDefault = addr._id.toString() === addressId;
      });
    } else {
      address.isDefault = customer.addresses.some(
        (addr) => addr._id.toString() !== addressId && addr.isDefault,
      );
    }

    address.fullname = fullname;
    address.mobile = mobile;
    address.fullAddress = fullAddress;
    address.city = city;
    address.state = state;
    address.pincode = pincode;
    address.lat = Number(lat);
    address.lng = Number(lng);

    await customer.save();

    return res.status(200).json({
      message: 'Address updated successfully',
      success: true,
      data: customer.addresses,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error updating address',
      success: false,
      error: error.message,
    });
  }
}

export async function deleteAddress(req, res) {
  const { addressId } = req.params;

  try {
    const customer = await CustomerSchema.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found',
        success: false,
      });
    }

    const removed = customer.addresses.id(addressId);
    const wasDefault = removed?.isDefault;

    customer.addresses.remove(customer.addresses.id(addressId));

    if (wasDefault && customer.addresses.length > 0) {
      customer.addresses[0].isDefault = true;
    }

    await customer.save();

    return res.status(200).json({
      message: 'Address deleted successfully',
      success: true,
      data: customer.addresses,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting address',
      success: false,
      error: error.message,
    });
  }
}
