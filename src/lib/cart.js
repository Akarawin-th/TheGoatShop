import { supabase } from './supabase'

export async function ensureCart(userId) {
  const { data: existingCart, error: cartError } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (existingCart) return existingCart
  if (cartError && cartError.code !== 'PGRST116') throw cartError

  const { data: newCart, error: newCartError } = await supabase
    .from('carts')
    .insert([{ user_id: userId }])
    .select()
    .single()

  if (newCartError) throw newCartError
  return newCart
}

export async function addToCart(userId, productId, quantity = 1) {
  const cart = await ensureCart(userId)

  const { data: existingItem, error: existingError } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cart.id)
    .eq('product_id', productId)
    .single()

  if (existingItem) {
    const { error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id)

    if (updateError) throw updateError
    return
  }

  if (existingError && existingError.code !== 'PGRST116') throw existingError

  const { error: insertError } = await supabase.from('cart_items').insert([
    {
      cart_id: cart.id,
      product_id: productId,
      quantity,
    },
  ])

  if (insertError) throw insertError
}

export async function getCartItemCount(userId) {
  const cart = await ensureCart(userId)

  const { data, error } = await supabase
    .from('cart_items')
    .select('quantity')
    .eq('cart_id', cart.id)

  if (error) throw error

  return (data || []).reduce((sum, item) => sum + item.quantity, 0)
}

export async function getCartItems(userId) {
  const cart = await ensureCart(userId)

  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      product_id,
      products (
        id,
        name,
        price,
        image_url,
        stock
      )
    `)
    .eq('cart_id', cart.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function updateCartItemQuantity(itemId, quantity) {
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)

  if (error) throw error
}

export async function removeCartItem(itemId) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId)

  if (error) throw error
}