import { supabase } from './supabase'

export async function validateCoupon({ code, totalPrice, userId }) {
  const { data, error } = await supabase.rpc('validate_coupon', {
    p_code: code,
    p_order_total: totalPrice,
    p_user_id: userId,
  })

  if (error) throw error
  return data
}

export async function applyCoupon({ code, totalPrice, userId, orderId }) {
  const { data, error } = await supabase.rpc('apply_coupon', {
    p_code: code,
    p_order_total: totalPrice,
    p_user_id: userId,
    p_order_id: orderId,
  })

  if (error) throw error
  return data
}